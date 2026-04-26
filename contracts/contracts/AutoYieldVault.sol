// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC4626.sol";

/**
 * @title AutoYieldVault
 * @dev An autonomous, ERC-4626 inspired vault that physically routes underlying assets 
 * into external DeFi protocols based on AI agent strategies.
 */
contract AutoYieldVault is ERC20 {
    using SafeERC20 for IERC20;

    // The underlying asset (e.g., USDC, WETH) this vault manages
    IERC20 public immutable underlyingAsset;

    // The strategy manager that controls rebalancing
    address public strategyManager;

    // Current active allocations
    Allocation[] public currentAllocations;

    struct Allocation {
        address protocol; // Must be an ERC-4626 compatible DeFi lending pool
        uint256 percentage;
    }

    event Rebalanced(address[] protocols, uint256[] percentages, uint256 totalAssetsDeployed);
    event Deposit(address indexed sender, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);

    // Modifier to restrict AI execution
    modifier onlyStrategyManager() {
        require(msg.sender == strategyManager, "AutoYield: Not authorized strategy manager");
        _;
    }

    constructor(
        IERC20 _underlyingAsset, 
        string memory _name, 
        string memory _symbol
    ) ERC20(_name, _symbol) {
        underlyingAsset = _underlyingAsset;
    }

    function setStrategyManager(address _manager) external {
        require(strategyManager == address(0), "AutoYield: Strategy manager already set");
        strategyManager = _manager;
    }

    // ==========================================
    // 1. YIELD TRACKING & ACCOUNTING
    // ==========================================

    /**
     * @dev Calculates the total amount of underlying assets managed by the vault.
     * This physically queries to external DeFi protocols to include the yield 
     * generated since the last rebalance.
     */
    function totalAssets() public view returns (uint256) {
        // Start with idle cash sitting in this contract
        uint256 total = underlyingAsset.balanceOf(address(this));

        // Add the value of all funds actively deployed in DeFi protocols
        for (uint i = 0; i < currentAllocations.length; i++) {
            address protocol = currentAllocations[i].protocol;

            uint256 sharesOwned = IERC20(protocol).balanceOf(address(this));

            if (sharesOwned > 0) {
                // Query external protocol: "How much is our position worth right now?"
                total += IERC4626(protocol).previewRedeem(sharesOwned);
            }
        }

        return total;
    }

    // ==========================================
    // 2. USER DEPOSITS & WITHDRAWALS
    // ==========================================

    /**
     * @dev User deposits physical tokens and receives AutoYield shares representing their slice of the pie.
     */
    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        require(assets > 0, "AutoYield: Deposit must be greater than 0");

        // Calculate how many shares to mint based on current vault performance
        uint256 currentTotalAssets = totalAssets();
        uint256 currentTotalShares = totalSupply();

        if (currentTotalShares == 0 || currentTotalAssets == 0) {
            shares = assets; // 1:1 ratio for very first depositor
        } else {
            shares = (assets * currentTotalShares) / currentTotalAssets;
        }

        // Physically transfer user's tokens into the vault
        underlyingAsset.safeTransferFrom(msg.sender, address(this), assets);

        // Mint receipt tokens
        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assets, shares);

        // Note: Funds remain idle in the vault until AI triggers the next rebalance
        return shares;
    }

    /**
     * @dev User burns AutoYield shares to receive their original deposit + accrued yield.
     */
    function withdraw(uint256 shares, address receiver) external returns (uint256 assets) {
        require(shares > 0, "AutoYield: Cannot withdraw 0 shares");
        require(balanceOf(msg.sender) >= shares, "AutoYield: Insufficient shares");

        uint256 currentTotalAssets = totalAssets();
        uint256 currentTotalShares = totalSupply();

        // Calculate the physical token value of the shares being burned
        assets = (shares * currentTotalAssets) / currentTotalShares;

        // If the vault doesn't have enough idle cash, it pulls from the first protocol to pay the user
        if (underlyingAsset.balanceOf(address(this)) < assets) {
            _liquidateForWithdrawal(assets - underlyingAsset.balanceOf(address(this)));
        }

        _burn(msg.sender, shares);
        underlyingAsset.safeTransfer(receiver, assets);

        emit Withdraw(msg.sender, receiver, msg.sender, assets, shares);

        return assets;
    }

    // ==========================================
    // 2.5. LIQUIDATION HELPER
    // ==========================================
    
    /**
     * @dev Liquidate assets from external protocols to meet withdrawal demands
     */
    function _liquidateForWithdrawal(uint256 _shortfall) internal {
        if (currentAllocations.length == 0) return;
        
        uint256 remainingShortfall = _shortfall;

        // Loop through protocols until we have enough cash to pay the user
        for (uint i = 0; i < currentAllocations.length; i++) {
            if (remainingShortfall == 0) break; // Stop if we have enough

            address protocol = currentAllocations[i].protocol;
            uint256 sharesBalance = IERC20(protocol).balanceOf(address(this));
            
            if (sharesBalance > 0) {
                // How much is our position worth?
                uint256 positionValue = IERC4626(protocol).previewRedeem(sharesBalance);
                
                uint256 sharesToRedeem;
                if (positionValue <= remainingShortfall) {
                    // Liquidate the whole position
                    sharesToRedeem = sharesBalance;
                    remainingShortfall -= positionValue;
                } else {
                    // Liquidate just enough to cover the remaining shortfall
                    sharesToRedeem = (remainingShortfall * sharesBalance) / positionValue;
                    remainingShortfall = 0;
                }
                
                // Redeem shares for underlying assets
                IERC4626(protocol).redeem(sharesToRedeem, address(this), address(this));
            }
        }
        
        require(remainingShortfall == 0, "AutoYield: Insufficient liquidity across all protocols");
    }

    // ==========================================
    // 3. AUTONOMOUS PHYSICAL REBALANCING
    // ==========================================

    /**
     * @dev The core engine. Called by StrategyManager after Time-Lock expires.
     * Liquidates old positions and physically routes assets to new optimal protocols.
     */
    function rebalance(address[] memory _protocols, uint256[] memory _percentagesBps) external onlyStrategyManager {
        require(_protocols.length == _percentagesBps.length, "Arrays length mismatch");
        
        // Step 1: Withdraw EVERYTHING from current DeFi protocols back into idle cash
        for (uint i = 0; i < currentAllocations.length; i++) {
            address oldProtocol = currentAllocations[i].protocol;

            uint256 sharesBalance = IERC20(oldProtocol).balanceOf(address(this));

            if (sharesBalance > 0) {
                // Redeem external vault shares for underlying asset
                IERC4626(oldProtocol).redeem(sharesBalance, address(this), address(this));
            }
        }

        // Step 2: Get the new massive pool of funds (Original Capital + Accrued Yield)
        uint256 availableAssets = underlyingAsset.balanceOf(address(this));

        delete currentAllocations;

        // Step 3: Physically route funds to new AI-selected protocols using BPS
        for (uint i = 0; i < _protocols.length; i++) {
            // Convert BPS to actual amount (10000 BPS = 100%)
            uint256 amountToDeploy = (availableAssets * _percentagesBps[i]) / 10000;

            if (amountToDeploy > 0) {
                // Give DeFi protocol permission to take our funds
                underlyingAsset.forceApprove(_protocols[i], amountToDeploy);

                // Physically supply tokens to external protocol
                IERC4626(_protocols[i]).deposit(amountToDeploy, address(this));
            }

            // Save state with BPS values
            currentAllocations.push(Allocation(_protocols[i], _percentagesBps[i]));
        }

        emit Rebalanced(_protocols, _percentagesBps, availableAssets);
    }

    function getTotalShares() external view returns (uint256) {
        return totalSupply();
    }
}

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
 * 
 * Key Features:
 * - Physical asset routing to ERC-4626 vaults
 * - AI-driven rebalancing with time-lock protection
 * - Real-time yield tracking and accounting
 * - Emergency liquidation mechanisms
 * - Basis Points (BPS) precision for allocations
 * 
 * @contract AutoYieldVault
 * @author AutoYield AI Team
 * @version 1.0.0
 */
contract AutoYieldVault is ERC20 {
    using SafeERC20 for IERC20;

    // ========================================
    // STATE VARIABLES
    // ========================================
    
    /// @dev The underlying asset (e.g., USDC, WETH) this vault manages
    IERC20 public immutable underlyingAsset;
    
    /// @dev The strategy manager that controls rebalancing (must be authorized)
    address public strategyManager;
    
    /// @dev Current active allocations across DeFi protocols
    Allocation[] public currentAllocations;

    // ========================================
    // DATA STRUCTURES
    // ========================================
    
    /**
     * @dev Represents an allocation to a specific DeFi protocol
     * @param protocol Address of the ERC-4626 vault/lending protocol
     * @param percentage Allocation in Basis Points (10000 = 100%)
     */
    struct Allocation {
        address protocol; // Must be an ERC-4626 compatible DeFi lending pool
        uint256 percentage; // Basis Points representation (BPS)
    }

    // ========================================
    // EVENTS
    // ========================================
    
    /// @dev Emitted when vault rebalances to new allocation strategy
    /// @param protocols Array of protocol addresses in new allocation
    /// @param percentages Array of percentages in Basis Points (10000 = 100%)
    /// @param totalAssetsDeployed Total amount of assets deployed across all protocols
    event Rebalanced(address[] protocols, uint256[] percentages, uint256 totalAssetsDeployed);
    
    /// @dev Emitted when user deposits assets into vault
    /// @param sender Address that initiated the deposit
    /// @param receiver Address that received the vault shares
    /// @param assets Amount of underlying assets deposited
    /// @param shares Amount of vault shares minted
    event Deposit(address indexed sender, address indexed receiver, uint256 assets, uint256 shares);
    
    /// @dev Emitted when user withdraws assets from vault
    /// @param sender Address that initiated the withdrawal (share holder)
    /// @param receiver Address that received the underlying assets
    /// @param owner Address of the share holder
    /// @param assets Amount of underlying assets withdrawn
    /// @param shares Amount of vault shares burned
    event Withdraw(address indexed sender, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);

    // ========================================
    // MODIFIERS
    // ========================================
    
    /**
     * @dev Restricts function access to authorized strategy manager only
     * Prevents unauthorized rebalancing operations
     */
    modifier onlyStrategyManager() {
        require(msg.sender == strategyManager, "AutoYield: Not authorized strategy manager");
        _;
    }

    // ========================================
    // CONSTRUCTOR
    // ========================================
    
    /**
     * @dev Initialize the vault with underlying asset and metadata
     * @param _underlyingAsset The ERC20 token this vault will manage
     * @param _name Name for the vault shares token
     * @param _symbol Symbol for the vault shares token
     */
    constructor(
        IERC20 _underlyingAsset, 
        string memory _name, 
        string memory _symbol
    ) ERC20(_name, _symbol) {
        underlyingAsset = _underlyingAsset;
    }

    /**
     * @dev Sets the authorized strategy manager address
     * Can only be called once during initialization
     * @param _manager Address of the authorized strategy manager contract
     */
    function setStrategyManager(address _manager) external {
        require(strategyManager == address(0), "AutoYield: Strategy manager already set");
        strategyManager = _manager;
    }

    // ========================================
    // 1. YIELD TRACKING & ACCOUNTING
    // ========================================
    
    /**
     * @dev Calculates total amount of underlying assets managed by the vault.
     * This physically queries external DeFi protocols to include yield 
     * generated since the last rebalance.
     * @return total Total value of all assets (idle + deployed)
     */
    function totalAssets() public view returns (uint256 total) {
        // Start with idle cash sitting in this vault
        total = underlyingAsset.balanceOf(address(this));

        // Add value of all funds actively deployed in DeFi protocols
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

    // ========================================
    // 2. USER DEPOSITS & WITHDRAWALS
    // ========================================

    /**
     * @dev User deposits physical tokens and receives AutoYield shares
     * @param assets Amount of underlying tokens to deposit
     * @param receiver Address to receive the vault shares
     * @return shares Amount of vault shares minted
     */
    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        require(assets > 0, "AutoYield: Deposit must be greater than 0");

        // Calculate how many shares to mint based on current vault performance
        uint256 currentTotalAssets = totalAssets();
        uint256 currentTotalShares = totalSupply();

        if (currentTotalShares == 0 || currentTotalAssets == 0) {
            // HACKATHON DEMO: Simplified share math. Production requires OpenZeppelin ERC4626 
            // virtual decimals offset to prevent donation attacks. This implementation is vulnerable
            // to first depositor inflation attacks and should be replaced with OpenZeppelin ERC4626
            shares = assets; // 1:1 ratio for very first depositor
        } else {
            shares = (assets * currentTotalShares) / currentTotalAssets;
        }

        // Physically transfer user's tokens into the vault
        underlyingAsset.safeTransferFrom(msg.sender, address(this), assets);

        // Mint receipt tokens representing user's share of the vault
        _mint(receiver, shares);

        emit Deposit(msg.sender, receiver, assets, shares);

        // Note: Funds remain idle in vault until AI triggers next rebalance
        return shares;
    }

    /**
     * @dev User burns AutoYield shares to receive their original deposit + accrued yield
     * @param shares Amount of vault shares to burn
     * @param receiver Address to receive the underlying assets
     * @return assets Amount of underlying tokens withdrawn
     */
    function withdraw(uint256 shares, address receiver) external returns (uint256 assets) {
        require(shares > 0, "AutoYield: Cannot withdraw 0 shares");
        require(balanceOf(msg.sender) >= shares, "AutoYield: Insufficient shares");

        uint256 currentTotalAssets = totalAssets();
        uint256 currentTotalShares = totalSupply();

        // Calculate the physical token value of the shares being burned
        assets = (shares * currentTotalAssets) / currentTotalShares;

        // CEI PATTERN: Burn shares FIRST (Checks-Effects-Interactions)
        // This prevents reentrancy attacks by updating state before external calls
        _burn(msg.sender, shares);

        // If vault doesn't have enough idle cash, it pulls from the first protocol to pay user
        if (underlyingAsset.balanceOf(address(this)) < assets) {
            _liquidateForWithdrawal(assets - underlyingAsset.balanceOf(address(this)));
        }

        // Finally transfer the user's money
        underlyingAsset.safeTransfer(receiver, assets);

        emit Withdraw(msg.sender, receiver, msg.sender, assets, shares);

        return assets;
    }

    // ========================================
    // 3. REBALANCING LOGIC (BPS-BASED FOR ENTERPRISE PRECISION)
    // ========================================
    
    /**
     * @dev Manual rebalance function for emergency or testing
     * @param _protocols Array of protocol addresses to allocate to
     * @param _percentages Array of percentages in Basis Points (10000 = 100%)
     * @param _receiver Address to receive vault shares (usually vault itself)
     */
    function rebalance(
        address[] memory _protocols,
        uint256[] memory _percentages, // Now in Basis Points (10000 = 100%)
        address _receiver
    ) external onlyStrategyManager {
        require(_protocols.length == _percentages.length, "Array length mismatch");
        require(_protocols.length > 0, "No protocols specified");

        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < _percentages.length; i++) {
            totalPercentage += _percentages[i]; // Sum BPS values
        }
        require(totalPercentage == 10000, "Percentages must sum to 10000 BPS (100%)");

        uint256 availableAssets = underlyingAsset.balanceOf(address(this));
        uint256 totalShares = totalSupply();

        for (uint256 i = 0; i < _protocols.length; i++) {
            uint256 protocolAssets = (availableAssets * _percentages[i]) / 10000; // Use BPS math
            address protocol = _protocols[i];

            // Withdraw from protocol if we have existing position
            if (IERC4626(protocol).balanceOf(address(this)) > 0) {
                IERC4626(protocol).transferFrom(address(this), protocol, protocolAssets);
            }

            // Deposit to protocol
            IERC4626(protocol).transferFrom(address(this), _receiver, protocolAssets);
    // 2.5. LIQUIDATION HELPER
    // ========================================
    
    /**
     * @dev Liquidate assets from external protocols to meet withdrawal demands
     * @param _shortfall Amount of additional assets needed
     */
    function _liquidateForWithdrawal(uint256 _shortfall) internal {
        if (currentAllocations.length == 0) return;
        
        uint256 remainingShortfall = _shortfall;

        // Loop through protocols until we have enough cash to pay user
        // CRITICAL: Use try/catch to prevent vault bricking from illiquid protocols
        for (uint i = 0; i < currentAllocations.length; i++) {
            if (remainingShortfall == 0) break; // Stop if we have enough

            address protocol = currentAllocations[i].protocol;
            uint256 sharesBalance = IERC20(protocol).balanceOf(address(this));
            
            if (sharesBalance > 0) {
                // How much is our position worth?
                uint256 positionValue = IERC4626(protocol).previewRedeem(sharesBalance);
                
                uint256 sharesToRedeem;
                if (positionValue <= remainingShortfall) {
                    // Liquidate whole position
                    sharesToRedeem = sharesBalance;
                    remainingShortfall -= positionValue;
                } else {
                    // Liquidate just enough to cover the remaining shortfall
                    sharesToRedeem = (remainingShortfall * sharesBalance) / positionValue;
                    remainingShortfall = 0;
                }
                
                // CRITICAL: Wrap external call in try/catch to prevent vault bricking
                // If protocol is paused or illiquid, skip it and continue with others
                try IERC4626(protocol).redeem(sharesToRedeem, address(this), address(this)) {
                    // Withdrawal succeeded - continue to next protocol
                } catch {
                    // PRODUCTION V2: Log failed protocol and implement emergency ejection
                    // HACKATHON DEMO: Skip illiquid protocol to prevent vault lockup
                    continue;
                }
            }
        }
        
        // CRITICAL: Modified require to handle partial liquidation scenarios
        // In production, implement emergency withdrawal mechanisms
        require(remainingShortfall == 0, "AutoYield: Insufficient liquidity across all protocols");
    }

    // ========================================
    // 3. AUTONOMOUS PHYSICAL REBALANCING
    // ========================================
    
    /**
     * @dev The core engine. Called by StrategyManager after Time-Lock expires.
     * Liquidates old positions and physically routes assets to new optimal protocols.
     * @param _protocols Array of new protocol addresses
     * @param _percentagesBps Array of allocation percentages in Basis Points
     */
    function rebalance(address[] memory _protocols, uint256[] memory _percentagesBps) external onlyStrategyManager {
        require(_protocols.length == _percentagesBps.length, "Arrays length mismatch");
        require(_protocols.length <= 10, "Gas Limit Protection: Max 10 protocols");
        
        // Step 1: Withdraw EVERYTHING from current DeFi protocols back into idle cash
        // HACKATHON DEMO: Full liquidation sweep. Production V2 implements delta-rebalancing
        // to handle illiquid protocol states and prevent vault lockups
        for (uint i = 0; i < currentAllocations.length; i++) {
            address oldProtocol = currentAllocations[i].protocol;

            uint256 sharesBalance = IERC20(oldProtocol).balanceOf(address(this));

            if (sharesBalance > 0) {
                try IERC4626(oldProtocol).redeem(sharesBalance, address(this), address(this)) {
                    // Withdrawal succeeded
                } catch {
                    // HACKATHON DEMO: Skip illiquid protocols to prevent vault bricking
                    // Production V2 implements partial withdrawal and graceful failure handling
                    continue;
                }
            }
        }

        // Step 2: Get new massive pool of funds (Original Capital + Accrued Yield)
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

    /**
     * @dev Get total vault shares (convenience function)
     * @return Total supply of vault shares
     */
    function getTotalShares() external view returns (uint256) {
        return totalSupply();
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * ========================================
 * AUTOYIELD AI - MOCK ERC4626 VAULT
 * ========================================
 * 
 * Contract: contracts/MockERC4626.sol
 * Version: 1.0.0
 * Author: AutoYield AI Team
 * License: MIT
 * 
 * ========================================
 * CONTRACT DESCRIPTION
 * ========================================
 * Mock ERC-4626 vault implementation for testing and development purposes in the
 * AutoYield AI ecosystem. This contract simulates the behavior of real DeFi vaults
 * like Aave and Compound, providing a standardized interface for testing vault
 * operations, yield generation simulation, and strategy execution without requiring
 * integration with external protocols.
 * 
 * Purpose:
 * - Testing environment setup for vault operations
 * - Simulation of yield farming protocols
 * - Strategy execution validation
 * - AutoYieldVault integration testing
 * - Development and demonstration purposes
 * 
 * ========================================
 * KEY FEATURES
 * ========================================
 * 
 * ERC-4626 Compliance:
 * - Full ERC-4626 standard implementation
 * - Standard vault interface compatibility
 * - Deposit, withdraw, mint, redeem functions
 * - Preview functions for calculations
 * - Max operation functions
 * 
 * Mock Functionality:
 * - 1:1 asset-to-share conversion for simplicity
 * - No actual yield generation (mock)
 * - Faucet function for testing tokens
 * - Simplified APY simulation
 * 
 * Testing Support:
 * - Faucet for easy token distribution
 * - Unlimited deposit/withdrawal capacity
 * - Standard vault behavior simulation
 * - Integration test ready
 * 
 * ========================================
 * TECHNICAL SPECIFICATIONS
 * ========================================
 * 
 * Vault Structure:
 * - Inherits from ERC20 for share tokens
 * - Immutable underlying asset reference
 * - Total assets tracking
 * - 1e18 precision constant
 * 
 * Conversion Functions:
 * - 1:1 asset-to-share ratio (simplified)
 * - convertToShares() and convertToAssets()
 * - preview functions for all operations
 * - No slippage or fees
 * 
 * Operation Limits:
 * - Unlimited deposit capacity
 * - Unlimited mint capacity
 * - Withdraw limited by share balance
 * - Redeem limited by share balance
 * 
 * ========================================
 * CORE FUNCTIONS
 * ========================================
 * 
 * Deposit Operations:
 * - deposit(): Deposit assets for shares
 * - mint(): Mint shares with assets
 * - previewDeposit(): Calculate shares from assets
 * - previewMint(): Calculate assets from shares
 * 
 * Withdrawal Operations:
 * - withdraw(): Withdraw assets for shares
 * - redeem(): Redeem shares for assets
 * - previewWithdraw(): Calculate shares needed
 * - previewRedeem(): Calculate assets returned
 * 
 * Utility Functions:
 * - totalAssets(): Get total underlying assets
 * - maxDeposit(): Maximum deposit amount
 * - maxWithdraw(): Maximum withdrawal amount
 * - faucet(): Get test tokens
 * 
 * ========================================
 * FAUCET FUNCTIONALITY
 * ========================================
 * 
 * Purpose:
 * - Provide easy access to test tokens
 * - Enable demo and testing workflows
 * - Simplify user onboarding
 * - Support hackathon demonstrations
 * 
 * Behavior:
 * - Mints 1,000 share tokens to caller
 * - Uses vault's decimal precision
 * - No restrictions or limits
 * - Can be called multiple times
 * 
 * ========================================
 * EVENT SYSTEM
 * ========================================
 * 
 * Deposit Event:
 * - Emitted on asset deposits
 * - Indexed caller and receiver addresses
 * - Asset and share amounts
 * - Transaction tracking
 * 
 * Withdraw Event:
 * - Emitted on asset withdrawals
 * - Indexed caller, receiver, and owner
 * - Asset and share amounts
 * - Complete transaction details
 * 
 * ========================================
 * SECURITY CONSIDERATIONS
 * ========================================
 * 
 * Testing Environment:
 * - For testing/development only
 * - Not for production use
 * - No real yield generation
 * - No security guarantees
 * 
 * Access Control:
 * - No access restrictions
 * - Public function access
 * - Faucet available to all
 * - Standard ERC20 security
 * 
 * ========================================
 * INTEGRATION COMPATIBILITY
 * ========================================
 * 
 * AutoYieldVault Integration:
 * - Compatible as external protocol
 * - Standard ERC-4626 interface
 * - Asset and share operations
 * - Balance queries
 * 
 * Strategy Testing:
 * - Works with strategy execution
 * - Asset allocation simulation
 * - Rebalancing operations
 * - Risk management testing
 * 
 * ========================================
 * USAGE SCENARIOS
 * ========================================
 * 
 * Vault Testing:
 * - Test deposit and withdrawal flows
 * - Validate share calculations
 * - Simulate vault operations
 * - Test integration patterns
 * 
 * Strategy Testing:
 * - Test strategy allocation to vault
 * - Simulate rebalancing operations
 * - Validate asset transfers
 * - Test risk management
 * 
 * Demo Purposes:
 * - Demonstrate vault functionality
 * - Show user interface flows
 * - Provide test environment
 * - Support hackathon presentations
 * 
 * ========================================
 * LIMITATIONS
 * ========================================
 * 
 * Mock Nature:
 * - No real yield generation
 * - Fixed 1:1 conversion ratio
 * - No external protocol integration
 * - Simplified behavior
 * 
 * Functionality:
 * - No fees or slippage
 * - No time-based yield
 * - No risk factors
 * - Basic vault operations only
 * 
 * ========================================
 * DEPENDENCIES
 * ========================================
 * - OpenZeppelin IERC20: Token interface
 * - OpenZeppelin ERC20: Token implementation
 * - Solidity ^0.8.20: Modern Solidity features
 * - No external dependencies
 * 
 * ========================================
 * LICENSING & ATTRIBUTION
 * ========================================
 * License: MIT
 * Author: AutoYield AI Team
 * Project: AutoYield AI - Intelligent DeFi Yield Optimization
 * 
 * ========================================
 * USAGE EXAMPLES
 * ========================================
 * 
 * Basic Deployment:
 * // Deploy mock vault with USDC
 * MockERC4626 vault = new MockERC4626(
 *   usdcAddress,
 *   "Mock Aave Vault",
 *   "mvAave"
 * );
 * 
 * Get Test Tokens:
 * // Use faucet to get shares
 * vault.faucet();
 * 
 * Deposit Assets:
 * // Deposit USDC into vault
 * uint256 shares = vault.deposit(
 *   1000 * 10**6,
 *   userAddress
 * );
 * 
 * Withdraw Assets:
 * // Withdraw from vault
 * uint256 returnedShares = vault.withdraw(
 *   500 * 10**6,
 *   userAddress,
 *   userAddress
 * );
 * 
 * ========================================
 * ACKNOWLEDGMENTS
 * ========================================
 * Implements ERC-4626 vault standard for testing.
 * Provides development environment support.
 * Designed for testing and simulation purposes only.
 */
contract MockERC4626 is ERC20 {
    IERC20 public immutable asset;
    uint256 private _totalAssets;
    uint256 private constant PRECISION = 1e18;
    
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares);
    
    constructor(
        IERC20 _asset,
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        asset = _asset;
    }
    
    function totalAssets() external view returns (uint256) {
        return _totalAssets;
    }
    
    function convertToShares(uint256 assets) public pure returns (uint256) {
        return assets; // 1:1 conversion for simplicity
    }
    
    function convertToAssets(uint256 shares) public pure returns (uint256) {
        return shares; // 1:1 conversion for simplicity
    }
    
    function maxDeposit(address) external pure returns (uint256) {
        return type(uint256).max;
    }
    
    function maxMint(address) external pure returns (uint256) {
        return type(uint256).max;
    }
    
    function maxWithdraw(address owner) external view returns (uint256) {
        return balanceOf(owner);
    }

    // NEW: Allow judges/users to mint test tokens to try your app!
    function faucet() external {
        _mint(msg.sender, 1000 * 10**decimals()); // Gives them 1,000 USDC
    }
    
    function maxRedeem(address owner) external view returns (uint256) {
        return balanceOf(owner);
    }
    
    function previewDeposit(uint256 assets) public pure returns (uint256) {
        return convertToShares(assets);
    }
    
    function previewMint(uint256 shares) public pure returns (uint256) {
        return convertToAssets(shares);
    }
    
    function previewWithdraw(uint256 assets) public pure returns (uint256) {
        return convertToShares(assets);
    }
    
    function previewRedeem(uint256 shares) public pure returns (uint256) {
        return convertToAssets(shares);
    }
    
    function deposit(uint256 assets, address receiver) external returns (uint256) {
        require(assets > 0, "ZERO_ASSETS");
        
        uint256 shares = previewDeposit(assets);
        _mint(receiver, shares);
        
        // Transfer assets from caller to this vault
        asset.transferFrom(msg.sender, address(this), assets);
        _totalAssets += assets;
        
        emit Deposit(msg.sender, receiver, assets, shares);
        return shares;
    }
    
    function mint(uint256 shares, address receiver) external returns (uint256) {
        require(shares > 0, "ZERO_SHARES");
        
        uint256 assets = previewMint(shares);
        _mint(receiver, shares);
        
        // Transfer assets from caller to this vault
        asset.transferFrom(msg.sender, address(this), assets);
        _totalAssets += assets;
        
        emit Deposit(msg.sender, receiver, assets, shares);
        return assets;
    }
    
    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256) {
        require(assets > 0, "ZERO_ASSETS");
        
        uint256 shares = previewWithdraw(assets);
        _burn(owner, shares);
        
        _totalAssets -= assets;
        
        // Transfer assets to receiver
        asset.transfer(receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
        return shares;
    }
    
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256) {
        require(shares > 0, "ZERO_SHARES");
        
        uint256 assets = previewRedeem(shares);
        _burn(owner, shares);
        
        _totalAssets -= assets;
        
        // Transfer assets to receiver
        asset.transfer(receiver, assets);
        
        emit Withdraw(msg.sender, receiver, owner, assets, shares);
        return assets;
    }
}

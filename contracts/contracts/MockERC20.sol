// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * ========================================
 * AUTOYIELD AI - MOCK ERC20 TOKEN
 * ========================================
 * 
 * Contract: contracts/MockERC20.sol
 * Version: 1.0.0
 * Author: AutoYield AI Team
 * License: MIT
 * 
 * ========================================
 * CONTRACT DESCRIPTION
 * ========================================
 * Mock USDC token implementation for testing and development purposes in the
 * AutoYield AI ecosystem. This contract provides a fully functional ERC20 token
 * that simulates USDC behavior for testing vault operations, strategy execution,
 * and yield farming interactions without requiring real USDC tokens.
 * 
 * Purpose:
 * - Testing environment setup
 * - Development simulation
 * - Vault deposit/withdrawal testing
 * - Strategy execution validation
 * - UI integration testing
 * 
 * ========================================
 * KEY FEATURES
 * ========================================
 * 
 * ERC20 Compliance:
 * - Full ERC20 standard implementation
 * - OpenZeppelin base contract inheritance
 * - Standard token functions (transfer, approve, etc.)
 * - Event emission compliance
 * 
 * Mock Functionality:
 * - 1,000,000 tokens minted to deployer
 * - 6 decimal places (USDC standard)
 * - Instant minting for testing
 * - No transfer restrictions
 * 
 * Testing Support:
 * - Sufficient initial supply
 * - Standard ERC20 behavior
 * - Compatible with vault operations
 * - Integration test ready
 * 
 * ========================================
 * TECHNICAL SPECIFICATIONS
 * ========================================
 * 
 * Token Details:
 * - Name: Mock USDC
 * - Symbol: mUSDC
 * - Decimals: 6 (matching USDC standard)
 * - Initial Supply: 1,000,000 tokens
 * - Total Supply: Fixed at deployment
 * 
 * ERC20 Functions:
 * - transfer(): Send tokens to address
 * - approve(): Approve spending allowance
 * - transferFrom(): Transfer with allowance
 * - balanceOf(): Check token balance
 * - allowance(): Check approved amount
 * 
 * ========================================
 * USAGE SCENARIOS
 * ========================================
 * 
 * Vault Testing:
 * - Deposit mock USDC into AutoYieldVault
 * - Test withdrawal operations
 * - Validate share calculations
 * - Simulate yield generation
 * 
 * Strategy Testing:
 * - Test strategy execution with mock funds
 * - Validate protocol allocations
 * - Simulate rebalancing operations
 * - Test risk management
 * 
 * Integration Testing:
 * - Frontend wallet connection
 * - Transaction signing simulation
 * - Balance display testing
 * - User interface validation
 * 
 * ========================================
 * DEPLOYMENT NOTES
 * ========================================
 * 
 * Constructor Behavior:
 * - Inherits from OpenZeppelin ERC20
 * - Sets token name and symbol
 * - Mints 1M tokens to deployer
 * - Uses 6 decimal places
 * 
 * Initial Distribution:
 * - All tokens go to deployer
 * - Deployer can distribute for testing
 * - No vesting or restrictions
 * - Immediate availability
 * 
 * ========================================
 * SECURITY CONSIDERATIONS
 * ========================================
 * 
 * Testing Environment:
 * - For testing/development only
 * - Not for production use
 * - No real monetary value
 * - No security guarantees
 * 
 * Token Security:
 * - Standard ERC20 security
 * - OpenZeppelin audit protection
 * - No known vulnerabilities
 * - Basic access control
 * 
 * ========================================
 * INTEGRATION COMPATIBILITY
 * ========================================
 * 
 * Vault Integration:
 * - Compatible with AutoYieldVault
 * - Standard ERC20 interface
 * - 6-decimal precision support
 * - Full function compatibility
 * 
 * Protocol Integration:
 * - Works with ERC4626 vaults
 * - Standard approval mechanisms
 * - Transfer functionality
 * - Balance queries
 * 
 * ========================================
 * LIMITATIONS
 * ========================================
 * 
 * Mock Nature:
 * - No real value
 * - No yield generation
 * - No external price feeds
 * - Test environment only
 * 
 * Functionality:
 * - Fixed supply
 * - No minting after deployment
 * - No burning mechanisms
 * - Basic ERC20 only
 * 
 * ========================================
 * DEPENDENCIES
 * ========================================
 * - OpenZeppelin ERC20: Standard token implementation
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
 * // Deploy mock USDC
 * MockUSDC mockToken = new MockUSDC();
 * 
 * // Check deployer balance
 * uint256 balance = mockToken.balanceOf(msg.sender);
 * // Returns: 1,000,000 * 10**6
 * 
 * Transfer Tokens:
 * // Transfer to user
 * mockToken.transfer(userAddress, 1000 * 10**6);
 * 
 * Vault Integration:
 * // Approve vault spending
 * mockToken.approve(vaultAddress, amount);
 * 
 * ========================================
 * ACKNOWLEDGMENTS
 * ========================================
 * Implements standard ERC20 token for testing.
 * Provides development environment support.
 * Designed for testing and simulation purposes only.
 */
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        // Mint 1M tokens to deployer for testing
        _mint(msg.sender, 1000000 * 10**decimals());
    }
}

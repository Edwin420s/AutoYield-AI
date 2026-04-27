/**
 * Blockchain Configuration Module
 * Provides ethers.js provider and wallet configuration for blockchain interactions
 * 
 * Key Features:
 * - RPC provider initialization from environment variables
 * - Wallet creation with private key
 * - Exported wallet and provider instances
 * - Environment-based configuration management
 * 
 * @module backend/src/config/blockchain.js
 * @author AutoYield AI Team
 * @version 1.0.0
 */
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// ========================================
// BLOCKCHAIN CONFIGURATION
// ========================================

/// @dev JSON RPC Provider from environment variable or fallback
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

/// @dev Wallet instance with private key from environment
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

/**
 * Get configured wallet instance
 * Returns the ethers wallet for blockchain transactions
 * 
 * @returns {ethers.Wallet} Configured wallet instance
 */
export const getWallet = () => wallet;

/**
 * Export provider as default for direct imports
 * Returns the ethers provider for blockchain queries
 * 
 * @returns {ethers.JsonRpcProvider} Configured provider instance
 */
export default provider;

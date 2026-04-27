/**
 * TEE Service - Simulates Trusted Execution Environment signing
 * For hackathon demo purposes - simulates Intel SGX enclave behavior
 * 
 * Key Features:
 * - Mock enclave key generation and management
 * - Strategy hash creation and signing
 * - TEE attestation signature verification
 * - Enclave address management
 * 
 * SECURITY WARNING: Oracle Vulnerability
 * ========================================
 * This V1 prototype has a critical oracle vulnerability:
 * The TEE only secures the *calculation*, not the *data source*.
 * Market data is fetched from external APIs (DefiLlama) and fed to the TEE.
 * If the Node.js server is compromised, an attacker can rewrite API responses
 * to manipulate the AI's decisions while generating valid TEE proofs.
 * 
 * Production V2 Solution:
 * - SGX Enclave natively queries Decentralized On-Chain Oracles (Chainlink/Pyth)
 * - Completely removes Node.js server from the chain of trust
 * - Implements cryptographic data source verification
 * 
 * @module services/teeService
 * @author AutoYield AI Team
 * @version 1.0.0
 */
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

// ========================================
// MOCK ENCLAVE CONFIGURATION
// ========================================

/// @dev Mock enclave private key (should match one used in deployment)
/// Falls back to zero address if not configured
const MOCK_ENCLAVE_PRIVATE_KEY = process.env.MOCK_ENCLAVE_PRIVATE_KEY || 
  "0x" + "0".repeat(64); // Fallback to zero address if not set

/// @dev Mock enclave wallet for signing operations
const enclaveWallet = new ethers.Wallet(MOCK_ENCLAVE_PRIVATE_KEY);

/**
 * Generate TEE attestation signature for strategy proposal
 * Simulates Intel SGX enclave signing of strategy hash
 * 
 * @param {Object} strategyData - Strategy data containing protocols, percentages, and APY
 * @param {Array<string>} strategyData.protocols - Array of protocol addresses
 * @param {Array<number>} strategyData.percentages - Allocation percentages in BPS (10000 = 100%)
 * @param {number} strategyData.expectedAPY - Expected annual percentage yield
 * @returns {Promise<Object>} Object containing signature, enclave address, and strategy hash
 * @throws {Error} When TEE attestation generation fails
 */
export async function generateTEEAttestation(strategyData) {
  try {
    // Create strategy hash exactly as smart contract expects
    // Uses same encoding pattern as StrategyManager.sol
    const strategyHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['address[]', 'uint256[]', 'uint256'],
        [
          strategyData.protocols,
          strategyData.percentages, // Should be in BPS (10000 = 100%)
          strategyData.expectedAPY
        ]
      )
    );

    // Sign the hash with mock enclave private key
    const signature = await enclaveWallet.signMessage(ethers.getBytes(strategyHash));

    console.log('Generated TEE Attestation:', {
      strategyHash,
      enclaveAddress: enclaveWallet.address,
      signature: signature.substring(0, 20) + '...'
    });

    return {
      signature,
      enclaveAddress: enclaveWallet.address,
      strategyHash
    };

  } catch (error) {
    console.error('TEE attestation failed:', error);
    throw new Error(`TEE attestation generation failed: ${error.message}`);
  }
}

/**
 * Verify TEE signature (for testing purposes)
 * Recreates strategy hash and verifies signature matches expected enclave address
 * 
 * @param {Object} strategyData - Original strategy data to verify
 * @param {string} signature - TEE attestation signature to verify
 * @param {string} expectedEnclaveAddress - Expected enclave address for verification
 * @returns {boolean} True if signature is valid, false otherwise
 */
export function verifyTEEAttestation(strategyData, signature, expectedEnclaveAddress) {
  try {
    // Recreate strategy hash using same encoding as generation
    const strategyHash = ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ['address[]', 'uint256[]', 'uint256'],
        [
          strategyData.protocols,
          strategyData.percentages,
          strategyData.expectedAPY
        ]
      )
    );

    // Recover signer address from signature
    const recoveredAddress = ethers.verifyMessage(strategyHash, signature);
    
    // Verify recovered address matches expected enclave address
    return recoveredAddress.toLowerCase() === expectedEnclaveAddress.toLowerCase();
  } catch (error) {
    console.error('TEE verification failed:', error);
    return false;
  }
}

/**
 * Get mock enclave address for frontend display
 * Returns the address of the simulated TEE enclave
 * 
 * @returns {string} Mock enclave address
 */
export function getEnclaveAddress() {
  return enclaveWallet.address;
}

import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

/**
 * TEE Service - Simulates Trusted Execution Environment signing
 * For hackathon demo purposes - simulates Intel SGX enclave behavior
 */

// Mock enclave private key (should match the one used in deployment)
const MOCK_ENCLAVE_PRIVATE_KEY = process.env.MOCK_ENCLAVE_PRIVATE_KEY || 
  "0x" + "0".repeat(64); // Fallback to zero address if not set

const enclaveWallet = new ethers.Wallet(MOCK_ENCLAVE_PRIVATE_KEY);

/**
 * Generate TEE attestation signature for strategy proposal
 * Simulates Intel SGX enclave signing the strategy hash
 */
export async function generateTEEAttestation(strategyData) {
  try {
    // Create strategy hash exactly as the smart contract expects
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

    // Sign the hash with the enclave private key
    const signature = await enclaveWallet.signMessage(ethers.getBytes(strategyHash));

    console.log('🔐 Generated TEE Attestation:', {
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
    console.error('❌ TEE attestation failed:', error);
    throw new Error(`TEE attestation generation failed: ${error.message}`);
  }
}

/**
 * Verify TEE signature (for testing purposes)
 */
export function verifyTEEAttestation(strategyData, signature, expectedEnclaveAddress) {
  try {
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

    const recoveredAddress = ethers.verifyMessage(strategyHash, signature);
    
    return recoveredAddress.toLowerCase() === expectedEnclaveAddress.toLowerCase();
  } catch (error) {
    console.error('❌ TEE verification failed:', error);
    return false;
  }
}

/**
 * Get mock enclave address for frontend display
 */
export function getEnclaveAddress() {
  return enclaveWallet.address;
}

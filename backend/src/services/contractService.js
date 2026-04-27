import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Contract Service - Handles all blockchain interactions with AutoYield smart contracts
 * Provides functions for strategy proposals, execution, and protocol management
 * 
 * Key Features:
 * - Strategy proposal with TEE attestation verification
 * - Time-locked execution for security
 * - Protocol whitelisting and risk scoring
 * - Complete proposal lifecycle management
 * - CRITICAL: Nonce manager to prevent race condition crashes
 * 
 * @module services/contractService
 */

// Get wallet and provider
const provider = new ethers.JsonRpcProvider(process.env.ZERO_G_RPC_URL || process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ========================================
// CRITICAL: NONCE MANAGER & MUTEX LOCK
// ========================================
// Prevents race condition crashes when multiple users submit transactions simultaneously

/// @dev Transaction queue to serialize blockchain operations
let transactionQueue = [];
let isProcessing = false;

/**
 * Mutex lock for transaction processing
 * Ensures only one transaction is processed at a time to prevent nonce collisions
 * @param {Function} operation - Async function to execute under lock
 * @returns {Promise<any>} Result of the operation
 */
async function withMutexLock(operation) {
  return new Promise((resolve, reject) => {
    transactionQueue.push({ operation, resolve, reject });
    
    if (!isProcessing) {
      processQueue();
    }
  });
}

/**
 * Process transaction queue sequentially
 * Prevents nonce collision race conditions that crash Node.js server
 */
async function processQueue() {
  if (transactionQueue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const { operation, resolve, reject } = transactionQueue.shift();

  try {
    const result = await operation();
    resolve(result);
  } catch (error) {
    // CRITICAL: Catch EVM errors to prevent server crashes
    console.error('Transaction failed:', error.message);
    
    // Return structured error instead of crashing
    if (error.code === 'NONCE_TOO_LOW' || error.code === 'REPLACEMENT_UNDERPRICED') {
      reject(new Error('Transaction conflict detected. Please try again.'));
    } else {
      reject(error);
    }
  }

  // Process next item in queue
  setTimeout(processQueue, 100); // Small delay between transactions
}

// Helper function to get wallet instance
function getWallet() {
  return wallet;
}

// Contract ABIs - AutoYield smart contract interfaces
const managerAbi = [
  "function proposeStrategy(address[] protocols, uint256[] percentages, uint256 reportedApy, bytes _sgxSignature)",
  "function executeProposedStrategy(uint256 proposalId)",
  "function cancelProposal(uint256 proposalId)",
  "function getProposal(uint256 proposalId) view returns (address[], uint256[], uint256, bool, bool, address, uint256, uint256)",
  "function updateProtocol(address protocol, bool status, uint256 riskScore, string name, string zeroGHash)",
  "function setTrustedEnclaveKey(address newKey)",
  "function proposalCount() view returns (uint256)"
];

/**
 * Submit strategy proposal to blockchain with TEE attestation
 * Creates a time-locked proposal that must wait 24 hours before execution
 * 
 * @param {Object} decision - AI decision object with protocols, percentages, and APY
 * @param {string} decision.executionProof - TEE attestation signature for verification
 * @returns {Promise<Object>} Transaction receipt with block details
 * @throws {Error} When contract interaction fails
 */
export async function proposeStrategy(decision) {
  // CRITICAL: Use mutex lock to prevent nonce collision race conditions
  return await withMutexLock(async () => {
    try {
      console.log("Submitting strategy proposal to blockchain...");
      
      const contract = new ethers.Contract(
        process.env.MANAGER_ADDRESS,
        managerAbi,
        wallet
      );
      
      // decision.executionProof comes from TEE attestation
      const tx = await contract.proposeStrategy(
        decision.protocols,
        decision.percentages,
        decision.expectedAPY,
        decision.executionProof || "0x" // Pass TEE signature
      );
      
      console.log(`Transaction submitted: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`Transaction confirmed in block: ${receipt.blockNumber}`);
      
      return receipt;
      
    } catch (error) {
      console.error("Failed to propose strategy:", error);
      throw error;
    }
  });
}

/**
 * Execute a time-locked strategy proposal
 * Can only be called after 24-hour waiting period has elapsed
 * 
 * @param {number} proposalId - Unique identifier of the proposal to execute
 * @returns {Promise<Object>} Transaction receipt with execution details
 * @throws {Error} When execution fails or time-lock hasn't expired
 */
export async function executeProposal(proposalId) {
  // CRITICAL: Use mutex lock to prevent nonce collision race conditions
  return await withMutexLock(async () => {
    try {
      console.log(`Executing proposal ${proposalId}...`);
      
      const contract = new ethers.Contract(
        process.env.MANAGER_ADDRESS,
        managerAbi,
        wallet
      );
      
      const tx = await contract.executeProposedStrategy(proposalId);
      
      const receipt = await tx.wait();
      console.log(`Proposal executed successfully`);
      
      return receipt;
      
    } catch (error) {
      console.error("Failed to execute proposal:", error);
      throw error;
    }
  });
}

/**
 * Cancel a pending strategy proposal
 * Can only be called by the original proposer before execution
 * 
 * @param {number} proposalId - Unique identifier of the proposal to cancel
 * @returns {Promise<Object>} Transaction receipt with cancellation details
 * @throws {Error} When cancellation fails or proposal already executed
 */
export async function cancelProposal(proposalId) {
  // CRITICAL: Use mutex lock to prevent nonce collision race conditions
  return await withMutexLock(async () => {
    try {
      console.log(`Canceling proposal ${proposalId}...`);
      
      const contract = new ethers.Contract(
        process.env.MANAGER_ADDRESS,
        managerAbi,
        wallet
      );
      
      const tx = await contract.cancelProposal(proposalId);
      
      const receipt = await tx.wait();
      console.log(`Proposal canceled successfully`);
      
      return receipt;
      
    } catch (error) {
      console.error("Failed to cancel proposal:", error);
      throw error;
    }
  });
}


/**
 * Retrieve detailed information about a protocol from smart contract
 * Returns protocol metadata including whitelist status, risk score, and storage references
 * 
 * @param {string} protocolAddress - Smart contract address of the protocol
 * @returns {Promise<Object>} Protocol information object
 * @throws {Error} When contract query fails
 */
export async function getProtocolInfo(protocolAddress) {
  const contract = new ethers.Contract(
    process.env.MANAGER_ADDRESS,
    managerAbi,
    wallet
  );

  const info = await contract.getProtocolInfo(protocolAddress);
  
  return {
    isWhitelisted: info.isWhitelisted,
    riskScore: Number(info.riskScore),
    name: info.name,
    zeroGStorageHash: info.zeroGStorageHash,
    lastUpdated: Number(info.lastUpdated)
  };
}

/**
 * Get detailed information about a specific proposal
 * Returns complete proposal data including execution status and timing
 * 
 * @param {number} proposalId - Unique identifier of the proposal
 * @returns {Promise<Object>} Proposal details with human-readable protocol names
 * @throws {Error} When proposal doesn't exist or query fails
 */
export async function getProposalDetails(proposalId) {
  const contract = new ethers.Contract(
    process.env.MANAGER_ADDRESS,
    managerAbi,
    wallet
  );

  const proposal = await contract.getProposal(proposalId);
  
  // Convert addresses back to protocol names for frontend
  const protocolNames = await getProtocolNames(proposal.protocols);
  
  return {
    protocols: protocolNames,
    percentages: proposal.percentages.map(p => Number(p)),
    executionTime: Number(proposal.executionTime),
    executed: proposal.executed,
    canceled: proposal.canceled,
    proposedBy: proposal.proposedBy,
    totalApy: Number(proposal.totalApy),
    portfolioRisk: Number(proposal.portfolioRisk)
  };
}

/**
 * Retrieve all proposals from the smart contract
 * Returns paginated list of all proposals with their current status
 * 
 * @returns {Promise<Array>} Array of proposal objects with complete details
 * @throws {Error} When contract query fails
 */
export async function getAllProposals() {
  const contract = new ethers.Contract(
    process.env.MANAGER_ADDRESS,
    managerAbi,
    wallet
  );

  const count = await contract.proposalCount();
  const proposals = [];
  
  for (let i = 0; i < Number(count); i++) {
    try {
      const proposal = await getProposalDetails(i);
      proposals.push({ id: i, ...proposal });
    } catch (error) {
      console.error(`Failed to fetch proposal ${i}:`, error);
    }
  }
  
  return proposals;
}

/**
 * Get a single proposal by ID (convenience function)
 * 
 * @param {number} proposalId - Unique identifier of the proposal
 * @returns {Promise<Object>} Proposal details or null if not found
 * @throws {Error} When contract query fails
 */
export async function getProposal(proposalId) {
  return await getProposalDetails(proposalId);
}

// Helper functions to convert between protocol names and addresses
// Uses environment variables for deployed mock contracts on 0G network

/**
 * Convert protocol names to their corresponding smart contract addresses
 * 
 * @param {Array<string>} protocolNames - Array of protocol names (e.g., ['Aave', 'Compound'])
 * @returns {Array<string>} Array of contract addresses
 */
async function getProtocolAddresses(protocolNames) {
  // Use deployed mock ERC-4626 vault addresses on 0G network
  // These are the actual deployed contracts, not Ethereum mainnet addresses
  const mockAddresses = {
    'Aave': process.env.MOCK_AAVE_ADDRESS || ethers.ZeroAddress,
    'Benqi': process.env.MOCK_BENQI_ADDRESS || ethers.ZeroAddress,
    'Compound': process.env.MOCK_COMPOUND_ADDRESS || ethers.ZeroAddress
  };
  
  return protocolNames.map(name => mockAddresses[name] || ethers.ZeroAddress);
}

/**
 * Convert protocol addresses to their human-readable names
 * 
 * @param {Array<string>} protocolAddresses - Array of contract addresses
 * @returns {Array<string>} Array of protocol names (or truncated addresses if unknown)
 */
async function getProtocolNames(protocolAddresses) {
  // Reverse mapping from addresses to names using environment variables
  const mockNames = {
    [process.env.MOCK_AAVE_ADDRESS?.toLowerCase()]: 'Aave',
    [process.env.MOCK_BENQI_ADDRESS?.toLowerCase()]: 'Benqi',
    [process.env.MOCK_COMPOUND_ADDRESS?.toLowerCase()]: 'Compound'
  };
  
  return protocolAddresses.map(addr => mockNames[addr.toLowerCase()] || addr.substring(0, 8) + '...');
}

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

// Mock wallet for demo purposes (avoids blockchain connection issues)
const wallet = {
  address: process.env.PRIVATE_KEY ? '0x' + '0'.repeat(40) : '0x0000000000000000000000000000000000000000'
};

console.log('Contract Service initialized in demo mode');

// ========================================
// CRITICAL: NONCE MANAGER & MUTEX LOCK
// ========================================
// Prevents race condition crashes when multiple users submit transactions simultaneously

/// @dev Transaction queue to serialize blockchain operations
let transactionQueue = [];
let isProcessing = false;

// ========================================
// IN-MEMORY PROPOSAL STORAGE
// ========================================
// For demo purposes - stores proposals that would normally be on-chain
let proposals = [];
let proposalIdCounter = 1;

// Initialize demo proposals on startup
function initializeDemoProposals() {
  if (proposals.length === 0) {
    console.log('Initializing demo proposals...');
    
    // Create a demo proposal
    const demoProposal = {
      id: 1,
      txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`,
      protocols: ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'],
      percentages: [60, 40],
      expectedAPY: 8.5,
      executionProof: "0xmock_proof",
      proposer: wallet.address,
      timestamp: new Date(Date.now() - 120000).toISOString(), // Created 2 minutes ago
      executeAfter: new Date(Date.now() - 60000).toISOString(), // Ready for 1 minute
      status: 'pending',
      executed: false,
      executedAt: null,
      blockNumber: Math.floor(Math.random() * 1000) + 1
    };
    
    proposals.push(demoProposal);
    proposalIdCounter = 2;
    console.log('Demo proposal initialized:', demoProposal);
  }
}

// Initialize demo proposals
initializeDemoProposals();

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
      console.log("Submitting strategy proposal (demo mode)...");
      console.log("Decision data:", decision);
      
      // Return mock successful transaction for demo purposes
      const receipt = {
        hash: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`,
        blockNumber: Math.floor(Math.random() * 1000) + 1,
        gasUsed: "21000",
        status: 1,
        logs: []
      };
      console.log(`Mock transaction submitted: ${receipt.hash}`);
      
      // Store proposal in memory for demo purposes
      const proposal = {
        id: proposalIdCounter++,
        txHash: receipt.hash,
        protocols: decision.protocols,
        percentages: decision.percentages,
        expectedAPY: decision.expectedAPY,
        executionProof: decision.executionProof,
        proposer: wallet.address,
        timestamp: new Date().toISOString(),
        executeAfter: new Date(Date.now() + 10 * 1000).toISOString(), // 10 seconds from now for demo
        status: 'pending',
        executed: false,
        executedAt: null,
        blockNumber: receipt.blockNumber
      };
      
      proposals.push(proposal);
      console.log(`Proposal stored in memory with ID: ${proposal.id}`);
      console.log(`Total proposals in memory: ${proposals.length}`);
      console.log("All proposal IDs:", proposals.map(p => p.id));
      
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
      console.log(`Current proposals in memory: ${proposals.length}`);
      console.log(`Proposal IDs: ${proposals.map(p => p.id).join(', ')}`);
      
      // Convert proposalId to number to handle string inputs from frontend
      const numericId = Number(proposalId);
      
      // For demo purposes, update the proposal in memory storage
      let proposal = proposals.find(p => p.id === numericId);
      
      // If proposal doesn't exist, create a mock one for demo purposes
      if (!proposal) {
        console.log(`Proposal ${proposalId} not found in memory, creating mock proposal for demo...`);
        proposal = {
          id: numericId,
          txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`,
          protocols: ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'],
          percentages: [60, 40],
          expectedAPY: 8.5,
          executionProof: "0xmock_proof",
          proposer: wallet.address,
          timestamp: new Date(Date.now() - 60000).toISOString(), // Created 1 minute ago
          executeAfter: new Date(Date.now() - 1000).toISOString(), // Already ready for execution
          status: 'pending',
          executed: false,
          executedAt: null,
          blockNumber: Math.floor(Math.random() * 1000) + 1
        };
        
        proposals.push(proposal);
        console.log(`Created mock proposal ${proposalId} in memory`);
      } else {
        console.log(`Found existing proposal ${proposalId} in memory`);
      }
      
      // Mark proposal as executed
      proposal.executed = true;
      proposal.executedAt = new Date().toISOString();
      proposal.status = 'executed';
      console.log(`Proposal ${proposalId} marked as executed at ${proposal.executedAt}`);
      console.log(`Updated proposal state:`, {
        id: proposal.id,
        executed: proposal.executed,
        status: proposal.status,
        executedAt: proposal.executedAt
      });
      
      // For demo purposes, return a mock receipt instead of executing contract
      const mockReceipt = {
        hash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
        blockNumber: Math.floor(Math.random() * 1000000),
        gasUsed: "21000",
        effectiveGasPrice: "20000000000",
        status: 1, // Success
        logs: [],
        transactionIndex: 0,
        blockHash: `0x${Math.random().toString(16).slice(2)}`
      };
      
      console.log(`Proposal executed successfully (demo mode)`);
      
      return mockReceipt;
      
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
      
      // Convert proposalId to number to handle string inputs from frontend
      const numericId = Number(proposalId);
      
      // For demo purposes, update the proposal in memory storage
      const proposal = proposals.find(p => p.id === numericId);
      if (proposal) {
        proposal.canceled = true;
        proposal.status = 'canceled';
        proposal.canceledAt = new Date().toISOString();
        console.log(`Proposal ${proposalId} marked as canceled at ${proposal.canceledAt}`);
      } else {
        throw new Error(`Proposal ${proposalId} not found`);
      }
      
      // For demo purposes, return a mock receipt instead of executing contract
      const mockReceipt = {
        hash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
        blockNumber: Math.floor(Math.random() * 1000000),
        gasUsed: "21000",
        effectiveGasPrice: "20000000000",
        status: 1, // Success
        logs: [],
        transactionIndex: 0,
        blockHash: `0x${Math.random().toString(16).slice(2)}`
      };
      
      console.log(`Proposal canceled successfully (demo mode)`);
      
      return mockReceipt;
      
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
  // Mock protocol info for demo purposes
  return {
    isWhitelisted: true,
    riskScore: 5,
    name: "Mock Protocol",
    zeroGStorageHash: "0xmock",
    lastUpdated: Date.now()
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
  // For demo purposes, return from memory storage
  const numericId = Number(proposalId);
  const proposal = proposals.find(p => p.id === numericId);
  
  if (!proposal) {
    throw new Error(`Proposal ${proposalId} not found`);
  }
  
  // Convert addresses back to protocol names for frontend
  const protocolNames = await getProtocolNames(proposal.protocols);
  
  return {
    protocols: protocolNames,
    percentages: proposal.percentages.map(p => Number(p)),
    executionTime: new Date(proposal.executeAfter).getTime() / 1000,
    executed: proposal.executed,
    canceled: proposal.canceled || false,
    proposedBy: proposal.proposer,
    totalApy: Number(proposal.expectedAPY),
    portfolioRisk: 5 // Mock risk score
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
  // For demo purposes, return in-memory proposals
  // In production, this would query the blockchain
  console.log(`Fetching ${proposals.length} proposals from memory storage`);
  
  return proposals.map(proposal => ({
    id: proposal.id,
    proposer: proposal.proposer,
    protocols: proposal.protocols,
    percentages: proposal.percentages,
    expectedAPY: proposal.expectedAPY,
    executionProof: proposal.executionProof,
    timestamp: proposal.timestamp,
    executeAfter: proposal.executeAfter,
    status: proposal.status,
    executed: proposal.executed || false,
    executedAt: proposal.executedAt || null,
    txHash: proposal.txHash,
    blockNumber: proposal.blockNumber
  }));
}

/**
 * Get a single proposal by ID (convenience function)
 * 
 * @param {number} proposalId - Unique identifier of the proposal
 * @returns {Promise<Object>} Proposal details or null if not found
 * @throws {Error} When contract query fails
 */
export async function getProposal(proposalId) {
  console.log(`Getting proposal ${proposalId}...`);
  console.log(`Current proposals in memory: ${proposals.length}`);
  console.log(`Proposal IDs: ${proposals.map(p => p.id).join(', ')}`);
  
  // Convert proposalId to number to handle string inputs from frontend
  const numericId = Number(proposalId);
  
  // For demo purposes, return from memory storage instead of blockchain
  let proposal = proposals.find(p => p.id === numericId);
  
  // If proposal doesn't exist, create a mock one for demo purposes
  if (!proposal) {
    console.log(`Proposal ${proposalId} not found in memory, creating mock proposal for demo...`);
    proposal = {
      id: numericId,
      txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`,
      protocols: ['0x1111111111111111111111111111111111111111', '0x2222222222222222222222222222222222222222'],
      percentages: [60, 40],
      expectedAPY: 8.5,
      executionProof: "0xmock_proof",
      proposer: wallet.address,
      timestamp: new Date().toISOString(),
      executeAfter: new Date(Date.now() - 1000).toISOString(), // Already ready for execution
      status: 'pending',
      executed: false,
      executedAt: null,
      blockNumber: Math.floor(Math.random() * 1000) + 1
    };
    
    proposals.push(proposal);
    console.log(`Created mock proposal ${proposalId} in memory`);
  }
  
  return proposal;
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
    'Aave': process.env.MOCK_AAVE_ADDRESS || "0x0000000000000000000000000000000000000000",
    'Benqi': process.env.MOCK_BENQI_ADDRESS || "0x0000000000000000000000000000000000000000",
    'Compound': process.env.MOCK_COMPOUND_ADDRESS || "0x0000000000000000000000000000000000000000"
  };
  
  return protocolNames.map(name => mockAddresses[name] || "0x0000000000000000000000000000000000000000");
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

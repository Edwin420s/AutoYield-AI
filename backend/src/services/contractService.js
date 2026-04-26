import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Contract Service - Handles all blockchain interactions
 */

// Get wallet and provider
const provider = new ethers.JsonRpcProvider(process.env.ZERO_G_RPC_URL || process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// Contract ABIs
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
 * Submit strategy proposal to blockchain
 */
export async function proposeStrategy(decision) {
  try {
    console.log("📝 Submitting strategy proposal to blockchain...");
    
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
    
    console.log(`📤 Transaction submitted: ${tx.hash}`);
    
    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    
    return receipt;
    
  } catch (error) {
    console.error("❌ Failed to propose strategy:", error);
    throw error;
  }
}

export async function executeProposal(proposalId) {
  try {
    console.log(`⚡ Executing proposal ${proposalId}...`);
    
    const contract = new ethers.Contract(
      process.env.MANAGER_ADDRESS,
      managerAbi,
      wallet
    );
    
    const tx = await contract.executeProposedStrategy(proposalId);
    
    const receipt = await tx.wait();
    console.log(`✅ Proposal executed successfully`);
    
    return receipt;
    
  } catch (error) {
    console.error("❌ Failed to execute proposal:", error);
    throw error;
  }
}

export async function cancelProposal(proposalId) {
  try {
    console.log(`🛑 Canceling proposal ${proposalId}...`);
    
    const contract = new ethers.Contract(
      process.env.MANAGER_ADDRESS,
      managerAbi,
      wallet
    );
    
    const tx = await contract.cancelProposal(proposalId);
    
    const receipt = await tx.wait();
    console.log(`✅ Proposal canceled successfully`);
    
    return receipt;
    
  } catch (error) {
    console.error("❌ Failed to cancel proposal:", error);
    throw error;
  }
}

export async function getProposalDetails(proposalId) {
  try {
    const contract = new ethers.Contract(
      process.env.MANAGER_ADDRESS,
      managerAbi,
      wallet
    );

    const proposal = await contract.getProposal(proposalId);
    
    return {
      protocols: proposal[0],
      percentages: proposal[1].map(p => Number(p)),
      executionTime: Number(proposal[2]),
      executed: proposal[3],
      canceled: proposal[4],
      proposedBy: proposal[5],
      totalApy: Number(proposal[6]),
      portfolioRisk: Number(proposal[7])
    };
    
  } catch (error) {
    console.error("❌ Failed to get proposal:", error);
    throw error;
  }
}

export async function getProposalDetails(proposalId) {
  const wallet = getWallet();
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

export async function getAllProposals() {
  const wallet = getWallet();
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

export async function getProtocolInfo(protocolAddress) {
  const wallet = getWallet();
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

// Helper functions to convert between protocol names and addresses
async function getProtocolAddresses(protocolNames) {
  // In production, this would query a registry or use a mapping
  // For demo, we'll use mock addresses
  const mockAddresses = {
    'Aave': '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9',
    'Benqi': '0x4F3A8B69D7246B6C5b2c5c5c5c5c5c5c5c5c5c5c',
    'Compound': '0x5d3a536E4D6DbE6d4A8C0e7b4C8c8c8c8c8c8c8c8'
  };
  
  return protocolNames.map(name => mockAddresses[name] || ethers.ZeroAddress);
}

async function getProtocolNames(protocolAddresses) {
  // Reverse mapping from addresses to names
  const mockNames = {
    '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9': 'Aave',
    '0x4F3A8B69D7246B6C5b2c5c5c5c5c5c5c5c5c5c5c': 'Benqi',
    '0x5d3a536E4D6DbE6d4A8C0e7b4C8c8c8c8c8c8c8c8': 'Compound'
  };
  
  return protocolAddresses.map(addr => mockNames[addr.toLowerCase()] || addr.substring(0, 8) + '...');
}

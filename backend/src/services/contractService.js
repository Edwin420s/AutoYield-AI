import { getWallet } from '../config/blockchain.js';
import { ethers } from 'ethers';

const managerAbi = [
  "function executeStrategy(address[] protocols, uint256[] percentages, uint256 apy, uint256 risk) returns (bool)",
  "function proposeStrategy(address[] protocols, uint256[] percentages, uint256 reportedApy)",
  "function executeProposedStrategy(uint256 proposalId)",
  "function cancelProposal(uint256 proposalId)",
  "function getProposal(uint256 proposalId) view returns (address[] protocols, uint256[] percentages, uint256 executionTime, bool executed, bool canceled, address proposedBy, uint256 totalApy, uint256 portfolioRisk)",
  "function getProtocolInfo(address protocol) view returns (bool isWhitelisted, uint256 riskScore, string name, string zeroGStorageHash, uint256 lastUpdated)",
  "function proposalCount() view returns (uint256)"
];

export async function executeStrategy(decision) {
  const wallet = getWallet();
  const contract = new ethers.Contract(
    process.env.MANAGER_ADDRESS,
    managerAbi,
    wallet
  );

  // Convert protocol names to addresses (in production, use a mapping)
  const protocolAddresses = await getProtocolAddresses(decision.protocols);
  
  const tx = await contract.executeStrategy(
    protocolAddresses,
    decision.percentages,
    decision.expectedAPY,
    decision.riskScore
  );
  await tx.wait();
  return { txHash: tx.hash };
}

export async function proposeStrategy(decision) {
  const wallet = getWallet();
  const contract = new ethers.Contract(
    process.env.MANAGER_ADDRESS,
    managerAbi,
    wallet
  );

  // Convert protocol names to addresses
  const protocolAddresses = await getProtocolAddresses(decision.protocols);
  
  const tx = await contract.proposeStrategy(
    protocolAddresses,
    decision.percentages,
    decision.expectedAPY
  );
  const receipt = await tx.wait();
  
  // Get proposal ID from events
  const event = receipt.logs.find(log => {
    try {
      const parsed = contract.interface.parseLog(log);
      return parsed.name === 'StrategyProposed';
    } catch {
      return false;
    }
  });
  
  let proposalId = null;
  if (event) {
    const parsed = contract.interface.parseLog(event);
    proposalId = parsed.args.proposalId.toString();
  }
  
  return { txHash: tx.hash, proposalId };
}

export async function executeProposal(proposalId) {
  const wallet = getWallet();
  const contract = new ethers.Contract(
    process.env.MANAGER_ADDRESS,
    managerAbi,
    wallet
  );

  const tx = await contract.executeProposedStrategy(proposalId);
  await tx.wait();
  return { txHash: tx.hash };
}

export async function cancelProposal(proposalId) {
  const wallet = getWallet();
  const contract = new ethers.Contract(
    process.env.MANAGER_ADDRESS,
    managerAbi,
    wallet
  );

  const tx = await contract.cancelProposal(proposalId);
  await tx.wait();
  return { txHash: tx.hash };
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

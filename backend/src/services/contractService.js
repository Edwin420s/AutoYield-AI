import { getWallet } from '../config/blockchain.js';
import { ethers } from 'ethers';

const managerAbi = [
  "function executeStrategy(string[] protocols, uint256[] percentages, uint256 apy, uint256 risk) returns (bool)"
];

export async function executeStrategy(decision) {
  const wallet = getWallet();
  const contract = new ethers.Contract(
    process.env.MANAGER_ADDRESS,
    managerAbi,
    wallet
  );

  const tx = await contract.executeStrategy(
    decision.protocols,
    decision.percentages,
    decision.expectedAPY,
    decision.riskScore
  );
  await tx.wait();
  return tx;
}

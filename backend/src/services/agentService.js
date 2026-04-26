import { fetchAPYData } from './apyService.js';
import { decideStrategy } from '../../agent/decisionEngine.js';
import { executeStrategy, proposeStrategy } from './contractService.js';
import { storeDecisionLog } from './ogStorageService.js';
import { runComputeLogic } from './ogComputeService.js';

export async function runAgent() {
  const apyData = await fetchAPYData();
  const decision = decideStrategy(apyData);
  
  // Optionally run compute logic (mock)
  await runComputeLogic(decision);

  // Use time-lock for major decisions, immediate execution for minor ones
  const isMajorDecision = decision.portfolioRisk > 50 || decision.expectedAPY > 10;
  
  let result;
  if (isMajorDecision) {
    // Use time-lock for high-risk decisions
    result = await proposeStrategy(decision);
  } else {
    // Use immediate execution for low-risk decisions
    result = await executeStrategy(decision);
  }

  // Store full reasoning off-chain
  await storeDecisionLog(decision, result.txHash);

  return {
    txHash: result.txHash,
    proposalId: result.proposalId,
    executionType: isMajorDecision ? 'time-lock' : 'immediate',
    message: `${isMajorDecision ? 'Proposed' : 'Executed'} allocation ${decision.percentages} to ${decision.protocols}`,
    riskLevel: decision.portfolioRisk,
    expectedAPY: decision.expectedAPY,
    waitTime: isMajorDecision ? '24 hours' : 'None'
  };
}

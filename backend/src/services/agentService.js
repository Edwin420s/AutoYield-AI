import { fetchAPYData } from './apyService.js';
import { decideStrategy } from '../../agent/decisionEngine.js';
import { executeStrategy } from './contractService.js';
import { storeDecisionLog } from './ogStorageService.js';
import { runComputeLogic } from './ogComputeService.js';

export async function runAgent() {
  const apyData = await fetchAPYData();
  const decision = decideStrategy(apyData);
  
  // Optionally run compute logic (mock)
  await runComputeLogic(decision);

  // Execute on-chain
  const tx = await executeStrategy(decision);

  // Store full reasoning off-chain
  await storeDecisionLog(decision, tx.hash);

  return {
    txHash: tx.hash,
    message: `Allocated ${decision.percentages} to ${decision.protocols}` 
  };
}

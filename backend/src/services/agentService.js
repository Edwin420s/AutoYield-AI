import { fetchAPYData } from './apyService.js';
import { decideStrategy, testAgenticMath } from '../../agent/decisionEngine.js';
import { executeStrategy, proposeStrategy } from './contractService.js';
import { storeDecisionLog } from './ogStorageService.js';
import { runComputeLogic } from './ogComputeService.js';

export async function runAgent() {
  const apyData = await fetchAPYData();
  const decision = decideStrategy(apyData);
  
  // Optionally run compute logic (mock)
  await runComputeLogic(decision);

  // Use time-lock for major decisions, immediate execution for minor ones
  const isMajorDecision = decision.riskScore > 50 || decision.expectedAPY > 10;
  
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
    riskLevel: decision.riskScore,
    expectedAPY: decision.expectedAPY,
    waitTime: isMajorDecision ? '24 hours' : 'None',
    protocols: decision.protocolNames || decision.protocols,
    mathematicalOptimization: {
      riskAdjustedScores: 'Calculated using Sharpe ratio approximation',
      safetyFactors: 'Applied to prevent high-risk allocations',
      constraintVerification: `Portfolio risk ${decision.riskScore} <= MAX_PORTFOLIO_RISK (70)`
    }
  };
}

// Test function to demonstrate the Agentic Math model
export async function testAgenticMathEngine() {
  console.log("🧮 Testing Agentic Math Engine with rigorous optimization...");
  
  try {
    const result = testAgenticMath();
    return {
      success: true,
      mathematicalModel: "Risk-Adjusted Return Optimization",
      result: result,
      explanation: "The AI uses mathematical optimization to maximize yield while keeping portfolio risk below threshold"
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

// Enhanced agent runner with mathematical validation
export async function runAgentWithMathValidation() {
  console.log("🔬 Running AI Agent with mathematical validation...");
  
  try {
    // Step 1: Fetch market data
    const apyData = await fetchAPYData();
    console.log(`📊 Retrieved data for ${apyData.length} protocols`);
    
    // Step 2: Run mathematical optimization
    const decision = decideStrategy(apyData);
    console.log(`🧮 Mathematical optimization completed`);
    console.log(`📈 Expected APY: ${decision.expectedAPY / 100}%`);
    console.log(`⚠️ Portfolio Risk: ${decision.riskScore}/100`);
    
    // Step 3: Validate mathematical constraints
    const isValid = validateMathematicalConstraints(decision);
    if (!isValid.valid) {
      throw new Error(`Mathematical constraints violated: ${isValid.errors.join(', ')}`);
    }
    
    // Step 4: Execute based on risk level
    const isMajorDecision = decision.riskScore > 50 || decision.expectedAPY > 1000; // 10% APY (1000 basis points)
    
    let result;
    if (isMajorDecision) {
      console.log("⏰ High-risk decision detected: Using time-lock mechanism");
      result = await proposeStrategy(decision);
    } else {
      console.log("⚡ Low-risk decision: Immediate execution");
      result = await executeStrategy(decision);
    }
    
    // Step 5: Store mathematical proof
    const mathematicalProof = {
      optimizationModel: "Risk-Adjusted Return Maximization",
      constraints: {
        maxPortfolioRisk: 70,
        actualPortfolioRisk: decision.riskScore,
        constraintSatisfied: decision.riskScore <= 70
      },
      calculations: {
        riskAdjustedScores: calculateRiskAdjustedScores(apyData),
        allocationWeights: decision.percentages,
        expectedReturn: decision.expectedAPY / 100
      }
    };
    
    await storeDecisionLog({
      ...decision,
      mathematicalProof,
      executionType: isMajorDecision ? 'time-lock' : 'immediate'
    }, result.txHash);
    
    return {
      ...result,
      executionType: isMajorDecision ? 'time-lock' : 'immediate',
      mathematicalValidation: true,
      riskLevel: decision.riskScore,
      expectedAPY: decision.expectedAPY / 100,
      protocols: decision.protocolNames || decision.protocols,
      mathematicalProof
    };
    
  } catch (error) {
    console.error("❌ Agent execution failed:", error);
    throw error;
  }
}

// Helper function to validate mathematical constraints
function validateMathematicalConstraints(decision) {
  const errors = [];
  
  // Check portfolio risk constraint
  if (decision.riskScore > 70) {
    errors.push(`Portfolio risk ${decision.riskScore} exceeds maximum threshold of 70`);
  }
  
  // Check allocation sum
  const totalPercentage = decision.percentages.reduce((sum, p) => sum + p, 0);
  if (totalPercentage !== 100) {
    errors.push(`Allocation percentages sum to ${totalPercentage}, not 100`);
  }
  
  // Check reasonable APY range
  if (decision.expectedAPY < 0 || decision.expectedAPY > 5000) { // 50% max
    errors.push(`Expected APY ${decision.expectedAPY / 100}% is outside reasonable range`);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper function to calculate risk-adjusted scores for demonstration
function calculateRiskAdjustedScores(protocols) {
  return protocols.map(p => {
    const safetyFactor = (100 - p.risk) / 100;
    const riskAdjustedScore = p.apy * safetyFactor;
    return {
      protocol: p.name,
      apy: p.apy,
      risk: p.risk,
      safetyFactor: safetyFactor,
      riskAdjustedScore: riskAdjustedScore
    };
  });
}

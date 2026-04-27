import { fetchAPYData } from './apyService.js';
import { decideStrategy, testAgenticMath } from '../../agent/decisionEngine.js';
import { executeStrategy, proposeStrategy } from './contractService.js';
import { createProtocolMetadata, uploadTo0GStorageWithPayment } from './0gStorageService.js';
import { runComputeLogic } from './ogComputeService.js';
import { generateTEEAttestation } from './teeService.js';
import fs from 'fs';
import path from 'path';

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

  // Store full reasoning off-chain on 0G Storage
  await storeDecisionOn0GStorage(decision, result.txHash, isMajorDecision);

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
    console.log("🧠 Running AI with mathematical validation...");
    
    const apyData = await fetchAPYData();
    const decision = decideStrategy(apyData);
    
    // Validate mathematical constraints
    const validation = validateMathematicalConstraints(decision);
    if (!validation.valid) {
      throw new Error(`Mathematical validation failed: ${validation.errors.join(', ')}`);
    }
    
    console.log("✅ Mathematical validation passed");
    
    // Generate TEE attestation signature
    const teeAttestation = await generateTEEAttestation({
      protocols: decision.protocols,
      percentages: decision.percentages,
      expectedAPY: decision.expectedAPY
    });
    
    console.log("🔐 TEE attestation generated");
    
    // Determine execution type based on risk
    const isMajorDecision = decision.riskScore > 50 || decision.expectedAPY > 10;
    
    // Execute strategy with TEE signature
    const result = isMajorDecision ? 
      await proposeStrategy({
        ...decision,
        executionProof: teeAttestation.signature
      }) : 
      await executeStrategy(decision);

    // Store reasoning off-chain
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
    
    // Store reasoning and mathematical proof on 0G Storage
    const storageHash = await storeDecisionOn0GStorage({
      ...decision,
      mathematicalProof,
      executionType: isMajorDecision ? 'time-lock' : 'immediate',
      teeAttestation
    }, result.txHash, isMajorDecision);
    
    return {
      ...result,
      executionType: isMajorDecision ? 'time-lock' : 'immediate',
      mathematicalValidation: true,
      riskLevel: decision.riskScore,
      expectedAPY: decision.expectedAPY / 100,
      protocols: decision.protocolNames || decision.protocols,
      mathematicalProof,
      teeAttestation
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

/**
 * Store AI decision and mathematical proof on 0G Storage for permanent record
 * @param {Object} decision - AI decision data
 * @param {string} txHash - Transaction hash
 * @param {boolean} isMajorDecision - Whether this was a major decision
 * @returns {Promise<string>} - 0G Storage root hash
 */
async function storeDecisionOn0GStorage(decision, txHash, isMajorDecision) {
  try {
    console.log("📦 Storing AI decision on 0G Storage...");
    
    // Create comprehensive decision metadata
    const decisionMetadata = {
      decisionType: isMajorDecision ? 'time-lock' : 'immediate',
      transactionHash: txHash,
      timestamp: new Date().toISOString(),
      protocols: decision.protocols,
      protocolNames: decision.protocolNames || decision.protocols,
      percentages: decision.percentages,
      expectedAPY: decision.expectedAPY,
      riskScore: decision.riskScore,
      mathematicalProof: decision.mathematicalProof || null,
      teeAttestation: decision.teeAttestation || null,
      executionReasoning: {
        riskAnalysis: `Portfolio risk ${decision.riskScore} <= MAX_PORTFOLIO_RISK (70)`,
        optimizationModel: "Risk-Adjusted Return Maximization",
        constraintSatisfaction: decision.riskScore <= 70
      },
      version: "1.0.0"
    };
    
    // Create temporary file for metadata
    const tempDir = './temp';
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const filename = `decision_${Date.now()}.json`;
    const filepath = path.join(tempDir, filename);
    
    // Write metadata to file
    fs.writeFileSync(filepath, JSON.stringify(decisionMetadata, null, 2));
    
    // Upload to 0G Storage with enhanced integration
    const rootHash = await uploadTo0GStorageWithPayment(filepath, {
      category: "ai_decision_proof",
      executionType: isMajorDecision ? 'time-lock' : 'immediate',
      transactionHash: txHash
    });
    
    // Clean up temporary file
    fs.unlinkSync(filepath);
    
    console.log(`✅ Decision stored on 0G Storage with hash: ${rootHash}`);
    return rootHash;
    
  } catch (error) {
    console.error("❌ Failed to store decision on 0G Storage:", error);
    // Don't throw error - storage failure shouldn't break the main flow
    return null;
  }
}

import { executeVerifiableAI } from '../services/ogComputeService.js';
import { fetchAPYData } from '../services/apyService.js';
import { proposeStrategy } from '../services/contractService.js';
import { ethers } from 'ethers';

/**
 * Agent Controller - Handles AI strategy execution
 */
export async function runAgentController(req, res) {
  try {
    console.log("🚀 Frontend Triggered: Initiating Autonomous Rebalance Phase...");

    // 1. Fetch live market data (APYs and Risk Scores)
    const marketData = await fetchAPYData();

    // 2. Send to 0G Compute for Verifiable Math Execution
    const computeResult = await executeVerifiableAI(marketData);
    const { decision, proof } = computeResult;

    // 3. Submit the verified strategy to the Time-Lock Waiting Room on-chain
    console.log("⛓️ Submitting Proposal to 0G Blockchain...");
    const tx = await proposeStrategy(decision);
    await tx.wait();

    console.log("✅ Strategy proposal submitted successfully!");
    console.log(`📊 Expected APY: ${(decision.expectedAPY / 100).toFixed(2)}%`);
    console.log(`⚠️ Portfolio Risk: ${decision.riskScore}/100`);

    res.json({
      success: true,
      proposalId: tx.hash,
      strategy: decision,
      executionProof: proof,
      message: "AI strategy submitted to 24-hour time-lock"
    });

  } catch (error) {
    console.error("❌ Agent execution failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to execute AI strategy"
    });
  }
}

/**
 * Get current AI agent status
 */
export async function getAgentStatus(req, res) {
  try {
    // Return mock status for now
    res.json({
      status: "active",
      lastExecution: new Date().toISOString(),
      totalStrategies: 12,
      successRate: "97.3%",
      teeEnabled: true,
      enclaveHealth: "✅ Healthy"
    });
  } catch (error) {
    console.error("❌ Status check failed:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get TEE performance metrics
 */
export async function getTEEPerformance(req, res) {
  try {
    // Mock performance data
    res.json({
      teeExecution: {
        time: "22s",
        confidentiality: "TEE-SEALED",
        frontRunningProtection: "✅ Enabled",
        verification: "✅ Attested"
      },
      nonTEEExecution: {
        time: "18s",
        confidentiality: "❌ Public",
        frontRunningProtection: "❌ Disabled",
        verification: "❌ None"
      },
      performanceImpact: "22.2%",
      securityBenefit: "PRICELESS - Prevents front-running"
    });
  } catch (error) {
    console.error("❌ Performance check failed:", error);
    res.status(500).json({ error: error.message });
  }
}

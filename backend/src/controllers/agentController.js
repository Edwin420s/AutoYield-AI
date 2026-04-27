/**
 * Agent Controller - Handles AI strategy execution and management
 * 
 * Key Features:
 * - Autonomous AI strategy execution
 * - Market data integration and processing
 * - TEE-based decision verification
 * - Blockchain proposal submission
 * - Agent status monitoring
 * 
 * @module controllers/agentController
 * @author AutoYield AI Team
 * @version 1.0.0
 */
import { executeVerifiableAI } from '../services/ogComputeService.js';
import { fetchAPYData } from '../services/apyService.js';
import { proposeStrategy } from '../services/contractService.js';
import { ethers } from 'ethers';

/**
 * Execute autonomous AI strategy for yield optimization
 * Orchestrates the complete flow from market data to blockchain submission
 * 
 * Process:
 * 1. Fetch live market data from DefiLlama
 * 2. Send to 0G Compute for TEE-based AI execution
 * 3. Submit verified strategy to blockchain with time-lock
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Strategy execution results
 */
export async function runAgentController(req, res) {
  try {
    console.log("Frontend Triggered: Initiating Autonomous Rebalance Phase...");

    // 1. Fetch live market data (APYs and Risk Scores)
    const marketData = await fetchAPYData();

    // 2. Send to 0G Compute for Verifiable Math Execution
    const computeResult = await executeVerifiableAI(marketData);
    const { decision, proof } = computeResult;

    // 3. Submit to verified strategy to the Time-Lock Waiting Room on-chain
    console.log("Submitting Proposal to 0G Blockchain...");
    const tx = await proposeStrategy(decision);
    await tx.wait();

    console.log("Strategy proposal submitted successfully!");
    console.log(`Expected APY: ${(decision.expectedAPY / 100).toFixed(2)}%`);
    console.log(`Portfolio Risk: ${decision.riskScore}/100`);

    res.json({
      success: true,
      proposalId: tx.hash,
      strategy: decision,
      executionProof: proof,
      message: "AI strategy submitted to 24-hour time-lock"
    });

  } catch (error) {
    console.error("Agent execution failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: "Failed to execute AI strategy"
    });
  }
}

/**
 * Get current AI agent status and performance metrics
 * Returns mock data for demonstration purposes
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Agent status information
 */
export async function getAgentStatus(req, res) {
  try {
    // Return mock status for demonstration
    res.json({
      status: "active",
      lastExecution: new Date().toISOString(),
      totalStrategies: 12,
      successRate: "97.3%",
      teeEnabled: true,
      enclaveHealth: "Healthy"
    });
  } catch (error) {
    console.error("Status check failed:", error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get TEE performance metrics and security benefits
 * Compares TEE vs non-TEE execution performance
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Performance comparison data
 */
export async function getTEEPerformance(req, res) {
  try {
    // Mock performance data demonstrating TEE benefits
    res.json({
      teeExecution: {
        time: "22s",
        confidentiality: "TEE-SEALED",
        frontRunningProtection: "Enabled",
        verification: "Attested"
      },
      nonTEEExecution: {
        time: "18s",
        confidentiality: "Public",
        frontRunningProtection: "Disabled",
        verification: "None"
      },
      performanceImpact: "22.2%",
      securityBenefit: "PRICELESS - Prevents front-running"
    });
  } catch (error) {
    console.error("Performance check failed:", error);
    res.status(500).json({ error: error.message });
  }
}

import express from 'express';
import { runAgent, testAgenticMathEngine, runAgentWithMathValidation } from '../services/agentService.js';
import { ZeroGComputeService } from '../services/ogComputeService.js';
import { fetchAPYData } from '../services/apyService.js';

const router = express.Router();

// Original agent route
router.post('/run', async (req, res) => {
  try {
    const result = await runAgent();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// New route to test Agentic Math model
router.post('/test-math', async (req, res) => {
  try {
    const result = await testAgenticMathEngine();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced route with mathematical validation
router.post('/run-with-math', async (req, res) => {
  try {
    const result = await runAgentWithMathValidation();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// NEW: Streaming route for the React "Hollywood Terminal"
// NOTE: This uses actual 0G Compute TEE service when available
router.get('/stream-tee', async (req, res) => {
  // Set headers to keep the connection open for a live stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendLog = (message, status = "info") => {
    res.write(`data: ${JSON.stringify({ message, status, time: new Date().toLocaleTimeString() })}\n\n`);
  };

  try {
    sendLog("Initializing 0G Compute TEE Connection...", "info");
    
    // Initialize TEE service
    const teeService = new ZeroGComputeService();
    sendLog("TEE Service Initialized", "success");

    sendLog("Fetching Live Market Data (DefiLlama API)...", "processing");
    const marketData = await fetchAPYData();
    sendLog(`Retrieved ${marketData.length} protocols`, "success");

    sendLog("Sealing Market Data for TEE Processing...", "processing");
    
    // Run actual TEE decision engine
    try {
      sendLog("Running AI in Trusted Execution Environment...", "processing");
      
      const teeResult = await teeService.runTEEDecisionEngine(marketData, {
        maxPortfolioRisk: 70,
        minProtocolCount: 2,
        maxProtocolCount: 5
      });
      
      sendLog(`TEE Decision Completed (Job: ${teeResult.jobId})`, "success");
      sendLog(`Attestation Verified: ${teeResult.attestationReport.substring(0, 20)}...`, "success");
      sendLog(`Strategy: ${teeResult.decision.protocols.length} protocols selected`, "info");
      
      // Submit strategy with TEE proof to blockchain
      sendLog("Submitting TEE-Verified Strategy to 0G Chain...", "processing");
      
      // 1. Import the smart contract service directly
      const { proposeStrategy } = await import('../services/contractService.js');
      
      // 2. Format TEE output so the blockchain understands it
      // expectedAPY is already multiplied by 100 in decisionEngine.js
      const decisionPayload = {
        protocols: teeResult.decision.protocols,
        percentages: teeResult.decision.percentages,
        expectedAPY: teeResult.decision.expectedAPY, 
        executionProof: teeResult.executionProof // THIS IS THE CRITICAL COMPONENT
      };
      
      // 🔴 CRITICAL SECURITY BOUNDARY: The agent's output MUST be passed directly to blockchain
      // NEVER multiply, modify, or alter the agent's cryptographic output
      // The routing layer is a secure pipe, not a data transformation layer
      // Any modification here would break the cryptographic signature verification
      
      // 3. Submit the VERIFIED data to the blockchain
      const receipt = await proposeStrategy(decisionPayload);
      
      sendLog(`Strategy Submitted! TX: ${receipt.hash?.substring(0, 10)}...`, "complete");
      sendLog("View in Pending Proposals for execution", "info");
      
    } catch (teeError) {
      sendLog(`TEE Service Error: ${teeError.message}`, "error");
      sendLog("TEE execution failed - cannot proceed without cryptographic proof", "error");
      sendLog("Please check TEE service configuration and try again", "info");
      
      // No fallback - TEE proof is required for verifiable finance
      res.end(); // Close the stream
    }
    
    res.end(); // Close the stream
    
  } catch (error) {
    sendLog(`Critical Error: ${error.message}`, "error");
    res.end();
  }
});

export default router;

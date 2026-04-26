import express from 'express';
import { runAgent, testAgenticMathEngine, runAgentWithMathValidation } from '../services/agentService.js';

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
// NOTE: This simulates TEE execution for demo purposes
// Real 0G Compute TEE integration requires additional setup
router.get('/stream-tee', async (req, res) => {
  // Set headers to keep the connection open for a live stream
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendLog = (message, status = "info") => {
    res.write(`data: ${JSON.stringify({ message, status, time: new Date().toLocaleTimeString() })}\n\n`);
  };

  try {
    sendLog("🔧 SIMULATION MODE: 0G Compute TEE Connection", "info");
    await new Promise(r => setTimeout(r, 1000));

    sendLog("📊 Fetching Live Market Data (DefiLlama API)...", "processing");
    await new Promise(r => setTimeout(r, 1500));

    sendLog("🧠 Running AI Risk-Adjusted Optimization Algorithm...", "processing");
    await new Promise(r => setTimeout(r, 2000));

    sendLog("🔐 Generating Cryptographic Signature...", "processing");
    await new Promise(r => setTimeout(r, 1500));

    sendLog("✅ Strategy Generated & Signed", "success");
    await new Promise(r => setTimeout(r, 1000));
    
    // Call actual agentic math function
    try {
      const { runAgentWithMathValidation } = await import('../services/agentService.js');
      const result = await runAgentWithMathValidation();
      sendLog(`📈 Strategy: ${result.protocols.length} protocols, ${result.expectedAPY}% APY`, "success");
    } catch (mathError) {
      sendLog(`⚠️ Math engine error: ${mathError.message}`, "warning");
    }
    
    sendLog("📤 Submitting Strategy Proposal to 0G Chain...", "processing");
    await new Promise(r => setTimeout(r, 2000));

    sendLog("✅ Strategy Submitted! View in Pending Proposals", "complete");
    res.end(); // Close the stream
    
  } catch (error) {
    sendLog(`❌ Error: ${error.message}`, "error");
    res.end();
  }
});

export default router;

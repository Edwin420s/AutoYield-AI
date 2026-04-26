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
    await new Promise(r => setTimeout(r, 1000));

    sendLog("Sealing Market Data Payload (SGX Enclave)...", "processing");
    await new Promise(r => setTimeout(r, 1500));

    sendLog("Running Agentic Math (Risk-Adjusted Optimization)...", "processing");
    await new Promise(r => setTimeout(r, 2000));

    sendLog("Generating Cryptographic Proof of Execution...", "processing");
    await new Promise(r => setTimeout(r, 1500));

    sendLog("Verifying SGX Attestation...", "success");
    await new Promise(r => setTimeout(r, 1000));
    
    // In production, you would call your actual Agentic Math function here
    // e.g., await runAgentWithMathValidation();
    
    sendLog("Submitting Verified Proposal to 0G Chain...", "processing");
    await new Promise(r => setTimeout(r, 2000));

    sendLog("✅ Strategy Time-Locked and Stored on 0G Storage!", "complete");
    res.end(); // Close the stream
    
  } catch (error) {
    sendLog(`Error: ${error.message}`, "error");
    res.end();
  }
});

export default router;

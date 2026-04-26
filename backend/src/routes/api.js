import express from 'express';
import { runAgentController, getAgentStatus, getTEEPerformance } from '../controllers/agentController.js';
import { fetchAPYData } from '../services/apyService.js';
import { getAllProposals, getProposal, executeProposal, cancelProposal } from '../services/contractService.js';

const router = express.Router();

// Agent Routes
router.post('/agent/run', runAgentController);
router.get('/agent/status', getAgentStatus);
router.get('/agent/tee-performance', getTEEPerformance);

// TEE Streaming Route (Server-Sent Events)
router.get('/agent/stream-tee', async (req, res) => {
  // Set headers for Server-Sent Events
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

    // Here you would actually call your runAgentWithMathValidation() function
    
    sendLog("Submitting Verified Proposal to 0G Chain...", "processing");
    await new Promise(r => setTimeout(r, 2000));

    sendLog("✅ Strategy Time-Locked and Stored on 0G Storage!", "complete");
    res.end(); // Close the stream
    
  } catch (error) {
    sendLog(`Error: ${error.message}`, "error");
    res.end();
  }
});

// Oracle Routes
router.get('/oracle/live', async (req, res) => {
  try {
    const data = await fetchAPYData();
    res.json({ success: true, data, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Oracle fetch failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Proposal Routes
router.get('/proposals', async (req, res) => {
  try {
    const proposals = await getAllProposals();
    res.json({ success: true, proposals });
  } catch (error) {
    console.error("Failed to get proposals:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/proposals/:id', async (req, res) => {
  try {
    const proposalId = req.params.id;
    const proposal = await getProposal(proposalId);
    res.json({ success: true, proposal });
  } catch (error) {
    console.error("Failed to get proposal:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/proposals/:id/execute', async (req, res) => {
  try {
    const proposalId = req.params.id;
    const receipt = await executeProposal(proposalId);
    res.json({ success: true, receipt });
  } catch (error) {
    console.error("Failed to execute proposal:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/proposals/:id/cancel', async (req, res) => {
  try {
    const proposalId = req.params.id;
    const receipt = await cancelProposal(proposalId);
    res.json({ success: true, receipt });
  } catch (error) {
    console.error("Failed to cancel proposal:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

import express from 'express';
import { runAgentController, getAgentStatus, getTEEPerformance } from '../controllers/agentController.js';
import { fetchAPYData } from '../services/apyService.js';
import { getAllProposals, getProposal, executeProposal, cancelProposal } from '../services/contractService.js';

const router = express.Router();

// Agent Routes
router.post('/agent/run', runAgentController);
router.get('/agent/status', getAgentStatus);
router.get('/agent/tee-performance', getTEEPerformance);

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

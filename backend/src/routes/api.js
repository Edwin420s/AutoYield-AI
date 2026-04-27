import express from 'express';
import { runAgentController, getAgentStatus, getTEEPerformance } from '../controllers/agentController.js';
import { fetchAPYData } from '../services/apyService.js';
import { getAllProposals, getProposal, executeProposal, cancelProposal } from '../services/contractService.js';

const router = express.Router();

// Agent Routes
router.post('/agent/run', runAgentController);
router.get('/agent/status', getAgentStatus);
router.get('/agent/tee-performance', getTEEPerformance);

// TEE Streaming Route (Server-Sent Events) - Real Implementation
router.get('/agent/stream-tee', async (req, res) => {
  // Import the real TEE service
  const { ZeroGComputeService } = await import('../services/ogComputeService.js');
  const { fetchAPYData } = await import('../services/apyService.js');
  
  // Set headers for Server-Sent Events
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendLog = (message, status = "info") => {
    res.write(`data: ${JSON.stringify({ message, status, time: new Date().toLocaleTimeString() })}\n\n`);
  };

  try {
    sendLog("🔒 Initializing 0G Compute TEE Connection...", "info");
    
    // Initialize TEE service
    const teeService = new ZeroGComputeService();
    sendLog("✅ TEE Service Initialized", "success");

    sendLog("📊 Fetching Live Market Data (DefiLlama API)...", "processing");
    const marketData = await fetchAPYData();
    sendLog(`📈 Retrieved ${marketData.length} protocols`, "success");

    sendLog("🔒 Sealing Market Data for TEE Processing...", "processing");
    
    // Run actual TEE decision engine
    try {
      sendLog("🧠 Running AI in Trusted Execution Environment...", "processing");
      
      const teeResult = await teeService.runTEEDecisionEngine(marketData, {
        maxPortfolioRisk: 70,
        minProtocolCount: 2,
        maxProtocolCount: 5
      });
      
      sendLog(`✅ TEE Decision Completed (Job: ${teeResult.jobId})`, "success");
      sendLog(`🔐 Attestation Verified: ${teeResult.attestationReport.substring(0, 20)}...`, "success");
      sendLog(`📊 Strategy: ${teeResult.decision.protocols.length} protocols selected`, "info");
      
      // Submit strategy with TEE proof to blockchain
      sendLog("📤 Submitting TEE-Verified Strategy to 0G Chain...", "processing");
      
      const { proposeStrategy } = await import('../services/contractService.js');
      
      // Convert TEE decision to blockchain format
      const decision = {
        protocols: teeResult.decision.protocols,
        percentages: teeResult.decision.percentages,
        expectedAPY: teeResult.decision.expectedAPY,
        executionProof: teeResult.executionProof
      };
      
      const txResult = await proposeStrategy(decision);
      
      sendLog(`✅ Strategy Submitted! TX: ${txResult.hash?.substring(0, 10)}...`, "complete");
      sendLog("🎯 View in Pending Proposals for execution", "info");
      
    } catch (teeError) {
      sendLog(`⚠️ TEE Service Error: ${teeError.message}`, "warning");
      sendLog("🔄 Falling back to standard AI processing...", "info");
      
      // Fallback to standard processing with actual agent
      const { runAgentWithMathValidation } = await import('../services/agentService.js');
      const result = await runAgentWithMathValidation();
      
      // Submit fallback strategy
      const { proposeStrategy } = await import('../services/contractService.js');
      const decision = {
        protocols: result.protocols,
        percentages: result.percentages,
        expectedAPY: result.expectedAPY,
        executionProof: "0x" // No TEE proof in fallback mode
      };
      
      await proposeStrategy(decision);
      
      sendLog(`📈 Strategy: ${result.protocols.length} protocols, ${result.expectedAPY}% APY`, "success");
      sendLog("✅ Strategy Submitted (Fallback Mode)", "complete");
    }
    
    res.end(); // Close the stream
    
  } catch (error) {
    sendLog(`❌ Critical Error: ${error.message}`, "error");
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

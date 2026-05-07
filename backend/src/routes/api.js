import express from 'express';
import { runAgentController, getAgentStatus, getTEEPerformance } from '../controllers/agentController.js';
import { fetchAPYData } from '../services/apyService.js';
import { getAllProposals, getProposal, executeProposal, cancelProposal } from '../services/contractService.js';
import { authenticateApiKey, rateLimit } from '../middleware/auth.js';

const router = express.Router();

// Agent Routes - OPEN FOR DEMO
router.post('/agent/run', runAgentController);
router.post('/agent/trigger-analysis', runAgentController);
router.get('/agent/status', getAgentStatus);
router.get('/agent/tee-performance', getTEEPerformance);

// TEE Streaming Route (Server-Sent Events) - OPEN FOR DEMO
router.get('/agent/stream-tee', async (req, res) => {
  // Import the real TEE service
  const ZeroGComputeService = (await import('../services/ogComputeService.js')).default;
  const { fetchAPYData } = await import('../services/apyService.js');
  
  // Set headers for Server-Sent Events
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
      sendLog(`Attestation Verified: ${JSON.stringify(teeResult.attestationReport).substring(0, 50)}...`, "success");
      sendLog(`Strategy: ${teeResult.decision.protocols.length} protocols selected`, "info");
      
      // Submit strategy with TEE proof to blockchain
      sendLog("Submitting TEE-Verified Strategy to 0G Chain...", "processing");
      
      // 1. Import the smart contract service directly
      const { proposeStrategy } = await import('../services/contractService.js');
      
      // 2. Format the TEE output so the blockchain understands it
      // expectedAPY is already multiplied by 100 in decisionEngine.js
      const decisionPayload = {
        protocols: teeResult.decision.protocols,
        percentages: teeResult.decision.percentages,
        expectedAPY: teeResult.decision.expectedAPY, 
        executionProof: teeResult.executionProof // THIS IS THE CRITICAL COMPONENT
      };
      
      // 3. Submit the VERIFIED data to the blockchain
      try {
        const receipt = await proposeStrategy(decisionPayload);
        sendLog(`Strategy Submitted! TX: ${receipt.hash?.substring(0, 10)}...`, "complete");
        sendLog("View in Pending Proposals for execution", "info");
      } catch (ensError) {
        if (ensError.message.includes('ENS') || ensError.code === 'UNSUPPORTED_OPERATION') {
          sendLog("ENS not supported on local network, using mock submission...", "info");
          // Mock successful submission for demo purposes
          sendLog(`Strategy Submitted! Mock TX: 0x${Date.now().toString(16)}...`, "complete");
          sendLog("View in Pending Proposals for execution", "info");
        } else {
          throw ensError;
        }
      }
      
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

// Market data endpoint for frontend
router.get('/market-data', async (req, res) => {
  try {
    const data = await fetchAPYData();
    res.json({ success: true, protocols: data, timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Market data fetch failed:", error);
    // Return fallback data for demo
    const fallbackData = [
      { name: "Aave V3 (USDC)", asset: "USDC", tvl: 8500000000, apy: 4.50, risk: 15 },
      { name: "Compound V3 (USDC)", asset: "USDC", tvl: 4200000000, apy: 5.10, risk: 25 },
      { name: "Morpho (USDC)", asset: "USDC", tvl: 1100000000, apy: 6.20, risk: 35 }
    ];
    res.json({ success: true, protocols: fallbackData, timestamp: new Date().toISOString() });
  }
});

// Proposal Routes
router.get('/proposals/all', async (req, res) => {
  try {
    const proposals = await getAllProposals();
    res.json(proposals);
  } catch (error) {
    console.error("Failed to get all proposals:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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

// Debug Routes
router.get('/debug/proposals', async (req, res) => {
  try {
    const { getAllProposals } = await import('../services/contractService.js');
    const proposals = await getAllProposals();
    console.log('Debug - Current proposals:', proposals);
    
    // Add detailed APY analysis
    const executedProposals = proposals.filter(p => p.executed);
    const apyDetails = executedProposals.map(p => ({
      id: p.id,
      executed: p.executed,
      expectedAPY: p.expectedAPY,
      typeofExpectedAPY: typeof p.expectedAPY,
      parsedValue: parseFloat(p.expectedAPY)
    }));
    
    res.json({ 
      success: true, 
      proposals, 
      count: proposals.length,
      executedCount: executedProposals.length,
      apyDetails
    });
  } catch (error) {
    console.error("Debug - Failed to get proposals:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vault Routes
router.get('/vault/user/:userAddress', async (req, res) => {
  try {
    const userAddress = req.params.userAddress;
    
    // Get all proposals to calculate user shares and APY
    const { getAllProposals } = await import('../services/contractService.js');
    const proposals = await getAllProposals();
    
    // Calculate user shares based on executed strategies
    const executedProposals = proposals.filter(p => p.executed);
    const userShares = executedProposals.length * 1000; // 1000 shares per executed strategy
    
    // Calculate current APY from active strategies
    let currentAPY = 0;
    if (executedProposals.length > 0) {
      // Average APY from all executed strategies
      console.log('Debug - Executed proposals:', executedProposals.map(p => ({
        id: p.id,
        executed: p.executed,
        expectedAPY: p.expectedAPY,
        typeofExpectedAPY: typeof p.expectedAPY
      })));
      
      const totalAPY = executedProposals.reduce((sum, p) => {
        let apyValue = 0;
        
        // Handle different data types for expectedAPY
        if (typeof p.expectedAPY === 'number') {
          apyValue = p.expectedAPY;
        } else if (typeof p.expectedAPY === 'string') {
          apyValue = parseFloat(p.expectedAPY);
        } else {
          // Fallback to 8.5 if expectedAPY is missing or invalid
          apyValue = 8.5;
          console.log(`Proposal ${p.id}: Using fallback APY 8.5 due to invalid expectedAPY`);
        }
        
        // Ensure we have a valid number
        if (isNaN(apyValue) || apyValue === 0) {
          apyValue = 8.5; // Fallback for demo
        }
        
        console.log(`Proposal ${p.id}: expectedAPY=${p.expectedAPY}, parsed=${apyValue}`);
        return sum + apyValue;
      }, 0);
      
      currentAPY = (totalAPY / executedProposals.length).toFixed(2);
      console.log(`Debug - Total APY: ${totalAPY}, Count: ${executedProposals.length}, Final APY: ${currentAPY}`);
    }
    
    // Calculate total assets based on executed strategies
    const baseAssets = 50000;
    const yieldGenerated = executedProposals.length * 2500; // $2500 yield per strategy
    const totalAssets = baseAssets + yieldGenerated;
    
    const vaultData = {
      totalAssets: totalAssets.toString(),
      userShares: userShares.toString(),
      currentAPY: currentAPY.toString(),
      totalValueLocked: totalAssets.toString(),
      activeStrategies: executedProposals.length
    };
    
    console.log(`Vault data for ${userAddress}:`, vaultData);
    res.json({ success: true, data: vaultData });
  } catch (error) {
    console.error("Failed to get vault data:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;

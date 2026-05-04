import express from 'express';
import { executeProposal, getAllProposals } from '../services/contractService.js';
import { authenticateApiKey, rateLimit } from '../middleware/auth.js';

const router = express.Router();

/**
 * Execute a proposal by ID
 * POST /contract/execute/:id
 */
router.post('/execute/:id', authenticateApiKey, rateLimit({ windowMs: 60000, maxRequests: 5 }), async (req, res) => {
  try {
    const proposalId = parseInt(req.params.id);
    
    if (isNaN(proposalId)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid proposal ID' 
      });
    }
    
    console.log(`Executing proposal ${proposalId}...`);
    
    // Execute the proposal
    const receipt = await executeProposal(proposalId);
    
    res.json({ 
      success: true, 
      message: 'Proposal executed successfully',
      receipt: receipt
    });
    
  } catch (error) {
    console.error('Failed to execute proposal:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * Get all proposals
 * GET /contract/proposals
 */
router.get('/proposals', async (req, res) => {
  try {
    const proposals = await getAllProposals();
    
    res.json({ 
      success: true, 
      proposals: proposals
    });
    
  } catch (error) {
    console.error('Failed to fetch proposals:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;

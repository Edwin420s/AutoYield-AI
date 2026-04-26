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

export default router;

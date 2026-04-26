import express from 'express';
import { runAgentController } from '../controllers/agentController.js';

const router = express.Router();
router.post('/run', runAgentController);

export default router;

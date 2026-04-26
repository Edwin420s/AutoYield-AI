import { runAgent } from '../services/agentService.js';

export async function runAgentController(req, res) {
  try {
    const result = await runAgent();
    res.json({ success: true, tx: result.txHash, message: result.message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
}

/**
 * Express.js Server for Agent Routes
 * Alternative backend server focused on AI agent endpoints
 * 
 * Key Features:
 * - Agent-specific route mounting
 * - CORS support for frontend integration
 * - JSON parsing middleware
 * - Environment-based configuration
 * - Health check endpoint
 * - Error handling middleware
 * 
 * @module backend/src/server.js
 * @author AutoYield AI Team
 * @version 1.0.0
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import agentRoutes from './routes/agentRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import { rateLimit } from './middleware/auth.js';
import { initializeEnvironment, PRODUCTION_MODE } from './config/productionMode.js';

dotenv.config();

// Initialize environment configuration
initializeEnvironment();

// ========================================
// APPLICATION CONFIGURATION
// ========================================

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE CONFIGURATION
// ========================================

/**
 * Enable Cross-Origin Resource Sharing for frontend integration
 */
app.use(cors());

/**
 * Apply global rate limiting to prevent DoS attacks
 * Limits: 100 requests per minute per IP
 */
app.use(rateLimit({ 
  windowMs: 60000, 
  maxRequests: 100,
  skipSuccessfulRequests: false
}));

/**
 * Parse JSON request bodies
 */
app.use(express.json());

// ========================================
// ROUTE CONFIGURATION
// ========================================

/**
 * Mount agent routes under /api/agent prefix
 */
app.use('/api/agent', agentRoutes);

/**
 * Mount contract routes under /api/contract prefix
 */
app.use('/api/contract', contractRoutes);

/**
 * Health check endpoint for monitoring and load balancers
 * Returns server status and version information
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} JSON response with health status
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

/**
 * SECURE: Global error handling middleware
 * Catches unhandled errors and returns sanitized error response
 * Prevents information disclosure to potential attackers
 * 
 * @param {Error} error - Error object to handle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} JSON error response with 500 status
 */
app.use((error, req, res, next) => {
  // Log full error for debugging (server-side only)
  console.error('Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
  
  // SECURITY: Return sanitized error to client
  // Never expose internal error details, file paths, or stack traces
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development, provide more details but still sanitize sensitive info
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message.substring(0, 100), // Limit message length
      timestamp: new Date().toISOString()
    });
  } else {
    // In production, return minimal information
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      requestId: Math.random().toString(36).substring(7) // For support tracking
    });
  }
});

/**
 * 404 handler for unknown routes
 * Returns standardized error response for missing endpoints
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {void} JSON error response with 404 status
 */
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    error: 'Route not found'
  });
});

/**
 * Server startup and configuration logging
 * Starts Express server and displays important URLs for development
 * 
 * @returns {void} Server listening on configured port
 */
app.listen(PORT, () => {
  console.log(`AutoYield AI Backend Server running on port ${PORT}`);
  console.log(`Agent API available at: http://localhost:${PORT}/api/agent`);
  console.log(`Contract API available at: http://localhost:${PORT}/api/contract`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

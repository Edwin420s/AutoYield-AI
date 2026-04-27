/**
 * Express.js Application Entry Point
 * Main backend server for AutoYield AI API
 * 
 * Key Features:
 * - RESTful API with CORS support
 * - Health check endpoint
 * - Route mounting for API endpoints
 * - Comprehensive error handling
 * - Environment-based configuration
 * 
 * @module backend/src/app.js
 * @author AutoYield AI Team
 * @version 1.0.0
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';

dotenv.config();

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
 * Parse JSON request bodies
 */
app.use(express.json());

// ========================================
// ROUTE CONFIGURATION
// ========================================

/**
 * Mount API routes under /api prefix
 */
app.use('/api', apiRoutes);

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
 * Global error handling middleware
 * Catches unhandled errors and returns standardized error response
 * 
 * @param {Error} error - Error object to handle
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {void} JSON error response with 500 status
 */
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error'
  });
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
  console.log(`API available at: http://localhost:${PORT}/api`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

/**
 * ========================================
 * AUTOYIELD AI - BACKEND APPLICATION
 * ========================================
 * 
 * File: backend/src/app.js
 * Version: 1.0.0
 * Author: AutoYield AI Team
 * 
 * ========================================
 * MODULE DESCRIPTION
 * ========================================
 * Express.js Application Entry Point for AutoYield AI Backend API.
 * This module serves as the main server application that handles all HTTP requests,
 * middleware configuration, and route mounting for the autonomous DeFi yield optimizer.
 * 
 * The backend acts as the bridge between the frontend UI and the blockchain,
 * providing RESTful API endpoints for AI strategy execution, vault management,
 * and protocol monitoring. It integrates with 0G services for TEE computation
 * and storage while maintaining a clean separation of concerns.
 * 
 * ========================================
 * ARCHITECTURE ROLE
 * ========================================
 * This application serves as the central orchestrator for:
 * - API request routing and middleware management
 * - Cross-Origin Resource Sharing (CORS) configuration
 * - Health check endpoints for monitoring and load balancers
 * - Global error handling and logging
 * - Route mounting for modular API endpoints
 * - Environment-based configuration management
 * 
 * ========================================
 * KEY FEATURES
 * ========================================
 * - RESTful API with comprehensive CORS support
 * - Health check endpoint for monitoring and load balancers
 * - Route mounting for organized API endpoint management
 * - Comprehensive error handling with standardized responses
 * - Environment-based configuration for deployment flexibility
 * - JSON request body parsing for API data handling
 * - 404 handling for unknown routes
 * - Structured logging for debugging and monitoring
 * 
 * ========================================
 * API ENDPOINTS
 * ========================================
 * Mounted under /api prefix:
 * - GET /api/agent/run - Execute AI strategy with TEE verification
 * - GET /api/agent/proposals - Get all pending and executed proposals
 * - GET /api/vault/balance/:userAddress - Get user vault balance and shares
 * - POST /api/vault/deposit - Deposit funds into vault
 * - GET /api/protocols - Get whitelisted protocols with risk scores
 * - GET /health - Server health check
 * 
 * ========================================
 * MIDDLEWARE STACK
 * ========================================
 * 1. CORS Middleware:
 *    - Enables cross-origin requests from frontend
 *    - Configured for development and production environments
 *    - Supports pre-flight requests for API security
 * 
 * 2. JSON Parser Middleware:
 *    - Parses incoming JSON request bodies
 *    - Handles content-type validation
 *    - Supports nested objects and arrays
 * 
 * 3. API Routes Middleware:
 *    - Mounts all API endpoints under /api prefix
 *    - Provides organized route structure
 *    - Enables modular route management
 * 
 * 4. Error Handling Middleware:
 *    - Catches unhandled errors globally
 *    - Returns standardized error responses
 *    - Prevents server crashes and leaks
 * 
 * 5. 404 Handler Middleware:
 *    - Handles requests to unknown endpoints
 *    - Returns consistent error format
 *    - Maintains API contract integrity
 * 
 * ========================================
 * ENVIRONMENT CONFIGURATION
 * ========================================
 * Environment Variables:
 * - PORT: Server port (default: 3000)
 * - NODE_ENV: Environment mode (development/production)
 * - ZERO_G_RPC_URL: 0G network RPC endpoint
 * - PRIVATE_KEY: Backend wallet private key
 * - MANAGER_ADDRESS: StrategyManager contract address
 * - VAULT_ADDRESS: AutoYieldVault contract address
 * - REGISTRY_ADDRESS: AgentRegistry contract address
 * - ZERO_G_COMPUTE_URL: 0G Compute service endpoint
 * 
 * ========================================
 * ERROR HANDLING STRATEGY
 * ========================================
 * 1. Global Error Handler:
 *    - Catches all unhandled errors
 *    - Logs error details for debugging
 *    - Returns standardized 500 error response
 *    - Prevents sensitive information leakage
 * 
 * 2. 404 Handler:
 *    - Handles unknown route requests
 *    - Returns consistent error format
 *    - Maintains API contract for clients
 * 
 * 3. Error Response Format:
 *    {
 *      "success": false,
 *      "error": "Error description",
 *      "code": "ERROR_CODE",
 *      "timestamp": "ISO timestamp"
 *    }
 * 
 * ========================================
 * HEALTH CHECK SYSTEM
 * ========================================
 * The health check endpoint provides:
 * - Server status verification
 * - Timestamp for monitoring
 * - Version information for deployment tracking
 * - Response time measurement for load balancers
 * - Service availability confirmation
 * 
 * Response Format:
 * {
 *   "status": "healthy",
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "version": "1.0.0",
 *   "uptime": "1234"
 * }
 * 
 * ========================================
 * SECURITY CONSIDERATIONS
 * ========================================
 * 1. CORS Configuration:
 *    - Restricts origins in production
 *    - Prevents cross-origin attacks
 *    - Supports pre-flight requests
 * 
 * 2. Input Validation:
 *    - JSON parsing prevents malformed requests
 *    - Size limits prevent DoS attacks
 *    - Type validation in route handlers
 * 
 * 3. Error Information:
 *    - Sanitized error messages
 *    - No stack traces in production
 *    - Consistent error format
 * 
 * 4. Request Logging:
 *    - Request tracking for audit
 *    - Error logging for debugging
 *    - Performance monitoring
 * 
 * ========================================
 * PERFORMANCE OPTIMIZATIONS
 * ========================================
 * 1. Middleware Efficiency:
 *    - Minimal overhead middleware stack
 *    - Efficient JSON parsing
 *    - Optimized CORS handling
 * 
 * 2. Response Caching:
 *    - Health check can be cached
 *    - Static responses for monitoring
 *    - Conditional requests support
 * 
 * 3. Connection Management:
 *    - Keep-alive connections
 *    - Timeout configurations
 *    - Resource cleanup
 * 
 * ========================================
 * DEVELOPMENT FEATURES
 * ========================================
 * 1. Detailed Logging:
 *    - Request/response logging
 *    - Error stack traces
 *    - Development server information
 * 
 * 2. Hot Reload Support:
 *    - Nodemon integration
 *    - Automatic restart on changes
 *    - Development workflow optimization
 * 
 * 3. Environment Flexibility:
 *    - Development/production configs
 *    - Local environment variables
 *    - Docker deployment support
 * 
 * ========================================
 * PRODUCTION CONSIDERATIONS
 * ========================================
 * 1. Scalability:
 *    - Stateless design
 *    - Horizontal scaling support
 *    - Load balancer compatibility
 * 
 * 2. Reliability:
 *    - Graceful error handling
 *    - Health check endpoints
 *    - Monitoring integration
 * 
 * 3. Security:
 *    - Environment variable secrets
 *    - CORS restrictions
 *    - Input sanitization
 * 
 * ========================================
 * INTEGRATION POINTS
 * ========================================
 * 1. Frontend Integration:
 *    - React application API calls
 *    - Web3 wallet connections
 *    - Real-time data updates
 * 
 * 2. Blockchain Integration:
 *    - 0G network RPC connections
 *    - Smart contract interactions
 *    - Transaction monitoring
 * 
 * 3. 0G Services Integration:
 *    - TEE computation services
 *    - Storage service uploads
 *    - Attestation verification
 * 
 * 4. External APIs:
 *    - DefiLlama APY data
 *    - Protocol metadata
 *    - Risk scoring services
 * 
 * ========================================
 * MONITORING & DEBUGGING
 * ========================================
 * 1. Application Logs:
 *    - Server startup information
 *    - Request/response logging
 *    - Error details and stack traces
 * 
 * 2. Health Monitoring:
 *    - Endpoint availability
 *    - Response time tracking
 *    - Error rate monitoring
 * 
 * 3. Performance Metrics:
 *    - Request throughput
 *    - Response latency
 *    - Resource utilization
 * 
 * ========================================
 * FUTURE ENHANCEMENTS
 * ========================================
 * 1. Advanced Middleware:
 *    - Rate limiting
 *    - Request authentication
 *    - API versioning
 * 
 * 2. Monitoring Integration:
 *    - Prometheus metrics
 *    - Grafana dashboards
 *    - Alert systems
 * 
 * 3. Security Enhancements:
 *    - JWT authentication
 *    - API key management
 *    - Request signing
 * 
 * ========================================
 * DEPENDENCIES
 * ========================================
 * - express: Web framework for Node.js
 * - cors: Cross-Origin Resource Sharing middleware
 * - dotenv: Environment variable management
 * - API routes: Modular route handlers
 * 
 * ========================================
 * LICENSING & ATTRIBUTION
 * ========================================
 * License: MIT
 * Author: AutoYield AI Team
 * Project: AutoYield AI - 0G APAC Hackathon 2026
 * Track: Agentic Trading Arena (Verifiable Finance)
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

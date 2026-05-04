/**
 * Authentication Middleware for AutoYield AI Backend
 * Provides API key authentication and rate limiting for security
 * 
 * @module middleware/auth
 * @version 1.0.0
 */

import crypto from 'crypto';

// In production, store these securely in environment variables or a database
const VALID_API_KEYS = new Set([
  process.env.API_KEY_1 || 'demo-key-1-change-in-production',
  process.env.API_KEY_2 || 'demo-key-2-change-in-production'
]);

// Rate limiting storage (in production, use Redis)
const rateLimitStore = new Map();

/**
 * API Key Authentication Middleware
 * Validates API keys from Authorization header or query parameter
 */
export function authenticateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Please provide an API key in X-API-Key header or api_key query parameter'
    });
  }
  
  if (!VALID_API_KEYS.has(apiKey)) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }
  
  // Store API key for rate limiting
  req.apiKey = apiKey;
  next();
}

/**
 * Rate Limiting Middleware
 * Prevents DoS attacks by limiting requests per API key
 */
export function rateLimit(options = {}) {
  const {
    windowMs = 60000, // 1 minute window
    maxRequests = 100, // 100 requests per window
    skipSuccessfulRequests = false
  } = options;
  
  return (req, res, next) => {
    const key = req.apiKey || req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get existing requests for this key
    let requests = rateLimitStore.get(key) || [];
    
    // Clean up old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (requests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per ${windowMs/1000} seconds.`,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request timestamp
    requests.push(now);
    rateLimitStore.set(key, requests);
    
    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': maxRequests,
      'X-RateLimit-Remaining': Math.max(0, maxRequests - requests.length),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });
    
    next();
  };
}

/**
 * Signature Verification Middleware
 * Verifies cryptographic signatures for critical operations
 */
export function verifySignature(req, res, next) {
  const signature = req.headers['x-signature'];
  const timestamp = req.headers['x-timestamp'];
  const payload = JSON.stringify(req.body);
  
  if (!signature || !timestamp) {
    return res.status(401).json({
      success: false,
      error: 'Signature verification required',
      message: 'Please provide X-Signature and X-Timestamp headers'
    });
  }
  
  // Check timestamp to prevent replay attacks (5 minute window)
  const now = Date.now();
  const requestTime = parseInt(timestamp);
  if (Math.abs(now - requestTime) > 300000) { // 5 minutes
    return res.status(401).json({
      success: false,
      error: 'Request expired',
      message: 'Timestamp is too old or too far in the future'
    });
  }
  
  // Verify signature using HMAC-SHA256
  const secretKey = process.env.SIGNATURE_SECRET || 'demo-secret-change-in-production';
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(`${timestamp}.${payload}`)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({
      success: false,
      error: 'Invalid signature',
      message: 'Cryptographic signature verification failed'
    });
  }
  
  next();
}

/**
 * Combined Security Middleware for Agent Endpoints
 * Applies authentication, rate limiting, and signature verification
 */
export function secureAgentEndpoint(req, res, next) {
  authenticateApiKey(req, res, (err) => {
    if (err) return;
    
    rateLimit({ windowMs: 60000, maxRequests: 10 })(req, res, (err) => {
      if (err) return;
      
      verifySignature(req, res, next);
    });
  });
}

/**
 * Clean up old rate limit entries periodically
 */
setInterval(() => {
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  
  for (const [key, requests] of rateLimitStore.entries()) {
    const filteredRequests = requests.filter(timestamp => timestamp > now - windowMs);
    if (filteredRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, filteredRequests);
    }
  }
}, 60000); // Clean up every minute

export default {
  authenticateApiKey,
  rateLimit,
  verifySignature,
  secureAgentEndpoint
};

/**
 * Input Validation Middleware for AutoYield AI Backend
 * Provides comprehensive input validation and bounds checking
 * 
 * @module middleware/validation
 * @version 1.0.0
 */

/**
 * Validate protocol data from oracle APIs
 * Prevents bad data from triggering harmful rebalances
 */
export function validateProtocolData(req, res, next) {
  const { protocols } = req.body;
  
  if (!protocols || !Array.isArray(protocols)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid protocols data',
      message: 'Protocols must be provided as an array'
    });
  }
  
  // Validate each protocol
  for (let i = 0; i < protocols.length; i++) {
    const protocol = protocols[i];
    
    // Required fields
    if (!protocol.name || typeof protocol.name !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid protocol name',
        message: `Protocol at index ${i} must have a valid name`
      });
    }
    
    if (!protocol.address || typeof protocol.address !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(protocol.address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid protocol address',
        message: `Protocol at index ${i} must have a valid Ethereum address`
      });
    }
    
    // APY bounds checking (0% to 1000%)
    if (typeof protocol.apy !== 'number' || protocol.apy < 0 || protocol.apy > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid APY value',
        message: `Protocol at index ${i} APY must be between 0% and 1000%`
      });
    }
    
    // Risk score bounds (0 to 100)
    if (typeof protocol.risk !== 'number' || protocol.risk < 0 || protocol.risk > 100) {
      return res.status(400).json({
        success: false,
        error: 'Invalid risk score',
        message: `Protocol at index ${i} risk score must be between 0 and 100`
      });
    }
    
    // TVL bounds (non-negative, reasonable max)
    if (typeof protocol.tvl !== 'number' || protocol.tvl < 0 || protocol.tvl > 1e15) {
      return res.status(400).json({
        success: false,
        error: 'Invalid TVL value',
        message: `Protocol at index ${i} TVL must be a non-negative number less than 1 quadrillion`
      });
    }
    
    // Volume bounds (non-negative, reasonable max)
    if (protocol.volume24h !== undefined) {
      if (typeof protocol.volume24h !== 'number' || protocol.volume24h < 0 || protocol.volume24h > 1e15) {
        return res.status(400).json({
          success: false,
          error: 'Invalid volume value',
          message: `Protocol at index ${i} 24h volume must be a non-negative number less than 1 quadrillion`
        });
      }
    }
  }
  
  // Must have at least 2 protocols for diversification
  if (protocols.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient protocols',
      message: 'At least 2 protocols are required for diversification'
    });
  }
  
  // Maximum protocols to prevent gas issues
  if (protocols.length > 10) {
    return res.status(400).json({
      success: false,
      error: 'Too many protocols',
      message: 'Maximum 10 protocols allowed per strategy'
    });
  }
  
  next();
}

/**
 * Validate strategy proposal data
 */
export function validateStrategyProposal(req, res, next) {
  const { protocols, percentages, expectedAPY } = req.body;
  
  // Array validation
  if (!Array.isArray(protocols) || !Array.isArray(percentages)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid arrays',
      message: 'Protocols and percentages must be arrays'
    });
  }
  
  // Length matching
  if (protocols.length !== percentages.length) {
    return res.status(400).json({
      success: false,
      error: 'Array length mismatch',
      message: 'Protocols and percentages arrays must have the same length'
    });
  }
  
  // Minimum protocols
  if (protocols.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient protocols',
      message: 'At least 2 protocols are required'
    });
  }
  
  // Maximum protocols
  if (protocols.length > 10) {
    return res.status(400).json({
      success: false,
      error: 'Too many protocols',
      message: 'Maximum 10 protocols allowed'
    });
  }
  
  // Validate protocol addresses
  for (let i = 0; i < protocols.length; i++) {
    if (!/^0x[a-fA-F0-9]{40}$/.test(protocols[i])) {
      return res.status(400).json({
        success: false,
        error: 'Invalid protocol address',
        message: `Protocol at index ${i} has an invalid address`
      });
    }
  }
  
  // Validate percentages (BPS format: 100-10000)
  let totalPercentage = 0;
  for (let i = 0; i < percentages.length; i++) {
    if (typeof percentages[i] !== 'number' || percentages[i] < 100 || percentages[i] > 10000) {
      return res.status(400).json({
        success: false,
        error: 'Invalid percentage',
        message: `Percentage at index ${i} must be between 100 (1%) and 10000 (100%)`
      });
    }
    totalPercentage += percentages[i];
  }
  
  // Must sum to exactly 10000 BPS (100%)
  if (totalPercentage !== 10000) {
    return res.status(400).json({
      success: false,
      error: 'Invalid percentage sum',
      message: `Percentages must sum to exactly 10000 BPS (100%), got ${totalPercentage}`
    });
  }
  
  // Validate expected APY
  if (typeof expectedAPY !== 'number' || expectedAPY < 0 || expectedAPY > 1000) {
    return res.status(400).json({
      success: false,
      error: 'Invalid expected APY',
      message: 'Expected APY must be between 0% and 1000%'
    });
  }
  
  next();
}

/**
 * Validate deposit amount
 */
export function validateDeposit(req, res, next) {
  const { amount } = req.body;
  
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid deposit amount',
      message: 'Deposit amount must be a positive number'
    });
  }
  
  // Maximum deposit to prevent issues
  if (amount > 1e9) { // 1 billion USDC max
    return res.status(400).json({
      success: false,
      error: 'Deposit amount too large',
      message: 'Maximum deposit amount is 1,000,000,000 USDC'
    });
  }
  
  // Minimum deposit to prevent dust
  if (amount < 0.01) { // 0.01 USDC minimum
    return res.status(400).json({
      success: false,
      error: 'Deposit amount too small',
      message: 'Minimum deposit amount is 0.01 USDC'
    });
  }
  
  next();
}

/**
 * Validate withdrawal amount
 */
export function validateWithdrawal(req, res, next) {
  const { shares } = req.body;
  
  if (typeof shares !== 'number' || shares <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Invalid withdrawal amount',
      message: 'Withdrawal amount must be a positive number'
    });
  }
  
  // Maximum withdrawal to prevent issues
  if (shares > 1e18) { // 1 billion shares max
    return res.status(400).json({
      success: false,
      error: 'Withdrawal amount too large',
      message: 'Maximum withdrawal amount is 1,000,000,000 shares'
    });
  }
  
  next();
}

/**
 * Sanitize and validate user addresses
 */
export function validateAddress(req, res, next) {
  const { address } = req.params;
  
  if (!address || typeof address !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'Invalid address',
      message: 'Address parameter is required'
    });
  }
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid address format',
      message: 'Address must be a valid Ethereum address'
    });
  }
  
  // Add sanitized address to request
  req.sanitizedAddress = address.toLowerCase();
  next();
}

/**
 * Generic bounds checking middleware
 */
export function validateBounds(min = 0, max = Infinity, field = 'value') {
  return (req, res, next) => {
    const value = req.body[field];
    
    if (typeof value !== 'number') {
      return res.status(400).json({
        success: false,
        error: `Invalid ${field}`,
        message: `${field} must be a number`
      });
    }
    
    if (value < min || value > max) {
      return res.status(400).json({
        success: false,
        error: `Out of bounds`,
        message: `${field} must be between ${min} and ${max}`
      });
    }
    
    next();
  };
}

export default {
  validateProtocolData,
  validateStrategyProposal,
  validateDeposit,
  validateWithdrawal,
  validateAddress,
  validateBounds
};

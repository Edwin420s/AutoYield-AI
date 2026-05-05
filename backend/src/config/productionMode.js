/**
 * Production Mode Configuration Service
 * Provides consistent abstraction between mock and production environments
 * 
 * @module config/productionMode
 * @author AutoYield AI Team
 * @version 1.0.0
 */

import dotenv from 'dotenv';
dotenv.config();

/**
 * Production mode detection and configuration
 */
export const PRODUCTION_MODE = {
  // Environment detection
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  
  // Feature flags
  useRealBlockchain: process.env.USE_REAL_BLOCKCHAIN === 'true',
  useRealTEE: process.env.USE_REAL_TEE === 'true',
  useRealStorage: process.env.USE_REAL_STORAGE === 'true',
  useRealOracle: process.env.USE_REAL_ORACLE === 'true',
  
  // Network configuration
  network: process.env.NETWORK || 'localhost',
  rpcUrl: process.env.ZERO_G_RPC_URL || process.env.RPC_URL || 'http://localhost:8545',
  
  // Check if RPC is reachable
  isRPCReachable: async function() {
    if (this.isDevelopment && this.rpcUrl.includes('rpc.0g.ai')) {
      console.warn('⚠️  External RPC (rpc.0g.ai) not reachable in development, using mock mode');
      return false;
    }
    return true;
  },
  
  // Contract addresses (with fallbacks)
  getContractAddresses: () => ({
    manager: process.env.MANAGER_ADDRESS || (PRODUCTION_MODE.useRealBlockchain ? null : "0x1234567890123456789012345678901234567890"),
    vault: process.env.VAULT_ADDRESS || (PRODUCTION_MODE.useRealBlockchain ? null : "0x2345678901234567890123456789012345678901"),
    registry: process.env.REGISTRY_ADDRESS || (PRODUCTION_MODE.useRealBlockchain ? null : "0x3456789012345678901234567890123456789012"),
    underlying: process.env.UNDERLYING_ASSET || (PRODUCTION_MODE.useRealBlockchain ? null : "0x4567890123456789012345678901234567890123")
  }),
  
  // Mock protocol addresses (for demo)
  getMockProtocolAddresses: () => ({
    'Aave': process.env.MOCK_AAVE_ADDRESS || "0x1234567890123456789012345678901234567890",
    'Benqi': process.env.MOCK_BENQI_ADDRESS || "0x2345678901234567890123456789012345678901",
    'Compound': process.env.MOCK_COMPOUND_ADDRESS || "0x3456789012345678901234567890123456789012"
  }),
  
  // Security configuration
  getSecurityConfig: () => ({
    apiKeyRequired: PRODUCTION_MODE.isProduction,
    rateLimitEnabled: true,
    signatureVerification: PRODUCTION_MODE.isProduction,
    maxTransactionValue: process.env.MAX_TRANSACTION_VALUE || "1000000000000000000000"
  }),
  
  // Logging configuration
  getLoggingConfig: () => ({
    level: PRODUCTION_MODE.isProduction ? 'warn' : 'debug',
    console: !PRODUCTION_MODE.isProduction,
    file: PRODUCTION_MODE.isProduction
  })
};

/**
 * Mock data factory for consistent demo experience
 */
export class MockDataFactory {
  static createMockProposal(id = 1) {
    const addresses = PRODUCTION_MODE.getMockProtocolAddresses();
    return {
      id,
      txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).substr(2, 8)}`,
      protocols: [addresses['Aave'], addresses['Benqi']],
      percentages: [60, 40],
      expectedAPY: 8.5,
      executionProof: "0xmock_proof_" + Date.now(),
      proposer: "0x" + "0".repeat(40),
      timestamp: new Date(Date.now() - 120000).toISOString(),
      executeAfter: new Date(Date.now() - 60000).toISOString(),
      status: 'pending',
      executed: false,
      executedAt: null,
      blockNumber: Math.floor(Math.random() * 1000) + 1
    };
  }
  
  static createMockMarketData() {
    return [
      {
        name: 'Aave V3 (USDC)',
        asset: 'USDC',
        address: PRODUCTION_MODE.getMockProtocolAddresses()['Aave'],
        apy: 4.5,
        tvl: 8500000000,
        risk: 15,
        source: 'mock_oracle',
        verified: true,
        lastUpdate: Math.floor(Date.now() / 1000)
      },
      {
        name: 'Compound V3 (USDC)',
        asset: 'USDC',
        address: PRODUCTION_MODE.getMockProtocolAddresses()['Compound'],
        apy: 5.1,
        tvl: 4200000000,
        risk: 20,
        source: 'mock_oracle',
        verified: true,
        lastUpdate: Math.floor(Date.now() / 1000)
      },
      {
        name: 'Benqi Protocol',
        asset: 'USDC',
        address: PRODUCTION_MODE.getMockProtocolAddresses()['Benqi'],
        apy: 6.2,
        tvl: 2100000000,
        risk: 25,
        source: 'mock_oracle',
        verified: true,
        lastUpdate: Math.floor(Date.now() / 1000)
      }
    ];
  }
  
  static createMockTransactionReceipt() {
    return {
      hash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
      blockNumber: Math.floor(Math.random() * 1000000),
      gasUsed: "21000",
      effectiveGasPrice: "20000000000",
      status: 1,
      logs: [],
      transactionIndex: 0,
      blockHash: `0x${Math.random().toString(16).slice(2)}`
    };
  }
  
  static createMockTEEAttestation() {
    return {
      signature: `0x${Buffer.from('TEE_ATTESTATION_' + Date.now()).toString('hex')}`,
      enclaveAddress: "0x" + "0".repeat(40),
      strategyHash: `0x${Buffer.from('STRATEGY_HASH_' + Date.now()).toString('hex')}`
    };
  }
}

/**
 * Environment validation service
 */
export class EnvironmentValidator {
  static validateRequiredEnvVars() {
    const required = ['PORT', 'NODE_ENV'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.warn(`Missing environment variables: ${missing.join(', ')}`);
      console.warn('Using default values for development...');
    }
    
    return missing.length === 0;
  }
  
  static validateProductionConfig() {
    if (!PRODUCTION_MODE.isProduction) return true;
    
    const productionRequired = [
      'MANAGER_ADDRESS',
      'VAULT_ADDRESS',
      'REGISTRY_ADDRESS',
      'PRIVATE_KEY',
      'RPC_URL'
    ];
    
    const missing = productionRequired.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      console.error(`CRITICAL: Missing production environment variables: ${missing.join(', ')}`);
      return false;
    }
    
    return true;
  }
  
  static validateSecurityConfig() {
    const security = PRODUCTION_MODE.getSecurityConfig();
    
    if (PRODUCTION_MODE.isProduction && !security.apiKeyRequired) {
      console.warn('WARNING: Production mode without API key authentication');
    }
    
    if (PRODUCTION_MODE.isProduction && !security.signatureVerification) {
      console.warn('WARNING: Production mode without signature verification');
    }
    
    return true;
  }
}

/**
 * Initialize environment on startup
 */
export function initializeEnvironment() {
  console.log(`🚀 Initializing AutoYield AI Backend...`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Network: ${PRODUCTION_MODE.network}`);
  console.log(`🔗 RPC URL: ${PRODUCTION_MODE.rpcUrl}`);
  
  // Validate environment
  EnvironmentValidator.validateRequiredEnvVars();
  
  if (PRODUCTION_MODE.isProduction) {
    const isValid = EnvironmentValidator.validateProductionConfig() && 
                    EnvironmentValidator.validateSecurityConfig();
    
    if (!isValid) {
      console.error('❌ Production environment validation failed');
      process.exit(1);
    }
    
    console.log('✅ Production environment validated');
  } else {
    console.log('🧪 Development mode - using mock data');
  }
  
  console.log('✅ Environment initialization complete');
}

export default {
  PRODUCTION_MODE,
  MockDataFactory,
  EnvironmentValidator,
  initializeEnvironment
};

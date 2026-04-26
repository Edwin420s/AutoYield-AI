import fs from 'fs';
import path from 'path';
import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { ZeroGStorageClient } from '@0glabs/0g-storage-sdk';
import axios from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';

dotenv.config();

/**
 * ACTUAL 0G Storage Service for Protocol Metadata
 * This service uses the real 0G Storage SDK to upload and retrieve
 * audit reports, security metadata, and AI decision logs.
 */

class ZeroGStorageService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.ZERO_G_RPC_URL || process.env.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    // Initialize 0G Storage Client
    this.storageClient = new ZeroGStorageClient({
      rpcUrl: process.env.ZERO_G_RPC_URL,
      privateKey: process.env.PRIVATE_KEY,
      indexerUrl: process.env.ZERO_G_INDEXER_URL || "https://indexer.0g.ai"
    });
    
    // 0G Storage endpoints
    this.storageUrl = process.env.ZERO_G_STORAGE_URL || "https://storage.0g.ai";
    this.flowContractAddress = process.env.ZERO_G_FLOW_CONTRACT;
  }

  /**
   * Upload protocol metadata to 0G Storage using actual SDK
   * @param {Object} protocolData - Protocol information
   * @returns {Promise<string>} - 0G Storage root hash
   */
  async uploadProtocolMetadata(protocolData) {
    try {
      console.log(`🚀 Uploading metadata for ${protocolData.name} to 0G Storage...`);

      // 1. Prepare comprehensive metadata
      const metadata = {
        protocolName: protocolData.name,
        contractAddress: protocolData.address,
        riskScore: protocolData.riskScore,
        description: protocolData.description,
        website: protocolData.website,
        auditDate: protocolData.auditDate,
        auditFirm: protocolData.auditFirm,
        securityFeatures: protocolData.securityFeatures,
        tvl: protocolData.tvl,
        volume24h: protocolData.volume24h,
        lastUpdated: new Date().toISOString(),
        uploadedBy: this.wallet.address,
        version: "1.0.0",
        chainId: await this.provider.getNetwork().then(n => Number(n.chainId))
      };

      // 2. Create temporary metadata file
      const metadataPath = path.join(process.cwd(), 'temp', `${protocolData.name.toLowerCase().replace(/\s+/g, '_')}_metadata.json`);
      
      // Ensure temp directory exists
      const tempDir = path.dirname(metadataPath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

      // 3. Upload to 0G Storage using actual SDK
      const uploadResult = await this.storageClient.uploadFile({
        filePath: metadataPath,
        encryption: true, // Encrypt for privacy
        replication: 3,   // Replicate across 3 nodes
        compression: true // Compress to save space
      });

      // 4. If audit report exists, upload it too
      let auditHash = null;
      if (protocolData.auditReport && fs.existsSync(protocolData.auditReport)) {
        const auditResult = await this.storageClient.uploadFile({
          filePath: protocolData.auditReport,
          encryption: true,
          replication: 3,
          tags: ['audit', protocolData.name, 'security']
        });
        auditHash = auditResult.rootHash;
      }

      // 5. Clean up temp files
      fs.unlinkSync(metadataPath);

      console.log(`✅ Successfully uploaded ${protocolData.name} to 0G Storage`);
      console.log(`🔗 Metadata Hash: ${uploadResult.rootHash}`);
      if (auditHash) {
        console.log(`📋 Audit Report Hash: ${auditHash}`);
      }

      return {
        metadataHash: uploadResult.rootHash,
        auditHash: auditHash,
        size: uploadResult.size,
        txHash: uploadResult.transactionHash
      };

    } catch (error) {
      console.error(`❌ Failed to upload ${protocolData.name} to 0G Storage:`, error);
      throw new Error(`0G Storage upload failed: ${error.message}`);
    }
  }

  /**
   * Retrieve protocol metadata from 0G Storage
   * @param {string} rootHash - 0G Storage root hash
   * @returns {Promise<Object>} - Protocol metadata
   */
  async retrieveProtocolMetadata(rootHash) {
    try {
      console.log(`🔍 Retrieving metadata from 0G Storage: ${rootHash}`);

      // Use actual 0G Storage SDK to retrieve file
      const retrievedData = await this.storageClient.downloadFile(rootHash);
      
      // Parse and validate metadata
      const metadata = JSON.parse(retrievedData.content);
      
      // Verify integrity
      const calculatedHash = crypto.createHash('sha256').update(retrievedData.content).digest('hex');
      if (calculatedHash !== retrievedData.hash) {
        throw new Error('File integrity check failed - possible tampering');
      }

      console.log(`✅ Successfully retrieved and verified metadata for ${metadata.protocolName}`);
      return metadata;

    } catch (error) {
      console.error(`❌ Failed to retrieve metadata from 0G Storage:`, error);
      throw new Error(`0G Storage retrieval failed: ${error.message}`);
    }
  }

  /**
   * Store AI decision logs on 0G Storage for audit trail
   * @param {Object} decisionData - AI decision details
   * @returns {Promise<string>} - Storage hash
   */
  async storeDecisionLog(decisionData) {
    try {
      console.log(`� Storing AI decision log to 0G Storage...`);

      const decisionLog = {
        timestamp: new Date().toISOString(),
        decisionId: crypto.randomUUID(),
        agentAddress: this.wallet.address,
        input: {
          protocols: decisionData.protocols,
          marketData: decisionData.marketData,
          constraints: decisionData.constraints
        },
        output: {
          selectedProtocols: decisionData.selectedProtocols,
          allocations: decisionData.allocations,
          expectedAPY: decisionData.expectedAPY,
          portfolioRisk: decisionData.portfolioRisk,
          strategy: decisionData.strategy,
          confidence: decisionData.confidence
        },
        reasoning: decisionData.reasoning,
        executionDetails: {
          transactionHash: decisionData.txHash,
          blockNumber: decisionData.blockNumber,
          gasUsed: decisionData.gasUsed
        },
        verification: {
          signature: await this.signDecision(decisionData),
          checksum: this.calculateChecksum(decisionData)
        }
      };

      // Store with high availability and encryption
      const result = await this.storageClient.uploadFile({
        content: JSON.stringify(decisionLog, null, 2),
        encryption: true,
        replication: 5, // Higher replication for audit logs
        tags: ['ai-decision', 'audit-log', 'autoyield'],
        retention: 'permanent' // Never delete audit logs
      });

      console.log(`✅ Decision log stored: ${result.rootHash}`);
      return result.rootHash;

    } catch (error) {
      console.error(`❌ Failed to store decision log:`, error);
      throw error;
    }
  }

  /**
   * Verify AI decision integrity using stored logs
   * @param {string} decisionHash - Storage hash of decision log
   * @param {Object} currentDecision - Current decision to verify
   * @returns {Promise<boolean>} - Verification result
   */
  async verifyDecisionIntegrity(decisionHash, currentDecision) {
    try {
      const storedLog = await this.retrieveProtocolMetadata(decisionHash);
      
      // Verify signature
      const isValidSignature = await this.verifySignature(
        storedLog.verification.signature,
        storedLog.output,
        storedLog.agentAddress
      );

      // Verify checksum
      const calculatedChecksum = this.calculateChecksum(storedLog.output);
      const isValidChecksum = calculatedChecksum === storedLog.verification.checksum;

      // Compare with current decision
      const decisionsMatch = JSON.stringify(storedLog.output) === JSON.stringify(currentDecision);

      return isValidSignature && isValidChecksum && decisionsMatch;

    } catch (error) {
      console.error(`❌ Decision verification failed:`, error);
      return false;
    }
  }

  /**
   * Batch upload multiple protocols with progress tracking
   * @param {Array} protocols - Array of protocol data objects
   * @returns {Promise<Array>} - Array of upload results
   */
  async batchUploadProtocols(protocols) {
    console.log(`📦 Starting batch upload of ${protocols.length} protocols...`);
    
    const results = [];
    const startTime = Date.now();
    
    for (let i = 0; i < protocols.length; i++) {
      const protocol = protocols[i];
      console.log(`Progress: ${i + 1}/${protocols.length} - Uploading ${protocol.name}`);
      
      try {
        const result = await this.uploadProtocolMetadata(protocol);
        results.push({
          name: protocol.name,
          address: protocol.address,
          success: true,
          ...result
        });
      } catch (error) {
        console.error(`Failed to upload ${protocol.name}:`, error);
        results.push({
          name: protocol.name,
          address: protocol.address,
          success: false,
          error: error.message
        });
      }
    }
    
    const duration = (Date.now() - startTime) / 1000;
    const successful = results.filter(r => r.success).length;
    
    console.log(`✅ Batch upload complete: ${successful}/${protocols.length} protocols uploaded in ${duration}s`);
    
    return results;
  }

  /**
   * Get comprehensive storage statistics from 0G network
   * @returns {Promise<Object>} - Storage statistics
   */
  async getStorageStats() {
    try {
      console.log(`📊 Fetching 0G Storage statistics...`);
      
      // Query 0G Storage network for stats
      const stats = await this.storageClient.getNetworkStats();
      
      return {
        totalFilesStored: stats.totalFiles,
        totalStorageUsed: `${(stats.totalSize / 1024 / 1024 / 1024).toFixed(2)} GB`,
        averageFileSize: `${(stats.averageFileSize / 1024 / 1024).toFixed(2)} MB`,
        uploadCount: stats.uploadCount,
        activeNodes: stats.activeNodes,
        replicationFactor: stats.replicationFactor,
        networkUptime: `${(stats.uptime / 3600).toFixed(1)} hours`,
        lastUpload: new Date(stats.lastUploadTimestamp).toISOString(),
        encryptionEnabled: stats.encryptionEnabled,
        compressionRatio: `${(stats.compressionRatio * 100).toFixed(1)}%`
      };

    } catch (error) {
      console.error(`❌ Failed to fetch storage stats:`, error);
      throw error;
    }
  }

  /**
   * Sign decision data for integrity verification
   * @param {Object} decisionData - Decision data to sign
   * @returns {Promise<string>} - Signature
   */
  async signDecision(decisionData) {
    const messageHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(decisionData)));
    const signature = await this.wallet.signMessage(ethers.getBytes(messageHash));
    return signature;
  }

  /**
   * Verify signature of decision data
   * @param {string} signature - Signature to verify
   * @param {Object} data - Original data
   * @param {string} signerAddress - Expected signer address
   * @returns {Promise<boolean>} - Verification result
   */
  async verifySignature(signature, data, signerAddress) {
    try {
      const messageHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(data)));
      const recoveredAddress = ethers.verifyMessage(ethers.getBytes(messageHash), signature);
      return recoveredAddress.toLowerCase() === signerAddress.toLowerCase();
    } catch {
      return false;
    }
  }

  /**
   * Calculate checksum for data integrity
   * @param {Object} data - Data to checksum
   * @returns {string} - Checksum hash
   */
  calculateChecksum(data) {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  /**
   * Monitor storage health and replication status
   * @returns {Promise<Object>} - Health status
   */
  async monitorStorageHealth() {
    try {
      const health = await this.storageClient.getHealthStatus();
      
      return {
        status: health.status === 'healthy' ? '✅ Healthy' : '⚠️ Issues Detected',
        nodeCount: health.activeNodes,
        replicationHealth: health.replicationStatus,
        lastCheck: new Date().toISOString(),
        alerts: health.alerts || []
      };
    } catch (error) {
      return {
        status: '❌ Error',
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    }
  }
}

export default ZeroGStorageService;

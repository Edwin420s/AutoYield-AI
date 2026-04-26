import { Sdk } from '@0glabs/0g-storage-sdk';

// Initialize 0G Storage SDK
const storage = new Sdk();

// Real 0G Storage integration – store full reasoning off-chain
export async function storeDecisionLog(decision, txHash) {
  try {
    const logData = {
      decision,
      txHash,
      timestamp: new Date().toISOString(),
      network: '0g-testnet'
    };

    // Convert to JSON and upload to 0G Storage
    const jsonData = JSON.stringify(logData, null, 2);
    const uploadResult = await storage.upload(jsonData);

    console.log(`✅ Successfully stored to 0G Storage:`, {
      cid: uploadResult.cid,
      size: jsonData.length,
      txHash
    });

    return {
      success: true,
      cid: uploadResult.cid,
      size: jsonData.length
    };
  } catch (error) {
    console.error('❌ 0G Storage upload failed:', error);
    // Fallback for demo purposes
    return {
      success: false,
      error: error.message,
      fallbackCid: '0x0gmockroothash' + Math.random().toString(36).substr(2, 9)
    };
  }
}

export async function uploadProtocolAuditTo0G(protocolData) {
  try {
    const auditData = {
      protocols: protocolData,
      auditTimestamp: new Date().toISOString(),
      auditor: 'AutoYield AI',
      version: '1.0.0'
    };

    const jsonData = JSON.stringify(auditData, null, 2);
    const uploadResult = await storage.upload(jsonData);

    console.log(`✅ Protocol audit uploaded to 0G Storage:`, {
      cid: uploadResult.cid,
      protocolsCount: protocolData.length
    });

    return uploadResult.cid;
  } catch (error) {
    console.error('❌ Protocol audit upload failed:', error);
    throw new Error(`Failed to upload audit to 0G Storage: ${error.message}`);
  }
}

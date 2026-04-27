/**
 * Mock 0G Storage SDK for Hackathon Demo
 * Simulates decentralized file storage with CID generation
 */

export class ZgFile {
  constructor(buffer) {
    this.buffer = buffer;
    this.size = buffer.length;
    this.merkleTree = this.generateMockMerkleTree();
  }

  static async fromBuffer(buffer) {
    return new ZgFile(buffer);
  }

  generateMockMerkleTree() {
    const mockRootHash = `0x${Buffer.from('ROOT_' + Date.now() + this.size).toString('hex')}`;
    return {
      rootHash: () => mockRootHash
    };
  }
}

export class IndexerClient {
  constructor(url) {
    this.url = url;
  }

  async upload(zgFile) {
    console.log("📦 Mock 0G Storage: Uploading file chunks...");
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockCid = zgFile.merkleTree.rootHash();
    console.log(`✅ Mock 0G Storage: File uploaded with CID: ${mockCid}`);
    
    return {
      cid: mockCid,
      size: zgFile.size,
      timestamp: new Date().toISOString()
    };
  }

  async retrieve(cid) {
    console.log(`📥 Mock 0G Storage: Retrieving file with CID: ${cid}`);
    
    // Simulate retrieval delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      cid,
      data: Buffer.from("Mock file data for CID: " + cid),
      retrieved: true
    };
  }
}

export function getFlowContract(address, wallet) {
  console.log(`🔗 Mock 0G Storage: Flow contract at ${address}`);
  
  return {
    append: async (zgFile) => {
      console.log("📝 Mock 0G Storage: Submitting storage payment transaction...");
      
      // Simulate transaction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        hash: `0x${Buffer.from('TX_' + Date.now()).toString('hex')}`,
        wait: async () => ({ blockNumber: 12345 })
      };
    }
  };
}

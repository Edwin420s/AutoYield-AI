import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { IndexerClient, ZgFile, getFlowContract } from '../mocks/0g-storage-sdk.js';

dotenv.config();

/**
 * Uploads protocol security metadata to 0G Storage
 * @param {string} filePath - Path to the local JSON or PDF file
 */
export async function uploadProtocolAuditTo0G(filePath) {
    console.log("Preparing to upload to 0G Storage...");

    // 1. Initialize your wallet (You need 0G tokens to pay for storage)
    const provider = new ethers.JsonRpcProvider(process.env.ZERO_G_RPC_URL || process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    // 2. Initialize 0G Storage Clients
    // These endpoints will be provided in the 0G Hackathon documentation
    const indexerClient = new IndexerClient("https://indexer.0g.ai"); // Example endpoint
    const flowContract = getFlowContract("0x0G_FLOW_CONTRACT_ADDRESS", wallet);

    try {
        // 3. Read the file (e.g., Aave_Security_Audit.pdf or protocol_metadata.json)
        const fileBuffer = fs.readFileSync(filePath);
        
        // Convert to 0G File format
        const zgFile = await ZgFile.fromBuffer(fileBuffer);
        const rootHash = zgFile.merkleTree.rootHash();
        
        console.log(`File processed. Root Hash: ${rootHash}`);

        // 4. Pay for the storage on the 0G Chain (The "Flow" contract)
        console.log("Submitting transaction to 0G Chain...");
        const tx = await flowContract.append(zgFile);
        await tx.wait();
        
        // 5. Upload the actual data to the 0G Storage Nodes
        console.log("Uploading file chunks to 0G Storage Nodes...");
        await indexerClient.upload(zgFile);

        console.log("✅ Upload Complete!");
        console.log(`🔗 0G Storage CID / Root Hash: ${rootHash}`);
        
        return rootHash;

    } catch (error) {
        console.error("0G Storage Upload Failed:", error);
        throw error;
    }
}

/**
 * Retrieves protocol metadata from 0G Storage using the root hash
 * @param {string} rootHash - The 0G Storage root hash
 * @returns {Promise<Object>} - The retrieved metadata
 */
export async function retrieveProtocolMetadataFrom0G(rootHash) {
    console.log(`Retrieving metadata from 0G Storage: ${rootHash}`);

    try {
        const indexerClient = new IndexerClient("https://indexer.0g.ai");
        
        // Download the file from 0G Storage
        const zgFile = await indexerClient.download(rootHash);
        const fileBuffer = await zgFile.toBuffer();
        
        // Parse the content (assuming JSON for metadata)
        const metadata = JSON.parse(fileBuffer.toString());
        
        console.log("✅ Successfully retrieved metadata from 0G Storage");
        return metadata;

    } catch (error) {
        console.error("Failed to retrieve from 0G Storage:", error);
        throw error;
    }
}

/**
 * Batch upload multiple protocol files to 0G Storage
 * @param {Array} filePaths - Array of file paths to upload
 * @returns {Promise<Array>} - Array of upload results with root hashes
 */
export async function batchUploadTo0G(filePaths) {
    console.log(`Starting batch upload of ${filePaths.length} files to 0G Storage...`);
    
    const results = [];
    
    for (const filePath of filePaths) {
        try {
            const rootHash = await uploadProtocolAuditTo0G(filePath);
            results.push({
                filePath,
                rootHash,
                success: true
            });
        } catch (error) {
            console.error(`Failed to upload ${filePath}:`, error);
            results.push({
                filePath,
                rootHash: null,
                success: false,
                error: error.message
            });
        }
    }
    
    const successful = results.filter(r => r.success).length;
    console.log(`✅ Batch upload complete: ${successful}/${filePaths.length} files uploaded successfully`);
    
    return results;
}

/**
 * Verifies file integrity by comparing hashes
 * @param {string} rootHash - Expected root hash
 * @param {string} filePath - Local file path to verify
 * @returns {Promise<boolean>} - True if integrity is verified
 */
export async function verifyFileIntegrity(rootHash, filePath) {
    try {
        console.log(`Verifying file integrity for ${filePath}...`);
        
        // Calculate local file hash
        const fileBuffer = fs.readFileSync(filePath);
        const zgFile = await ZgFile.fromBuffer(fileBuffer);
        const localHash = zgFile.merkleTree.rootHash();
        
        // Compare with stored hash
        const isValid = localHash === rootHash;
        
        console.log(`Integrity check: ${isValid ? '✅ PASSED' : '❌ FAILED'}`);
        console.log(`Local hash: ${localHash}`);
        console.log(`Stored hash: ${rootHash}`);
        
        return isValid;

    } catch (error) {
        console.error("File integrity verification failed:", error);
        return false;
    }
}

/**
 * Creates protocol metadata JSON file for upload
 * @param {Object} protocolData - Protocol information
 * @param {string} outputPath - Path to save the JSON file
 * @returns {Promise<string>} - Path to the created file
 */
export async function createProtocolMetadata(protocolData, outputPath) {
    const metadata = {
        protocolName: protocolData.name,
        contractAddress: protocolData.address,
        riskScore: protocolData.risk,
        description: protocolData.description,
        website: protocolData.website,
        auditDate: protocolData.auditDate,
        auditFirm: protocolData.auditFirm,
        securityFeatures: protocolData.securityFeatures,
        tvl: protocolData.tvl,
        volume24h: protocolData.volume24h,
        lastUpdated: new Date().toISOString(),
        version: "1.0.0"
    };

    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Protocol metadata created: ${outputPath}`);
    
    return outputPath;
}

// Example usage function for testing
export async function test0GStorageIntegration() {
    try {
        // Create test metadata
        const testData = {
            name: "Aave Protocol",
            address: "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9",
            risk: 25,
            description: "Decentralized lending and borrowing protocol",
            website: "https://aave.com",
            auditDate: "2024-01-15",
            auditFirm: "Certik",
            securityFeatures: ["Multi-sig", "Time locks", "Bug bounty"],
            tvl: 5000000000,
            volume24h: 100000000
        };

        // Create metadata file
        const metadataPath = await createProtocolMetadata(testData, './temp/aave_metadata.json');
        
        // Upload to 0G Storage
        const rootHash = await uploadProtocolAuditTo0G(metadataPath);
        
        // Retrieve and verify
        const retrieved = await retrieveProtocolMetadataFrom0G(rootHash);
        console.log("Retrieved metadata:", retrieved);
        
        // Clean up
        fs.unlinkSync(metadataPath);
        
        return { rootHash, retrieved };

    } catch (error) {
        console.error("0G Storage integration test failed:", error);
        throw error;
    }
}

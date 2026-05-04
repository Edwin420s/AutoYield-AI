const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Starting AutoYield AI Deployment Sequence on 0G Network...");
  console.log("Deployer Address:", deployer.address);
  console.log("Account Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  // ==========================================
  // 1. DEPLOY MOCK ASSET (For Hackathon Testing)
  // ==========================================
  console.log("\nDeploying Mock USDC (Underlying Asset)...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("Mock USDC deployed to:", usdcAddress);

  // ==========================================
  // 2. DEPLOY AGENT REGISTRY
  // ==========================================
  console.log("\nDeploying Agent Registry...");
  const Registry = await hre.ethers.getContractFactory("AgentRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("Registry deployed to:", registryAddress);

  // ==========================================
  // 3. DEPLOY MOCK ERC-4626 VAULTS (For 0G Network Compatibility)
  // ==========================================
  console.log("\nDeploying Mock ERC-4626 Vaults on 0G Network...");
  
  const MockERC4626 = await hre.ethers.getContractFactory("MockERC4626");
  
  // Deploy Mock Aave Vault
  const mockAave = await MockERC4626.deploy(usdcAddress, "Mock Aave USDC", "maUSDC");
  await mockAave.waitForDeployment();
  const mockAaveAddress = await mockAave.getAddress();
  console.log("Mock Aave Vault deployed to:", mockAaveAddress);
  
  // Deploy Mock Benqi Vault
  const mockBenqi = await MockERC4626.deploy(usdcAddress, "Mock Benqi USDC", "mbUSDC");
  await mockBenqi.waitForDeployment();
  const mockBenqiAddress = await mockBenqi.getAddress();
  console.log("Mock Benqi Vault deployed to:", mockBenqiAddress);
  
  // Deploy Mock Compound Vault
  const mockCompound = await MockERC4626.deploy(usdcAddress, "Mock Compound USDC", "mcUSDC");
  await mockCompound.waitForDeployment();
  const mockCompoundAddress = await mockCompound.getAddress();
  console.log("Mock Compound Vault deployed to:", mockCompoundAddress);

  // ==========================================
  // 4. DEPLOY AUTOYIELD VAULT (ERC-4626)
  // ==========================================
  console.log("\nDeploying AutoYield Vault...");
  const Vault = await hre.ethers.getContractFactory("AutoYieldVault");
  const vault = await Vault.deploy(usdcAddress, "AutoYield AI Shares", "ayUSDC");
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("Vault deployed to:", vaultAddress);

  // ==========================================
  // 5. DEPLOY STRATEGY MANAGER (With Proper Enclave Key)
  // ==========================================
  console.log("\nDeploying Strategy Manager (Hardware Enclave Verification)...");
  
  // Generate a dedicated mock enclave key for TEE simulation
  // HACKATHON NOTE: In production, this would be the actual public key of the 0G Compute SGX Enclave
  // For hackathon demo purposes, we generate a cryptographically secure random wallet to simulate the enclave
  const mockEnclaveWallet = hre.ethers.Wallet.createRandom();
  const mockEnclaveKey = mockEnclaveWallet.address;
  console.log("Generated Mock Enclave Key (Simulates SGX Enclave):", mockEnclaveKey);
  console.log("NOTE: In production, this would be Intel SGX enclave public key");
  
  const Manager = await hre.ethers.getContractFactory("StrategyManager");
  const manager = await Manager.deploy(vaultAddress, registryAddress, mockEnclaveKey, 10); // 10 seconds for hackathon demo
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("Strategy Manager deployed to:", managerAddress);
  console.log("HACKATHON MODE: Time-lock set to 10 seconds for demo");

  // ==========================================
  // 6. SYSTEM CONFIGURATION
  // ==========================================
  console.log("\nConfiguring System Permissions...");
  
  // Grant the StrategyManager permission to physically move vault funds
  await vault.setStrategyManager(managerAddress);
  console.log("StrategyManager linked to Vault.");

  // Register the backend Node.js wallet as an authorized AI Agent Caller
  // (Assuming your backend uses the same private key for testing)
  await registry.addAgent(deployer.address);
  console.log("Backend Wallet authorized in Agent Registry.");

  // ==========================================
  // 7. PROTOCOL WHITELISTING (CRITICAL FOR DEMO)
  // ==========================================
  console.log("\nWhitelisting Protocols in StrategyManager...");
  
  // Use the actual deployed mock protocol addresses
  // updateProtocol(address, isWhitelisted, riskScore, maxAllocationBps, name, 0GStorageHash)
  await manager.updateProtocol(mockAaveAddress, true, 15, 6000, "Mock Aave", "0xMockHashAave");
  await manager.updateProtocol(mockBenqiAddress, true, 40, 4000, "Mock Benqi", "0xMockHashBenqi");
  await manager.updateProtocol(mockCompoundAddress, true, 25, 5000, "Mock Compound", "0xMockHashCompound");
  
  console.log("Protocols whitelisted successfully.");
  console.log("Mock Aave: 15% risk, 60% max allocation");
  console.log("Mock Benqi: 40% risk, 40% max allocation");
  console.log("Mock Compound: 25% risk, 50% max allocation");

  // ==========================================
  // FINAL STEP: SEED THE VAULT FOR THE DEMO
  // ==========================================
  console.log("\nSeeding Vault with Initial Capital...");
  
  // 1. Define seed amount (e.g., 50,000 Mock USDC)
  // Note: Mock USDC uses 6 decimals like real USDC
  const seedAmount = hre.ethers.parseUnits("50000", 6); 
  
  // 2. Approve Vault to take deployer's money
  console.log("   Approving Vault...");
  const approveTx = await usdc.approve(vaultAddress, seedAmount);
  await approveTx.wait();

  // 3. Deposit money into Vault
  console.log("   Depositing physical tokens into Vault...");
  const depositTx = await vault.deposit(seedAmount, deployer.address);
  await depositTx.wait();
  
  console.log(`Vault successfully seeded! Total TVL: $50,000`);

  console.log("\nDEPLOYMENT COMPLETE!");
  console.log("==========================================");
  
  // Auto-generate .env files for frontend and backend
  const envContent = `# AutoYield AI - Generated by deploy.js
# 0G Network Contract Addresses

# Frontend Environment Variables
VITE_UNDERLYING_ASSET="${usdcAddress}"
VITE_VAULT_ADDRESS="${vaultAddress}"
VITE_MANAGER_ADDRESS="${managerAddress}"
VITE_REGISTRY_ADDRESS="${registryAddress}"
VITE_API_URL="http://localhost:3000"

# Backend Environment Variables
ZERO_G_ENCLAVE_KEY="${mockEnclaveKey}"
ZERO_G_ENCLAVE_PRIVATE_KEY="${mockEnclaveWallet.privateKey}"
MANAGER_ADDRESS="${managerAddress}"
VAULT_ADDRESS="${vaultAddress}"
REGISTRY_ADDRESS="${registryAddress}"
UNDERLYING_ASSET="${usdcAddress}"

# Mock ERC-4626 Protocol Addresses (for 0G Network)
MOCK_AAVE_ADDRESS="${mockAaveAddress}"
MOCK_BENQI_ADDRESS="${mockBenqiAddress}"
MOCK_COMPOUND_ADDRESS="${mockCompoundAddress}"

# 0G Network Configuration
ZERO_G_RPC_URL="https://rpc.0g.ai"
ZERO_G_COMPUTE_URL="https://compute.0g.ai"
PRIVATE_KEY="${process.env.PRIVATE_KEY || ''}"
`;

  // Write to backend .env
  const backendEnvPath = path.join(__dirname, '../../backend/.env');
  fs.writeFileSync(backendEnvPath, envContent);
  console.log("Backend .env file updated");

  // Write to frontend .env (only frontend vars)
  const frontendEnvContent = `# AutoYield AI Frontend - Generated by deploy.js
VITE_UNDERLYING_ASSET="${usdcAddress}"
VITE_VAULT_ADDRESS="${vaultAddress}"
VITE_MANAGER_ADDRESS="${managerAddress}"
VITE_REGISTRY_ADDRESS="${registryAddress}"
VITE_API_URL="http://localhost:3000"
`;
  
  const frontendEnvPath = path.join(__dirname, '../../frontend/.env');
  fs.writeFileSync(frontendEnvPath, frontendEnvContent);
  console.log("Frontend .env file updated");

  console.log("==========================================");
  console.log("Contract Addresses:");
  console.log(`USDC: ${usdcAddress}`);
  console.log(`Vault: ${vaultAddress}`);
  console.log(`Manager: ${managerAddress}`);
  console.log(`Registry: ${registryAddress}`);
  console.log(`Mock Aave: ${mockAaveAddress}`);
  console.log(`Mock Benqi: ${mockBenqiAddress}`);
  console.log(`Mock Compound: ${mockCompoundAddress}`);
  console.log(`Enclave Key: ${mockEnclaveKey}`);
  console.log("==========================================");
  console.log("Environment files automatically updated!");
  console.log("Ready to start: npm run dev (backend) & npm run dev (frontend)");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("🚀 Starting AutoYield AI Deployment Sequence on 0G Network...");
  console.log("👤 Deployer Address:", deployer.address);
  console.log("💰 Account Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)));

  // ==========================================
  // 1. DEPLOY MOCK ASSET (For Hackathon Testing)
  // ==========================================
  console.log("\n📦 Deploying Mock USDC (Underlying Asset)...");
  const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
  const usdc = await MockUSDC.deploy();
  await usdc.waitForDeployment();
  const usdcAddress = await usdc.getAddress();
  console.log("✅ Mock USDC deployed to:", usdcAddress);

  // ==========================================
  // 2. DEPLOY AGENT REGISTRY
  // ==========================================
  console.log("\n🤖 Deploying Agent Registry...");
  const Registry = await hre.ethers.getContractFactory("AgentRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ Registry deployed to:", registryAddress);

  // ==========================================
  // 3. DEPLOY MOCK ERC-4626 VAULTS (For 0G Network Compatibility)
  // ==========================================
  console.log("\n🏦 Deploying Mock ERC-4626 Vaults on 0G Network...");
  
  const MockERC4626 = await hre.ethers.getContractFactory("MockERC4626");
  
  // Deploy Mock Aave Vault
  const mockAave = await MockERC4626.deploy(usdcAddress, "Mock Aave USDC", "maUSDC");
  await mockAave.waitForDeployment();
  const mockAaveAddress = await mockAave.getAddress();
  console.log("✅ Mock Aave Vault deployed to:", mockAaveAddress);
  
  // Deploy Mock Benqi Vault
  const mockBenqi = await MockERC4626.deploy(usdcAddress, "Mock Benqi USDC", "mbUSDC");
  await mockBenqi.waitForDeployment();
  const mockBenqiAddress = await mockBenqi.getAddress();
  console.log("✅ Mock Benqi Vault deployed to:", mockBenqiAddress);
  
  // Deploy Mock Compound Vault
  const mockCompound = await MockERC4626.deploy(usdcAddress, "Mock Compound USDC", "mcUSDC");
  await mockCompound.waitForDeployment();
  const mockCompoundAddress = await mockCompound.getAddress();
  console.log("✅ Mock Compound Vault deployed to:", mockCompoundAddress);

  // ==========================================
  // 4. DEPLOY AUTOYIELD VAULT (ERC-4626)
  // ==========================================
  console.log("\n🏦 Deploying AutoYield Vault...");
  const Vault = await hre.ethers.getContractFactory("AutoYieldVault");
  const vault = await Vault.deploy(usdcAddress, "AutoYield AI Shares", "ayUSDC");
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log("✅ Vault deployed to:", vaultAddress);

  // ==========================================
  // 5. DEPLOY STRATEGY MANAGER (With Enclave Key)
  // ==========================================
  console.log("\n🛡️ Deploying Strategy Manager (Hardware Enclave Verification)...");
  // Generate a dedicated mock enclave key for TEE simulation
  // In production, this would be the actual public key of the 0G Compute SGX Enclave
  const mockEnclaveWallet = hre.ethers.Wallet.createRandom();
  const mockEnclaveKey = mockEnclaveWallet.address;
  console.log("🔐 Generated Mock Enclave Key:", mockEnclaveKey); 
  
  const Manager = await hre.ethers.getContractFactory("StrategyManager");
  const manager = await Manager.deploy(vaultAddress, registryAddress, mockEnclaveKey);
  await manager.waitForDeployment();
  const managerAddress = await manager.getAddress();
  console.log("✅ Strategy Manager deployed to:", managerAddress);

  // ==========================================
  // 6. SYSTEM CONFIGURATION
  // ==========================================
  console.log("\n⚙️ Configuring System Permissions...");
  
  // Grant the StrategyManager permission to physically move vault funds
  await vault.setStrategyManager(managerAddress);
  console.log("✅ StrategyManager linked to Vault.");

  // Register the backend Node.js wallet as an authorized AI Agent Caller
  // (Assuming your backend uses the same private key for testing)
  await registry.addAgent(deployer.address);
  console.log("✅ Backend Wallet authorized in Agent Registry.");

  console.log("\n🎉 DEPLOYMENT COMPLETE! 🎉");
  console.log("==========================================");
  console.log("Save these addresses to your backend/frontend .env files:");
  console.log(`VITE_UNDERLYING_ASSET="${usdcAddress}"`);
  console.log(`VITE_VAULT_ADDRESS="${vaultAddress}"`);
  console.log(`VITE_MANAGER_ADDRESS="${managerAddress}"`);
  console.log(`VITE_REGISTRY_ADDRESS="${registryAddress}"`);
  console.log(`ZERO_G_ENCLAVE_KEY="${mockEnclaveKey}"`);
  console.log("==========================================");
  console.log("Mock ERC-4626 Protocol Addresses (for 0G Network):");
  console.log(`MOCK_AAVE_ADDRESS="${mockAaveAddress}"`);
  console.log(`MOCK_BENQI_ADDRESS="${mockBenqiAddress}"`);
  console.log(`MOCK_COMPOUND_ADDRESS="${mockCompoundAddress}"`);
  console.log("==========================================");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});

const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const Registry = await ethers.getContractFactory("AgentRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  console.log("Registry:", await registry.getAddress());

  const Vault = await ethers.getContractFactory("AutoYieldVault");
  const vault = await Vault.deploy();
  await vault.waitForDeployment();
  console.log("Vault:", await vault.getAddress());

  const Manager = await ethers.getContractFactory("StrategyManager");
  const manager = await Manager.deploy(
    await vault.getAddress(),
    await registry.getAddress()
  );
  await manager.waitForDeployment();
  console.log("Manager:", await manager.getAddress());

  await vault.setStrategyManager(await manager.getAddress());
  console.log("Setup complete");
}

main().catch(console.error);

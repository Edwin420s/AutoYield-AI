const hre = require("hardhat");

async function main() {
  console.log("Checking vault contract...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get the contracts
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x0E801D84Fa97b50751Dbf25036d067dCf18858bF");
  
  const Vault = await hre.ethers.getContractFactory("AutoYieldVault");
  const vault = await Vault.attach("0x99bbA657f2BbC93c02D617f8bA121cB8Fc104Acf");
  
  try {
    // Check if vault has rebalance function
    console.log("Checking vault interface...");
    
    // Get vault address from strategy manager
    const vaultAddress = await strategyManager.vault();
    console.log("Vault address from strategy manager:", vaultAddress);
    console.log("Our vault address:", await vault.getAddress());
    console.log("Addresses match:", vaultAddress.toLowerCase() === (await vault.getAddress()).toLowerCase());
    
    // Try to call rebalance directly to see the error
    const mockAave = "0x998abeb3E57409262aE5b751f60747921B33613E";
    const mockBenqi = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49";
    const protocols = [mockAave, mockBenqi];
    const percentages = [6000, 4000];
    
    console.log("Attempting direct vault rebalance...");
    try {
      const tx = await vault.rebalance(protocols, percentages);
      console.log("Vault rebalance transaction:", tx.hash);
      const receipt = await tx.wait();
      console.log("Vault rebalance successful!");
    } catch (vaultError) {
      console.log("Vault rebalance failed:", vaultError.message);
      if (vaultError.data) {
        console.log("Vault error data:", vaultError.data);
      }
    }
    
    // Check vault balance
    const balance = await vault.totalAssets();
    console.log("Vault total assets:", balance.toString());
    
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

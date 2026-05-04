const hre = require("hardhat");

async function main() {
  console.log("Checking protocol whitelist status...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get the Strategy Manager contract
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x0E801D84Fa97b50751Dbf25036d067dCf18858bF");
  
  try {
    // Get protocol addresses from deployment
    const mockAave = "0x998abeb3E57409262aE5b751f60747921B33613E";
    const mockBenqi = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49";
    
    // Check whitelist status
    const aaveInfo = await strategyManager.getProtocolInfo(mockAave);
    const benqiInfo = await strategyManager.getProtocolInfo(mockBenqi);
    
    console.log("Mock Aave protocol info:");
    console.log("- isWhitelisted:", aaveInfo[0]);
    console.log("- riskScore:", aaveInfo[1].toString());
    console.log("- name:", aaveInfo[2]);
    console.log("- maxAllocationBps:", aaveInfo[3].toString());
    
    console.log("Mock Benqi protocol info:");
    console.log("- isWhitelisted:", benqiInfo[0]);
    console.log("- riskScore:", benqiInfo[1].toString());
    console.log("- name:", benqiInfo[2]);
    console.log("- maxAllocationBps:", benqiInfo[3].toString());
    
    // Get proposal details
    const proposal = await strategyManager.getProposal(1);
    console.log("Proposal protocols:", proposal[0]);
    
    // Try to execute with specific error handling
    console.log("Attempting execution with detailed error...");
    try {
      const tx = await strategyManager.executeProposedStrategy(1);
      console.log("Execution transaction:", tx.hash);
      const receipt = await tx.wait();
      console.log("Execution successful!");
    } catch (error) {
      console.log("Execution failed:", error.message);
      
      // Try to get revert reason
      if (error.data) {
        console.log("Error data:", error.data);
      }
    }
    
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

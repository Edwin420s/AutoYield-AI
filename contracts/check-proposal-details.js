const hre = require("hardhat");

async function main() {
  console.log("Checking proposal details...");
  
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x4A679253410272dd5232B3Ff7cF5dbB88f295319");
  
  try {
    // Get the proposal details
    const proposal = await strategyManager.getProposal(1);
    console.log("Proposal 1 details:");
    console.log("- protocols:", proposal[0]);
    console.log("- percentages:", proposal[1]);
    console.log("- executionTime:", proposal[2].toString());
    console.log("- executed:", proposal[3]);
    console.log("- canceled:", proposal[4]);
    console.log("- proposedBy:", proposal[5]);
    console.log("- totalApy:", proposal[6].toString());
    console.log("- portfolioRisk:", proposal[7].toString());
    
    // Check if we can execute it now
    const currentTime = Math.floor(Date.now() / 1000);
    console.log("Current time:", currentTime);
    console.log("Execution time:", proposal[2].toString());
    console.log("Ready to execute:", currentTime >= proposal[2]);
    
    // Try to execute with error details
    console.log("Attempting execution...");
    try {
      const tx = await strategyManager.executeProposedStrategy(1);
      console.log("Execution transaction:", tx.hash);
      const receipt = await tx.wait();
      console.log("Execution successful!");
    } catch (error) {
      console.log("Execution failed:", error.message);
      
      // Try to estimate gas to see the specific error
      try {
        const gasEstimate = await strategyManager.executeProposedStrategy.estimateGas(1);
        console.log("Gas estimate:", gasEstimate.toString());
      } catch (gasError) {
        console.log("Gas estimation error:", gasError.message);
      }
    }
    
  } catch (error) {
    console.error("Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

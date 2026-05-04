const hre = require("hardhat");

async function main() {
  console.log("Executing proposal...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get the Strategy Manager contract
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x0E801D84Fa97b50751Dbf25036d067dCf18858bF");
  
  try {
    // Check current time vs execution time
    const proposal = await strategyManager.getProposal(1);
    const currentTime = Math.floor(Date.now() / 1000);
    const executionTime = proposal[2].toString();
    
    console.log("Current time:", currentTime);
    console.log("Execution time:", executionTime);
    console.log("Ready to execute:", currentTime >= executionTime);
    
    if (currentTime < executionTime) {
      const waitTime = executionTime - currentTime;
      console.log(`Waiting ${waitTime} seconds for time-lock to expire...`);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    }
    
    // Execute the proposal
    console.log("Executing proposal 1...");
    const tx = await strategyManager.executeProposedStrategy(1);
    console.log("Execution transaction:", tx.hash);
    const receipt = await tx.wait();
    console.log("Execution confirmed in block:", receipt.blockNumber);
    
    // Check final state
    const finalProposal = await strategyManager.getProposal(1);
    console.log("Final proposal state:");
    console.log("- executed:", finalProposal[3]);
    console.log("- canceled:", finalProposal[4]);
    
    console.log("✅ Proposal executed successfully!");
    
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

const hre = require("hardhat");

async function main() {
  console.log("Testing proposal #2 execution...");
  
  const [deployer] = await hre.ethers.getSigners();
  
  // Get the Strategy Manager contract
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x922D6956C99E12DFeB3224DEA977D0939758A1Fe");
  
  try {
    // Check proposal #2 details
    const proposal = await strategyManager.getProposal(2);
    const currentTime = Math.floor(Date.now() / 1000);
    const executionTime = proposal[2].toString();
    
    console.log("Proposal #2 details:");
    console.log("- executed:", proposal[3]);
    console.log("- canceled:", proposal[4]);
    console.log("- executionTime:", executionTime);
    console.log("- currentTime:", currentTime);
    console.log("- ready to execute:", currentTime >= parseInt(executionTime));
    console.log("- protocols:", proposal[0]);
    console.log("- percentages:", proposal[1]);
    
    if (currentTime < parseInt(executionTime)) {
      const waitTime = parseInt(executionTime) - currentTime;
      console.log(`Waiting ${waitTime} seconds for time-lock to expire...`);
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    }
    
    // Execute proposal #2
    console.log("Executing proposal #2...");
    const tx = await strategyManager.executeProposedStrategy(2);
    console.log("Execution transaction:", tx.hash);
    const receipt = await tx.wait();
    console.log("Execution confirmed in block:", receipt.blockNumber);
    
    // Check final state
    const finalProposal = await strategyManager.getProposal(2);
    console.log("Final proposal #2 state:");
    console.log("- executed:", finalProposal[3]);
    console.log("- canceled:", finalProposal[4]);
    
    console.log("✅ Proposal #2 executed successfully!");
    
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

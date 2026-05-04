const hre = require("hardhat");

async function main() {
  console.log("Checking all proposals...");
  
  const [deployer] = await hre.ethers.getSigners();
  
  // Get the Strategy Manager contract
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x922D6956C99E12DFeB3224DEA977D0939758A1Fe");
  
  try {
    const proposalCount = await strategyManager.proposalCount();
    console.log("Total proposal count:", proposalCount.toString());
    
    for (let i = 1; i <= proposalCount; i++) {
      try {
        const proposal = await strategyManager.getProposal(i);
        console.log(`\nProposal ${i}:`);
        console.log("- executed:", proposal[3]);
        console.log("- canceled:", proposal[4]);
        console.log("- executionTime:", proposal[2].toString());
        console.log("- protocols:", proposal[0].length);
        console.log("- percentages:", proposal[1].length);
      } catch (error) {
        console.log(`Failed to get proposal ${i}:`, error.message);
      }
    }
    
    // Find the next available proposal ID that doesn't exist or is not executed
    let nextProposalId = proposalCount.toNumber() + 1;
    console.log(`\nNext available proposal ID: ${nextProposalId}`);
    
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

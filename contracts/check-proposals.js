const hre = require("hardhat");

async function main() {
  console.log("Checking contract state...");
  
  // Get the Strategy Manager contract
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x0165878A594ca255338adfa4d48449f69242Eb8F");
  
  try {
    // Check proposal count
    const proposalCount = await strategyManager.proposalCount();
    console.log("Proposal count:", proposalCount.toString());
    
    // Try to get proposal 1
    try {
      const proposal = await strategyManager.proposals(1);
      console.log("Proposal 1 details:");
      console.log("- executed:", proposal.executed);
      console.log("- canceled:", proposal.canceled);
      console.log("- executionTime:", proposal.executionTime.toString());
      console.log("- protocols length:", proposal.protocols.length);
      console.log("- percentages length:", proposal.percentages.length);
    } catch (error) {
      console.log("Proposal 1 does not exist or error:", error.message);
    }
    
    // Check if we can call executeProposedStrategy directly
    console.log("Testing direct contract call...");
    const tx = await strategyManager.executeProposedStrategy.populateTransaction(1);
    console.log("Transaction data:", tx.data);
    
  } catch (error) {
    console.error("Error checking contract:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

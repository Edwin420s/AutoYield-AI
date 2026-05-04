const hre = require("hardhat");

async function main() {
  console.log("Simple proposal test...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get the Strategy Manager contract
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x922D6956C99E12DFeB3224DEA977D0939758A1Fe");
  
  try {
    // Check current proposal count
    const initialCount = await strategyManager.proposalCount();
    console.log("Initial proposal count:", initialCount.toString());
    
    // Get protocol addresses from deployment
    const mockAave = "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc";
    const mockBenqi = "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f";
    
    // Prepare simple proposal data
    const protocols = [mockAave];
    const percentagesBps = [10000]; // 100% to one protocol
    const reportedApy = 500; // 5% APY
    
    console.log("Simple proposal data:");
    console.log("- protocols:", protocols);
    console.log("- percentagesBps:", percentagesBps);
    console.log("- reportedApy:", reportedApy);
    
    // Submit proposal with minimal data
    console.log("Submitting simple proposal...");
    const tx = await strategyManager.proposeStrategy(
      protocols,
      percentagesBps,
      reportedApy,
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    );
    
    console.log("Transaction submitted:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Check proposal count
    const finalCount = await strategyManager.proposalCount();
    console.log("Final proposal count:", finalCount.toString());
    
    // Get proposal details
    if (finalCount > initialCount) {
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
    } else {
      console.log("No new proposal created");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    if (error.transaction) {
      console.log("Transaction hash:", error.transaction.hash);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

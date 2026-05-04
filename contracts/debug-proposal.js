const hre = require("hardhat");

async function main() {
  console.log("Debugging proposal creation...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get the Strategy Manager contract
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x922D6956C99E12DFeB3224DEA977D0939758A1Fe");
  
  try {
    // Check if deployer is an agent
    const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
    const agentRegistry = await AgentRegistry.attach("0xFD471836031dc5108809D173A067e8486B9047A3");
    
    const isAgent = await agentRegistry.isAgent(deployer.address);
    console.log("Is deployer an agent?", isAgent);
    
    if (!isAgent) {
      console.log("Registering deployer as agent...");
      const registerTx = await agentRegistry.registerAgent(deployer.address);
      await registerTx.wait();
      console.log("Agent registered successfully");
    }
    
    // Get protocol addresses from deployment
    const mockAave = "0xcbEAF3BDe82155F56486Fb5a1072cb8baAf547cc";
    const mockBenqi = "0x1429859428C0aBc9C2C47C8Ee9FBaf82cFA0F20f";
    
    // Prepare proposal data
    const protocols = [mockAave, mockBenqi];
    const percentagesBps = [6000, 4000]; // 60% and 40% in BPS
    const reportedApy = 850; // 8.5% APY (multiplied by 100)
    
    console.log("Proposal data:");
    console.log("- protocols:", protocols);
    console.log("- percentagesBps:", percentagesBps);
    console.log("- reportedApy:", reportedApy);
    
    // Submit proposal with minimal signature (bypassed)
    console.log("Submitting proposal...");
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
    const proposalCount = await strategyManager.proposalCount();
    console.log("Proposal count:", proposalCount.toString());
    
    // Get proposal details
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
    
  } catch (error) {
    console.error("Error:", error.message);
    
    // Try to get more detailed error info
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

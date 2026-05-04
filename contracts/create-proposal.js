const hre = require("hardhat");

async function main() {
  console.log("Creating a real proposal on-chain...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get the Strategy Manager contract
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x0165878A594ca255338adfa4d48449f69242Eb8F");
  
  // Get the Agent Registry contract
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.attach("0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  
  try {
    // First, register the deployer as an agent (if not already registered)
    const isAgent = await agentRegistry.isAgent(deployer.address);
    console.log("Is deployer an agent?", isAgent);
    
    if (!isAgent) {
      console.log("Registering deployer as agent...");
      const tx = await agentRegistry.registerAgent(deployer.address);
      await tx.wait();
      console.log("Agent registered successfully");
    }
    
    // Get protocol addresses from deployment
    const mockAave = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const mockBenqi = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    
    // Prepare proposal data
    const protocols = [mockAave, mockBenqi];
    const percentagesBps = [6000, 4000]; // 60% and 40% in BPS
    const reportedApy = 850; // 8.5% APY (multiplied by 100)
    
    // Create a mock signature (in production, this would be TEE attestation)
    const mockSignature = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    
    console.log("Submitting proposal to contract...");
    console.log("- Protocols:", protocols);
    console.log("- Percentages (BPS):", percentagesBps);
    console.log("- Reported APY:", reportedApy);
    
    // Submit the proposal
    const tx = await strategyManager.proposeStrategy(
      protocols,
      percentagesBps,
      reportedApy,
      mockSignature
    );
    
    console.log("Transaction submitted:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Check the new proposal count
    const proposalCount = await strategyManager.proposalCount();
    console.log("New proposal count:", proposalCount.toString());
    
    // Get the proposal details
    const proposal = await strategyManager.proposals(1);
    console.log("Proposal 1 created:");
    console.log("- executed:", proposal.executed);
    console.log("- canceled:", proposal.canceled);
    console.log("- executionTime:", proposal.executionTime.toString());
    console.log("- protocols:", proposal.protocols);
    console.log("- percentages:", proposal.percentages);
    
  } catch (error) {
    console.error("Error creating proposal:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

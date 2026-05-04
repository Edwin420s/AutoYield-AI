const hre = require("hardhat");
const dotenv = require("dotenv");

// Load environment variables from backend/.env
dotenv.config({ path: "../backend/.env" });

async function main() {
  console.log("Creating proposal using environment variables...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get contract addresses from environment variables
  const managerAddress = process.env.MANAGER_ADDRESS;
  const registryAddress = process.env.REGISTRY_ADDRESS;
  const mockAaveAddress = process.env.MOCK_AAVE_ADDRESS;
  const mockBenqiAddress = process.env.MOCK_BENQI_ADDRESS;
  
  console.log("Contract addresses from .env:");
  console.log("- Manager:", managerAddress);
  console.log("- Registry:", registryAddress);
  console.log("- Mock Aave:", mockAaveAddress);
  console.log("- Mock Benqi:", mockBenqiAddress);
  
  // Get the contracts
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach(managerAddress);
  
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.attach(registryAddress);
  
  try {
    // Check if deployer is an agent
    const isAgent = await agentRegistry.isAgent(deployer.address);
    console.log("Is deployer an agent?", isAgent);
    
    if (!isAgent) {
      console.log("Registering deployer as agent...");
      const registerTx = await agentRegistry.registerAgent(deployer.address);
      await registerTx.wait();
      console.log("Agent registered successfully");
    }
    
    // Prepare proposal data
    const protocols = [mockAaveAddress, mockBenqiAddress];
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
    
    // Wait for time-lock to expire and execute
    console.log("Waiting for time-lock to expire (10 seconds)...");
    await new Promise(resolve => setTimeout(resolve, 11000));
    
    console.log("Executing proposal 1...");
    const executeTx = await strategyManager.executeProposedStrategy(1);
    console.log("Execution transaction:", executeTx.hash);
    const executeReceipt = await executeTx.wait();
    console.log("Execution confirmed in block:", executeReceipt.blockNumber);
    
    // Check final state
    const finalProposal = await strategyManager.getProposal(1);
    console.log("Final proposal state:");
    console.log("- executed:", finalProposal[3]);
    console.log("- canceled:", finalProposal[4]);
    
    console.log("✅ Proposal created and executed successfully!");
    
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

const hre = require("hardhat");

async function main() {
  console.log("Adding a demo proposal directly to contract...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get the Strategy Manager contract
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x0E801D84Fa97b50751Dbf25036d067dCf18858bF");
  
  try {
    // For demo purposes, let's temporarily set the deployer as the trusted enclave key
    console.log("Setting deployer as trusted enclave key for demo...");
    const setKeyTx = await strategyManager.setTrustedEnclaveKey(deployer.address);
    await setKeyTx.wait();
    console.log("Trusted enclave key updated");
    
    // Get protocol addresses from deployment
    const mockAave = "0x998abeb3E57409262aE5b751f60747921B33613E";
    const mockBenqi = "0x70e0bA845a1A0F2DA3359C97E0285013525FFC49";
    
    // Prepare proposal data
    const protocols = [mockAave, mockBenqi];
    const percentagesBps = [6000, 4000]; // 60% and 40% in BPS
    const reportedApy = 850; // 8.5% APY (multiplied by 100)
    
    console.log("Creating EIP-712 signature for demo proposal...");
    
    // Create proper EIP-712 signature
    const domain = {
      name: "StrategyManager",
      version: "1",
      chainId: 31337, // localhost
      verifyingContract: await strategyManager.getAddress()
    };
    
    const types = {
      Strategy: [
        { name: "protocols", type: "address[]" },
        { name: "percentagesBps", type: "uint256[]" },
        { name: "reportedApy", type: "uint256" },
        { name: "chainId", type: "uint256" },
        { name: "nonce", type: "uint256" }
      ]
    };
    
    // Get current nonce
    const currentNonce = await strategyManager.nonces(deployer.address);
    
    const value = {
      protocols: protocols,
      percentagesBps: percentagesBps,
      reportedApy: reportedApy,
      chainId: 31337,
      nonce: currentNonce.toString()
    };
    
    // Sign the typed data
    const signature = await deployer.signTypedData(domain, types, value);
    console.log("Signature created successfully");
    
    // Submit the proposal
    console.log("Submitting proposal to contract...");
    const tx = await strategyManager.proposeStrategy(
      protocols,
      percentagesBps,
      reportedApy,
      signature
    );
    
    console.log("Transaction submitted:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed in block:", receipt.blockNumber);
    
    // Check the new proposal count
    const proposalCount = await strategyManager.proposalCount();
    console.log("New proposal count:", proposalCount.toString());
    
    // Get the proposal details
    const proposal = await strategyManager.proposals(1);
    console.log("Proposal 1 created successfully:");
    console.log("- executed:", proposal.executed);
    console.log("- canceled:", proposal.canceled);
    console.log("- executionTime:", proposal.executionTime.toString());
    console.log("- protocols:", proposal.protocols);
    console.log("- percentages:", proposal.percentages);
    
    // Wait for time-lock to expire (10 seconds for demo)
    console.log("Waiting for time-lock to expire (10 seconds)...");
    await new Promise(resolve => setTimeout(resolve, 11000));
    
    // Now execute the proposal
    console.log("Executing proposal 1...");
    const executeTx = await strategyManager.executeProposedStrategy(1);
    console.log("Execution transaction:", executeTx.hash);
    const executeReceipt = await executeTx.wait();
    console.log("Execution confirmed in block:", executeReceipt.blockNumber);
    
    // Check final state
    const finalProposal = await strategyManager.proposals(1);
    console.log("Final proposal state:");
    console.log("- executed:", finalProposal.executed);
    console.log("- canceled:", finalProposal.canceled);
    
    console.log("✅ Demo proposal created and executed successfully!");
    
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

const hre = require("hardhat");

async function main() {
  console.log("Creating a real proposal on-chain with proper signature...");
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Get the Strategy Manager contract
  const StrategyManager = await hre.ethers.getContractFactory("StrategyManager");
  const strategyManager = await StrategyManager.attach("0x0165878A594ca255338adfa4d48449f69242Eb8F");
  
  try {
    // Get the trusted enclave key from the contract
    const trustedEnclaveKey = await strategyManager.trustedEnclaveKey();
    console.log("Trusted enclave key:", trustedEnclaveKey);
    
    // Create a signer for the enclave key (we need the private key)
    // For demo purposes, we'll use the deployer's private key to sign
    // In production, this would be the actual TEE enclave private key
    
    // Get protocol addresses from deployment
    const mockAave = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    const mockBenqi = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";
    
    // Prepare proposal data
    const protocols = [mockAave, mockBenqi];
    const percentagesBps = [6000, 4000]; // 60% and 40% in BPS
    const reportedApy = 850; // 8.5% APY (multiplied by 100)
    
    console.log("Creating signature for proposal...");
    console.log("- Protocols:", protocols);
    console.log("- Percentages (BPS):", percentagesBps);
    console.log("- Reported APY:", reportedApy);
    
    // For demo purposes, let's create a simpler approach:
    // We'll temporarily set the deployer as the trusted enclave key
    console.log("Setting deployer as trusted enclave key for demo...");
    const setKeyTx = await strategyManager.setTrustedEnclaveKey(deployer.address);
    await setKeyTx.wait();
    console.log("Trusted enclave key updated to:", deployer.address);
    
    // Now we can sign with the deployer's private key
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
    
    console.log("Signing EIP-712 typed data...");
    const signature = await deployer.signTypedData(domain, types, value);
    console.log("Signature created:", signature);
    
    // Submit the proposal with the proper signature
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
    console.log("Proposal 1 created:");
    console.log("- executed:", proposal.executed);
    console.log("- canceled:", proposal.canceled);
    console.log("- executionTime:", proposal.executionTime.toString());
    console.log("- protocols:", proposal.protocols);
    console.log("- percentages:", proposal.percentages);
    
    // Wait for time-lock to expire (10 seconds for demo)
    console.log("Waiting for time-lock to expire...");
    await new Promise(resolve => setTimeout(resolve, 11000));
    
    // Now try to execute the proposal
    console.log("Executing proposal 1...");
    const executeTx = await strategyManager.executeProposedStrategy(1);
    console.log("Execution transaction:", executeTx.hash);
    const executeReceipt = await executeTx.wait();
    console.log("Execution confirmed in block:", executeReceipt.blockNumber);
    
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

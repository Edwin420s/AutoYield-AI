/**
 * The core mathematical engine for the AutoYield AI.
 * It evaluates available protocols, calculates risk-adjusted scores,
 * and determines the optimal safe fund allocation using rigorous mathematical optimization.
 */

// The maximum acceptable blended risk score for the entire portfolio (0-100)
const MAX_PORTFOLIO_RISK = 70; 

export function decideStrategy(protocols) {
  if (!protocols || protocols.length === 0) {
    throw new Error('No protocol data provided to the engine.');
  }

  // Step 1: Calculate the Risk-Adjusted Score for every protocol
  const scoredProtocols = protocols.map(p => {
    // Safety multiplier: a risk of 20 means safety is 0.8.
    const safetyFactor = (100 - p.risk) / 100;
    
    // The raw score balancing APY and Risk (Sharpe Ratio approximation)
    const score = p.apy * safetyFactor;
    
    return { ...p, score, safetyFactor };
  });

  // Step 2: Sort protocols from highest risk-adjusted score to lowest
  scoredProtocols.sort((a, b) => b.score - a.score);

  // Step 3: Select the top 2 or 3 protocols to diversify (avoiding single points of failure)
  // For this implementation, we take the top 2.
  const selected = scoredProtocols.slice(0, 2);
  const totalScore = selected.reduce((sum, p) => sum + p.score, 0);

  // Step 4: Calculate proportional weights based on their scores
  let allocations = selected.map(p => {
    // Calculate raw percentage
    let rawPercent = (p.score / totalScore) * 100;
    return {
      name: p.name,
      address: p.address, // CRITICAL: Now using the on-chain address for the Whitelist!
      apy: p.apy,
      risk: p.risk,
      // Round to nearest integer for solid blockchain execution
      percentage: Math.round(rawPercent) 
    };
  });

  // Ensure percentages equal exactly 100% due to rounding
  let totalPercent = allocations.reduce((sum, a) => sum + a.percentage, 0);
  if (totalPercent !== 100) {
    const diff = 100 - totalPercent;
    // Add/subtract the difference to the top protocol
    allocations[0].percentage += diff; 
  }

  // Step 5: Verify against the strict portfolio risk constraint
  const blendedRisk = allocations.reduce((sum, a) => sum + (a.risk * (a.percentage / 100)), 0);
  const blendedApy = allocations.reduce((sum, a) => sum + (a.apy * (a.percentage / 100)), 0);

  if (blendedRisk > MAX_PORTFOLIO_RISK) {
    // If our best mathematical guess is still too risky, fallback to the single safest protocol
    console.warn(`Calculated risk (${blendedRisk.toFixed(2)}) exceeds max threshold. Engaging safety fallback.`);
    const safest = [...protocols].sort((a, b) => a.risk - b.risk)[0];
    return generateOutput([safest], [100]);
  }

  // Step 6: Format the output for the Smart Contract
  return generateOutput(allocations, allocations.map(a => a.percentage));
}

// Helper function to format data perfectly for the blockchain
function generateOutput(protocolObjects, percentages) {
    const blendedRisk = protocolObjects.reduce((sum, p, i) => sum + (p.risk * (percentages[i] / 100)), 0);
    const blendedApy = protocolObjects.reduce((sum, p, i) => sum + (p.apy * (percentages[i] / 100)), 0);

    return {
        protocols: protocolObjects.map(p => p.address), // Returning addresses, not names
        protocolNames: protocolObjects.map(p => p.name), // Keeping names for the UI/Storage logging
        percentages: percentages,
        expectedAPY: Math.round(blendedApy * 100), // Multiply by 100 for integer math on chain (e.g. 5.25% -> 525)
        riskScore: Math.round(blendedRisk)
    };
}

// Test function to demonstrate the mathematical model
export function testAgenticMath() {
  const liveMarketData = [
    { name: 'Aave', address: '0x1111111111111111111111111111111111111111', apy: 4.5, risk: 15 },    // Low reward, very low risk
    { name: 'Benqi', address: '0x2222222222222222222222222222222222222222', apy: 12.0, risk: 65 },   // High reward, high risk
    { name: 'DegenScam', address: '0x3333333333333333333333333333333333333333', apy: 150.0, risk: 99 } // Extreme reward, total scam
  ];

  console.log("Testing Agentic Math with live market data:");
  console.log("Input protocols:", liveMarketData);
  
  const result = decideStrategy(liveMarketData);
  console.log("Mathematical optimization result:", result);
  
  // Demonstrate why this prevents scams:
  console.log("\n=== RISK-ADJUSTED SCORE ANALYSIS ===");
  liveMarketData.forEach(p => {
    const safetyFactor = (100 - p.risk) / 100;
    const riskAdjustedScore = p.apy * safetyFactor;
    console.log(`${p.name}: APY=${p.apy}%, Risk=${p.risk}, Safety=${safetyFactor.toFixed(2)}, Score=${riskAdjustedScore.toFixed(3)}`);
  });
  
  return result;
}

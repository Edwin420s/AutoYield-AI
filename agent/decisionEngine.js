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

  // Step 4: Calculate proportional weights using Basis Points (BPS) for precision
  let allocations = selected.map(p => {
    // Calculate raw BPS (10000 = 100%)
    let rawBps = (p.score / totalScore) * 10000;
    return {
      name: p.name,
      address: p.address, // CRITICAL: Now using the on-chain address for the Whitelist!
      apy: p.apy,
      risk: p.risk,
      // Round to nearest integer BPS for precise blockchain execution
      percentageBps: Math.round(rawBps) 
    };
  });

  // Ensure BPS equals exactly 10000 (100%) due to rounding
  let totalBps = allocations.reduce((sum, a) => sum + a.percentageBps, 0);
  if (totalBps !== 10000) {
    const diff = 10000 - totalBps;
    // Add/subtract the difference to the top protocol
    allocations[0].percentageBps += diff; 
  }

  // Step 5: Verify against the strict portfolio risk constraint (using BPS)
  const blendedRisk = allocations.reduce((sum, a) => sum + (a.risk * (a.percentageBps / 10000)), 0);
  const blendedApy = allocations.reduce((sum, a) => sum + (a.apy * (a.percentageBps / 10000)), 0);

  if (blendedRisk > MAX_PORTFOLIO_RISK) {
    // If our best mathematical guess is still too risky, fallback to the single safest protocol
    console.warn(`Calculated risk (${blendedRisk.toFixed(2)}) exceeds max threshold. Engaging safety fallback.`);
    const safest = [...protocols].sort((a, b) => a.risk - b.risk)[0];
    return generateOutput([safest], [10000]); // 10000 BPS = 100%
  }

  // Step 6: Format the output for the Smart Contract (using BPS)
  return generateOutput(allocations, allocations.map(a => a.percentageBps));
}

// Helper function to format data perfectly for the blockchain (using BPS)
function generateOutput(protocolObjects, percentagesBps) {
    const blendedRisk = protocolObjects.reduce((sum, p, i) => sum + (p.risk * (percentagesBps[i] / 10000)), 0);
    const blendedApy = protocolObjects.reduce((sum, p, i) => sum + (p.apy * (percentagesBps[i] / 10000)), 0);

    return {
        protocols: protocolObjects.map(p => p.address), // Returning addresses, not names
        protocolNames: protocolObjects.map(p => p.name), // Keeping names for the UI/Storage logging
        percentages: percentagesBps, // Now using BPS values
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

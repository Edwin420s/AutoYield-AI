/**
 * The core mathematical engine for AutoYield AI.
 * Evaluates available protocols, calculates risk-adjusted scores,
 * and determines optimal safe fund allocation using rigorous mathematical optimization.
 * 
 * Key Features:
 * - Risk-adjusted scoring using safety factors
 * - Sharpe ratio approximation for risk-adjusted returns
 * - Portfolio risk constraint enforcement (MAX_PORTFOLIO_RISK = 70)
 * - Basis Points (BPS) precision for blockchain execution
 * - Mathematical validation and safety fallbacks
 * 
 * Algorithm Process:
 * 1. Calculate risk-adjusted scores for all protocols
 * 2. Sort by highest score to lowest risk
 * 3. Select top 2-3 protocols for diversification
 * 4. Calculate proportional weights using BPS (10000 = 100%)
 * 5. Enforce portfolio risk constraint
 * 6. Format output for smart contract execution
 * 
 * @module agent/decisionEngine
 * @author AutoYield AI Team
 * @version 1.0.0
 */

// ========================================
// CONSTANTS & CONFIGURATION
// ========================================

/// @dev Maximum acceptable blended risk score for entire portfolio (0-100)
const MAX_PORTFOLIO_RISK = 70; 

/**
 * Main decision function that orchestrates the mathematical optimization
 * 
 * @param {Array<Object>} protocols - Array of protocol objects with name, address, apy, risk
 * @returns {Object} Optimized allocation strategy with protocols, percentages, and risk metrics
 * @throws {Error} When no protocol data provided or constraints violated
 */
export function decideStrategy(protocols) {
  if (!protocols || protocols.length === 0) {
    throw new Error('No protocol data provided to engine.');
  }

  // ========================================
  // STEP 1: CALCULATE RISK-ADJUSTED SCORES
  // ========================================
  
  // Calculate risk-adjusted scores for every protocol
  // Safety multiplier: a risk of 20 means safety is 0.8
  const scoredProtocols = protocols.map(p => {
    const safetyFactor = (100 - p.risk) / 100;
    
    // The raw score balancing APY and Risk (Sharpe Ratio approximation)
    const score = p.apy * safetyFactor;
    
    return { ...p, score, safetyFactor };
  });

  // Sort protocols from highest risk-adjusted score to lowest risk
  scoredProtocols.sort((a, b) => b.score - a.score);

  // ========================================
  // STEP 2: SELECT TOP PROTOCOLS FOR DIVERSIFICATION
  // ========================================
  
  // Select the top 2 or 3 protocols to diversify (avoiding single points of failure)
  // For this implementation, we take the top 2.
  const selected = scoredProtocols.slice(0, 2);
  const totalScore = selected.reduce((sum, p) => sum + p.score, 0);

  // ========================================
  // STEP 3: CALCULATE PROPORTIONAL WEIGHTS USING BPS
  // ========================================
  
  // Calculate proportional weights using Basis Points (BPS) for precision
  let allocations = selected.map(p => {
    // Calculate raw BPS (10000 = 100%)
    let rawBps = (p.score / totalScore) * 10000;
    return {
      name: p.name,
      address: p.address, // CRITICAL: Now using on-chain address for Whitelist!
      apy: p.apy,
      risk: p.risk,
      // Round to nearest integer BPS for precise blockchain execution
      percentageBps: Math.round(rawBps) 
    };
  });

  // ========================================
  // STEP 4: GUARANTEE EXACT 10000 BPS TOTAL
  // ========================================
  
  // Force the very last protocol to absorb rounding error 
  // so total always perfectly equals exactly 10,000 BPS
  let currentTotalBps = 0;
  const finalAllocations = allocations.map((allocation, index) => {
    let bps = allocation.percentageBps;
    
    // Force the very last protocol to absorb rounding error 
    if (index === allocations.length - 1) {
      bps = 10000 - currentTotalBps;
    }
    
    currentTotalBps += bps;
    return {
      ...allocation,
      percentageBps: bps
    };
  });
  
  // Replace allocations with the corrected version
  allocations = finalAllocations;

  // ========================================
  // STEP 5: VERIFY PORTFOLIO RISK CONSTRAINT
  // ========================================
  
  // Verify against strict portfolio risk constraint (using BPS)
  const blendedRisk = allocations.reduce((sum, a) => sum + (a.risk * (a.percentageBps / 10000)), 0);
  const blendedApy = allocations.reduce((sum, a) => sum + (a.apy * (a.percentageBps / 10000)), 0);

  if (blendedRisk > MAX_PORTFOLIO_RISK) {
    // If our best mathematical guess is still too risky, fallback to single safest protocol
    console.warn(`Calculated risk (${blendedRisk.toFixed(2)}) exceeds max threshold. Engaging safety fallback.`);
    const safest = [...protocols].sort((a, b) => a.risk - b.risk)[0];
    return generateOutput([safest], [10000]); // 10000 BPS = 100%
  }

  // ========================================
  // STEP 6: FORMAT OUTPUT FOR SMART CONTRACT
  // ========================================
  
  return generateOutput(allocations, allocations.map(a => a.percentageBps));
}

/**
 * Helper function to format data perfectly for blockchain (using BPS)
 * 
 * @param {Array<Object>} protocolObjects - Array of protocol objects with address, apy, risk
 * @param {Array<number>} percentagesBps - Array of allocation percentages in Basis Points
 * @returns {Object} Formatted output object for smart contract execution
 */
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

/**
 * Test function to demonstrate the mathematical model
 * Shows how the engine prevents scams and optimizes for risk-adjusted returns
 * 
 * @returns {Object} Test results with live market data and optimization output
 */
export function testAgenticMath() {
  const liveMarketData = [
    { name: 'Aave', address: '0x1111111111111111111111111111111111', apy: 4.5, risk: 15 }, // Low reward, very low risk
    { name: 'Benqi', address: '0x2222222222222222222222222222222222', apy: 12.0, risk: 65 },   // High reward, high risk
    { name: 'DegenScam', address: '0x3333333333333333333333333333333333', apy: 150.0, risk: 99 } // Extreme reward, total scam
  ];

  console.log("Testing Agentic Math with live market data:");
  console.log("Input protocols:", liveMarketData);
  
  const result = decideStrategy(liveMarketData);
  console.log("Mathematical optimization result:", result);
  
  // ========================================
  // DEMONSTRATE SCAM PREVENTION
  // ========================================
  
  console.log("\n=== RISK-ADJUSTED SCORE ANALYSIS ===");
  liveMarketData.forEach(p => {
    const safetyFactor = (100 - p.risk) / 100;
    const riskAdjustedScore = p.apy * safetyFactor;
    console.log(`${p.name}: APY=${p.apy}%, Risk=${p.risk}, Safety=${safetyFactor.toFixed(2)}, Score=${riskAdjustedScore.toFixed(3)}`);
  });
  
  return result;
}

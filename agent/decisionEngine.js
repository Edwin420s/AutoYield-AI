/**
 * Enhanced AI decision engine with risk assessment and portfolio optimization
 * Selects optimal protocols based on APY, risk scores, and portfolio constraints
 */
export function decideStrategy(protocols) {
  if (!protocols || protocols.length === 0) {
    throw new Error('No protocol data available');
  }

  // Filter out invalid protocols and sort by risk-adjusted APY
  const validProtocols = protocols.filter(p => 
    p.apy > 0 && p.risk >= 0 && p.risk <= 100
  );
  
  if (validProtocols.length === 0) {
    throw new Error('No valid protocols found');
  }

  // Calculate risk-adjusted APY (Sharpe ratio approximation)
  const riskAdjustedProtocols = validProtocols.map(p => ({
    ...p,
    riskAdjustedApy: p.apy / (1 + p.risk / 100) // Simple risk adjustment
  }));

  // Sort by risk-adjusted APY
  const sorted = riskAdjustedProtocols.sort((a, b) => b.riskAdjustedApy - a.riskAdjustedApy);

  // Determine allocation strategy
  const strategy = calculateOptimalAllocation(sorted);
  
  // Calculate portfolio metrics
  const portfolioMetrics = calculatePortfolioMetrics(strategy.allocations, sorted);

  return {
    protocols: strategy.allocations.map(a => a.protocol),
    percentages: strategy.allocations.map(a => a.percentage),
    expectedAPY: portfolioMetrics.expectedAPY,
    portfolioRisk: portfolioMetrics.portfolioRisk,
    riskAdjustedApy: portfolioMetrics.riskAdjustedApy,
    strategy: strategy.type,
    reasoning: strategy.reasoning,
    confidence: strategy.confidence,
    timestamp: Date.now()
  };
}

function calculateOptimalAllocation(sortedProtocols) {
  const topProtocol = sortedProtocols[0];
  const secondProtocol = sortedProtocols[1];
  const thirdProtocol = sortedProtocols[2];

  // Strategy selection based on available protocols and their characteristics
  if (sortedProtocols.length === 1) {
    // Single protocol available
    return {
      type: 'single',
      allocations: [{ protocol: topProtocol.name, percentage: 100 }],
      reasoning: `Only ${topProtocol.name} available with ${topProtocol.apy}% APY and risk score ${topProtocol.risk}`,
      confidence: 0.6
    };
  }

  // Check if we should use conservative or aggressive strategy
  const avgRisk = sortedProtocols.slice(0, 3).reduce((sum, p) => sum + p.risk, 0) / Math.min(3, sortedProtocols.length);
  const isConservative = avgRisk > 60;

  if (isConservative) {
    // Conservative strategy: diversify across top 3 protocols
    const allocations = [];
    let remainingPercentage = 100;

    // Allocate 50% to top protocol
    allocations.push({ protocol: topProtocol.name, percentage: 50 });
    remainingPercentage -= 50;

    // Allocate 30% to second protocol if available
    if (secondProtocol) {
      allocations.push({ protocol: secondProtocol.name, percentage: 30 });
      remainingPercentage -= 30;
    }

    // Allocate remaining to third protocol if available
    if (thirdProtocol && remainingPercentage > 0) {
      allocations.push({ protocol: thirdProtocol.name, percentage: remainingPercentage });
    } else if (secondProtocol && remainingPercentage > 0) {
      // Give remaining to second protocol
      allocations[1].percentage += remainingPercentage;
    }

    return {
      type: 'conservative',
      allocations,
      reasoning: `Conservative diversification across ${allocations.length} protocols to manage high market risk (avg: ${avgRisk.toFixed(1)})`,
      confidence: 0.8
    };
  } else {
    // Aggressive strategy: concentrate on top performers
    if (topProtocol.riskAdjustedApy > (secondProtocol?.riskAdjustedApy || 0) * 1.5) {
      // Top protocol significantly outperforms others
      return {
        type: 'aggressive',
        allocations: [
          { protocol: topProtocol.name, percentage: 70 },
          ...(secondProtocol ? [{ protocol: secondProtocol.name, percentage: 30 }] : [])
        ],
        reasoning: `Aggressive allocation: ${topProtocol.name} shows superior risk-adjusted returns (${topProtocol.riskAdjustedApy.toFixed(2)} vs ${secondProtocol?.riskAdjustedApy.toFixed(2) || 0})`,
        confidence: 0.9
      };
    } else {
      // Balanced approach
      return {
        type: 'balanced',
        allocations: [
          { protocol: topProtocol.name, percentage: 60 },
          { protocol: secondProtocol.name, percentage: 40 }
        ],
        reasoning: `Balanced allocation between top 2 performers with similar risk-adjusted returns`,
        confidence: 0.85
      };
    }
  }
}

function calculatePortfolioMetrics(allocations, protocols) {
  let expectedAPY = 0;
  let portfolioRisk = 0;

  allocations.forEach(allocation => {
    const protocol = protocols.find(p => p.name === allocation.protocol);
    if (protocol) {
      expectedAPY += (protocol.apy * allocation.percentage) / 100;
      portfolioRisk += (protocol.risk * allocation.percentage) / 100;
    }
  });

  const riskAdjustedApy = expectedAPY / (1 + portfolioRisk / 100);

  return {
    expectedAPY: Math.round(expectedAPY * 100) / 100,
    portfolioRisk: Math.round(portfolioRisk * 100) / 100,
    riskAdjustedApy: Math.round(riskAdjustedApy * 100) / 100
  };
}

// Additional helper functions for advanced features
export function validateDecision(decision, constraints = {}) {
  const maxRisk = constraints.maxRisk || 80;
  const minAPY = constraints.minAPY || 3;
  const maxProtocols = constraints.maxProtocols || 3;

  const errors = [];

  if (decision.portfolioRisk > maxRisk) {
    errors.push(`Portfolio risk ${decision.portfolioRisk} exceeds maximum ${maxRisk}`);
  }

  if (decision.expectedAPY < minAPY) {
    errors.push(`Expected APY ${decision.expectedAPY} below minimum ${minAPY}`);
  }

  if (decision.protocols.length > maxProtocols) {
    errors.push(`Too many protocols: ${decision.protocols.length} > ${maxProtocols}`);
  }

  const totalPercentage = decision.percentages.reduce((sum, p) => sum + p, 0);
  if (totalPercentage !== 100) {
    errors.push(`Percentages sum to ${totalPercentage}, not 100`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function explainDecision(decision) {
  return {
    summary: `AI chose ${decision.strategy} strategy: ${decision.protocols.join(', ')} with allocations ${decision.percentages.join('/')}`,
    expectedReturns: `Expected APY: ${decision.expectedAPY}% (risk-adjusted: ${decision.riskAdjustedApy}%)`,
    riskAssessment: `Portfolio risk score: ${decision.portfolioRisk}/100`,
    confidence: `Decision confidence: ${(decision.confidence * 100).toFixed(0)}%`,
    reasoning: decision.reasoning,
    timestamp: new Date(decision.timestamp).toLocaleString()
  };
}

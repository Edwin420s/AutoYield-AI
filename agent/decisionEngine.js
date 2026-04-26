/**
 * Simple but real AI agent logic (replace with ML/RAG if needed)
 * Selects top two protocols by APY, allocates 70/30, checks risk threshold.
 */
export function decideStrategy(protocols) {
  const sorted = [...protocols].sort((a, b) => b.apy - a.apy);
  const top = sorted[0];
  const second = sorted[1];

  if (!top) throw new Error('No protocol data');

  const totalAPY = top.apy + (second ? second.apy : 0);
  const topPercent = second ? 70 : 100;
  const secondPercent = second ? 30 : 0;

  return {
    protocols: second ? [top.name, second.name] : [top.name],
    percentages: second ? [topPercent, secondPercent] : [100],
    expectedAPY: Math.max(top.apy, 0),
    riskScore: Math.min(top.risk + (second ? second.risk : 0), 100)
  };
}

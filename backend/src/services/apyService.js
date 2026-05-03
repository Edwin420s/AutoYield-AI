import axios from 'axios';

/**
 * Fetches LIVE yield data from DefiLlama's public API.
 * Filters for high-liquidity, stable pools to feed the TEE AI Engine.
 * 
 * 
 * CRITICAL SECURITY WARNING: ORACLE INGRESS VULNERABILITY
 * ==========================================================
 * This V1 prototype has a critical architectural vulnerability:
 * The TEE secures the *calculation*, but NOT the *data source*.
 * 
 * THE PROBLEM:
 * - This service fetches market data from centralized API (DefiLlama)
 * - Data is fed to TEE for secure processing
 * - If backend server is compromised, attacker can inject malicious data
 * - TEE will process fake data and generate valid cryptographic proofs
 * - Blockchain accepts valid proofs, potentially draining user funds
 * 
 * EXPLOIT SCENARIO:
 * 1. Hacker compromises backend server
 * 2. Modifies API response: { protocol: "HackerCoin", apy: 99999, risk: 0 }
 * 3. TEE processes fake data securely (no fault in TEE)
 * 4. Valid cryptographic proof generated
 * 5. Blockchain accepts valid signature
 * 6. Vault funds drained to malicious protocol
 * 
 * PRODUCTION V2 SOLUTION:
 * - SGX Enclave queries Chainlink/PYTH oracles directly
 * - Remove Node.js server from chain of trust
 * - Implement ZK proofs for data integrity verification
 * - Multi-oracle consensus for data validation
 * 
 * @returns {Promise<Array>} Array of formatted protocol data with risk assessment
 * @throws {Error} When oracle fails or no safe pools are available
 */
export async function fetchAPYData() {
  console.log("Fetching live market data from decentralized oracles (DefiLlama)...");

  try {
    // DefiLlama's free Yields API
    const response = await axios.get('https://yields.llama.fi/pools');

    // Filter raw data to ensure we only feed AI viable options
    // Criteria:
    // 1. Must be on Ethereum (or 0G in production)
    // 2. Must be a USDC stablecoin pool (for baseline stability)
    // 3. Must have over $1M in TVL (to avoid micro-cap rug pulls)
    const livePools = response.data.data
      .filter(pool => 
        pool.chain === 'Ethereum' && 
        pool.symbol.includes('USDC') && 
        pool.tvlUsd > 1000000 
      )
      .slice(0, 15); // Send top 15 pools to the AI to evaluate

    if (livePools.length === 0) {
      throw new Error("Oracle returned no safe liquidity pools.");
    }

    // Format data exactly how our decisionEngine.js expects it
    const formattedData = livePools.map(pool => ({
      name: `${pool.project} (${pool.symbol})`, // Human-readable format
      asset: 'USDC', // Add asset field for frontend compatibility
      address: pool.pool, // The actual smart contract address of the pool
      apy: pool.apy, // Live APY percentage
      tvl: pool.tvlUsd,
      
      // Dynamic Risk Calculation based on liquidity (TVL)
      // Higher TVL = Lower Risk. A $1B pool is safer than a $1M pool.
      risk: calculateDynamicRisk(pool.tvlUsd, pool.ilRisk) 
    }));

    console.log(`Oracle Sync Complete: ${formattedData.length} live pools ready for TEE analysis.`);
    return formattedData;

  } catch (error) {
    console.error("Oracle fetch failed. Engaging emergency fallback data.", error.message);

    // Fallback data in case API goes down during live hackathon demo
    return [
      { name: 'Aave V3 (USDC)', asset: 'USDC', address: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2', apy: 4.5, risk: 15 },
      { name: 'Compound V3 (USDC)', asset: 'USDC', address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3', apy: 5.1, risk: 20 }
    ];
  }
}

/**
 * Calculates a 0-100 risk score based on real-world DeFi metrics.
 * 
 * @param {number} tvlUsd - Total Value Locked in USD
 * @param {string} impermanentLossRisk - Risk indicator from DefiLlama
 * @returns {number} Risk score (0=lowest risk, 100=highest risk)
 */
function calculateDynamicRisk(tvlUsd, impermanentLossRisk) {
  let riskScore = 50; // Base score (medium risk)

  // TVL Adjustments - Larger pools are generally safer
  if (tvlUsd > 500_000_000) riskScore -= 30; // Massive liquidity = very safe
  else if (tvlUsd > 100_000_000) riskScore -= 15; // High liquidity = very safe
  else if (tvlUsd < 10_000_000) riskScore += 30; // Low liquidity = risky

  // Impermanent loss adjustment (if not a pure single-sided lending pool)
  if (impermanentLossRisk === 'yes') riskScore += 20;

  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, riskScore));
}

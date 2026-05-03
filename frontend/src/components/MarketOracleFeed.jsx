import React, { useState, useEffect } from 'react';

export default function MarketOracleFeed() {
  const [marketData, setMarketData] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  // Fetch live data from backend oracle
  const fetchLiveOracleData = async () => {
    setIsUpdating(true);

    try {
      // Call the real backend oracle API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/oracle/live`);
      const result = await response.json();
      
      if (result.success) {
        setMarketData(result.data);
        setLastUpdate(new Date(result.timestamp).toLocaleTimeString());
      } else {
        // Fallback to demo data if backend fails
        console.warn('Backend oracle failed, using fallback data');
        setMarketData([
          { name: 'Mock Aave', asset: 'USDC', tvl: 642000000, apy: 4.85, risk: 15 },
          { name: 'Mock Benqi', asset: 'USDC', tvl: 315000000, apy: 5.12, risk: 22 },
          { name: 'Mock Compound', asset: 'USDC', tvl: 89000000, apy: 8.45, risk: 45 },
          { name: 'Mock Spark', asset: 'DAI', tvl: 45000000, apy: 9.10, risk: 52 },
        ]);
        setLastUpdate(new Date().toLocaleTimeString());
      }

      setIsUpdating(false);

    } catch (error) {

      console.error("Failed to fetch oracle data", error);

    }

  };

  // Poll every 15 seconds
  useEffect(() => {
    fetchLiveOracleData();

    const interval = setInterval(fetchLiveOracleData, 15000);

    return () => clearInterval(interval);

  }, []);

  // Formatting helpers
  const formatTVL = (value) => `$${(value / 1000000).toFixed(1)}M`;

  const getRiskColor = (risk) => {
    if (risk < 30) return 'text-green-400 bg-green-400/10 border-green-500/20';
    if (risk < 60) return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20';
    return 'text-red-400 bg-red-400/10 border-red-500/20';
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-lg border border-gray-800">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          Live Oracle Feed

        </h2>

        <div className="flex items-center gap-3 text-sm font-mono">

          <span className="text-gray-400">Last Block: {lastUpdate}</span>

          <span className="relative flex h-3 w-3">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isUpdating ? 'bg-blue-400' : 'bg-green-400'}`}></span>

            <span className={`relative inline-flex rounded-full h-3 w-3 ${isUpdating ? 'bg-blue-500' : 'bg-green-500'}`}></span>

          </span>

        </div>

      </div>



      <div className="overflow-x-auto">

        <table className="w-full text-left border-collapse">

          <thead>

            <tr className="border-b border-gray-800 text-gray-400 text-xs uppercase font-mono">

              <th className="py-3 px-4">DeFi Protocol</th>

              <th className="py-3 px-4">Live Liquidity (TVL)</th>

              <th className="py-3 px-4 text-right">Current APY</th>

              <th className="py-3 px-4 text-center">Calculated Risk</th>

            </tr>

          </thead>

          <tbody>

            {marketData.map((pool, idx) => (

              <tr key={idx} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">

                <td className="py-4 px-4">

                  <div className="font-bold">{pool.name}</div>

                  <div className="text-xs text-gray-500 font-mono">Asset: {pool.asset}</div>

                </td>

                <td className="py-4 px-4 font-mono text-gray-300">

                  {formatTVL(pool.tvl)}

                </td>

                <td className="py-4 px-4 text-right font-bold text-blue-400">

                  {pool.apy.toFixed(2)}%

                </td>

                <td className="py-4 px-4 text-center">

                  <span className={`px-3 py-1 rounded border font-mono text-xs ${getRiskColor(pool.risk)}`}>

                    Risk: {pool.risk}/100

                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      <div className="mt-4 text-xs text-gray-500 flex justify-between">

        <span>Powered by DefiLlama decentralized oracles</span>

        <span>Data piped directly to 0G Compute TEE</span>

      </div>

    </div>

  );

}

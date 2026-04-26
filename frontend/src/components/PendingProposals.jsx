import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

export default function PendingProposals({ strategyManagerContract, isOwner, protocolRegistry }) {
  const [proposals, setProposals] = useState([]);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [loading, setLoading] = useState(true);

  // Fetch proposals from smart contract
  useEffect(() => {
    const fetchProposals = async () => {
      if (!strategyManagerContract) return;
      
      try {
        setLoading(true);
        const count = await strategyManagerContract.proposalCount();
        let fetchedProposals = [];
        
        // Loop backwards to show newest proposals first
        for (let i = Number(count) - 1; i >= 0; i--) {
          const p = await strategyManagerContract.getProposal(i);
          
          // Only include non-executed, non-canceled proposals
          if (!p.executed && !p.canceled) {
            // Get protocol names from registry
            const protocolDetails = await Promise.all(
              p.protocols.map(async (addr) => {
                try {
                  const info = await strategyManagerContract.getProtocolInfo(addr);
                  return {
                    address: addr,
                    name: info[2], // name field
                    riskScore: Number(info[1]) // riskScore field
                  };
                } catch {
                  return {
                    address: addr,
                    name: addr.substring(0, 8) + '...',
                    riskScore: 0
                  };
                }
              })
            );

            fetchedProposals.push({
              id: i,
              protocols: protocolDetails,
              percentages: p.percentages.map(n => Number(n)),
              executionTime: Number(p.executionTime),
              executed: p.executed,
              canceled: p.canceled,
              proposedBy: p.proposedBy,
              totalApy: Number(p.totalApy),
              portfolioRisk: Number(p.portfolioRisk)
            });
          }
        }
        
        setProposals(fetchedProposals);
      } catch (error) {
        console.error("Error fetching proposals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
    
    // Set up event listener for new proposals
    if (strategyManagerContract) {
      strategyManagerContract.on("StrategyProposed", (proposalId, executeAfter, proposer) => {
        console.log("New strategy proposed:", proposalId.toString());
        fetchProposals(); // Refresh the list
      });
      
      strategyManagerContract.on("ProposalCanceled", (proposalId, canceler) => {
        console.log("Proposal canceled:", proposalId.toString());
        fetchProposals(); // Refresh the list
      });
      
      strategyManagerContract.on("StrategyExecuted", (agent, proposalId, totalApy, portfolioRisk) => {
        console.log("Strategy executed:", proposalId.toString());
        fetchProposals(); // Refresh the list
      });
    }

    return () => {
      if (strategyManagerContract) {
        strategyManagerContract.removeAllListeners();
      }
    };
  }, [strategyManagerContract]);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  // Smart contract interactions
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this proposal?")) return;
    
    try {
      const tx = await strategyManagerContract.cancelProposal(id);
      await tx.wait();
      alert("Proposal Canceled Successfully!");
      // UI will update via event listener
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel proposal: " + (error.message || "Unknown error"));
    }
  };

  const handleExecute = async (id) => {
    if (!window.confirm("Are you sure you want to execute this proposal?")) return;
    
    try {
      const tx = await strategyManagerContract.executeProposedStrategy(id);
      await tx.wait();
      alert("Strategy Executed Successfully!");
      // UI will update via event listener
    } catch (error) {
      console.error("Execution failed:", error);
      alert("Failed to execute proposal: " + (error.message || "Unknown error"));
    }
  };

  const formatTimeLeft = (executionTime) => {
    const timeLeft = executionTime - currentTime;
    if (timeLeft <= 0) return "Ready";
    
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h ${minutes}m`;
    }
    
    return `${hours}h ${minutes}m`;
  };

  const getRiskColor = (risk) => {
    if (risk <= 30) return "text-green-400";
    if (risk <= 60) return "text-yellow-400";
    return "text-red-400";
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 text-white rounded-xl shadow-lg border border-gray-800">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          ⏳ Time-Lock Waiting Room
        </h2>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading proposals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-lg border border-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          ⏳ Time-Lock Waiting Room
        </h2>
        <div className="text-sm text-gray-400">
          {proposals.length} pending proposal{proposals.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div className="space-y-4">
        {proposals.map((prop) => {
          const timeLeft = prop.executionTime - currentTime;
          const isReady = timeLeft <= 0;
          
          return (
            <div key={prop.id.toString()} className="bg-gray-800 p-4 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-mono text-sm text-gray-400">Proposal #{prop.id.toString()}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    Proposed by: {prop.proposedBy.substring(0, 8)}...{prop.proposedBy.substring(38)}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    isReady ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {isReady ? '✅ Ready for Execution' : `⏰ ${formatTimeLeft(prop.executionTime)}`}
                  </span>
                  <div className="text-xs text-gray-400 mt-1">
                    Expected APY: {prop.totalApy.toFixed(1)}%
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-2">Proposed Allocation:</p>
                <div className="space-y-2">
                  {prop.protocols.map((protocol, idx) => (
                    <div key={protocol.address} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span className="font-mono text-sm">{protocol.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${getRiskColor(protocol.riskScore)} bg-gray-700`}>
                          Risk: {protocol.riskScore}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-400 font-bold">{prop.percentages[idx]}%</span>
                        <div className="w-16 bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${prop.percentages[idx]}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <div className="text-sm">
                  <span className="text-gray-400">Portfolio Risk: </span>
                  <span className={`font-bold ${getRiskColor(prop.portfolioRisk)}`}>
                    {prop.portfolioRisk}/100
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {isReady ? "Time-lock expired" : "Waiting for time-lock"}
                </div>
              </div>

              <div className="flex gap-3">
                {/* Emergency Stop - Only visible to Owner/Admin */}
                {isOwner && (
                  <button 
                    onClick={() => handleCancel(prop.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    🛑 Emergency Cancel
                  </button>
                )}
                
                {/* Execute - Only active if timer is zero */}
                <button 
                  onClick={() => handleExecute(prop.id)}
                  disabled={!isReady}
                  className={`flex-1 font-bold py-2 px-4 rounded transition-colors flex items-center justify-center gap-2 ${
                    isReady 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isReady ? '✅ Execute Strategy' : '⏳ Time-Lock Active'}
                </button>
              </div>
            </div>
          );
        })}
        
        {proposals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No Pending Strategies</h3>
            <p className="text-gray-500">All caught up! No proposals are currently in the waiting room.</p>
          </div>
        )}
      </div>
    </div>
  );
}

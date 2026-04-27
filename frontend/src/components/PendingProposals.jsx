import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Assuming you pass your contract instance and user address as props
export default function PendingProposals({ strategyManagerContract, isOwner }) {
  const [proposals, setProposals] = useState([]);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  // 1. Fetch Proposals from the Smart Contract
  useEffect(() => {
    const fetchProposals = async () => {
      if (!strategyManagerContract) return;
      try {
        const count = await strategyManagerContract.proposalCount();
        let fetchedProposals = [];
        
        // Loop backwards to show the newest proposals first
        for (let i = count - 1n; i >= 0n; i--) {
          const p = await strategyManagerContract.proposals(i);
          fetchedProposals.push({
            id: i,
            protocols: p.protocols,
            percentages: p.percentages.map(n => Number(n)), // Convert BigInt
            executionTime: Number(p.executionTime),
            executed: p.executed,
            canceled: p.canceled
          });
        }
        setProposals(fetchedProposals);
      } catch (error) {
        console.error("Error fetching proposals:", error);
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

  // 2. Live Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Smart Contract Interactions
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

  // Helper function to get protocol name from address (mock for demo)
  const getProtocolName = (address) => {
    const protocolMap = {
      '0x1111111111111111111111111111111111111111': 'Aave',
      '0x2222222222222222222222222222222222222222': 'Benqi',
      '0x3333333333333333333333333333333333333333': 'Compound',
      '0x4444444444444444444444444444444444444444': 'Uniswap',
      '0x5555555555555555555555555555555555555555': 'Curve'
    };
    return protocolMap[address.toLowerCase()] || address.substring(0, 8) + '...';
  };

  return (
    <div className="p-6 bg-gray-900 text-white rounded-xl shadow-lg border border-gray-800">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        Time-Lock Waiting Room
      </h2>
      
      <div className="space-y-4">
        {proposals.map((prop) => {
          const timeLeft = prop.executionTime - currentTime;
          const isReady = timeLeft <= 0;
          
          if (prop.executed || prop.canceled) return null; // Hide finished items

          return (
            <div key={prop.id.toString()} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-sm text-gray-400">Proposal #{prop.id.toString()}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${isReady ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {isReady ? 'Ready for Execution' : `Time Left: ${Math.floor(timeLeft / 3600)}h ${Math.floor((timeLeft % 3600) / 60)}m`}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-400 mb-1">Proposed Allocation:</p>
                {prop.protocols.map((addr, idx) => (
                  <div key={addr} className="flex justify-between font-mono text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <span className="text-blue-400">{getProtocolName(addr)}</span>
                      <span className="text-gray-500 text-xs">({addr.substring(0, 8)}...{addr.substring(38)})</span>
                    </span>
                    <span className="text-green-400 font-bold">{prop.percentages[idx]}%</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {/* Emergency Stop - Only visible to Owner/Admin */}
                {isOwner && (
                  <button 
                    onClick={() => handleCancel(prop.id)}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                  >
                    Emergency Cancel
                  </button>
                )}
                
                {/* Execute - Only active if timer is zero */}
                <button 
                  onClick={() => handleExecute(prop.id)}
                  disabled={!isReady}
                  className={`flex-1 font-bold py-2 px-4 rounded transition-colors ${
                    isReady ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Execute Strategy
                </button>
              </div>
            </div>
          );
        })}
        {proposals.filter(p => !p.executed && !p.canceled).length === 0 && (
          <p className="text-center text-gray-500 py-8">No pending strategies in the queue.</p>
        )}
      </div>
    </div>
  );
}

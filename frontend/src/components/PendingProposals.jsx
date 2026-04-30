import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Assuming you pass your contract instance and user address as props
export default function PendingProposals({ account, onExecutionComplete, blockchainService }) {
  const [proposals, setProposals] = useState([]);
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));
  const [loading, setLoading] = useState(true);

  // 1. Fetch Proposals directly from Blockchain Service
  // Replaces backend API with direct Web3 calls
  const fetchProposals = async () => {
    // Don't fetch proposals if wallet is not connected
    if (!account || !blockchainService) {
      setLoading(false);
      return;
    }
      
      setLoading(true);
      
      try {
        console.log('Fetching proposals directly from blockchain...');
        const proposals = await blockchainService.getAllProposals();
        console.log('Blockchain proposals:', proposals);
        setProposals(proposals);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching proposals from blockchain:", error);
        // Set empty state to prevent infinite loading
        setProposals([]);
        setLoading(false);
      }
    };

  useEffect(() => {
    // Expose fetchProposals globally for real-time updates
    window.refreshProposals = fetchProposals;
    
    fetchProposals();
    
    // Set up blockchain event listeners for real-time updates
    // Only set up listeners if blockchain service is properly initialized
    if (blockchainService && blockchainService.strategyManagerContract) {
      console.log('Setting up blockchain event listeners...');
      
      blockchainService.setupEventListeners(
        // New proposal event
        (proposalData) => {
          console.log('New proposal event:', proposalData);
          fetchProposals(); // Refresh the list
        },
        // Strategy executed event
        (executionData) => {
          console.log('Strategy executed event:', executionData);
          fetchProposals(); // Refresh the list
        },
        // Proposal canceled event
        (cancelData) => {
          console.log('Proposal canceled event:', cancelData);
          fetchProposals(); // Refresh the list
        }
      );
    }

    // Set up polling for TEE-created proposals (every 30 seconds)
    const pollInterval = setInterval(() => {
      fetchProposals();
    }, 30000);

    return () => {
      if (blockchainService) {
        blockchainService.removeEventListeners();
      }
      clearInterval(pollInterval);
    };
  }, [blockchainService, account]);

  // 2. Live Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Blockchain Interactions with Transaction Verification
  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this proposal?")) return;
    
    try {
      console.log(`Cancelling proposal ${id} on blockchain...`);
      const result = await blockchainService.cancelProposal(id);
      
      if (result.success) {
        alert(`Proposal Canceled Successfully!\n\nTransaction: ${result.hash}\nBlock: ${result.blockNumber}`);
        console.log('Cancel transaction successful:', result);
        // UI will update via event listener
      } else {
        throw new Error('Cancel transaction failed');
      }
    } catch (error) {
      console.error("Cancel failed:", error);
      alert("Failed to cancel proposal: " + (error.message || "Unknown error"));
    }
  };

  const handleExecute = async (id) => {
    if (!window.confirm("Are you sure you want to execute this proposal?")) return;
    
    try {
      // Show detailed execution feedback
      const proposal = proposals.find(p => p.id === id);
      const protocolNames = proposal.protocols.map(addr => getProtocolName(addr));
      
      console.log(`Executing proposal ${id} on blockchain...`);
      
      // Execute on blockchain with transaction verification
      const result = await blockchainService.executeProposal(id);
      
      if (result.success) {
        const executionDetails = `
🎯 Strategy Execution Complete!

📊 Proposal #${id} Executed:
🔄 Protocols: ${protocolNames.join(', ')}
📈 Allocations: ${proposal.percentages.map((p, i) => `${p}% to ${protocolNames[i]}`).join(', ')}
🎯 Expected APY: ${proposal.expectedAPY || 'N/A'}%

⛽ Transaction: ${result.hash}
📦 Block: ${result.blockNumber}
💰 Funds have been physically routed to the selected DeFi protocols.
📡 Yield generation will begin immediately.

✅ Status: ACTIVE & GENERATING YIELD
        `.trim();
        
        alert(executionDetails);
        console.log('Execution transaction successful:', result);
        
        // Call parent callback to update vault data
        if (onExecutionComplete) {
          onExecutionComplete({
            proposalId: id,
            protocols: protocolNames,
            percentages: proposal.percentages,
            expectedAPY: proposal.expectedAPY,
            ...result // Include transaction result for verification
          });
        }
        
        // Refresh proposals to update the UI
        setTimeout(() => {
          fetchProposals();
        }, 1000); // Small delay to ensure backend is updated
      } else {
        throw new Error('Execution transaction failed');
      }
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
        Strategy Management
      </h2>
      
      {!account ? (
        <div className="text-center py-8">
          <p className="text-gray-400">Connect your wallet to view strategies</p>
        </div>
      ) : (
      
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-gray-400 mt-2">Loading proposal history...</p>
          </div>
        ) : (
          <>
            {/* Pending Proposals Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-yellow-400">⏱️ Pending Proposals</h3>
              <div className="space-y-4">
                {proposals.filter(prop => !prop.executed && !prop.canceled).map((prop) => {
              // Check if proposal is ready for execution based on on-chain time-lock
              // CRITICAL: Verify time-lock is enforced by smart contract, not just UI
              let isReady = false;
              let timeRemaining = 0;
              
              if (typeof prop.executionTime === 'string') {
                // If it's an ISO string, convert to timestamp
                const executeAfterTime = new Date(prop.executionTime).getTime();
                timeRemaining = executeAfterTime - Date.now();
                isReady = timeRemaining <= 0;
              } else if (typeof prop.executionTime === 'number') {
                // If it's already a timestamp (seconds or milliseconds)
                const executeAfterTime = prop.executionTime > 10000000000 ? prop.executionTime : prop.executionTime * 1000;
                timeRemaining = executeAfterTime - Date.now();
                isReady = timeRemaining <= 0;
              } else {
                // Fallback: assume it's 10 seconds from now for demo
                timeRemaining = 10000;
                isReady = false;
              }
              
              // Verify on-chain time-lock is respected
              console.log(`Proposal #${prop.id} time-lock check:`, {
                executionTime: prop.executionTime,
                currentTime: Date.now(),
                timeRemaining: Math.max(0, Math.floor(timeRemaining / 1000)),
                isReady,
                enforcedByContract: 'Smart contract will reject if time-lock not expired'
              });
              
              // Debug logging (commented out to reduce console noise)
              // console.log('Time calculation:', {
              //   proposalId: prop.id,
              //   executeAfter: prop.executeAfter,
              //   executeAfterTime,
              //   now,
              //   timeLeft,
              //   timeLeftSeconds: Math.floor(timeLeft / 1000),
              //   isReady
              // });
              
              // Don't hide executed items - show them in completed section

              return (
                <div key={prop.id.toString()} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-mono text-sm text-gray-400">Proposal #{prop.id.toString()}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                      isReady 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {isReady ? (
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
                          Ready for Execution
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <span className="w-2 h-2 bg-yellow-300 rounded-full mr-2"></span>
                          Time-Lock: {Math.max(0, Math.floor(timeRemaining / 1000))}s
                        </span>
                      )}
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
                    {/* Emergency Stop - Available to all users for demo */}
                    <button 
                      onClick={() => handleCancel(prop.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors"
                    >
                      Emergency Cancel
                    </button>
                    
                    {/* Execute - Only active if on-chain time-lock has expired */}
                    <button 
                      onClick={() => handleExecute(prop.id)}
                      disabled={!isReady}
                      className={`flex-1 font-bold py-2 px-4 rounded transition-all transform ${
                        isReady 
                          ? 'bg-green-600 hover:bg-green-700 text-white scale-105 shadow-lg shadow-green-600/30 animate-pulse' 
                          : 'bg-gray-600 text-gray-500 cursor-not-allowed'
                      }`}
                      title={isReady ? 'Execute strategy (time-lock expired)' : 'Wait for time-lock to expire'}
                    >
                      {isReady ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-2 h-2 bg-green-300 rounded-full animate-ping"></span>
                          Execute Strategy
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-2 h-2 bg-yellow-300 rounded-full"></span>
                          Time-Locked
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
                {!loading && proposals.filter(p => !p.executed && !p.canceled).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No pending strategies in the queue.</p>
                )}
              </div>
            </div>

            {/* Executed Proposals Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-green-400">✅ Active Strategies</h3>
              <div className="space-y-4">
                {proposals.filter(prop => prop.executed).map((prop) => {
                  const protocolNames = prop.protocols.map(addr => getProtocolName(addr));
                  return (
                    <div key={prop.id.toString()} className="bg-gray-800 p-4 rounded-lg border border-green-700/30">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono text-sm text-gray-400">Proposal #{prop.id.toString()}</span>
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-green-500/20 text-green-400">
                          Active & Generating Yield
                        </span>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-1">Active Allocation:</p>
                        {prop.protocols.map((addr, idx) => (
                          <div key={addr} className="flex justify-between font-mono text-sm mb-1">
                            <span className="flex items-center gap-2">
                              <span className="text-blue-400">{getProtocolName(addr)}</span>
                              <span className="text-gray-500 text-xs">({addr.substring(0, 8)}...{addr.substring(38)})</span>
                            </span>
                            <span className="text-green-400 font-bold">{prop.percentages[idx]}%</span>
                          </div>
                        ))}
                        <div className="mt-2 pt-2 border-t border-gray-700">
                          <p className="text-xs text-gray-500">
                            Executed: {prop.executedAt ? new Date(prop.executedAt).toLocaleString() : 'Unknown'}
                          </p>
                          <p className="text-xs text-green-400 font-semibold">
                            Expected APY: {prop.expectedAPY || 'N/A'}%
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!loading && proposals.filter(p => p.executed).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No active strategies yet.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      )}
    </div>
  );
}

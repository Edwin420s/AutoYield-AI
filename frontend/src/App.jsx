/**
 * AutoYield AI - Frontend Application
 * React-based web interface for autonomous yield optimization
 * 
 * Features:
 * - Wallet connection and management
 * - Real-time market data display
 * - AI strategy execution with TEE protection
 * - Proposal tracking and management
 * - Portfolio performance monitoring
 * 
 * @component App
 * @returns {JSX.Element} Main application component
 */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import MarketOracleFeed from './components/MarketOracleFeed.jsx';
import PendingProposals from './components/PendingProposals.jsx';
import AgentControlPanel from './components/AgentControlPanel.jsx';

/**
 * Main application state and wallet management
 * Handles user authentication, vault data fetching, and AI strategy execution
 */
function App() {
  // State management
  const [account, setAccount] = useState(null); // Connected wallet address
  const [vaultData, setVaultData] = useState({
    totalAssets: 0,    // Total USDC assets in vault
    userShares: 0,      // User's vault shares
    apy: 0             // Current annual percentage yield
  });

  /**
   * Connect user wallet using MetaMask or compatible browser wallet
   * Fetches vault data after successful connection
   */
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        
        // Fetch vault data
        await fetchVaultData(address);
      } else {
        alert('Please install MetaMask!');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  /**
   * Fetch user's vault data from backend API
   * Retrieves total assets, shares, and current APY
   * 
   * @param {string} userAddress - Connected wallet address
   */
  const fetchVaultData = async (userAddress) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vault/user/${userAddress}`);
      const data = await response.json();
      if (data.success) {
        setVaultData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch vault data:', error);
    }
  };

  /**
   * Execute AI strategy for yield optimization
   * Submits strategy to blockchain with 24-hour time-lock
   */
  const runAIStrategy = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.success) {
        alert('AI strategy submitted to 24-hour time-lock!');
        console.log('Proposal ID:', data.proposalId);
      } else {
        alert('Failed to run AI strategy: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to run AI strategy:', error);
      alert('Failed to run AI strategy');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Application Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-400">AutoYield AI</h1>
              <span className="ml-3 px-3 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded-full">
                0G Powered
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {account ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-400">
                    {account.substring(0, 6)}...{account.substring(38)}
                  </span>
                  <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm">
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Application Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Portfolio Dashboard */}
        {account && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Total Assets</h3>
              <p className="text-3xl font-bold text-blue-400">
                ${vaultData.totalAssets.toLocaleString()} USDC
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Your Shares</h3>
              <p className="text-3xl font-bold text-green-400">
                {vaultData.userShares.toLocaleString()}
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Current APY</h3>
              <p className="text-3xl font-bold text-yellow-400">
                {vaultData.apy.toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* AI Control Panel */}
        {account && (
          <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              AI Control Panel
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-2">
                  Run the autonomous AI agent to optimize your yield across DeFi protocols
                </p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    TEE Enabled
                  </span>
                  <span className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Front-running Protected
                  </span>
                </div>
              </div>
              <button 
                onClick={runAIStrategy}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-6 py-3 rounded-lg font-medium"
              >
                Run AI Strategy
              </button>
            </div>
          </div>
        )}

        {/* Three-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Market Oracle Feed - Live DeFi Yields */}
          <MarketOracleFeed />
          
          {/* AI Agent Control Panel - TEE Terminal */}
          <AgentControlPanel />
          
          {/* Pending Proposals - Time-lock Management */}
          <PendingProposals />
        </div>
      </main>

      {/* Application Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-400">
            <p>AutoYield AI - Autonomous Yield Optimizer on 0G</p>
            <p className="text-sm mt-2">
              Built for the 0G APAC Hackathon 2026 - Track 2: Agentic Trading Arena
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

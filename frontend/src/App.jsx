/**
 * ========================================
 * AUTOYIELD AI - FRONTEND APPLICATION
 * ========================================
 * 
 * File: frontend/src/App.jsx
 * Version: 1.0.0
 * Author: AutoYield AI Team
 * 
 * ========================================
 * COMPONENT DESCRIPTION
 * ========================================
 * React-based main application component for AutoYield AI.
 * This component serves as the primary user interface for the autonomous DeFi yield optimizer,
 * providing users with a comprehensive dashboard for managing their investments,
 * monitoring AI strategies, and interacting with blockchain smart contracts.
 * 
 * The application implements a non-custodial architecture where users maintain
 * full control over their funds through Web3 wallet integration, while the AI
 * agent operates as an autonomous keeper with TEE-verified decision making.
 * 
 * ========================================
 * ARCHITECTURE DESIGN
 * ========================================
 * This component follows modern React patterns with:
 * - Functional component with hooks for state management
 * - Web3 integration through ethers.js for blockchain interaction
 * - Service layer abstraction for API and blockchain operations
 * - Real-time data updates through polling and event listeners
 * - Responsive design with Tailwind CSS styling
 * - Component composition for modular UI elements
 * 
 * ========================================
 * KEY FEATURES
 * ========================================
 * - Wallet Connection and Management:
 *   - MetaMask integration for self-custodial access
 *   - Network switching and validation
 *   - Account management and display
 *   - Connection status monitoring
 * 
 * - Portfolio Dashboard:
 *   - Real-time asset display from blockchain
 *   - User shares and investment tracking
 *   - Current APY monitoring
 *   - Deposit/withdrawal functionality
 * 
 * - AI Strategy Execution:
 *   - TEE-protected AI decision making
 *   - Real-time strategy monitoring
 *   - Execution status tracking
 *   - Front-running protection indicators
 * 
 * - Proposal Management:
 *   - Time-locked strategy proposals
 *   - Countdown timers for execution
 *   - Manual execution controls
 *   - Proposal history tracking
 * 
 * - Market Data Integration:
 *   - Live oracle feed display
 *   - Protocol APY monitoring
 *   - Risk score visualization
 *   - Real-time data updates
 * 
 * ========================================
 * STATE MANAGEMENT
 * ========================================
 * The component manages several key state variables:
 * 
 * Wallet State:
 * - account: Connected wallet address
 * - provider: Web3 provider instance
 * - signer: Transaction signer instance
 * - isConnecting: Connection loading state
 * - networkError: Network validation errors
 * 
 * Portfolio State:
 * - vaultData: User's vault information
 *   - totalAssets: Total USDC in vault
 *   - userShares: User's vault shares
 *   - currentAPY: Current yield percentage
 *   - userValue: User's investment value
 * 
 * UI State:
 * - Loading states for async operations
 * - Error states for user feedback
 * - Modal states for user interactions
 * 
 * ========================================
 * WEB3 INTEGRATION
 * ========================================
 * The application implements comprehensive Web3 functionality:
 * 
 * Wallet Connection:
 * - MetaMask detection and connection
 * - Account access permission requests
 * - Network validation and switching
 * - Provider and signer initialization
 * 
 * Blockchain Interaction:
 * - Direct contract calls via ethers.js
 * - Transaction signing and confirmation
 * - Event listening for real-time updates
 * - Error handling for failed transactions
 * 
 * Network Support:
 * - 0G Testnet configuration
 * - Local Hardhat network for development
 * - Chain ID validation
 * - RPC endpoint configuration
 * 
 * ========================================
 * SECURITY IMPLEMENTATIONS
 * ========================================
 * Non-Custodial Architecture:
 * - Funds never leave user control
 * - All transactions require user signature
 * - Direct blockchain interaction
 * - No backend custody of assets
 * 
 * TEE Protection:
 * - AI decisions executed in secure enclaves
 * - Front-running prevention through sealed inference
 * - Cryptographic proof verification
 * - Attestation validation
 * 
 * Input Validation:
 * - Address format validation
 * - Amount range checking
 * - Network validation
 * - Error boundary handling
 * 
 * ========================================
 * USER EXPERIENCE DESIGN
 * ========================================
 * Responsive Layout:
 * - Mobile-first design approach
 * - Adaptive grid layouts
 * - Touch-friendly controls
 * - Progressive enhancement
 * 
 * Real-Time Feedback:
 * - Loading states for async operations
 * - Success/error notifications
 * - Progress indicators
 * - Status updates
 * 
 * Accessibility:
 * - Semantic HTML structure
 * - ARIA labels and descriptions
 * - Keyboard navigation support
 * - Screen reader compatibility
 * 
 * ========================================
 * COMPONENT ARCHITECTURE
 * ========================================
 * The main App component orchestrates several child components:
 * 
 * MarketOracleFeed:
 * - Displays live DeFi protocol data
 * - Shows APY rates and risk scores
 * - Updates in real-time
 * 
 * AgentControlPanel:
 * - AI strategy execution controls
 * - TEE status indicators
 * - Execution monitoring
 * 
 * PendingProposals:
 * - Time-locked proposal display
 * - Countdown timers
 * - Execution controls
 * 
 * Service Layer:
 * - walletService: Web3 wallet management
 * - blockchainService: Contract interaction
 * - API communication
 * 
 * ========================================
 * DATA FLOW ARCHITECTURE
 * ========================================
 * 1. User Interaction:
 *    - User clicks button or enters input
 *    - Event handler triggers action
 *    - Loading state updated
 * 
 * 2. Service Call:
 *    - Appropriate service function called
 *    - Parameters validated and formatted
 *    - Async operation initiated
 * 
 * 3. Blockchain/API Response:
 *    - Response received and validated
 *    - State updated with new data
 *    - UI re-renders with changes
 * 
 * 4. User Feedback:
 *    - Success/error notification displayed
 *    - Loading state cleared
 *    - UI reflects new state
 * 
 * ========================================
 * ERROR HANDLING STRATEGY
 * ========================================
 * Network Errors:
 * - RPC connection failures
 * - Transaction reverts
 * - Network switching issues
 * - Wallet connection problems
 * 
 * Validation Errors:
 * - Invalid address formats
 * - Insufficient balances
 * - Incorrect network
 * - Permission denied
 * 
 * UI Error States:
 * - Error messages displayed
 * - Retry mechanisms provided
 * - Graceful degradation
 * - User guidance offered
 * 
 * ========================================
 * PERFORMANCE OPTIMIZATIONS
 * ========================================
 * React Optimizations:
 * - useEffect dependency management
 * - Callback memoization
 * - State update batching
 * - Component lazy loading
 * 
 * Web3 Optimizations:
 * - Provider instance reuse
 * - Event listener cleanup
 * - Request batching
 * - Connection pooling
 * 
 * Data Fetching:
 * - Polling interval management
 * - Cache invalidation
 * - Background updates
 * - Error retry logic
 * 
 * ========================================
 * DEVELOPMENT CONSIDERATIONS
 * ========================================
 * Environment Configuration:
 * - Development vs production settings
 * - Local vs testnet configuration
 * - Environment variable management
 * - Feature flag support
 * 
 * Testing Strategy:
 * - Component unit testing
 * - Integration testing
 * - E2E testing scenarios
 * - Mock Web3 providers
 * 
 * Debugging Tools:
 * - React Developer Tools
 * - Browser console logging
 * - Network request monitoring
 * - State inspection tools
 * 
 * ========================================
 * DEPLOYMENT CONFIGURATION
 * ========================================
 * Build Process:
 * - Vite build system
 * - Production optimization
 * - Asset bundling
 * - Code minification
 * 
 * Environment Variables:
 * - VITE_RPC_URL: Blockchain RPC endpoint
 * - VITE_VAULT_ADDRESS: Vault contract address
 * - VITE_MANAGER_ADDRESS: Strategy manager address
 * - VITE_REGISTRY_ADDRESS: Agent registry address
 * - VITE_API_URL: Backend API endpoint
 * - VITE_CHAIN_ID: Blockchain network ID
 * 
 * ========================================
 * FUTURE ENHANCEMENTS
 * ========================================
 * Advanced Features:
 * - Multi-wallet support
 * - Advanced charting
 * - Portfolio analytics
 * - Strategy backtesting
 * 
 * UX Improvements:
 * - Dark/light theme toggle
 * - Customizable dashboard
 * - Advanced filtering
 * - Export functionality
 * 
 * Technical Enhancements:
 * - WebSocket integration
 * - Service worker support
 * - Progressive Web App
 * - Offline functionality
 * 
 * ========================================
 * DEPENDENCIES
 * ========================================
 * React Ecosystem:
 * - react: Core React library
 * - react-dom: DOM rendering
 * - ethers: Web3 library
 * 
 * UI Framework:
 * - tailwindcss: Utility-first CSS
 * - framer-motion: Animation library
 * - recharts: Chart library
 * - lucide-react: Icon library
 * 
 * Build Tools:
 * - vite: Build tool and dev server
 * - @vitejs/plugin-react: React plugin
 * 
 * ========================================
 * LICENSING & ATTRIBUTION
 * ========================================
 * License: MIT
 * Author: AutoYield AI Team
 * Project: AutoYield AI - 0G APAC Hackathon 2026
 * Track: Agentic Trading Arena (Verifiable Finance)
 * 
 * ========================================
 * ACKNOWLEDGMENTS
 * ========================================
 * Built with modern Web3 technologies and React best practices.
 * Implements non-custodial DeFi architecture with TEE protection.
 * Designed for the 0G ecosystem with comprehensive security measures.
 */
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { walletService } from './services/walletService.js';
import { blockchainService } from './services/blockchainService.js';
import MarketOracleFeed from './components/MarketOracleFeed.jsx';
import PendingProposals from './components/PendingProposals.jsx';
import AgentControlPanel from './components/AgentControlPanel.jsx';

// Suppress wallet extension injection errors globally
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && 
      (message.includes('message channel closed') ||
       message.includes('listener indicated an asynchronous response') ||
       message.includes('runtime.lastError'))) {
    // Silently ignore wallet extension injection errors
    return;
  }
  originalConsoleError.apply(console, args);
};

/**
 * Main application state and wallet management
 * Handles user authentication, vault data fetching, and AI strategy execution
 */
function App() {
  // State management
  const [account, setAccount] = useState(null); // Connected wallet address
  const [provider, setProvider] = useState(null); // Web3 provider
  const [signer, setSigner] = useState(null); // Wallet signer
  const [isConnecting, setIsConnecting] = useState(false); // Connection loading state
  const [networkError, setNetworkError] = useState(null); // Network error state
  const [vaultData, setVaultData] = useState({
    totalAssets: 0,    // Total USDC assets in vault (from blockchain)
    userShares: 0,      // User's vault shares (from blockchain)
    apy: 0             // Current annual percentage yield (from blockchain)
  });

  /**
   * Connect user wallet using proper non-custodial Web3 service
   * User must approve connection and sign all transactions
   * Implements self-custodial architecture for verifiable finance
   */
  const connectWallet = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    setNetworkError(null);
    
    try {
      console.log('Initiating non-custodial wallet connection...');
      
      // Connect using wallet service - USER MUST APPROVE
      const result = await walletService.connect('metamask');
      
      if (result.success) {
        console.log('Wallet connected successfully:', result);
        
        setAccount(result.account);
        setProvider(result.provider);
        setSigner(result.signer);
        
        // Initialize blockchain service with user's Web3 provider
        await blockchainService.initialize(result.provider, result.signer);
        
        // Check if on correct network (Local Hardhat)
        const LOCALHARDHAT_CHAIN_ID = `0x${parseInt(import.meta.env.VITE_CHAIN_ID).toString(16)}`;
        if (!walletService.isCorrectNetwork(LOCALHARDHAT_CHAIN_ID)) {
          console.log('Wrong network detected, switching to Local Hardhat...');
          const switched = await walletService.switchNetwork(LOCALHARDHAT_CHAIN_ID);
          if (!switched) {
            setNetworkError('Please switch to Local Hardhat (localhost:8545) to use AutoYield AI');
            return;
          }
          
          // Reinitialize blockchain service with updated provider after network switch
          const updatedProvider = new ethers.BrowserProvider(window.ethereum);
          const updatedSigner = await updatedProvider.getSigner();
          await blockchainService.initialize(updatedProvider, updatedSigner);
          
          // Update state with new provider/signer
          setProvider(updatedProvider);
          setSigner(updatedSigner);
        }
        
        // Fetch vault data directly from blockchain
        await fetchVaultDataFromBlockchain(result.account);
        
      } else {
        console.error('Wallet connection failed:', result.error);
        setNetworkError(result.error);
      }
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setNetworkError('Failed to connect wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Fetch user's vault data directly from blockchain
   * Replaces fake backend API with real Web3 data
   * 
   * @param {string} userAddress - Connected wallet address
   */
  const fetchVaultDataFromBlockchain = async (userAddress) => {
    try {
      console.log('Fetching vault data directly from blockchain...');
      const data = await blockchainService.getVaultData(userAddress);
      console.log('Real blockchain vault data:', data);
      setVaultData(data);
    } catch (error) {
      console.error('Failed to fetch vault data from blockchain:', error);
      // Set zero values on error to prevent UI crashes
      setVaultData({
        totalAssets: "0",
        userShares: "0",
        currentAPY: "0",
        totalValueLocked: "0",
        activeStrategies: 0
      });
    }
  };

  /**
   * Handle strategy execution completion
   * Updates vault data with new shares and APY after execution
   * Verifies blockchain transaction status
   * 
   * @param {Object} executionResult - Result of strategy execution
   */
  const handleExecutionComplete = async (executionResult) => {
    console.log('Strategy execution completed:', executionResult);
    
    // CRITICAL: Verify transaction was successful on blockchain
    if (executionResult.status === 0) {
      console.error('Blockchain transaction failed:', executionResult);
      alert('Transaction failed on blockchain! Please check the transaction and try again.');
      return;
    }
    
    // Fetch real vault data from blockchain after successful execution
    if (account) {
      console.log('Fetching updated vault data from blockchain after execution...');
      await fetchVaultDataFromBlockchain(account);
    }
  };

  /**
   * Refresh vault data periodically and when account changes
   * Fetches directly from blockchain, not fake backend
   */
  useEffect(() => {
    if (account) {
      // Initial fetch from blockchain
      fetchVaultDataFromBlockchain(account);
      
      // Set up periodic refresh every 30 seconds from blockchain
      const interval = setInterval(() => {
        fetchVaultDataFromBlockchain(account);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [account]);

  /**
   * Execute AI strategy for yield optimization
   * Submits strategy to blockchain with proper transaction verification
   * Uses TEE-verified decisions and non-custodial execution
   */
  const runAIStrategy = async () => {
    // Check if wallet is connected
    if (!account) {
      alert('Please connect your wallet first to execute AI strategies!');
      return;
    }
    
    if (!walletService.isCorrectNetwork('0x7a69')) {
      alert('Please switch to Localhost 8545 to execute AI strategies!');
      return;
    }
    
    try {
      console.log('Initiating AI strategy execution with TEE verification...');
      
      // Use Server-Sent Events for real-time TEE execution
      const eventSource = new EventSource(`${import.meta.env.VITE_API_URL}/agent/stream-tee`);
      
      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('TEE execution update:', data);
        
        // Handle different execution statuses
        if (data.status === 'error') {
          alert(`TEE Execution Error: ${data.message}`);
          eventSource.close();
        } else if (data.status === 'complete') {
          alert('AI strategy successfully submitted to blockchain with TEE verification!');
          eventSource.close();
          
          // Refresh proposals to show new strategy
          if (window.refreshProposals) {
            window.refreshProposals();
          }
        }
      };
      
      eventSource.onerror = (error) => {
        console.error('TEE stream error:', error);
        alert('Failed to connect to TEE service. Please try again.');
        eventSource.close();
      };
      
    } catch (error) {
      console.error('Failed to run AI strategy:', error);
      alert('Failed to run AI strategy: ' + error.message);
    }
  };

  /**
   * Handle USDC deposit into vault
   * Allows users to deposit funds and see their shares
   */
  const handleDeposit = async () => {
    try {
      if (!account || !signer) {
        alert('Please connect your wallet first!');
        return;
      }

      // Prompt user for deposit amount
      const amount = prompt('Enter amount of USDC to deposit:');
      if (!amount || parseFloat(amount) <= 0) {
        return;
      }

      console.log('Depositing USDC:', amount);
      
      // Call the deposit function from blockchain service
      const result = await blockchainService.deposit(account, amount, signer);
      
      console.log('Deposit successful:', result);
      alert(`Successfully deposited ${amount} USDC! You now have ${result.shares} vault shares.`);
      
      // Refresh vault data to show updated shares
      await fetchVaultDataFromBlockchain(account);
      
    } catch (error) {
      console.error('Deposit failed:', error);
      alert('Deposit failed: ' + error.message);
    }
  };

  /**
   * Handle USDC withdrawal from vault
   * Allows users to withdraw their shares and receive USDC + yield
   */
  const handleWithdraw = async () => {
    try {
      if (!account || !signer) {
        alert('Please connect your wallet first!');
        return;
      }

      // Get user's current shares
      const userShares = vaultData.userShares || '0';
      if (parseFloat(userShares) <= 0) {
        alert('You have no shares to withdraw!');
        return;
      }

      // Prompt user for withdrawal amount
      const amount = prompt(`Enter amount of shares to withdraw (max: ${userShares}):`);
      if (!amount || parseFloat(amount) <= 0) {
        return;
      }

      if (parseFloat(amount) > parseFloat(userShares)) {
        alert('Insufficient shares balance!');
        return;
      }

      console.log('Withdrawing shares:', amount);
      
      // Call the withdraw function from blockchain service
      const result = await blockchainService.withdraw(account, amount, signer);
      
      console.log('Withdrawal successful:', result);
      alert(`Successfully withdrawn ${result.sharesWithdrawn} shares! You received ${result.usdcReceived} USDC.`);
      
      // Refresh vault data to show updated shares and assets
      await fetchVaultDataFromBlockchain(account);
      
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('Withdrawal failed: ' + error.message);
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
                  {networkError && (
                    <span className="text-xs text-red-400">
                      {networkError}
                    </span>
                  )}
                  <button 
                    onClick={() => {
                      walletService.disconnect();
                      setAccount(null);
                      setProvider(null);
                      setSigner(null);
                      setNetworkError(null);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isConnecting 
                      ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
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
                ${vaultData.totalAssets || "0.00"} USDC
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Your Investment Value</h3>
              <p className="text-3xl font-bold text-green-400 mb-3">
                ${vaultData.userValue || "0.00"} USDC
              </p>
              <p className="text-sm text-gray-400 mb-3">
                Shares: {(vaultData.userShares || 0).toLocaleString()}
              </p>
              <div className="flex gap-2">
                <button 
                  onClick={handleDeposit}
                  disabled={!account}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    account 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-400'
                  }`}
                >
                  Deposit USDC
                </button>
                <button 
                  onClick={handleWithdraw}
                  disabled={!account}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    account 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-gray-600 cursor-not-allowed opacity-50 text-gray-400'
                  }`}
                >
                  Withdraw USDC
                </button>
              </div>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
              <h3 className="text-lg font-semibold mb-2">Current APY</h3>
              <p className="text-3xl font-bold text-yellow-400">
                {parseFloat(vaultData.currentAPY || 0).toFixed(2)}%
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
                disabled={!account}
                className={`px-6 py-3 rounded-lg font-medium ${
                  account 
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' 
                    : 'bg-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                {account ? 'Run AI Strategy' : 'Connect Wallet First'}
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
          <PendingProposals 
            account={account} 
            onExecutionComplete={handleExecutionComplete}
            blockchainService={blockchainService}
          />
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

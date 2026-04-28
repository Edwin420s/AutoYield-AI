/**
 * Wallet Service - Non-Custodial Web3 Integration
 * Implements proper self-custodial wallet architecture for verifiable finance
 * 
 * Key Features:
 * - Self-custodial wallet connections (MetaMask, WalletConnect, etc.)
 * - User signs all transactions directly
 * - No private keys stored on backend
 * - Proper Web3 transaction handling
 * - Multi-wallet support
 * 
 * @module services/walletService
 */

import { ethers } from 'ethers';

class WalletService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
    this.connectedWallet = null;
    
    // Event callbacks
    this.onAccountChanged = null;
    this.onChainChanged = null;
    this.onDisconnect = null;
  }

  /**
   * Initialize wallet service with event listeners
   */
  async initialize() {
    // Check for existing connections
    if (window.ethereum) {
      this.setupEventListeners();
      
      // Check if already connected
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await this.connect();
        }
      } catch (error) {
        console.log('No existing wallet connection found');
      }
    }
  }

  /**
   * Setup wallet event listeners for account/chain changes
   */
  setupEventListeners() {
    if (!window.ethereum) return;

    // Account changed
    window.ethereum.on('accountsChanged', (accounts) => {
      console.log('Wallet accounts changed:', accounts);
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.account = accounts[0];
        if (this.onAccountChanged) {
          this.onAccountChanged(this.account);
        }
      }
    });

    // Chain changed
    window.ethereum.on('chainChanged', (chainId) => {
      console.log('Wallet chain changed:', chainId);
      this.chainId = chainId;
      if (this.onChainChanged) {
        this.onChainChanged(chainId);
      }
    });

    // Disconnect (MetaMask specific)
    if (window.ethereum.on && typeof window.ethereum.on === 'function') {
      window.ethereum.on('disconnect', (error) => {
        console.log('Wallet disconnected:', error);
        this.disconnect();
        if (this.onDisconnect) {
          this.onDisconnect(error);
        }
      });
    }
  }

  /**
   * Connect to wallet with proper user consent
   * User must approve connection and sign transactions
   * @param {string} preferredWallet - Preferred wallet type ('metamask', 'walletconnect', etc.)
   * @returns {Promise<Object>} Connection result with account and provider
   */
  async connect(preferredWallet = 'metamask') {
    try {
      console.log(`Connecting to ${preferredWallet} wallet...`);
      
      // Wait for wallet extensions to fully inject
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let provider = await this.getWalletProvider(preferredWallet);
      
      if (!provider) {
        throw new Error('No compatible wallet found. Please install MetaMask or another Web3 wallet.');
      }

      // Request account access - USER MUST APPROVE
      await provider.send("eth_requestAccounts", []);
      
      const signer = await provider.getSigner();
      const account = await signer.getAddress();
      const network = await provider.getNetwork();
      
      // Store connection details
      this.provider = provider;
      this.signer = signer;
      this.account = account;
      this.chainId = `0x${network.chainId.toString(16)}`;
      this.connectedWallet = preferredWallet;
      
      console.log('Wallet connected successfully:', {
        account,
        chainId: this.chainId,
        wallet: preferredWallet
      });

      return {
        success: true,
        account,
        chainId: this.chainId,
        provider,
        signer,
        wallet: preferredWallet
      };

    } catch (error) {
      console.error('Failed to connect wallet:', error);
      
      // Handle specific wallet connection errors
      let errorMessage = 'Failed to connect wallet';
      
      if (error.code === -32002) {
        errorMessage = 'Please unlock your wallet and approve the connection request.';
      } else if (error.code === 4001) {
        errorMessage = 'Connection request was rejected. Please try again.';
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message?.includes('message channel closed')) {
        // Wallet extension injection error - ignore silently
        console.log('Wallet extension injection detected, continuing...');
        return { success: false, error: 'Wallet extension error' };
      }
      
      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * Get appropriate wallet provider based on user preference
   * @param {string} preferredWallet - Preferred wallet type
   * @returns {ethers.BrowserProvider|null} Provider instance or null
   */
  async getWalletProvider(preferredWallet) {
    if (!window.ethereum) {
      return null;
    }

    let provider;
    
    // Handle multiple wallet extensions
    if (window.ethereum.providers?.length) {
      // Multiple wallets detected
      if (preferredWallet === 'metamask') {
        const metamaskProvider = window.ethereum.providers.find(p => p.isMetaMask);
        if (metamaskProvider) {
          provider = new ethers.BrowserProvider(metamaskProvider);
        }
      } else {
        // Use first available wallet
        provider = new ethers.BrowserProvider(window.ethereum.providers[0]);
      }
    } else if (window.ethereum.isMetaMask) {
      // Single MetaMask wallet
      provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      // Other wallet (Coinbase, etc.)
      provider = new ethers.BrowserProvider(window.ethereum);
    }

    return provider;
  }

  /**
   * Disconnect wallet and clear connection state
   * Note: Some wallets don't support programmatic disconnect
   */
  disconnect() {
    console.log('Disconnecting wallet...');
    
    this.provider = null;
    this.signer = null;
    this.account = null;
    this.chainId = null;
    this.connectedWallet = null;
    
    // Note: We can't actually disconnect from MetaMask programmatically
    // User must disconnect from their wallet extension
    console.log('Wallet disconnected (user must disconnect from wallet extension)');
  }

  /**
   * Switch to specific blockchain network
   * @param {string} chainId - Target chain ID in hex format
   * @returns {Promise<boolean>} Success status
   */
  async switchNetwork(chainId) {
    try {
      if (!this.provider) {
        throw new Error('No wallet connected');
      }

      await this.provider.send('wallet_switchEthereumChain', [
        { chainId: chainId }
      ]);

      this.chainId = chainId;
      console.log(`Switched to network: ${chainId}`);
      return true;

    } catch (error) {
      console.error('Failed to switch network:', error);
      
      // Handle network not added error
      if (error.code === 4902) {
        console.log('Network not found, attempting to add...');
        return await this.addNetwork(chainId);
      }
      
      return false;
    }
  }

  /**
   * Add new network to wallet
   * @param {string} chainId - Chain ID in hex format
   * @returns {Promise<boolean>} Success status
   */
  async addNetwork(chainId) {
    try {
      // 0G Testnet configuration
      const networkConfig = {
        chainId: chainId,
        chainName: '0G Testnet',
        nativeCurrency: {
          name: '0G',
          symbol: '0G',
          decimals: 18
        },
        rpcUrls: ['https://rpc.0g.ai/testnet'],
        blockExplorerUrls: ['https://blockscout.0g.ai/testnet']
      };

      await this.provider.send('wallet_addEthereumChain', [networkConfig]);
      this.chainId = chainId;
      console.log(`Added and switched to network: ${chainId}`);
      return true;

    } catch (error) {
      console.error('Failed to add network:', error);
      return false;
    }
  }

  /**
   * Sign and send transaction - USER MUST SIGN
   * @param {Object} transaction - Transaction object
   * @returns {Promise<Object>} Transaction receipt
   */
  async sendTransaction(transaction) {
    try {
      if (!this.signer) {
        throw new Error('No wallet connected. Please connect your wallet first.');
      }

      console.log('Sending transaction:', transaction);
      
      // User must sign this transaction
      const tx = await this.signer.sendTransaction(transaction);
      console.log('Transaction submitted:', tx.hash);
      
      // Wait for transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      return {
        success: true,
        hash: tx.hash,
        receipt
      };

    } catch (error) {
      console.error('Transaction failed:', error);
      
      // Handle specific transaction errors
      let errorMessage = 'Transaction failed';
      
      if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        errorMessage = 'Gas estimation failed. Please check your account balance and try again.';
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorMessage = 'Insufficient funds for gas. Please add more funds to your wallet.';
      } else if (error.code === 'NONCE_TOO_LOW') {
        errorMessage = 'Transaction nonce conflict. Please try again.';
      } else if (error.code === 4001) {
        errorMessage = 'Transaction was rejected. Please try again.';
      }
      
      return {
        success: false,
        error: errorMessage,
        code: error.code
      };
    }
  }

  /**
   * Sign message - USER MUST SIGN
   * @param {string} message - Message to sign
   * @returns {Promise<string>} Signature
   */
  async signMessage(message) {
    try {
      if (!this.signer) {
        throw new Error('No wallet connected. Please connect your wallet first.');
      }

      const signature = await this.signer.signMessage(message);
      console.log('Message signed successfully');
      return signature;

    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Get current wallet connection status
   * @returns {Object} Connection status
   */
  getConnectionStatus() {
    return {
      connected: !!this.account,
      account: this.account,
      chainId: this.chainId,
      wallet: this.connectedWallet,
      provider: !!this.provider,
      signer: !!this.signer
    };
  }

  /**
   * Check if wallet is connected to correct network
   * @param {string} expectedChainId - Expected chain ID
   * @returns {boolean} Network match status
   */
  isCorrectNetwork(expectedChainId) {
    return this.chainId === expectedChainId;
  }

  /**
   * Get wallet balance
   * @param {string} tokenAddress - Token contract address (null for native token)
   * @returns {Promise<string>} Balance in human readable format
   */
  async getBalance(tokenAddress = null) {
    try {
      if (!this.provider || !this.account) {
        throw new Error('No wallet connected');
      }

      if (tokenAddress) {
        // ERC20 token balance
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function balanceOf(address) view returns (uint256)'],
          this.provider
        );
        const balance = await tokenContract.balanceOf(this.account);
        return ethers.formatUnits(balance, 6); // Assuming USDC (6 decimals)
      } else {
        // Native token balance
        const balance = await this.provider.getBalance(this.account);
        return ethers.formatEther(balance);
      }

    } catch (error) {
      console.error('Failed to get balance:', error);
      return '0';
    }
  }
}

// Export singleton instance
export const walletService = new WalletService();
export default walletService;

# AutoYield AI

An intelligent DeFi vault that uses AI to monitor lending rates across protocols and automatically reallocate funds to optimize yield while managing risk through Trusted Execution Environments (TEEs).

## Overview

AutoYield AI is an autonomous asset management system that:
- Monitors DeFi lending rates (Aave, Benqi, etc.) in real-time
- Executes strategy decisions inside Intel SGX enclaves for front-running protection
- Provides verifiable execution with cryptographic proofs stored on-chain
- Maintains full audit trails and transparent decision-making

## Architecture

### System Design
```
User Wallet → Smart Contracts → TEE Decision Engine → Keeper Agent → Strategy Execution → Event Logging
```

### Key Components
- **Smart Contracts**: Vault management, strategy execution, and time-lock controls on 0G Chain
- **TEE Engine**: AI decision-making inside Intel SGX enclaves
- **Keeper Agent**: Autonomous execution with authorized gas wallet
- **Oracle Integration**: Real-time market data from DeFiLlama API
- **Storage Layer**: Decision logs and audit trails on 0G Storage

### Web3 Design Principles
1. **Self-Custody**: Users maintain control of funds via MetaMask/web3 wallets
2. **On-Chain State**: All financial data stored in smart contracts
3. **Verifiable Execution**: Every action cryptographically proven and publicly auditable
4. **Keeper Autonomy**: AI agent operates independently with gas wallet for execution

## Technical Implementation

### Decimal Precision
**Current Implementation**: Uses 18 decimals for all assets (including MockUSDC) for consistency with standard ERC-20 tutorials and Hardhat testing environments.

**Production Upgrade**: Will natively parse dynamic ERC-20 `decimals()` to support 6-decimal stablecoins (USDC/USDT) to prevent magnitude routing failures on mainnet deployment.

### Deployment Synchronization
**Issue**: When restarting a local Hardhat node with Express backend, ethers.js caches wallet nonces which can cause transaction failures.

**Solution**: Always restart both the Hardhat node and backend server together to reset nonce tracking and prevent transaction stalling.

### 0G Ecosystem Integration
| Component | Usage | Status |
|-----------|-------|---------|
| 0G Chain | Smart contracts for vault operations | Deployed |
| 0G Storage | Audit logs and decision records | Simulated |
| 0G Compute | TEE-based AI execution | Simulated |

### Security Implementation
**Current**: Uses ECDSA signature verification as a cryptographic proxy for Intel SGX hardware attestation.

**Production Roadmap**: Will implement Intel SGX DCAP attestation verifier for true hardware-level security guarantees.

### Oracle Security
**Current**: Market data ingested via off-chain oracles (DefiLlama API) fed to TEE for processing.

**Production**: Will integrate on-chain zero-knowledge oracles for end-to-end data verification.

## Risk Management

### Trust Scoring System
Comprehensive protocol assessment using 5-category scoring:
- **Security** (35%): Audit history, bug bounty, track record
- **Financial** (25%): TVL sustainability, revenue, treasury health
- **Market** (20%): Performance metrics, liquidity depth
- **Governance** (15%): Decentralization, voting mechanisms
- **Technical** (5%): Code quality, integration complexity

### Allocation Limits
| Trust Score | Grade | Max Allocation |
|-------------|-------|----------------|
| 85-100 | A+ | 50% |
| 70-84 | A | 35% |
| 55-69 | B | 20% |
| 40-54 | C | 10% |
| 0-39 | F | 5% |

### Security Considerations
Current Limitations:
- Oracle dependency on centralized data sources
- Simple rebalancing mechanics (100% withdrawal/redeposit)
- ECDSA signature verification (proxy for hardware attestation)
- Manual execution requirement for time-locked strategies

Production Roadmap:
- Direct on-chain oracle integration with ZK proofs
- Delta-rebalancing to minimize slippage
- Intel SGX DCAP hardware attestation
- Decentralized keeper networks for automation

## Technology Stack

- Frontend: React, Tailwind CSS, ethers.js
- Backend: Node.js, Express, 0G SDKs
- Smart Contracts: Solidity, Hardhat
- Security: Intel SGX TEEs, cryptographic proofs
- Storage: 0G Storage for audit trails
- Network: 0G Chain deployment

## Installation

### Prerequisites
- Node.js v18+
- npm v8+
- MetaMask wallet
- 0G Testnet ETH for gas

### Quick Start

1. **Deploy Contracts**
```bash
cd contracts
cp .env.example .env
# Configure PRIVATE_KEY and ZERO_G_RPC_URL
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network og
```

2. **Start Backend**
```bash
cd backend
cp .env.example .env
# Configure contract addresses and RPC URL
npm install
npm run dev
```

3. **Launch Frontend**
```bash
cd frontend
cp .env.example .env
# Configure contract addresses and API URL
npm install
npm run dev
# Frontend available at http://localhost:5173
```

## Usage

1. Connect MetaMask wallet to 0G Testnet
2. Deposit funds into the vault
3. Configure risk tolerance (conservative/moderate/aggressive)
4. Run AI strategy to generate optimized allocations
5. Monitor 24-hour time-lock for high-risk decisions
6. Verify execution on 0G Explorer

## Verification
All on-chain activity can be viewed on the 0G Explorer:
`https://explorer.0g.ai/address/<contract-address>`

Every rebalance emits a StrategyExecuted event with:
- APY and risk metrics
- TEE attestation proof
- Link to full reasoning stored in 0G Storage
- Cryptographic verification of execution integrity

## API Reference

### Agent Endpoints
- POST /api/agent/run - Execute AI strategy with TEE verification
- GET /api/agent/proposals - Get pending and executed proposals

### Vault Endpoints
- GET /api/vault/balance/:userAddress - Get user balance and shares
- POST /api/vault/deposit - Deposit funds into vault

### Protocol Endpoints
- GET /api/protocols - Get whitelisted protocols with risk scores

## Testing

```bash
# Smart contracts
cd contracts && npx hardhat test

# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

## Troubleshooting

Common Issues:
- Transaction failures: Restart both Hardhat node and backend server
- MetaMask connection: Add 0G Testnet (Chain ID: 16600, RPC: https://rpc.0g.ai)
- Backend connection: Verify API is running at http://localhost:3000/health

## Project Structure

```
AutoYield-AI/
├── frontend/          # React UI
├── backend/           # Node.js API
├── contracts/         # Solidity contracts
├── agent/             # AI decision engine
└── scripts/           # Utility scripts
```

## License

MIT License - see LICENSE for details.

---

AutoYield AI demonstrates TEE-based yield optimization with comprehensive security considerations and a clear production roadmap.
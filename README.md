# AutoYield AI

AutoYield AI is an intelligent DeFi yield optimization platform that uses artificial intelligence to automatically allocate user funds across various DeFi protocols while maximizing returns and minimizing risks. The platform implements a non-custodial architecture with Trusted Execution Environment (TEE) protection for verifiable finance.

## Features

- **Autonomous Yield Optimization**: AI-powered fund allocation across multiple DeFi protocols
- **Non-Custodial Architecture**: Users maintain full control of their funds through self-custodial wallets
- **TEE-Based Execution**: Front-running prevention through sealed inference in secure enclaves
- **Risk Management**: Enterprise-grade trust scoring and mathematical optimization
- **Time-Lock Security**: 24-hour waiting period for high-risk decisions with emergency override
- **On-Chain Verification**: All actions cryptographically proven and publicly auditable

## Architecture

AutoYield AI implements a Keeper-as-a-Service architecture:

```
User (Self-Custodial Wallet) 
   → Direct Contract Calls (ethers.js) 
      → TEE Decision Engine (0G Compute) 
         → Keeper Agent (Authorized on 0G Chain) 
            → StrategyManager (Time-Lock on 0G Chain) 
               → Vault Rebalance (0G Chain) 
                  → Event emitted (0G Chain)
                  → Decision Log stored (0G Storage)
```

### Core Components

- **AutoYieldVault (ERC-4626)**: Tokenized vault for user deposits
- **StrategyManager**: Core contract for AI strategy execution with time-lock
- **AgentRegistry**: Manages authorized AI agent callers
- **Decision Engine**: Mathematical optimization engine with risk-adjusted scoring

## Tech Stack

- **Frontend**: React, Tailwind CSS, ethers.js
- **Backend**: Node.js, Express, ethers.js
- **Smart Contracts**: Solidity (Hardhat), deployed on 0G
- **Security**: Intel SGX TEEs, cryptographic proofs
- **Storage/Compute**: 0G native services integration

## Installation

### Prerequisites

- Node.js v18.0.0 or higher
- npm v8.0.0 or higher
- MetaMask or compatible Web3 wallet
- 0G Testnet RPC access

### Quick Start

1. **Deploy Contracts**
   ```bash
   cd contracts
   npm install
   npx hardhat run scripts/deploy.js --network og
   ```

2. **Start Backend**
   ```bash
   cd ../backend
   npm install
   npm run dev
   ```

3. **Start Frontend**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. **Access Application**
   - Open http://localhost:5173
   - Connect MetaMask wallet to 0G Testnet

## Project Structure

```
autoyield-ai/
├── frontend/          # React UI with Web3 integration
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API and blockchain services
│   │   └── App.jsx        # Main application
│   └── package.json
├── backend/           # Node.js API with 0G SDK integration
│   ├── src/
│   │   ├── controllers/   # API route handlers
│   │   ├── services/      # Business logic and 0G integration
│   │   └── routes/        # API endpoints
│   └── package.json
├── contracts/         # Solidity smart contracts
│   ├── contracts/        # Smart contract source files
│   ├── scripts/          # Deployment scripts
│   └── hardhat.config.js # Hardhat configuration
├── agent/             # AI decision engine
│   └── decisionEngine.js # Mathematical optimization logic
└── scripts/           # Utility scripts and deployment
```

## Trust Scoring System

The platform uses a comprehensive trust scoring system to assess protocol risk:

### Risk Assessment Formula

```
Trust Score = (Security × 0.35) + (Financial × 0.25) + (Market × 0.20) + (Governance × 0.15) + (Technical × 0.05)
```

### Dynamic Allocation Limits

| Trust Score Range | Grade | Max Allocation | Risk Category |
|------------------|-------|----------------|---------------|
| 85-100 | A+ | 50% | Excellent |
| 70-84 | A | 35% | Good |
| 55-69 | B | 20% | Moderate |
| 40-54 | C | 10% | Poor |
| 0-39 | F | 5% | High Risk |

## API Documentation

### Agent Endpoints

#### `POST /api/agent/run`
Execute AI strategy with TEE verification

#### `GET /api/agent/proposals`
Get all pending and executed proposals

### Vault Endpoints

#### `GET /api/vault/balance/:userAddress`
Get user's vault balance and shares

#### `POST /api/vault/deposit`
Deposit funds into vault

### Protocol Endpoints

#### `GET /api/protocols`
Get all whitelisted protocols with risk scores

## Security Features

- **TEE Protection**: AI decisions executed in secure enclaves
- **Time-Lock Mechanism**: 24-hour waiting period for high-risk decisions
- **Risk Management**: Portfolio risk constraint enforcement
- **Access Control**: Agent registry for authorization management
- **Audit Trail**: Complete on-chain verification

## Important Notes

### Decimal Precision
The current implementation uses 18 decimals for all assets. Production deployment will support dynamic ERC-20 decimals for 6-decimal stablecoins.

### Nonce Management
When running a local Hardhat node, restart both the node and backend server together to prevent nonce cache issues.

## License

MIT License - see LICENSE file for details.

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## Support

- GitHub: https://github.com/Edwin420s/AutoYield-AI
- Email: support@autoyield.ai
- Documentation: See PROJECT_DOCUMENTATION.md for detailed technical information

## Important Notes

### Decimal Precision
The current implementation uses 18 decimals for all assets. Production deployment will support dynamic ERC-20 decimals for 6-decimal stablecoins.

### Nonce Management
When running a local Hardhat node, restart both the node and backend server together to prevent nonce cache issues.

### TEE Implementation
Current implementation uses ECDSA signature verification as a proxy for hardware attestation. Production deployment will integrate Intel SGX DCAP attestation.

## System Architecture

```
User (Self-Custodial Wallet) 
   → Direct Contract Calls (ethers.js) 
      → TEE Decision Engine (0G Compute) 
         → Keeper Agent (Authorized on 0G Chain) 
            → StrategyManager (Time‑Lock on 0G Chain) 
               → Vault Rebalance (0G Chain) 
                  → Event emitted (0G Chain)
                  → Decision Log stored (0G Storage)
```

### Web3 Design Principles
1. **Blockchain as Database:** All financial state stored in smart contracts, not backend
2. **User Self-Custody:** Funds never leave user's wallet control without explicit approval
3. **Keeper Autonomy:** AI agent operates as independent keeper with gas wallet for execution
4. **Verifiable Execution:** Every action cryptographically proven and publicly auditable

## Verification

All on-chain activity can be viewed on the **0G Explorer**:  
`https://explorer.0g.ai/address/<contract-address>`  

Every rebalance emits a `StrategyExecuted` event with:
- APY and risk metrics
- TEE attestation proof
- Link to full reasoning stored in 0G Storage
- Cryptographic verification of execution integrity

## Troubleshooting

### Common Issues

**Contract Deployment Failed:**
- Check your `PRIVATE_KEY` in contracts/.env
- Verify `ZERO_G_RPC_URL` is accessible
- Ensure you have testnet ETH for gas fees

**Backend Connection Failed:**
- Verify backend is running: `curl http://localhost:3000/health`
- Check `VITE_API_URL` in frontend/.env
- Ensure ports 3000 and 5173 are not blocked

**MetaMask Connection Issues:**
- Add 0G Testnet to MetaMask:
  - Network Name: 0G Testnet
  - RPC URL: https://rpc.0g.ai
  - Chain ID: 16600
  - Currency Symbol: ETH

**Nonce Errors:**
- Restart both Hardhat node and backend server
- Reset MetaMask account (Advanced → Reset Account)

## Testing

### Running Tests
```bash
# Smart Contracts
cd contracts && npx hardhat test

# Backend
cd backend && npm test

# Frontend  
cd frontend && npm test
```

### Test Coverage
- **Smart Contracts:** 85%+ coverage on critical functions
- **Backend Services:** 80%+ coverage on API endpoints
- **Frontend Components:** 70%+ coverage on UI interactions

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Attribution
When using or modifying this code, please maintain the original attribution:
```
AutoYield AI - V1 Architectural Prototype
Copyright (c) 2024 AutoYield AI Contributors
```

## Third-Party Licenses

This project uses open-source dependencies with their respective licenses:
- **OpenZeppelin Contracts:** MIT License
- **React:** MIT License  
- **Hardhat:** MIT License
- **0G SDKs:** Apache 2.0 License

For a complete list, see `package.json` files in each directory.

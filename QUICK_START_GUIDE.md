# AutoYield AI - Quick Start Guide

## Complete Setup Instructions

### 1. Smart Contracts (Backend Foundation)
```bash
cd contracts
cp .env.example .env   # Fill PRIVATE_KEY and ZERO_G_RPC_URL
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network og
```

**Save the deployed addresses!** You'll need them for the backend and frontend.

### 2. Backend API (Node.js)
```bash
cd backend
cp .env.example .env   # Fill with deployed contract addresses
npm install
npm run dev
```

Backend will run on: `http://localhost:3000`

### 3. Frontend (React)
```bash
cd frontend
cp .env.example .env   # Fill with deployed contract addresses
npm install
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Environment Configuration

### Backend .env Required Variables:
```
ZERO_G_RPC_URL=https://rpc.0g.ai
PRIVATE_KEY=your_private_key_here
MANAGER_ADDRESS=0x...  # From deployment
VAULT_ADDRESS=0x...     # From deployment
REGISTRY_ADDRESS=0x...   # From deployment
ZERO_G_COMPUTE_URL=https://compute.0g.ai
PORT=3000
```

### Frontend .env Required Variables:
```
VITE_RPC_URL=https://rpc.0g.ai
VITE_VAULT_ADDRESS=0x...    # From deployment
VITE_MANAGER_ADDRESS=0x...   # From deployment
VITE_REGISTRY_ADDRESS=0x...  # From deployment
VITE_API_URL=http://localhost:3000/api
```

## Testing the System

### 1. Deploy Everything
1. Deploy smart contracts to 0G testnet
2. Start backend server
3. Start frontend application

### 2. Test AI Strategy Flow
1. **Connect Wallet** - Click "Connect Wallet" in frontend
2. **View Oracle Data** - See live DeFi yields in Market Oracle Feed
3. **Run AI Strategy** - Click "Run AI Strategy" to:
   - Fetch live market data from DefiLlama
   - Send to 0G Compute TEE for verifiable execution
   - Submit strategy proposal to blockchain with 24-hour time-lock
4. **Monitor Proposals** - View pending strategies in the Time-Lock Waiting Room
5. **Execute Strategy** - After 24 hours, execute the strategy

### 3. Key Features Demonstrated

- **TEE-Based AI Execution**: AI decisions run in Intel SGX enclaves  
- **Front-Running Protection**: Strategies are sealed until execution  
- **24-Hour Time-Lock**: Emergency stop mechanism for high-risk decisions  
- **Live Oracle Data**: Real-time DefiLlama yield data  
- **Physical Asset Routing**: ERC-4626 vault actually moves tokens to DeFi protocols  
- **Trust Scoring Engine**: Dynamic risk assessment based on TVL and audit history  
- **On-Chain Verification**: Smart contracts verify TEE attestation signatures  

## Hackathon Winning Features

### Track 2: Agentic Trading Arena Requirements Met:
- **Sealed Inference**: AI executes in TEE enclaves
- **TEE-Based Execution**: Full SGX attestation and verification
- **Front-Running Prevention**: Strategy privacy maintained until execution
- **Verifiable Finance**: All decisions cryptographically proven
- **Risk Management**: Enterprise-grade trust scoring engine
- **Autonomous Operation**: Minimal human intervention required

### 0G Ecosystem Integration:
- **0G Chain**: Smart contracts deployed and verified
- **0G Storage**: Audit reports and decision logs stored
- **0G Compute**: AI decision engine runs in TEE

## Demo Script for Hackathon

Follow the demo script in `DEMO_VIDEO_SCRIPT.md` for your 3-minute video presentation:

1. **Introduction** (30s) - Project overview and Track 2 focus
2. **Architecture Tour** (45s) - Show system diagram and 0G integration
3. **Live Demo** (60s) - Connect wallet, run AI strategy, show TEE verification
4. **Time-Lock Demo** (30s) - Show 24-hour waiting period and emergency stop
5. **Verification** (15s) - Show blockchain explorer and 0G storage proof

## Troubleshooting

### Common Issues:
1. **"Contract not deployed"**: Check PRIVATE_KEY and RPC_URL in contracts/.env
2. **"Backend can't connect"**: Verify contract addresses in backend/.env
3. **"Frontend shows no data"**: Check VITE_API_URL in frontend/.env
4. **"TEE execution fails"**: Ensure ZERO_G_COMPUTE_URL is accessible

### Debug Commands:
```bash
# Check contract deployment
npx hardhat run scripts/verify-deployment.js --network og

# Test backend API
curl http://localhost:3000/health

# Check frontend build
cd frontend && npm run build
```

## Production Deployment

For production deployment:
1. Deploy contracts to 0G mainnet
2. Host backend on Railway/Vercel
3. Host frontend on Vercel with environment variables
4. Update all .env files with mainnet addresses
5. Verify contracts on 0G Explorer

Ready to win the 0G APAC Hackathon!

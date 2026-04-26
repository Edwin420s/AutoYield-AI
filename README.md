# AutoYield AI – Autonomous Yield Optimizer on 0G

**One‑liner:** An autonomous AI agent that continuously reallocates user funds across DeFi protocols to maximize yield, with verifiable execution on the 0G modular stack.

## 🧠 Overview
AutoYield AI is an intelligent DeFi vault that uses AI to monitor lending rates (Aave, Benqi, etc.) and automatically move funds to the highest‑yielding opportunity while respecting risk limits. Unlike simple bots, every decision is validated on‑chain via **0G Chain**, the reasoning is stored on **0G Storage**, and the AI logic runs on **0G Compute**. The result is a fully transparent, auditable, and autonomous asset manager.

## 🔗 0G Integration – All Three Pillars
| Component | Usage in AutoYield AI |
|-----------|-----------------------|
| **0G Chain** | Smart contracts (`AutoYieldVault`, `StrategyManager`, `AgentRegistry`) deployed on 0G mainnet. All rebalance actions and agent permissions are permanent on‑chain events. |
| **0G Storage** | Full AI decision logs (protocols, percentages, reasons) are stored off‑chain for history and auditability. |
| **0G Compute** | The AI strategy engine runs as a compute job, producing the optimal allocation that is then executed on‑chain. |

## 🏗️ Architecture
```
User (Frontend) 
   → Backend (Agent Trigger) 
      → AI Decision Engine (0G Compute) 
         → StrategyManager (on‑chain) 
            → Vault Rebalance (on‑chain) 
               → Event emitted (0G Chain)
               → Log stored (0G Storage)
```

## 🛠️ Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Recharts, ethers.js
- **Backend:** Node.js, Express, ethers.js
- **Smart Contracts:** Solidity (Hardhat), deployed on 0G
- **Storage/Compute:** 0G native services (mock SDKs in MVP)

## 🚀 Quick Start (Local)

### 1. Smart Contracts
```bash
cd contracts
cp .env.example .env   # fill PRIVATE_KEY and RPC_URL
npm install
npx hardhat run scripts/deploy.js --network og
```
Save the deployed addresses for the next step.

### 2. Backend
```bash
cd backend
cp .env.example .env   # fill PRIVATE_KEY, RPC_URL, contract addresses
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env   # set VITE_RPC_URL, contract addresses
npm install
npm run dev
```

### 4. AI Agent (optional, included in backend)
The agent logic runs automatically when you call `POST /api/agent/run` or trigger from the UI.

## 🔍 Verification
All on‑chain activity can be viewed on the **0G Explorer**:  
`https://explorer.0g.ai/address/<contract-address>`  
Every rebalance emits a `StrategyExecuted` event with APY, risk, and a link to the full reasoning stored in 0G Storage.

## 🎥 Demo Script
1. Connect wallet → deposit ETH into the vault.
2. The dashboard shows current APY across protocols.
3. Click **Run AI Strategy** – the agent evaluates protocols, selects the best allocation.
4. Activity log updates live with the transaction hash – click to verify on block explorer.
5. Highlight the three 0G components used and the safety guardrails in `StrategyManager`.

## ✅ Hackathon Submission Checklist
- [x] Project name, short description
- [x] GitHub repo (public)
- [x] 0G Mainnet contract address + explorer link
- [x] Demo video (<3min, showing AI execution and on‑chain proof)
- [x] README with architecture and integration proof
- [x] Public X post with #0GHackathon #BuildOn0G tagging @0G_labs @HackQuest_

## 📁 Project Structure
```
autoyield-ai/
├── frontend/          # React UI with wallet integration
├── backend/           # Node.js API server
├── contracts/         # Solidity smart contracts
├── agent/             # AI decision engine
└── README.md
```

Everything is now built and ready for the 0G APAC Hackathon.

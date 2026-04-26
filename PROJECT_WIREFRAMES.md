# AutoYield AI - Project Wireframes & Architecture

## 🎯 Project Overview
**AutoYield AI** is an autonomous yield optimization platform that combines AI decision-making with blockchain security to maximize DeFi returns while minimizing risk.

## 🏗️ System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend UI   │    │   Backend API   │    │  Smart Contracts│
│   (React)       │◄──►│   (Node.js)     │◄──►│   (0G Chain)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       ▼
         │              ┌─────────────────┐    ┌─────────────────┐
         │              │   AI Agent      │    │   0G Storage    │
         │              │ (Decision Engine)│    │ (Audit Reports)│
         │              └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Wallet   │    │   0G Compute    │    │  0G Explorer    │
│   (MetaMask)    │    │   (AI Processing)│    │ (Verification)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📱 Frontend Wireframes

### 1. Dashboard (Main View)
```
┌─────────────────────────────────────────────────────────────────┐
│ AutoYield AI                                    🔔 📊 ⚙️ 👤 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Portfolio Overview                                             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐│
│  │ Total Value │ │   APY       │ │   Risk      │ │   Status    ││
│  │   $12,450   │ │   8.7%      │ │   45/100    │ │   Active    ││
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘│
│                                                                 │
│  Quick Actions                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐    │
│  │ 💰 Deposit      │ │ 🤖 Run AI       │ │ 📋 View History │    │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘    │
│                                                                 │
│  Current Allocations                                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 📊 Allocation Chart (Pie/Bar)                              ││
│  │ • Aave: 60% ($7,470)                                       ││
│  │ • Benqi: 30% ($3,735)                                      ││
│  │ • Compound: 10% ($1,245)                                    ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 2. Time-Lock Waiting Room
```
┌─────────────────────────────────────────────────────────────────┐
│ ⏳ Time-Lock Waiting Room                              [Refresh] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Pending Proposals: 2                                           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Proposal #15                                [⏰ 14h 23m left]││
│  │ Proposed by: 0x7d27...8dE2                                   ││
│  │ Expected APY: 12.3% | Risk: 68/100                           ││
│  │                                                               ││
│  │ 📋 Allocation:                                                ││
│  │ • Aave: 50% (Risk: 25)                                       ││
│  │ • Benqi: 30% (Risk: 40)                                      ││
│  │ • NewProtocol: 20% (Risk: 75) ⚠️                            ││
│  │                                                               ││
│  │ [🛑 Emergency Cancel] [⏳ Time-Lock Active]                   ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Proposal #14                                    [✅ Ready Now]││
│  │ Proposed by: 0x7d27...8dE2                                   ││
│  │ Expected APY: 9.1% | Risk: 42/100                            ││
│  │                                                               ││
│  │ 📋 Allocation: Aave 70%, Compound 30%                        ││
│  │                                                               ││
│  │ [🛑 Emergency Cancel] [✅ Execute Strategy]                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 3. Protocol Registry (Admin View)
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔐 Protocol Registry                                    [+ Add] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Search: [Aave...]                                                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🏦 Aave Protocol                               ⭐ Whitelisted││
│  │ Address: 0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9         ││
│  │ Risk Score: 25/100 | Last Updated: 2024-01-15               ││
│  │ 📋 Audit: Certik Report (🔗 0G Storage: QmX...abc)          ││
│  │ [📝 Edit] [❌ Remove] [📋 View Audit]                        ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🏦 Benqi Protocol                              ⭐ Whitelisted││
│  │ Address: 0x4F3A8B69D7246B6C5b2c5c5c5c5c5c5c5c5c5c5c         ││
│  │ Risk Score: 40/100 | Last Updated: 2024-01-10               ││
│  │ 📋 Audit: OpenZeppelin Report (🔗 0G Storage: QmY...def)     ││
│  │ [📝 Edit] [❌ Remove] [📋 View Audit]                        ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 4. AI Decision Explanation
```
┌─────────────────────────────────────────────────────────────────┐
│ 🤖 AI Decision Analysis                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📊 Strategy: Conservative Diversification                      │
│  🎯 Confidence: 85%                                             │
│  ⏰ Generated: 2 minutes ago                                    │
│                                                                 │
│  💡 Reasoning:                                                  │
│  "Market shows elevated risk levels (avg: 62/100).             │
│   Implementing conservative diversification across              │
│   top 3 protocols to minimize exposure while                   │
│   maintaining competitive returns."                            │
│                                                                 │
│  📈 Expected Performance:                                        │
│  • Expected APY: 8.7%                                           │
│  • Risk-Adjusted APY: 6.2%                                      │
│  • Portfolio Risk: 45/100                                       │
│                                                                 │
│  🔍 Protocol Analysis:                                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ 🏦 Aave: Selected for stability (Risk: 25, APY: 5.0%)     ││
│  │    ✅ Low risk, proven track record                          ││
│  │                                                               ││
│  │ 🏦 Benqi: Selected for higher returns (Risk: 40, APY: 8.1%)  ││
│  │    ⚠️ Moderate risk, good diversification                    ││
│  │                                                               ││
│  │ 🏦 Compound: Small allocation (Risk: 15, APY: 4.2%)         ││
│  │    ✅ Very low risk, portfolio stabilizer                    ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  [📊 View Detailed Charts] [⚙️ Adjust Parameters]               │
└─────────────────────────────────────────────────────────────────┘
```

## 🔧 Backend Architecture

### API Endpoints Structure
```
/api/agent/
├── POST /run                    # Execute AI strategy
├── GET /proposals              # Get all proposals
├── POST /proposals/:id/execute # Execute proposal
├── POST /proposals/:id/cancel  # Cancel proposal
└── GET /decision/:id           # Get AI decision details

/api/protocols/
├── GET /                       # Get all protocols
├── POST /                      # Add new protocol (admin)
├── PUT /:address               # Update protocol (admin)
└── GET /:address               # Get protocol details

/api/vault/
├── GET /balance                # Get user balance
├── POST /deposit               # Deposit funds
├── POST /withdraw              # Withdraw funds
└── GET /allocations            # Current allocations

/api/storage/
├── POST /upload                # Upload to 0G Storage
├── GET /:hash                  # Retrieve from 0G Storage
└── GET /stats                  # Storage statistics
```

### Service Layer Architecture
```
Services/
├── agentService.js          # Main AI orchestration
├── contractService.js        # Blockchain interactions
├── apyService.js            # Market data fetching
├── 0gStorageService.js      # 0G Storage integration
├── 0gComputeService.js      # 0G Compute integration
└── riskAssessmentService.js # Advanced risk calculations
```

## ⛓️ Smart Contract Architecture

### Contract Interaction Flow
```
1. AI Decision → Backend Service → Smart Contract
2. Low Risk: Immediate Execution
3. High Risk: Time-Lock Proposal → 24h Wait → Execution/Cancellation
4. All Actions: 0G Storage Logging → 0G Explorer Verification
```

### Contract Functions
```
StrategyManager.sol
├── Protocol Management
│   ├── updateProtocol()           # Add/update protocol
│   ├── batchUpdateProtocols()     # Batch operations
│   └── getProtocolInfo()          # Get protocol details
│
├── Strategy Execution
│   ├── proposeStrategy()          # Time-lock proposal
│   ├── executeProposedStrategy()  # Execute after time-lock
│   ├── cancelProposal()           # Emergency cancel
│   └── executeStrategy()          # Immediate execution
│
├── View Functions
│   ├── getProposal()              # Get proposal details
│   ├── proposalCount()            # Total proposals
│   └── getProtocolInfo()          # Protocol registry
│
└── Admin Functions
    ├── setTimeLockDuration()      # Adjust time-lock
    ├── setMaxPortfolioRisk()      # Risk threshold
    └── transferOwnership()        # Ownership transfer
```

## 🎨 UI/UX Design System

### Color Palette
```css
/* Primary Colors */
--primary-blue: #3B82F6;
--primary-green: #10B981;
--primary-red: #EF4444;
--primary-yellow: #F59E0B;

/* Dark Theme */
--bg-primary: #111827;
--bg-secondary: #1F2937;
--bg-tertiary: #374151;
--text-primary: #F9FAFB;
--text-secondary: #D1D5DB;
--text-tertiary: #9CA3AF;

/* Risk Colors */
--risk-low: #10B981;
--risk-medium: #F59E0B;
--risk-high: #EF4444;
```

### Component Library
```
Components/
├── Dashboard/
│   ├── PortfolioCard.jsx
│   ├── AllocationChart.jsx
│   └── QuickActions.jsx
├── Proposals/
│   ├── PendingProposals.jsx
│   ├── ProposalCard.jsx
│   └── TimeLockTimer.jsx
├── Protocols/
│   ├── ProtocolRegistry.jsx
│   ├── ProtocolCard.jsx
│   └── AuditViewer.jsx
├── AI/
│   ├── DecisionExplanation.jsx
│   ├── StrategyAnalysis.jsx
│   └── RiskAssessment.jsx
└── Common/
    ├── WalletConnect.jsx
    ├── LoadingSpinner.jsx
    └── NotificationSystem.jsx
```

## 🚀 Deployment Architecture

### Development Environment
```
Frontend: Vite + React (localhost:5173)
Backend: Node.js + Express (localhost:3000)
Contracts: Hardhat Local Network
Storage: Local 0G Storage Node
```

### Production Environment
```
Frontend: Vercel/Netlify
Backend: Railway/Heroku
Contracts: 0G Mainnet
Storage: 0G Storage Network
DNS: Cloudflare
```

## 📊 Data Flow Diagram

```
User Action → Frontend → Backend API → Smart Contract → Blockchain
     ↓              ↓           ↓              ↓            ↓
   UI Update    HTTP Request  Validation    Transaction   Block Mining
     ↓              ↓           ↓              ↓            ↓
   Display     Response     0G Storage    Event Emit    0G Explorer
     ↓              ↓           ↓              ↓            ↓
   Refresh     JSON Data   Audit Log    Frontend    Verification
```

## 🎯 Key Features Summary

### ✅ Implemented Features
1. **On-Chain Whitelist & Risk Registry** - Protocol validation system
2. **24-Hour Time-Lock** - Emergency stop mechanism for high-risk decisions
3. **Enhanced AI Engine** - Risk-adjusted portfolio optimization
4. **0G Storage Integration** - Decentralized audit report storage
5. **Real-time Dashboard** - Live proposal tracking and execution
6. **Protocol Registry UI** - Admin interface for protocol management
7. **Decision Explanation** - Transparent AI reasoning display

### 🔄 Future Enhancements
1. **Multi-chain Support** - Expand beyond 0G Chain
2. **Advanced AI Models** - Machine learning integration
3. **Social Trading** - Copy successful strategies
4. **Mobile App** - iOS/Android native applications
5. **DAO Governance** - Community protocol approval system

## 🏆 Hackathon Competitive Advantages

1. **Security-First Design** - Time-lock prevents flash crashes
2. **Verifiable AI** - All decisions stored on 0G Storage
3. **Risk Management** - Sophisticated portfolio risk assessment
4. **User Control** - Emergency stop and override mechanisms
5. **Transparency** - Full audit trail on blockchain
6. **0G Integration** - Deep integration with all 0G components

This architecture positions AutoYield AI as a leading example of safe, autonomous DeFi management, perfectly aligned with the 0G hackathon's focus on verifiable AI x Web3 applications.

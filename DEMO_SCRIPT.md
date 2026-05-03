# AutoYield AI - Hackathon Demo Script

## Demo Overview
**Time**: 5-7 minutes  
**Focus**: Autonomous DeFi Yield Optimization with TEE Protection  
**Target**: 0G APAC Hackathon 2026 - Track 2: Agentic Trading Arena

---

## Demo Checklist
- [ ] Frontend loaded at http://localhost:5173
- [ ] Backend running at http://localhost:3000
- [ ] Wallet connected (MetaMask/Yoroi/Eternl)
- [ ] Live oracle data showing 15 protocols
- [ ] Ready to execute AI strategy

---

## Demo Script

### **1. Introduction (30 seconds)**
"Welcome to AutoYield AI - the autonomous DeFi yield optimizer powered by 0G Compute's Trusted Execution Environment. 

Our system uses AI to automatically optimize yield across DeFi protocols while ensuring security through TEE-protected execution and front-running prevention."

**Key Points to Highlight:**
- Real-time DeFi protocol analysis
- AI-driven portfolio optimization  
- TEE cryptographic protection
- 24-hour time-lock security

---

### **2. Live Market Data (45 seconds)**
"Let me show you the live market data we're working with."

**Actions:**
- Point to the Live Oracle Feed section
- Highlight 15 DeFi protocols with real APYs
- Show risk scores (20/100 to 70/100)
- Mention data source: "Powered by DefiLlama decentralized oracles"

**Talking Points:**
"We're pulling real-time data from 15 different DeFi protocols including Aave, Compound, Uniswap, and Curve. Each protocol shows current APY, TVL, and calculated risk scores. This data is piped directly into our 0G Compute TEE for secure processing."

---

### **3. Portfolio Dashboard (30 seconds)**
"Here's our user portfolio dashboard showing $50,000 of USDC ready for optimization."

**Actions:**
- Point to Total Assets: $50,000 USDC
- Show Current APY: 0.00% (no active strategies yet)
- Highlight "Your Shares: 0" (new user)

**Talking Points:**
"Currently showing $50,000 of capital ready for deployment. The APY is 0% because we haven't executed any strategies yet. That's exactly what our AI is going to optimize."

---

### **4. AI Strategy Execution (2 minutes)**
"Now for the exciting part - let's execute our AI strategy!"

**Actions:**
1. Click "Run AI Strategy" button
2. Watch the TEE Console logs in real-time
3. Explain each step as it appears

**TEE Console Script:**
"Watch what happens in our TEE Console:"

- **"Initializing 0G Compute TEE Connection..."** 
  "First, we establish a secure connection to the Trusted Execution Environment"

- **"TEE Service Initialized"**
  "Our TEE service is ready to process sensitive financial data"

- **"Fetching Live Market Data (DefiLlama API)..."**
  "We're fetching the latest market data from 15 protocols"

- **"Retrieved 15 protocols"**
  "Perfect! We have current market conditions"

- **"Sealing Market Data for TEE Processing..."**
  "This is critical - we're sealing the data inside the TEE so no one can tamper with it"

- **"Running AI in Trusted Execution Environment..."**
  "Our AI is now running inside the secure enclave, making decisions based on real market data"

- **"TEE Decision Completed (Job: tee_job_xxx)"**
  "The AI has made its decision! Let's see what it selected"

- **"Attestation Verified: {...}"**
  "This is the cryptographic proof that our AI ran securely inside the TEE"

- **"Strategy: 2 protocols selected"**
  "The AI selected 2 optimal protocols from the 15 available"

- **"Strategy Submitted! TX: 0x19dd072b..."**
  "The strategy has been submitted to the blockchain with cryptographic proof!"

---

### **5. Time-Lock Waiting Room (1 minute)**
"Now let's check our Time-Lock Waiting Room to see the submitted strategy."

**Actions:**
- Scroll to Time-Lock Waiting Room section
- Show Proposal #1 details
- Point to the countdown timer (should now show proper time)

**Talking Points:**
"Here's our submitted strategy in the Time-Lock Waiting Room:

- **Proposal #1**: Aave (60%) and Benqi (40%)
- **Expected APY**: 8.5% (much better than 0%!)
- **Time Left**: 23h XXm remaining
- **Security**: 24-hour time-lock prevents front-running

The AI determined that allocating 60% to Aave and 40% to Benqi would give us the best risk-adjusted return at 8.5% APY."

---

### **6. Security & TEE Features (1 minute)**
"What makes AutoYield AI special is our security model."

**Key Security Features to Highlight:**

**TEE Protection**
- AI decisions made inside secure enclave
- Cryptographic attestation proves execution integrity
- No tampering possible with market data or decisions

**Front-running Prevention**
- 24-hour time-lock prevents MEV attacks
- All strategies are public before execution
- Fair execution for all users

**Real-time Processing**
- Live oracle feeds every few seconds
- AI responds to market conditions immediately
- No delays in decision making

---

### **7. Technical Architecture (30 seconds)**
"Our system combines multiple cutting-edge technologies:"

**Architecture Overview:**
- **Frontend**: React with real-time updates
- **Backend**: Node.js with TEE integration
- **Oracle**: DefiLlama decentralized data feeds
- **Blockchain**: Smart contracts with time-lock security
- **AI**: Decision engine running in 0G Compute TEE

---

### **8. Conclusion & Impact (30 seconds)**
"AutoYield AI represents the future of automated DeFi yield optimization:

**Autonomous**: No manual portfolio management required
**Secure**: TEE protection ensures trustworthy execution  
**Efficient**: AI optimizes across 15+ protocols in real-time
**Fair**: Time-lock prevents front-running and MEV attacks

We're making sophisticated yield farming accessible to everyone while maintaining the highest security standards through 0G's Trusted Execution Environment."

**Call to Action:**
"This is just the beginning. Imagine expanding this to cross-chain strategies, more complex derivatives, and institutional-grade portfolio management - all protected by TEE technology."

---

## Demo Success Metrics

### **Technical Success:**
- All services running without errors
- Real-time data flowing correctly
- AI strategy executing successfully
- TEE attestation working
- Time-lock system functional

### **User Experience Success:**
- Clean, intuitive interface
- Real-time feedback and updates
- Clear strategy information
- Security features visible

### **Innovation Success:**
- TEE-protected DeFi automation
- Real-time AI decision making
- Front-running prevention
- Cryptographic proof generation

---

## Troubleshooting Guide

### **If Frontend Not Loading:**
```bash
cd frontend && npm run dev
```

### **If Backend Not Responding:**
```bash
cd backend && npm run dev
```

### **If AI Strategy Fails:**
- Check backend logs for ENS errors
- Verify oracle data is loading
- Ensure TEE service is initialized

### **If Time-Lock Shows NaN:**
- Refresh the page
- Check proposal data structure
- Verify executeAfter timestamp format

---

## Ready for Hackathon!

Your AutoYield AI system is now fully operational and ready to impress the judges. The demo showcases:

1. **Real-world DeFi integration** with live data
2. **Cutting-edge TEE technology** for security
3. **AI-powered automation** for optimization
4. **Complete user experience** from interface to execution

Good luck at the 0G APAC Hackathon 2026!

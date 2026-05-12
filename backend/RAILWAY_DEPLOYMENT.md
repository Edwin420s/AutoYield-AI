# Railway Deployment Guide for AutoYield AI Backend

## 🚀 Deploy to Railway

### Prerequisites
- Railway account (free tier available)
- GitHub repository with the backend code
- 0G Newton Testnet private key with gas funds

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Deploy on Railway
1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Select the `backend` folder
5. Railway will automatically detect Node.js project

### Step 3: Configure Environment Variables
In Railway dashboard, add these environment variables:

#### Critical Variables
```
NODE_ENV=production
PORT=3000
ZERO_G_RPC_URL=https://evmrpc-testnet.0g.ai
RPC_URL=https://evmrpc-testnet.0g.ai
PRIVATE_KEY=your_0g_testnet_private_key
```

#### Contract Addresses
```
MANAGER_ADDRESS=0x00CAC06Dd0BB4103f8b62D280fE9BCEE8f26fD59
VAULT_ADDRESS=0xAD2935E147b61175D5dc3A9e7bDa93B0975A43BA
REGISTRY_ADDRESS=0xd753c12650c280383Ce873Cc3a898F6f53973d16
UNDERLYING_ASSET=0x10e38eE9dd4C549b61400Fc19347D00eD3edAfC4
```

#### Additional Config
```
ZERO_G_ENCLAVE_KEY=0x64e552ee5b6E57888fA72cf2211C16BAbC3806f7
ZERO_G_COMPUTE_URL=https://compute.0g.ai
FRONTEND_URL=https://your-frontend-domain.com
```

### Step 4: Deploy
- Click "Deploy" button
- Railway will build and deploy your backend
- Wait for deployment to complete (2-3 minutes)

### Step 5: Get Your URL
Once deployed, Railway will provide:
- **Backend URL**: `https://your-app-name.railway.app`
- **Health Check**: `https://your-app-name.railway.app/health`

### Step 6: Update Frontend
Update your frontend `.env` file:
```
VITE_API_URL=https://your-app-name.railway.app/api
```

## 🌐 Alternative Deployment Options

### Vercel (Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Neon (PostgreSQL + Node)
1. Create Neon project
2. Deploy via Railway with Neon connection string
3. Add Redis via Railway add-on

## 🔧 Troubleshooting

### Common Issues
1. **Build fails**: Check `package.json` and dependencies
2. **Runtime errors**: Verify environment variables
3. **CORS issues**: Update `FRONTEND_URL` in environment

### Health Check
Your deployed backend should respond to:
```bash
curl https://your-app-name.railway.app/health
```

## 📊 Monitoring
- Railway provides built-in logs and metrics
- Monitor API calls and blockchain interactions
- Set up alerts for production issues

## 🔄 Continuous Deployment
- Railway automatically deploys on git push
- Set up preview deployments for testing
- Use environment-specific configurations

## 🛡️ Security Notes
- Never commit private keys to git
- Use Railway's encrypted environment variables
- Enable Railway's built-in security features
- Monitor for unauthorized access

## 📱 Support
- Railway documentation: docs.railway.app
- 0G Newton Testnet: docs.0g.ai
- AutoYield AI: Check project README

#!/bin/bash

# 🚀 AutoYield AI Backend Deployment Script
# Deploy to Railway, Vercel, or Neon

set -e

echo "🚀 AutoYield AI Backend Deployment"
echo "=================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Initializing..."
    git init
    git add .
    git commit -m "Initial commit - AutoYield AI Backend"
    echo "✅ Git repository initialized"
fi

# Check if remote is set
if ! git remote get-url origin 2>/dev/null; then
    echo "❌ No git remote found. Please set up GitHub repository first:"
    echo "1. Go to github.com and create a new repository"
    echo "2. Run: git remote add origin <your-repo-url>"
    echo "3. Run: git push -u origin main"
    exit 1
fi

# Stage and commit changes
echo "📝 Staging changes..."
git add .

if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    echo "💾 Committing changes..."
    git commit -m "Prepare for Railway deployment - $(date)"
    echo "✅ Changes committed"
fi

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push origin main
echo "✅ Code pushed to GitHub"

echo ""
echo "🌐 Next Steps for Railway Deployment:"
echo "==================================="
echo "1. Go to https://railway.app"
echo "2. Click 'New Project' → 'Deploy from GitHub'"
echo "3. Select your repository"
echo "4. Select the 'backend' folder"
echo "5. Add environment variables (see RAILWAY_DEPLOYMENT.md)"
echo "6. Click 'Deploy'"
echo ""
echo "📋 Required Environment Variables:"
echo "- NODE_ENV=production"
echo "- PORT=3000"
echo "- ZERO_G_RPC_URL=https://evmrpc-testnet.0g.ai"
echo "- RPC_URL=https://evmrpc-testnet.0g.ai"
echo "- PRIVATE_KEY=your_0g_testnet_private_key"
echo "- MANAGER_ADDRESS=0x00CAC06Dd0BB4103f8b62D280fE9BCEE8f26fD59"
echo "- VAULT_ADDRESS=0xAD2935E147b61175D5dc3A9e7bDa93B0975A43BA"
echo "- REGISTRY_ADDRESS=0xd753c12650c280383Ce873Cc3a898F6f53973d16"
echo "- UNDERLYING_ASSET=0x10e38eE9dd4C549b61400Fc19347D00eD3edAfC4"
echo ""
echo "🎯 Deployment Guide: RAILWAY_DEPLOYMENT.md"
echo "🚀 Ready to deploy!"

#!/usr/bin/env node

/**
 * Comprehensive Integration Test Suite
 * Tests backend-frontend-contract integration
 * 
 * @module integration-test
 * @author AutoYield AI Team
 * @version 1.0.0
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { ethers } from 'ethers';

const execAsync = promisify(exec);

let serverProcess = null;
let hardhatProcess = null;

// Test configuration
const TEST_CONFIG = {
  backendUrl: 'http://localhost:3000',
  rpcUrl: 'http://localhost:8545',
  testAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  testPrivateKey: '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
};

// Contract ABIs (simplified for testing)
const VAULT_ABI = [
  "function totalAssets() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function deposit(uint256) returns (uint256)",
  "function withdraw(uint256) returns (uint256)"
];

const MANAGER_ABI = [
  "function getProposal(uint256 proposalId) view returns (address[] protocols, uint256[] percentages, uint256 executionTime, address proposer, bool executed, bool canceled, bytes executionProof)",
  "function proposeStrategy(address[] protocols, uint256[] percentages, uint256 expectedAPY, bytes executionProof)",
  "function executeProposedStrategy(uint256 proposalId)"
];

/**
 * Start Hardhat node and backend server
 */
async function startServices() {
  console.log('🚀 Starting services for integration testing...');
  
  // Start Hardhat node
  hardhatProcess = exec('npx hardhat node', {
    cwd: '/home/skywalker/Projects/prj/wrk Dammy/AutoYield.AI/contracts',
    detached: true
  });
  
  // Wait for Hardhat to start
  console.log('⏳ Waiting for Hardhat node...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Deploy contracts
  console.log('📦 Deploying contracts...');
  try {
    await execAsync('npx hardhat run scripts/deploy.js --network localhost', {
      cwd: '/home/skywalker/Projects/prj/wrk Dammy/AutoYield.AI/contracts'
    });
    console.log('✅ Contracts deployed successfully');
  } catch (error) {
    console.error('❌ Contract deployment failed:', error.message);
    throw error;
  }
  
  // Start backend server
  serverProcess = exec('node src/app.js', {
    cwd: '/home/skywalker/Projects/prj/wrk Dammy/AutoYield.AI/backend',
    detached: true
  });
  
  // Wait for backend to start
  console.log('⏳ Waiting for backend server...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('✅ All services started');
}

/**
 * Stop all services
 */
async function stopServices() {
  console.log('🛑 Stopping services...');
  
  if (serverProcess) {
    serverProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  if (hardhatProcess) {
    hardhatProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('✅ Services stopped');
}

/**
 * Make HTTP request to backend API
 */
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:5173', // Simulate frontend origin
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { success: response.ok, status: response.status, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test 1: Backend-Frontend Data Flow
 */
async function testBackendFrontendDataFlow() {
  console.log('\n📡 Test 1: Backend-Frontend Data Flow');
  
  const tests = [
    {
      name: 'Health Check',
      url: `${TEST_CONFIG.backendUrl}/health`,
      expected: { status: 'healthy' }
    },
    {
      name: 'Oracle Live Data',
      url: `${TEST_CONFIG.backendUrl}/api/oracle/live`,
      expected: { success: true }
    },
    {
      name: 'Get All Proposals',
      url: `${TEST_CONFIG.backendUrl}/api/proposals/all`,
      expected: { success: true }
    },
    {
      name: 'Get Vault Data',
      url: `${TEST_CONFIG.backendUrl}/api/vault/user/${TEST_CONFIG.testAddress}`,
      expected: { success: true }
    },
    {
      name: 'Agent Status',
      url: `${TEST_CONFIG.backendUrl}/api/agent/status`,
      expected: { status: 'active' }
    },
    {
      name: 'TEE Performance',
      url: `${TEST_CONFIG.backendUrl}/api/agent/tee-performance`,
      expected: { teeExecution: {} }
    }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    console.log(`\n🔍 Testing ${test.name}...`);
    const result = await makeRequest(test.url);
    
    if (result.success) {
      console.log(`✅ ${test.name} - SUCCESS`);
      console.log(`   Status: ${result.status}`);
      
      // Validate response structure
      if (test.expected.status && result.data.status === test.expected.status) {
        console.log('   ✅ Response structure valid');
        passedTests++;
      } else if (test.expected.success && result.data.success) {
        console.log('   ✅ Response structure valid');
        passedTests++;
      } else {
        console.log('   ⚠️  Response structure unexpected');
      }
      
      // Log sample data
      if (result.data.data) {
        console.log(`   Sample: ${JSON.stringify(result.data.data).substring(0, 100)}...`);
      }
    } else {
      console.log(`❌ ${test.name} - FAILED`);
      console.log(`   Error: ${result.error}`);
    }
  }
  
  console.log(`\n📊 Test 1 Results: ${passedTests}/${tests.length} passed`);
  return passedTests === tests.length;
}

/**
 * Test 2: Contract Integration
 */
async function testContractIntegration() {
  console.log('\n🔗 Test 2: Contract Integration');
  
  try {
    // Setup provider and contracts
    const provider = new ethers.JsonRpcProvider(TEST_CONFIG.rpcUrl);
    const wallet = new ethers.Wallet(TEST_CONFIG.testPrivateKey, provider);
    
    console.log('🔐 Connected to blockchain');
    console.log(`   Wallet: ${wallet.address}`);
    console.log(`   Balance: ${ethers.formatEther(await provider.getBalance(wallet.address))} ETH`);
    
    // Read contract addresses from .env
    const fs = await import('fs');
    const envPath = '/home/skywalker/Projects/prj/wrk Dammy/AutoYield.AI/backend/.env';
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const vaultAddress = envContent.match(/VAULT_ADDRESS="([^"]+)"/)?.[1];
    const managerAddress = envContent.match(/MANAGER_ADDRESS="([^"]+)"/)?.[1];
    
    if (!vaultAddress || !managerAddress) {
      throw new Error('Contract addresses not found in .env');
    }
    
    console.log(`📋 Vault Address: ${vaultAddress}`);
    console.log(`📋 Manager Address: ${managerAddress}`);
    
    // Create contract instances
    const vaultContract = new ethers.Contract(vaultAddress, VAULT_ABI, wallet);
    const managerContract = new ethers.Contract(managerAddress, MANAGER_ABI, wallet);
    
    // Test contract calls
    console.log('\n🔍 Testing contract calls...');
    
    // Test vault total assets
    const totalAssets = await vaultContract.totalAssets();
    console.log(`✅ Vault Total Assets: ${ethers.formatEther(totalAssets)} USDC`);
    
    // Test user balance
    const userBalance = await vaultContract.balanceOf(TEST_CONFIG.testAddress);
    console.log(`✅ User Balance: ${ethers.formatEther(userBalance)} shares`);
    
    // Test proposals (try to get proposal #1)
    try {
      const proposal = await managerContract.getProposal(1);
      console.log(`✅ Proposal #1 retrieved: ${proposal.executed ? 'Executed' : 'Pending'}`);
    } catch (error) {
      console.log(`⚠️  Proposal #1 not found (expected for new deployment)`);
    }
    
    console.log('\n📊 Test 2 Results: Contract integration SUCCESS');
    return true;
    
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error.message);
    return false;
  }
}

/**
 * Test 3: Real-time Data Streaming (SSE)
 */
async function testRealTimeStreaming() {
  console.log('\n📡 Test 3: Real-time Data Streaming (SSE)');
  
  try {
    // Test SSE endpoint
    const response = await fetch(`${TEST_CONFIG.backendUrl}/api/agent/stream-tee`, {
      headers: {
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'X-API-Key': 'demo-key-1-change-in-production'
      }
    });
    
    if (response.ok) {
      console.log('✅ SSE endpoint accessible');
      
      // Read first few events
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let eventsReceived = 0;
      let timeoutReached = false;
      
      // Set timeout for reading events
      setTimeout(() => {
        timeoutReached = true;
      }, 5000);
      
      while (!timeoutReached && eventsReceived < 3) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            try {
              const parsed = JSON.parse(data);
              console.log(`✅ Event ${eventsReceived + 1}: ${parsed.message || parsed.status}`);
              eventsReceived++;
            } catch (e) {
              console.log(`✅ Event ${eventsReceived + 1}: ${data.substring(0, 50)}...`);
              eventsReceived++;
            }
          }
        }
      }
      
      reader.cancel();
      
      if (eventsReceived > 0) {
        console.log(`✅ SSE streaming working - received ${eventsReceived} events`);
        return true;
      } else {
        console.log('⚠️  SSE endpoint accessible but no events received');
        return false;
      }
    } else {
      console.log('❌ SSE endpoint not accessible');
      return false;
    }
  } catch (error) {
    console.log('❌ Test 3 FAILED:', error.message);
    return false;
  }
}

/**
 * Test 4: Transaction Queue and Blockchain Interactions
 */
async function testTransactionQueue() {
  console.log('\n⚡ Test 4: Transaction Queue and Blockchain Interactions');
  
  try {
    // Test agent run (which queues transactions)
    const result = await makeRequest(`${TEST_CONFIG.backendUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'demo-key-1-change-in-production',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (result.success) {
      console.log('✅ Agent execution initiated');
      console.log(`   Proposal ID: ${result.data.proposalId}`);
      console.log(`   Strategy: ${result.data.strategy?.protocols?.length || 0} protocols`);
      
      // Check if transaction was queued
      if (result.data.proposalId?.transactionHash?.startsWith('queued_')) {
        console.log('✅ Transaction successfully queued');
        return true;
      } else {
        console.log('⚠️  Transaction queued but format unexpected');
        return false;
      }
    } else {
      console.log('❌ Agent execution failed');
      console.log(`   Error: ${result.error}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Test 4 FAILED:', error.message);
    return false;
  }
}

/**
 * Test 5: Complete User Flow
 */
async function testCompleteUserFlow() {
  console.log('\n🔄 Test 5: Complete User Flow (Frontend → Backend → Contracts)');
  
  try {
    // Step 1: User checks vault status
    console.log('📍 Step 1: User checks vault status...');
    const vaultData = await makeRequest(`${TEST_CONFIG.backendUrl}/api/vault/user/${TEST_CONFIG.testAddress}`);
    
    if (!vaultData.success) {
      throw new Error('Vault data fetch failed');
    }
    console.log('✅ Vault status retrieved');
    
    // Step 2: User checks available strategies
    console.log('📍 Step 2: User checks available strategies...');
    const strategies = await makeRequest(`${TEST_CONFIG.backendUrl}/api/oracle/live`);
    
    if (!strategies.success) {
      throw new Error('Strategy data fetch failed');
    }
    console.log(`✅ ${strategies.data.data?.length || 0} strategies available`);
    
    // Step 3: User initiates AI agent execution
    console.log('📍 Step 3: User initiates AI agent execution...');
    const agentRun = await makeRequest(`${TEST_CONFIG.backendUrl}/api/agent/run`, {
      method: 'POST',
      headers: {
        'X-API-Key': 'demo-key-1-change-in-production',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    if (!agentRun.success) {
      throw new Error('Agent execution failed');
    }
    console.log('✅ AI agent execution initiated');
    
    // Step 4: Check proposal status
    console.log('📍 Step 4: Check proposal status...');
    const proposals = await makeRequest(`${TEST_CONFIG.backendUrl}/api/proposals/all`);
    
    if (!proposals.success) {
      throw new Error('Proposal status check failed');
    }
    console.log(`✅ ${proposals.data?.length || 0} proposals found`);
    
    // Step 5: Verify agent status
    console.log('📍 Step 5: Verify agent status...');
    const agentStatus = await makeRequest(`${TEST_CONFIG.backendUrl}/api/agent/status`);
    
    if (!agentStatus.success) {
      throw new Error('Agent status check failed');
    }
    console.log('✅ Agent status verified');
    
    console.log('\n📊 Test 5 Results: Complete user flow SUCCESS');
    return true;
    
  } catch (error) {
    console.log('❌ Test 5 FAILED:', error.message);
    return false;
  }
}

/**
 * Test 6: Error Handling and Edge Cases
 */
async function testErrorHandling() {
  console.log('\n🚨 Test 6: Error Handling and Edge Cases');
  
  const errorTests = [
    {
      name: 'Invalid API Key',
      url: `${TEST_CONFIG.backendUrl}/api/agent/run`,
      options: {
        method: 'POST',
        headers: { 'X-API-Key': 'invalid-key' }
      },
      expectedStatus: 401
    },
    {
      name: 'Missing API Key',
      url: `${TEST_CONFIG.backendUrl}/api/agent/run`,
      options: { method: 'POST' },
      expectedStatus: 401
    },
    {
      name: 'Invalid User Address',
      url: `${TEST_CONFIG.backendUrl}/api/vault/user/invalid-address`,
      expectedStatus: 400
    },
    {
      name: 'Non-existent Endpoint',
      url: `${TEST_CONFIG.backendUrl}/api/non-existent`,
      expectedStatus: 404
    }
  ];
  
  let passedTests = 0;
  
  for (const test of errorTests) {
    console.log(`\n🔍 Testing ${test.name}...`);
    const result = await makeRequest(test.url, test.options);
    
    if (result.status === test.expectedStatus) {
      console.log(`✅ ${test.name} - Correct error response (${result.status})`);
      passedTests++;
    } else {
      console.log(`❌ ${test.name} - Expected ${test.expectedStatus}, got ${result.status}`);
    }
  }
  
  console.log(`\n📊 Test 6 Results: ${passedTests}/${errorTests.length} error tests passed`);
  return passedTests === errorTests.length;
}

/**
 * Run all integration tests
 */
async function runIntegrationTests() {
  console.log('🧪 Starting Comprehensive Integration Tests...\n');
  
  const testResults = {
    backendFrontend: false,
    contractIntegration: false,
    realTimeStreaming: false,
    transactionQueue: false,
    completeUserFlow: false,
    errorHandling: false
  };
  
  try {
    await startServices();
    
    // Run all tests
    testResults.backendFrontend = await testBackendFrontendDataFlow();
    testResults.contractIntegration = await testContractIntegration();
    testResults.realTimeStreaming = await testRealTimeStreaming();
    testResults.transactionQueue = await testTransactionQueue();
    testResults.completeUserFlow = await testCompleteUserFlow();
    testResults.errorHandling = await testErrorHandling();
    
  } catch (error) {
    console.error('❌ Integration test suite failed:', error.message);
  } finally {
    await stopServices();
  }
  
  // Final results
  console.log('\n' + '='.repeat(60));
  console.log('🎯 INTEGRATION TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  
  const passedTests = Object.values(testResults).filter(Boolean).length;
  const totalTests = Object.keys(testResults).length;
  
  console.log(`✅ Backend-Frontend Data Flow: ${testResults.backendFrontend ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Contract Integration: ${testResults.contractIntegration ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Real-time Streaming: ${testResults.realTimeStreaming ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Transaction Queue: ${testResults.transactionQueue ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Complete User Flow: ${testResults.completeUserFlow ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Error Handling: ${testResults.errorHandling ? 'PASS' : 'FAIL'}`);
  
  console.log('\n' + '-'.repeat(60));
  console.log(`📊 Overall Score: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 ALL INTEGRATION TESTS PASSED!');
    console.log('🚀 Backend is fully functional and ready for frontend integration');
  } else {
    console.log('⚠️  Some integration tests failed. Check logs above.');
  }
  
  console.log('='.repeat(60));
  
  return passedTests === totalTests;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runIntegrationTests().catch(console.error);
}

export { runIntegrationTests };

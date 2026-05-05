#!/usr/bin/env node

/**
 * API Testing Script for AutoYield.AI Backend
 * Tests all major endpoints and functionality
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

let serverProcess = null;

async function startServer() {
  console.log('🚀 Starting AutoYield AI Backend...');
  serverProcess = exec('node src/app.js', {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  // Wait a moment for server to start
  await new Promise(resolve => setTimeout(resolve, 3000));
  console.log('✅ Server started');
}

async function stopServer() {
  if (serverProcess) {
    console.log('🛑 Stopping server...');
    serverProcess.kill('SIGTERM');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('✅ Server stopped');
  }
}

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
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

async function testHealthEndpoint() {
  console.log('\n🏥 Testing Health Endpoint...');
  const result = await makeRequest('http://localhost:3000/health');
  
  if (result.success) {
    console.log('✅ Health check passed:', result.data);
    return true;
  } else {
    console.log('❌ Health check failed:', result.error || result.data);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n🔌 Testing API Endpoints...');
  
  const tests = [
    {
      name: 'Oracle Live Data',
      url: 'http://localhost:3000/api/oracle/live',
      method: 'GET'
    },
    {
      name: 'Get All Proposals',
      url: 'http://localhost:3000/api/proposals/all',
      method: 'GET'
    },
    {
      name: 'Get Vault Data',
      url: 'http://localhost:3000/api/vault/user/0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
      method: 'GET'
    },
    {
      name: 'Agent Status',
      url: 'http://localhost:3000/api/agent/status',
      method: 'GET'
    },
    {
      name: 'TEE Performance',
      url: 'http://localhost:3000/api/agent/tee-performance',
      method: 'GET'
    }
  ];
  
  let passedTests = 0;
  
  for (const test of tests) {
    console.log(`\n📡 Testing ${test.name}...`);
    const result = await makeRequest(test.url, { method: test.method });
    
    if (result.success) {
      console.log(`✅ ${test.name} - SUCCESS`);
      console.log(`   Status: ${result.status}`);
      if (result.data) {
        console.log(`   Data: ${JSON.stringify(result.data).substring(0, 100)}...`);
      }
      passedTests++;
    } else {
      console.log(`❌ ${test.name} - FAILED`);
      console.log(`   Error: ${result.error || result.data}`);
    }
  }
  
  console.log(`\n📊 API Tests Summary: ${passedTests}/${tests.length} passed`);
  return passedTests === tests.length;
}

async function testSecureEndpoints() {
  console.log('\n🔒 Testing Secure Endpoints...');
  
  // Test agent run endpoint (requires API key)
  console.log('\n📡 Testing Agent Run (with API key)...');
  const result = await makeRequest('http://localhost:3000/api/agent/run', {
    method: 'POST',
    headers: {
      'X-API-Key': 'demo-key-1-change-in-production'
    }
  });
  
  if (result.success) {
    console.log('✅ Agent Run - SUCCESS');
    console.log(`   Data: ${JSON.stringify(result.data).substring(0, 100)}...`);
    return true;
  } else {
    console.log('❌ Agent Run - FAILED');
    console.log(`   Error: ${result.error || result.data}`);
    return false;
  }
}

async function testServiceIntegrations() {
  console.log('\n🧩 Testing Service Integrations...');
  
  // Test if all services can be imported without errors
  try {
    const services = [
      './src/services/trustScoringService.js',
      './src/services/transactionQueue.js',
      './src/services/teeService.js',
      './src/services/secureKeyManager.js',
      './src/services/ogStorageService.js',
      './src/services/ogComputeService.js',
      './src/services/apyService.js',
      './src/services/decentralizedOracle.js',
      './src/services/contractService.js',
      './src/services/agentService.js'
    ];
    
    for (const service of services) {
      console.log(`📦 Importing ${service}...`);
      await import(service);
      console.log(`✅ ${service} imported successfully`);
    }
    
    console.log('\n✅ All services imported successfully');
    return true;
  } catch (error) {
    console.log(`❌ Service integration failed: ${error.message}`);
    return false;
  }
}

async function runAllTests() {
  console.log('🧪 Starting Comprehensive API Testing...\n');
  
  let allTestsPassed = true;
  
  try {
    await startServer();
    
    // Test 1: Health endpoint
    const healthPassed = await testHealthEndpoint();
    allTestsPassed = allTestsPassed && healthPassed;
    
    // Test 2: API endpoints
    const apiPassed = await testAPIEndpoints();
    allTestsPassed = allTestsPassed && apiPassed;
    
    // Test 3: Secure endpoints
    const securePassed = await testSecureEndpoints();
    allTestsPassed = allTestsPassed && securePassed;
    
    // Test 4: Service integrations
    const servicesPassed = await testServiceIntegrations();
    allTestsPassed = allTestsPassed && servicesPassed;
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    allTestsPassed = false;
  } finally {
    await stopServer();
  }
  
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Backend is fully functional.');
  } else {
    console.log('⚠️  Some tests failed. Check the logs above.');
  }
  console.log('='.repeat(50));
  
  return allTestsPassed;
}

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests };

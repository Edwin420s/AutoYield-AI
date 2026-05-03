#!/usr/bin/env node

/**
 * Simple server startup script for AutoYield AI Backend
 * This script will start the Express server and provide helpful logging
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Starting AutoYield AI Backend Server...');
console.log('Directory:', __dirname);

// Start the server using node directly
const serverProcess = spawn('node', ['src/app.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env }
});

serverProcess.on('error', (error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});

serverProcess.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  serverProcess.kill('SIGINT');
  process.exit(0);
});

console.log('Server startup initiated...');

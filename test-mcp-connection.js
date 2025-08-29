const { spawn } = require('child_process');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

const serverPath = path.join(__dirname, 'dist', 'server.js');

const child = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    TESTRAIL_URL: process.env.TESTRAIL_URL || 'https://your-instance.testrail.io',
    TESTRAIL_USERNAME: process.env.TESTRAIL_USERNAME || '<your-testrail-username>',
    TESTRAIL_API_KEY: process.env.TESTRAIL_API_KEY || '<your-testrail-api-key>',
    TESTRAIL_TIMEOUT_MS: process.env.TESTRAIL_TIMEOUT_MS || '10000'
  }
});

let output = '';
let errorOutput = '';

child.stdout.on('data', (data) => {
  output += data.toString();
  console.log('STDOUT:', data.toString());
});

child.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.log('STDERR:', data.toString());
});

child.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
  console.log('Final output:', output);
  if (errorOutput) {
    console.log('Error output:', errorOutput);
  }
});

// Send initialization message
const initMessage = {
  jsonrpc: '2.0',
  id: 1,
  method: 'initialize',
  params: {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'test-client',
      version: '1.0.0'
    }
  }
};

setTimeout(() => {
  console.log('Sending initialization message...');
  child.stdin.write(JSON.stringify(initMessage) + '\n');
}, 1000);

// Send tools/list message
setTimeout(() => {
  const listMessage = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list',
    params: {}
  };
  console.log('Sending tools/list message...');
  child.stdin.write(JSON.stringify(listMessage) + '\n');
}, 2000);

// Cleanup after 5 seconds
setTimeout(() => {
  console.log('Terminating test...');
  child.kill('SIGTERM');
}, 5000);

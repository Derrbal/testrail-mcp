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
    TESTRAIL_USER: process.env.TESTRAIL_USERNAME || '<your-testrail-username>',
    TESTRAIL_API_KEY: process.env.TESTRAIL_API_KEY || '<your-testrail-api-key>'
  }
});

// Handle server output
child.stdout.on('data', (data) => {
  console.log('Server stdout:', data.toString());
});

child.stderr.on('data', (data) => {
  console.log('Server stderr:', data.toString());
});

// Send initialize message
setTimeout(() => {
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
  
  console.log('Sending initialize message:', JSON.stringify(initMessage, null, 2));
  child.stdin.write(JSON.stringify(initMessage) + '\n');
}, 1000);

// Send list tools request
setTimeout(() => {
  const listToolsMessage = {
    jsonrpc: '2.0',
    id: 2,
    method: 'tools/list'
  };
  
  console.log('Sending list tools message:', JSON.stringify(listToolsMessage, null, 2));
  child.stdin.write(JSON.stringify(listToolsMessage) + '\n');
}, 2000);

// Cleanup
setTimeout(() => {
  console.log('Terminating test...');
  child.kill();
  process.exit(0);
}, 5000);

child.on('close', (code) => {
  console.log('Server process exited with code:', code);
});

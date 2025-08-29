const { spawn } = require('child_process');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config();

console.log('=== MCP Protocol Test ===');

// Start the MCP server
const serverPath = path.join(__dirname, 'dist', 'server.js');
console.log('Starting MCP server at:', serverPath);

const child = spawn('node', [serverPath], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: {
    ...process.env,
    TESTRAIL_URL: process.env.TESTRAIL_URL || 'https://your-instance.testrail.io',
    TESTRAIL_USER: process.env.TESTRAIL_USERNAME || '<your-testrail-username>',
    TESTRAIL_API_KEY: process.env.TESTRAIL_API_KEY || '<your-testrail-api-key>'
  }
});

let serverOutput = '';
let serverErrors = '';

// Handle server output
child.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  console.log('Server stdout:', output);
});

child.stderr.on('data', (data) => {
  const error = data.toString();
  serverErrors += error;
  console.log('Server stderr:', error);
});

// Wait for server to start
setTimeout(() => {
  console.log('\n=== Sending MCP Messages ===');
  
  // Send initialize message
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
  
  console.log('Sending initialize:', JSON.stringify(initMessage, null, 2));
  child.stdin.write(JSON.stringify(initMessage) + '\n');
  
  // Wait and send list tools
  setTimeout(() => {
    const listToolsMessage = {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list'
    };
    
    console.log('Sending list tools:', JSON.stringify(listToolsMessage, null, 2));
    child.stdin.write(JSON.stringify(listToolsMessage) + '\n');
    
    // Wait and send get prompt
    setTimeout(() => {
      const getPromptMessage = {
        jsonrpc: '2.0',
        id: 3,
        method: 'prompts/list'
      };
      
      console.log('Sending list prompts:', JSON.stringify(getPromptMessage, null, 2));
      child.stdin.write(JSON.stringify(getPromptMessage) + '\n');
      
      // Cleanup after a delay
      setTimeout(() => {
        console.log('\n=== Test Complete ===');
        console.log('Total server output:', serverOutput);
        console.log('Total server errors:', serverErrors);
        child.kill();
        process.exit(0);
      }, 2000);
    }, 1000);
  }, 1000);
}, 2000);

child.on('close', (code) => {
  console.log('Server process exited with code:', code);
});



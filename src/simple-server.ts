import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

async function main(): Promise<void> {
  console.log('Starting simple MCP server...');
  
  const server = new McpServer({
    name: 'testrail-mcp',
    version: '0.1.0',
  });

  console.log('Registering simple tool...');
  
  server.registerTool(
    'echo',
    {
      title: 'Echo Tool',
      description: 'Simple echo tool for testing',
      inputSchema: {
        message: z.string().describe('Message to echo'),
      },
    },
    async ({ message }) => {
      console.log(`Echo tool called with: ${message}`);
      return {
        content: [
          {
            type: 'text',
            text: `Echo: ${message}`,
          },
        ],
      };
    },
  );

  console.log('Creating stdio transport...');
  const transport = new StdioServerTransport();
  
  console.log('Connecting to transport...');
  await server.connect(transport);
  
  console.log('Simple MCP server connected and ready!');
}

main().catch((error: unknown) => {
  const err = error as Error;
  console.error('Failed to start simple MCP server:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
});

process.on('exit', (code) => {
  console.log(`Simple MCP server exiting with code: ${code}`);
});



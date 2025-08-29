# TestRail MCP Server

A Model Context Protocol (MCP) server that provides TestRail integration tools for AI assistants like Cursor.

## Features

- Get TestRail test cases, projects, suites, runs, and tests
- Update test cases, runs, and tests
- Add test results and attachments
- Full TestRail API integration
- Seamless integration with Cursor and other MCP-compatible AI assistants

## Quick Start

### Prerequisites

- Node.js 18.17.0 or higher
- npm

### Installation

1. **Clone and setup**:
```bash
git clone <repository-url>
cd testrail-mcp
npm install
npm run build
```

2. **Configure environment variables**:
Create a `.env` file in the project root:
```env
TESTRAIL_USERNAME=your_testrail_username
TESTRAIL_API_KEY=your_testrail_api_key
TESTRAIL_URL=https://your-instance.testrail.com
```

## Cursor Integration

### Setup

1. **Configure Cursor MCP Settings**:
Open Cursor and go to Settings → Extensions → MCP. Add the following configuration:

```json
{
  "mcpServers": {
    "testrail": {
      "command": "node",
      "args": ["/path/to/testrail-mcp/dist/server.js"],
      "env": {
        "TESTRAIL_USERNAME": "your_testrail_username",
        "TESTRAIL_API_KEY": "your_testrail_api_key",
        "TESTRAIL_URL": "https://your-instance.testrail.com"
      }
    }
  }
}
```

2. **Restart Cursor** to load the MCP server configuration.

### Usage

Once configured, you can use TestRail tools directly in Cursor's chat:

**Example Commands**:
- "Get all TestRail projects"
- "Show me test cases for project ID 1"
- "Update test case 123 with new title"
- "Add a test result for test ID 456"
- "Upload an attachment to test case 789"

**Available Tools**:
- `get_case` - Fetch a TestRail test case by ID
- `update_case` - Update a TestRail test case
- `get_projects` - List all TestRail projects
- `get_project` - Get project details
- `get_suites` - Get test suites for a project
- `get_suite` - Get suite details
- `get_cases` - Get test cases with filtering
- `add_attachment_to_case` - Upload file attachment
- `get_sections` - Get test sections
- `get_runs` - Get test runs
- `get_run` - Get run details
- `update_run` - Update test run
- `get_tests` - Get tests in a run
- `get_test` - Get test details
- `update_test` - Update test
- `add_result` - Add test result

### Troubleshooting

**Common Issues**:
1. **Server not found**: Ensure the path to `dist/server.js` is correct
2. **Authentication errors**: Verify your TestRail credentials in the environment variables
3. **Permission denied**: Make sure the server file is executable
4. **Connection timeout**: Check your TestRail URL and network connectivity

**Debug Mode**:
Enable debug logging by adding to your environment variables:
```env
DEBUG=true
LOG_LEVEL=debug
```

## Deployment Options

### Local Development

```bash
# Run in development mode
npm run dev

# Start the server (stdio transport)
npm start

# Start the server (HTTP transport on port 1823)
npm run start:http

# Run tests
npm test
```

### Docker Deployment

**Quick Start**:
```bash
# Set environment variables
export TESTRAIL_USERNAME="your_testrail_username"
export TESTRAIL_API_KEY="your_testrail_api_key"
export TESTRAIL_URL="https://your-instance.testrail.com"

# Build and run with Docker Compose
docker-compose up -d
```

**Manual Build**:
```bash
# Build the image
docker build -t testrail-mcp-server .

# Run the container
docker run -d \
  --name testrail-mcp-server \
  -p 1823:1823 \
  -e TESTRAIL_USERNAME=your_username \
  -e TESTRAIL_API_KEY=your_api_key \
  -e TESTRAIL_URL=https://your-instance.testrail.com \
  testrail-mcp-server
```



## Security Considerations

- Store TestRail API keys securely using environment variables
- Never commit API keys to version control
- Use HTTPS for TestRail URLs
- Consider using Docker secrets for production deployments
- Regularly rotate API keys

## License

MIT


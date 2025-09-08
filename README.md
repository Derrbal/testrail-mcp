# TestRail MCP Server

## What is this?

This tool connects your TestRail test management system with AI assistants like Cursor or Claude Desktop. It allows your AI assistant to read and update test cases, add test results, and manage your testing workflow through simple conversations.

## Features

- **View Test Cases**: Show test cases, projects, and test runs
- **Update Tests**: Modify test case details, titles, and descriptions
- **Add Results**: Record test results and upload screenshots
- **Search & Filter**: Find specific tests or projects quickly
- **File Attachments**: Upload documents and images to test cases
- **Full Integration**: Works with Cursor, Claude Desktop, and other AI tools

## Who is this for?

- **QA Engineers** who want to manage tests through AI conversations
- **Project Managers** who need quick access to test information
- **Developers** who want to integrate testing into their AI-assisted workflow
- **Anyone** who uses TestRail and wants to make it more accessible through AI

## Quick Start

1. **Install Node.js** from [nodejs.org](https://nodejs.org/)
2. **Get TestRail API key** from your TestRail settings
3. **Install the server**: `npm install -g testrail-mcp-server`
4. **Configure your AI assistant** with your TestRail credentials
5. **Restart your AI assistant** and start asking questions!

## Prerequisites

You need these tools before installing:

1. **Node.js 18.17.0+** - Download from [nodejs.org](https://nodejs.org/) (LTS version)
2. **npm** - Comes with Node.js automatically
3. **AI Assistant** - Cursor ([cursor.sh](https://cursor.sh/)) or Claude Desktop ([claude.ai](https://claude.ai/download))
4. **TestRail Account** - With API access enabled

**Verify installation:**
```bash
node --version  # Should show 18.17.0 or higher
npm --version   # Should show a version number
```

## Getting TestRail API Credentials

1. **Log into TestRail** at your instance URL (e.g., `https://yourcompany.testrail.com`)

2. **Get API Key**:
   - Click your profile picture → "My Settings"
   - Scroll to "API Keys" section
   - Click "Add API Key"
   - Name it (e.g., "MCP Server")
   - **Copy and save the API key securely**

3. **Note your credentials**:
   - **Username**: Your TestRail login (usually email)
   - **URL**: Your TestRail web address

## Installation

### Step 1: Install the Server
Open Command Prompt/Terminal and run:
```bash
npm install -g testrail-mcp-server
```

### Step 2: Configure Your AI Assistant

**For Cursor Users:**
1. Open Cursor → Settings (`Ctrl + ,` or `Cmd + ,`)
2. Find "MCP" settings
3. Add this configuration:

```json
{
  "mcpServers": {
    "testrail": {
      "command": "npx",
      "args": ["testrail-mcp-server"],
      "env": {
        "TESTRAIL_USERNAME": "your_testrail_username",
        "TESTRAIL_API_KEY": "your_testrail_api_key",
        "TESTRAIL_URL": "https://your-instance.testrail.com"
      }
    }
  }
}
```

**For Claude Desktop Users:**
1. Find config file:
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
2. Add the same configuration as above

**Replace these values:**
- `your_testrail_username`: Your TestRail login (usually email)
- `your_testrail_api_key`: The API key from TestRail
- `https://your-instance.testrail.com`: Your TestRail URL

### Step 3: Restart and Test
1. **Restart** your AI assistant completely
2. **Test**: Ask "Can you show me my TestRail projects?"

## Usage

Once set up, simply talk to your AI assistant naturally:

**Viewing Information:**
- "Show me all my TestRail projects"
- "What test cases are in project 1?"
- "Show me test case number 123"

**Updating Tests:**
- "Update test case 123 with the title 'Login functionality test'"
- "Change the priority of test case 456 to high"
- "Add a comment to test case 789"

**Adding Results:**
- "Mark test 456 as passed"
- "Add a failed result to test 789 with comment 'Button not clickable'"
- "Upload this screenshot to test case 123"

**Searching:**
- "Find all test cases with 'login' in the title"
- "Show me failed tests from the last test run"

## Troubleshooting

**"Command not found" or "npm is not recognized"**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart Command Prompt/Terminal
- Check with `node --version`

**"Authentication failed" or "Invalid credentials"**
- Verify your TestRail username (usually email)
- Copy API key again from TestRail
- Check TestRail URL starts with `https://`

**"Connection timeout" or "Cannot connect to TestRail"**
- Check internet connection
- Verify TestRail URL is correct
- Test TestRail in web browser

**AI assistant doesn't respond to TestRail questions**
- Restart your AI assistant completely
- Check configuration file format (valid JSON)
- Verify all required fields are filled

**"Permission denied" error**
- Run Command Prompt as Administrator (Windows) or with `sudo` (Mac/Linux)
- Update to latest Node.js version

**Still having trouble?**
- Check error messages for clues
- Try installation steps again
- Create an issue on [GitHub](https://github.com/Derrbal/testrail-mcp/issues) with your error details

## Security Best Practices

- **Never share your API key** - treat it like a password
- **Use HTTPS URLs** - ensure your TestRail URL starts with `https://`
- **Don't put API keys in code** - always use configuration files
- **Rotate API keys regularly** - change them every few months
- **Keep TestRail account secure** - use strong passwords and 2FA

**What NOT to do:**
- Don't share configuration files with others
- Don't put API keys in public repositories
- Don't use HTTP URLs (only HTTPS)
- Don't share screenshots showing your API key

## Additional Resources

**Helpful Links:**
- [TestRail API Documentation](https://www.gurock.com/testrail/docs/api/reference)
- [Cursor MCP Documentation](https://docs.cursor.com/en/context/mcp)
- [Claude Desktop Setup Guide](https://www.youtube.com/watch?v=i7LuJPNKQYI)

**Getting Support:**
- [GitHub Issues](https://github.com/Derrbal/testrail-mcp/issues) - Report bugs or ask questions
- Contact your TestRail administrator for API access issues

## License

MIT License - see [LICENSE](LICENSE) file for details.


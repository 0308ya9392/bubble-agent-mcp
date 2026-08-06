# Install Bubble Agent MCP in Claude

You are responsible for installing and verifying Bubble Agent MCP for this user. Complete the setup yourself instead of only explaining the steps.

Primary package command:

```bash
npx -y bubble-agent-mcp
```

## Rules

- Ask the user only for the missing `BUBBLE_AGENT_API_KEY` and `BUBBLE_AGENT_PROJECT_ID`.
- Treat the API key as a secret. Never print it back, commit it, or place it in a project file tracked by Git.
- Do not change unrelated settings.
- Preserve all existing MCP servers when editing a configuration file.
- Prefer the published npm package. If it is not published yet, use the GitHub repository fallback below.

## Install

1. Confirm that Node.js 20 or newer and `npx` are available. If Node.js is missing, install the current Node.js LTS using the safest package manager available on the user's system.
2. Check whether the package is published:

   ```bash
   npm view bubble-agent-mcp version
   ```

3. Select one server command:
   - Published package: `npx -y bubble-agent-mcp`
   - GitHub fallback: `npx -y github:alijancb/bubble-agent-mcp`
4. Configure the `bubble-agent` stdio MCP server in the Claude client the user is currently using.

### Claude Code

Merge this server into `.mcp.json` in the current project:

```json
{
  "mcpServers": {
    "bubble-agent": {
      "command": "npx",
      "args": ["-y", "bubble-agent-mcp"],
      "env": {
        "BUBBLE_AGENT_API_KEY": "USER_API_KEY",
        "BUBBLE_AGENT_PROJECT_ID": "USER_PROJECT_ID"
      }
    }
  }
}
```

For the GitHub fallback, replace the final argument with `github:alijancb/bubble-agent-mcp`.

### Claude Desktop

Merge the same `mcpServers.bubble-agent` object into Claude Desktop's existing configuration. Locate the correct configuration path for the user's OS rather than guessing. Keep every existing server intact.

## Verify

1. Run the selected command with `doctor`, passing credentials through the process environment.
2. Restart Claude if required.
3. Confirm that the Bubble Agent tools are visible: `get_bubbles`, `search_bubbles`, `get_bubble_details`, `compare_bubbles`, and `generate_content`.
4. Make one read-only test call such as: “Show me the strongest Bubbles today.”
5. Report only the result and any action the user must take. Never reveal the API key.

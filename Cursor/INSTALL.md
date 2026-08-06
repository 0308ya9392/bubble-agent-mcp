# Install Bubble Agent MCP in Cursor

Install and verify Bubble Agent MCP for the user. Perform the setup directly instead of only explaining the steps.

Primary package command:

```bash
npx -y bubble-agent-mcp
```

## Rules

- Ask only for a missing `BUBBLE_AGENT_API_KEY` and `BUBBLE_AGENT_PROJECT_ID`.
- Never echo, commit, or expose the API key.
- Preserve every existing Cursor MCP server and unrelated setting.
- Prefer the published npm package. If it is unavailable, use `github:alijancb/bubble-agent-mcp` as the final `npx` argument.

## Procedure

1. Confirm Node.js 20+ and `npx` are installed.
2. Run `npm view bubble-agent-mcp version` to check package availability.
3. Merge this server into `.cursor/mcp.json` in the current project, or Cursor's user-level MCP configuration if the user wants it available everywhere:

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

4. For the GitHub fallback, replace `bubble-agent-mcp` with `github:alijancb/bubble-agent-mcp`.
5. Keep credentials out of Git. If the project configuration would be tracked, use Cursor's approved user-level configuration or secret mechanism.
6. Run the selected package command with `doctor`, passing credentials through environment variables.
7. Reload Cursor and confirm these tools exist: `get_bubbles`, `search_bubbles`, `get_bubble_details`, `compare_bubbles`, and `generate_content`.
8. Make one read-only test request: “Show me today’s strongest Bubbles.”
9. Report success without revealing credentials.


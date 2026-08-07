# Install Bubble Agent MCP in Codex

Install and verify Bubble Agent MCP for the user. Perform the setup directly; do not stop after describing commands.

Primary package command:

```bash
npx -y bubble-agent-mcp
```

## Rules

- If credentials are missing, open https://subio.space/settings/api-keys for the user. Ask only for the resulting `BUBBLE_AGENT_API_KEY` and `BUBBLE_AGENT_PROJECT_ID`.
- Keep the API key secret: do not echo it, commit it, or save it inside the user's repository.
- Preserve all existing Codex MCP configuration.
- Prefer the npm package. Use the GitHub fallback if npm reports that the package is unavailable.

## Procedure

1. Verify Node.js 20+ and `npx`:

   ```bash
   node --version
   npx --version
   ```

2. Check package availability:

   ```bash
   npm view bubble-agent-mcp version
   ```

3. When the npm package exists, install the MCP server with:

   ```bash
   codex mcp add bubble-agent \
     --env BUBBLE_AGENT_API_KEY=USER_API_KEY \
     --env BUBBLE_AGENT_PROJECT_ID=USER_PROJECT_ID \
     -- npx -y bubble-agent-mcp
   ```

4. If the npm package is not available, use:

   ```bash
   codex mcp add bubble-agent \
     --env BUBBLE_AGENT_API_KEY=USER_API_KEY \
     --env BUBBLE_AGENT_PROJECT_ID=USER_PROJECT_ID \
     -- npx -y github:alijancb/bubble-agent-mcp
   ```

5. If `codex mcp add` is unavailable, merge the following into `~/.codex/config.toml` without replacing existing configuration:

   ```toml
   [mcp_servers.bubble-agent]
   command = "npx"
   args = ["-y", "bubble-agent-mcp"]

   [mcp_servers.bubble-agent.env]
   BUBBLE_AGENT_API_KEY = "USER_API_KEY"
   BUBBLE_AGENT_PROJECT_ID = "USER_PROJECT_ID"
   ```

   Use `github:alijancb/bubble-agent-mcp` as the final argument for the GitHub fallback.

## Verify

1. Run the selected package command with `doctor` and credentials supplied through environment variables.
2. Confirm `bubble-agent` appears in `codex mcp list` if that command is available.
3. Ask the user to restart Codex only if the current session cannot reload MCP servers.
4. Confirm the tools `get_bubbles`, `search_bubbles`, `get_bubble_details`, `compare_bubbles`, and `generate_content` are available.
5. Make a read-only test request: “What are today’s strongest Bubbles?”
6. Summarize success without exposing credentials.

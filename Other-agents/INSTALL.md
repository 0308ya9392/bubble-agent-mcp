# Install Bubble Agent MCP in any MCP client

Your task is to install, configure, and verify Bubble Agent MCP for the user. Do the work directly whenever your environment permits it.

Primary package command:

```bash
npx -y bubble-agent-mcp
```

## Ask the user for

- Their MCP client name, only if you cannot detect it.
- `BUBBLE_AGENT_API_KEY`, only if it is not already securely available.
- `BUBBLE_AGENT_PROJECT_ID`, only if it is not already available.

Never repeat, log, commit, or expose the API key.

## Server definition

- Transport: `stdio`
- Command: `npx`
- Preferred arguments: `-y`, `bubble-agent-mcp`
- GitHub fallback arguments: `-y`, `github:alijancb/bubble-agent-mcp`
- Environment variables:
  - `BUBBLE_AGENT_API_KEY`
  - `BUBBLE_AGENT_PROJECT_ID`
  - Optional: `BUBBLE_AGENT_API_URL`

## Procedure

1. Detect the operating system and MCP client.
2. Confirm Node.js 20+ and `npx` are installed.
3. Run `npm view bubble-agent-mcp version`. Use the preferred arguments if it succeeds; otherwise use the GitHub fallback.
4. Find the client's official MCP configuration location or CLI command.
5. Back up the existing configuration before editing it.
6. Merge a server named `bubble-agent`; never overwrite unrelated servers.
7. Store credentials only in the MCP server environment or the client's approved secret store, never in a tracked project file.
8. Run the server's `doctor` command.
9. Restart or reload the client if necessary.
10. Confirm these tools are available:
    - `get_bubbles`
    - `search_bubbles`
    - `get_bubble_details`
    - `compare_bubbles`
    - `generate_content`
11. Perform one read-only test request and report whether the installation succeeded.

If you cannot modify the user's client, generate the exact configuration block and tell the user precisely where to paste it. Do not claim success until the tools are visible.

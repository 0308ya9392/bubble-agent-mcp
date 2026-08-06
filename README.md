<div align="center">

# Bubble Agent MCP

**Find the conversations gaining momentum before everyone else.**

An open-source Model Context Protocol server that brings live Bubble Agent intelligence into Claude, Codex, Cursor, and every MCP-compatible client.

[Website](https://subio.space) · [Install with AI](INSTALL.md) · [Quick start](#quick-start) · [Tools](#tools) · [Security](#security) · [Contributing](CONTRIBUTING.md)

</div>

## What is a Bubble?

A Bubble is a group of independent internet conversations converging around the same emerging topic. Bubble Agent collects public signals, removes noise, groups related discussions, scores momentum, and preserves the sources behind every result.

This MCP server lets your AI client ask questions such as:

- “What are today’s strongest AI infrastructure Bubbles?”
- “Why is this conversation growing?”
- “Compare these opportunities for a launch.”
- “Turn this Bubble into an evidence-based X thread.”

## Tools

| Tool | What it does | Safety |
| --- | --- | --- |
| `get_bubbles` | Returns the highest-priority Bubbles right now | Read only |
| `search_bubbles` | Searches current and historical conversations | Read only |
| `get_bubble_details` | Explains momentum, pain points, timeline, and sources | Read only |
| `compare_bubbles` | Ranks 2–5 Bubbles for a goal | Read only |
| `generate_content` | Creates a grounded draft from a Bubble | Draft only; never publishes |

It also exposes `bubble://workspace/profile`, a non-sensitive MCP resource containing the company and audience context used for personalization.

## Quick start

### No-code installation

Download the instruction file for [Claude, Codex, Cursor, or another AI agent](INSTALL.md), attach it to your agent, and say: **“Install Bubble Agent MCP for me and verify it works.”** The agent will handle the configuration and ask only for your Bubble Agent credentials.

### Requirements

- Node.js 20 or newer
- A Bubble Agent workspace
- A project ID and personal API key

Early-access users receive workspace credentials with their invite. Never commit your API key to a repository or paste it into a prompt.

### Claude Desktop

Open Claude Desktop settings, choose **Developer → Edit Config**, and add:

```json
{
  "mcpServers": {
    "bubble-agent": {
      "command": "npx",
      "args": ["-y", "bubble-agent-mcp"],
      "env": {
        "BUBBLE_AGENT_API_KEY": "your_personal_api_key",
        "BUBBLE_AGENT_PROJECT_ID": "your_project_id"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

### Claude Code

Copy [`examples/claude-code.mcp.json`](examples/claude-code.mcp.json) to `.mcp.json` in your project, replace the placeholders, then start Claude Code.

### Codex

```bash
codex mcp add bubble-agent \
  --env BUBBLE_AGENT_API_KEY=your_personal_api_key \
  --env BUBBLE_AGENT_PROJECT_ID=your_project_id \
  -- npx -y bubble-agent-mcp
```

Or copy the TOML from [`examples/codex.config.toml`](examples/codex.config.toml) into `~/.codex/config.toml`.

### Cursor

Copy [`examples/cursor.mcp.json`](examples/cursor.mcp.json) to `.cursor/mcp.json` in your project and replace the placeholders.

### Any MCP client

Use the standard stdio transport:

```text
command: npx
args: -y bubble-agent-mcp
```

Set `BUBBLE_AGENT_API_KEY` and `BUBBLE_AGENT_PROJECT_ID` in the server environment.

## Verify the connection

Run the built-in doctor before configuring your client:

```bash
BUBBLE_AGENT_API_KEY=your_personal_api_key \
BUBBLE_AGENT_PROJECT_ID=your_project_id \
npx -y bubble-agent-mcp doctor
```

## Architecture

```text
Claude / Codex / Cursor / MCP client
                 │
                 │ stdio
                 ▼
        Bubble Agent MCP server
                 │
                 │ HTTPS + project-scoped API key
                 ▼
          Hosted Bubble Agent API
          ├─ collection and deduplication
          ├─ clustering and momentum scoring
          ├─ verified source retrieval
          └─ evidence-based content drafts
```

The open-source package is intentionally thin. It does not contain scraper credentials, database access, private scoring prompts, or provider secrets.

## Security

- Credentials are read from the MCP process environment, never from tool arguments.
- API keys are sent only to the configured Bubble Agent API over HTTPS.
- Non-HTTPS remote API URLs are rejected.
- The package has no telemetry and does not persist conversation data.
- Errors never include the API key.
- Generated content remains a draft and is never auto-published.
- Keys are project-scoped and can be revoked independently.

Read the full policy in [`SECURITY.md`](SECURITY.md).

## Local development

```bash
git clone https://github.com/alijancb/bubble-agent-mcp.git
cd bubble-agent-mcp
pnpm install
cp .env.example .env
pnpm check
```

Run locally:

```bash
BUBBLE_AGENT_API_KEY=your_personal_api_key \
BUBBLE_AGENT_PROJECT_ID=your_project_id \
pnpm dev
```

## Project principles

1. Evidence before summaries.
2. Read-only by default.
3. No publishing without explicit user action.
4. No provider secrets in the open-source client.
5. Stable tools that work across MCP clients.

## License

[MIT](LICENSE) © 2026 Subio.

#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { BubbleAgentClient, configFromEnv } from './client.js';
import { createBubbleAgentMcpServer } from './server.js';

const command = process.argv[2];
const credentialsUrl = 'https://subio.space/settings/api-keys?source=cli';

if (command === '--help' || command === 'help') {
  process.stdout.write(`Bubble Agent MCP\n\nUsage:\n  npx -y bubble-agent-mcp\n  npx -y bubble-agent-mcp doctor\n\nEnvironment:\n  BUBBLE_AGENT_API_KEY      Personal workspace key\n  BUBBLE_AGENT_PROJECT_ID   Project connected to the key\n  BUBBLE_AGENT_API_URL      Optional API URL (default: https://api.subio.space)\n\nGet credentials:\n  ${credentialsUrl}\n`);
  process.exit(0);
}

const missingCredentials = (!process.env.BUBBLE_AGENT_API_KEY && !process.env.SUBIO_API_KEY)
  || (!process.env.BUBBLE_AGENT_PROJECT_ID && !process.env.SUBIO_PROJECT_ID);

if (missingCredentials) {
  if (process.stdin.isTTY && process.stderr.isTTY) openBrowser(credentialsUrl);
  process.stderr.write(
    `[bubble-agent-mcp] Sign in at ${credentialsUrl}\n`
    + '[bubble-agent-mcp] Create an API key, copy the project ID, add both to your MCP client, then run this command again.\n',
  );
  process.exit(1);
}

try {
  const client = new BubbleAgentClient(configFromEnv());

  if (command === 'doctor') {
    await client.health();
    process.stdout.write('Bubble Agent API: ready\nProject: configured\nAPI key: configured\n');
    process.exit(0);
  }

  const handle = serveStdio(
    () => createBubbleAgentMcpServer(client),
    { onerror: (error) => console.error(`[bubble-agent-mcp] ${error.message}`) },
  );

  const shutdown = async () => {
    await handle.close();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
} catch (error) {
  console.error(`[bubble-agent-mcp] ${error instanceof Error ? error.message : 'Startup failed'}`);
  process.exit(1);
}

function openBrowser(url: string) {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.on('error', () => undefined);
  child.unref();
}

#!/usr/bin/env node
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { BubbleAgentClient, configFromEnv } from './client.js';
import { createBubbleAgentMcpServer } from './server.js';

const command = process.argv[2];

if (command === '--help' || command === 'help') {
  process.stdout.write(`Bubble Agent MCP\n\nUsage:\n  npx -y bubble-agent-mcp\n  npx -y bubble-agent-mcp doctor\n\nEnvironment:\n  BUBBLE_AGENT_API_KEY      Personal workspace key\n  BUBBLE_AGENT_PROJECT_ID   Project connected to the key\n  BUBBLE_AGENT_API_URL      Optional API URL (default: https://api.subio.space)\n`);
  process.exit(0);
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

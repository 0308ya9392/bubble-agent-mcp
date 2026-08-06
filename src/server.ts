import { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { BubbleAgentApiError, BubbleAgentClient } from './client.js';

const timeframeShort = z.enum(['6h', '24h', '7d']);
const timeframeSearch = z.enum(['24h', '7d', '30d']);

export function createBubbleAgentMcpServer(client: BubbleAgentClient) {
  const server = new McpServer(
    { name: 'bubble-agent', version: '0.1.0' },
    { capabilities: { tools: {}, resources: {} } },
  );

  server.registerTool(
    'get_bubbles',
    {
      title: "Get today's Bubbles",
      description: 'Return the highest-priority internet conversations currently gaining momentum.',
      inputSchema: z.object({
        category: z.string().trim().min(1).max(120).optional(),
        timeframe: timeframeShort.default('24h'),
        limit: z.number().int().min(1).max(20).default(10),
        min_score: z.number().int().min(0).max(100).default(50),
      }),
      annotations: { readOnlyHint: true },
    },
    async (input) => toolResult(() => client.listBubbles(input)),
  );

  server.registerTool(
    'search_bubbles',
    {
      title: 'Search Bubbles',
      description: 'Search current and historical Bubbles about a company, product, technology, industry, or keyword.',
      inputSchema: z.object({
        query: z.string().trim().min(2).max(200),
        timeframe: timeframeSearch.default('7d'),
        platforms: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
        limit: z.number().int().min(1).max(20).default(10),
      }),
      annotations: { readOnlyHint: true },
    },
    async (input) => toolResult(() => client.searchBubbles(input)),
  );

  server.registerTool(
    'get_bubble_details',
    {
      title: 'Explain a Bubble',
      description: 'Explain why a Bubble is growing and return its timeline, pain points, opportunities, and verified sources.',
      inputSchema: z.object({ bubble_id: z.string().trim().min(1).max(200) }),
      annotations: { readOnlyHint: true },
    },
    async ({ bubble_id }) => toolResult(() => client.bubbleDetails(bubble_id)),
  );

  server.registerTool(
    'compare_bubbles',
    {
      title: 'Compare Bubbles',
      description: 'Compare two to five Bubbles and recommend the strongest one for a specific goal.',
      inputSchema: z.object({
        bubble_ids: z.array(z.string().trim().min(1).max(200)).min(2).max(5),
        goal: z.enum(['content', 'product_idea', 'launch', 'distribution']).optional(),
      }),
      annotations: { readOnlyHint: true },
    },
    async (input) => toolResult(() => client.compareBubbles(input)),
  );

  server.registerTool(
    'generate_content',
    {
      title: 'Draft content from a Bubble',
      description: 'Generate an evidence-based content draft from a Bubble. This tool never publishes automatically.',
      inputSchema: z.object({
        bubble_id: z.string().trim().min(1).max(200),
        format: z.enum(['x_post', 'x_thread', 'linkedin_post', 'reddit_post', 'product_hunt_comment', 'newsletter_outline']),
        tone: z.enum(['founder', 'technical', 'casual', 'contrarian', 'educational']).optional(),
        goal: z.enum(['engagement', 'distribution', 'thought_leadership', 'launch']).optional(),
        instructions: z.string().trim().max(2_000).optional(),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false },
    },
    async ({ bubble_id, ...input }) => toolResult(() => client.generateContent(bubble_id, input)),
  );

  server.registerResource(
    'workspace-profile',
    'bubble://workspace/profile',
    {
      title: 'Bubble Agent workspace profile',
      description: 'Non-sensitive company, market, and audience context used to personalize Bubble results.',
      mimeType: 'application/json',
    },
    async (uri) => {
      const profile = await client.workspaceProfile();
      return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(profile, null, 2) }] };
    },
  );

  return server;
}

async function toolResult(run: () => Promise<Record<string, unknown>>) {
  try {
    const output = await run();
    return {
      content: [{ type: 'text' as const, text: readable(output) }],
      structuredContent: output,
    };
  } catch (error) {
    const normalized = normalizeError(error);
    return {
      isError: true,
      content: [{ type: 'text' as const, text: `${normalized.code}: ${normalized.message}` }],
      structuredContent: { error: normalized },
    };
  }
}

function normalizeError(error: unknown) {
  if (error instanceof BubbleAgentApiError) {
    return { code: error.code, message: error.message, ...(error.status ? { status: error.status } : {}) };
  }
  return { code: 'INTERNAL_ERROR', message: error instanceof Error ? error.message : 'Unexpected Bubble Agent MCP error' };
}

function readable(output: Record<string, unknown>) {
  const items = Array.isArray(output.bubbles)
    ? output.bubbles
    : Array.isArray(output.matches)
      ? output.matches
      : undefined;
  if (!items) return JSON.stringify(output, null, 2);
  if (!items.length) return 'No Bubbles matched this request.';
  return items.map((item, index) => {
    const row = item as Record<string, unknown>;
    const title = row.title ?? 'Untitled Bubble';
    const opportunity = row.opportunityScore ?? row.opportunity_score ?? '—';
    const growth = row.growthRate ?? row.growth_rate ?? '—';
    const mentions = row.mentionCount ?? row.discussion_count ?? 0;
    return `${index + 1}. ${title}\n   Opportunity: ${opportunity}/100 · Growth: ${growth} · ${mentions} discussions\n   ${row.summary ?? ''}`;
  }).join('\n\n');
}

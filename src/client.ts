import { z } from 'zod';

const configSchema = z.object({
  apiKey: z.string().trim().min(12, 'BUBBLE_AGENT_API_KEY is missing or too short'),
  projectId: z.string().trim().min(1, 'BUBBLE_AGENT_PROJECT_ID is required'),
  apiUrl: z.string().url(),
});

export type BubbleAgentClientConfig = z.infer<typeof configSchema>;

export class BubbleAgentApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'BubbleAgentApiError';
  }
}

export class BubbleAgentClient {
  readonly config: BubbleAgentClientConfig;

  constructor(input: BubbleAgentClientConfig, private readonly fetcher: typeof fetch = fetch) {
    this.config = configSchema.parse(input);
    assertSecureApiUrl(this.config.apiUrl);
  }

  listBubbles(input: {
    category?: string | undefined;
    timeframe?: string | undefined;
    limit?: number | undefined;
    min_score?: number | undefined;
  }) {
    const query = new URLSearchParams({
      timeframe: input.timeframe ?? '24h',
      limit: String(input.limit ?? 10),
      minScore: String(input.min_score ?? 50),
    });
    if (input.category) query.set('q', input.category);
    return this.request(`/bubbles?${query}`);
  }

  searchBubbles(input: {
    query: string;
    timeframe?: string | undefined;
    platforms?: string[] | undefined;
    limit?: number | undefined;
  }) {
    const query = new URLSearchParams({
      q: input.query,
      timeframe: input.timeframe ?? '7d',
      limit: String(input.limit ?? 10),
    });
    for (const platform of input.platforms ?? []) query.append('platform', platform);
    return this.request(`/bubbles?${query}`);
  }

  bubbleDetails(bubbleId: string) {
    return this.request(`/bubbles/${encodeURIComponent(bubbleId)}`);
  }

  compareBubbles(input: { bubble_ids: string[]; goal?: string | undefined }) {
    return this.request('/bubbles/compare', { method: 'POST', body: JSON.stringify(input) });
  }

  generateContent(bubbleId: string, input: Record<string, unknown>) {
    return this.request(`/bubbles/${encodeURIComponent(bubbleId)}/content`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  workspaceProfile() {
    return this.request('/mcp/profile');
  }

  health() {
    return this.requestAbsolute('/healthz');
  }

  private request(path: string, init?: RequestInit) {
    return this.requestAbsolute(`/v1/projects/${encodeURIComponent(this.config.projectId)}${path}`, init);
  }

  private async requestAbsolute(path: string, init: RequestInit = {}): Promise<Record<string, unknown>> {
    let response: Response;
    try {
      response = await this.fetcher(`${this.config.apiUrl.replace(/\/$/, '')}${path}`, {
        ...init,
        headers: {
          authorization: `Bearer ${this.config.apiKey}`,
          'content-type': 'application/json',
          accept: 'application/json',
          ...init.headers,
        },
        signal: init.signal ?? AbortSignal.timeout(30_000),
      });
    } catch (error) {
      throw new BubbleAgentApiError(
        'API_UNREACHABLE',
        error instanceof Error ? `Could not reach Bubble Agent API: ${error.message}` : 'Could not reach Bubble Agent API',
      );
    }

    const text = await response.text();
    const payload = parseJson(text);
    if (!response.ok) {
      const error = isRecord(payload) && isRecord(payload.error) ? payload.error : undefined;
      const code = typeof error?.code === 'string'
        ? error.code
        : response.status === 401 || response.status === 403
          ? 'AUTHENTICATION_FAILED'
          : 'API_ERROR';
      const message = typeof error?.message === 'string'
        ? error.message
        : `Bubble Agent API returned HTTP ${response.status}`;
      throw new BubbleAgentApiError(code, message, response.status);
    }

    if (!isRecord(payload)) {
      throw new BubbleAgentApiError('INVALID_API_RESPONSE', 'Bubble Agent API returned an invalid JSON response.');
    }
    return payload;
  }
}

export function configFromEnv(env: NodeJS.ProcessEnv = process.env): BubbleAgentClientConfig {
  const apiKey = env.BUBBLE_AGENT_API_KEY ?? env.SUBIO_API_KEY;
  const projectId = env.BUBBLE_AGENT_PROJECT_ID ?? env.SUBIO_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new BubbleAgentApiError(
      'CONFIG_REQUIRED',
      'Set BUBBLE_AGENT_API_KEY and BUBBLE_AGENT_PROJECT_ID before starting Bubble Agent MCP.',
    );
  }
  return configSchema.parse({
    apiKey,
    projectId,
    apiUrl: env.BUBBLE_AGENT_API_URL ?? env.SUBIO_API_URL ?? 'https://api.subio.space',
  });
}

function assertSecureApiUrl(value: string) {
  const url = new URL(value);
  const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname === '::1';
  if (url.protocol !== 'https:' && !local) {
    throw new BubbleAgentApiError('INSECURE_API_URL', 'BUBBLE_AGENT_API_URL must use HTTPS unless it points to localhost.');
  }
}

function parseJson(value: string): unknown {
  if (!value) return {};
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

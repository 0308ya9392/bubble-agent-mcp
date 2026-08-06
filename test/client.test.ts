import assert from 'node:assert/strict';
import test from 'node:test';
import { BubbleAgentApiError, BubbleAgentClient, configFromEnv } from '../src/client.js';

const config = {
  apiKey: 'test_api_key_123456',
  projectId: 'project-demo',
  apiUrl: 'https://api.example.com',
};

test('listBubbles scopes requests to the configured project', async () => {
  let request: Request | undefined;
  const fetcher: typeof fetch = async (input, init) => {
    request = new Request(input, init);
    return Response.json({ bubbles: [] });
  };
  const client = new BubbleAgentClient(config, fetcher);

  await client.listBubbles({ category: 'AI agents', timeframe: '24h', limit: 5, min_score: 70 });

  assert.ok(request);
  assert.equal(request.url, 'https://api.example.com/v1/projects/project-demo/bubbles?timeframe=24h&limit=5&minScore=70&q=AI+agents');
  assert.equal(request.headers.get('authorization'), 'Bearer test_api_key_123456');
});

test('remote API URLs must use HTTPS', () => {
  assert.throws(
    () => new BubbleAgentClient({ ...config, apiUrl: 'http://api.example.com' }),
    (error: unknown) => error instanceof BubbleAgentApiError && error.code === 'INSECURE_API_URL',
  );
});

test('localhost HTTP remains available for development', () => {
  assert.doesNotThrow(() => new BubbleAgentClient({ ...config, apiUrl: 'http://localhost:3000' }));
});

test('API errors are normalized without exposing credentials', async () => {
  const fetcher: typeof fetch = async () => Response.json(
    { error: { code: 'RATE_LIMITED', message: 'Try again later' } },
    { status: 429 },
  );
  const client = new BubbleAgentClient(config, fetcher);

  await assert.rejects(
    () => client.listBubbles({}),
    (error: unknown) => {
      assert.ok(error instanceof BubbleAgentApiError);
      assert.equal(error.code, 'RATE_LIMITED');
      assert.equal(error.status, 429);
      assert.equal(error.message, 'Try again later');
      assert.equal(error.message.includes(config.apiKey), false);
      return true;
    },
  );
});

test('environment configuration supports the public variable names', () => {
  assert.deepEqual(configFromEnv({
    BUBBLE_AGENT_API_KEY: 'test_api_key_123456',
    BUBBLE_AGENT_PROJECT_ID: 'project-demo',
  }), {
    apiKey: 'test_api_key_123456',
    projectId: 'project-demo',
    apiUrl: 'https://api.subio.space',
  });
});

import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { getTransactionsTool } from '../tools/get-transactions-tool';
import { getRubeToolsets, rubeMcpClient } from '../mcp/rube-mcp-client';
import { Memory } from '@mastra/memory';
import { TokenLimiter, ToolCallFilter } from '@mastra/memory/processors';
import { PostgresStore, PgVector } from '@mastra/pg';

/**
 * A wrapper agent example showing how to include dynamic Rube MCP toolsets at call time.
 * We re-use the instructions & memory of the original financialAgent to avoid duplication.
 */
export const financialRubeAgent = new Agent({
  name: 'Financial Assistant (Rube Enabled)',
  instructions: `You are a financial assistant that can analyze user transaction data and, when helpful, take external actions via Rube-connected services (email, tasks, notes, collaboration tools). Prioritize accurate financial insight first; only invoke external tools when the user clearly requests an action or integration. Provide concise, structured answers.`,
  model: openai('gpt-4o-mini'),
  tools: { getTransactionsTool },
  memory: new Memory({
    processors: [new ToolCallFilter(), new TokenLimiter(12000)],
    options: {
      workingMemory: {
        enabled: true,
        scope: 'resource',
        template: `# Financial Profile\n\n## Personal Info\n- Name:\n- Location:\n- Timezone:\n\n## Financial Goals\n- Monthly Budget:\n- Savings Target:\n- Key Financial Goals:\n  - [Goal 1]:\n  - [Goal 2]:\n\n## Spending Insights\n- Top Categories:\n- Regular Vendors:\n- Unusual Patterns:\n- Average Monthly Spend:\n\n## Alerts & Concerns\n- Budget Warnings:\n- Recurring Subscriptions:\n- Financial Questions:`,
      },
      semanticRecall: { topK: 6, messageRange: 3, scope: 'resource' },
      threads: {
        generateTitle: {
          model: openai('gpt-4o-mini'),
          instructions: 'Generate a concise (max 6 words) finance-focused title summarizing the user\'s first message. Do not include quotes or punctuation at the end.',
        },
      },
    },
    storage: new PostgresStore({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mastra_memory',
    }),
    vector: new PgVector({
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/mastra_memory',
    }),
    embedder: openai.embedding('text-embedding-3-small'),
  }),
});

/**
 * Helper to generate with merged dynamic Rube toolsets.
 */
export async function generateWithRube(prompt: string, opts: { resourceId: string; threadId: string }) {
  const toolsets = await getRubeToolsets();
  return financialRubeAgent.generate(prompt, { ...opts, toolsets });
}

// Asynchronously fetch and merge Rube tools after agent initialization so the playground starts immediately.
(async () => {
  try {
    const rubeTools = await rubeMcpClient.getTools();
    if (rubeTools && typeof rubeTools === 'object') {
      Object.assign(financialRubeAgent.tools, rubeTools);
      console.log('[Rube MCP] Loaded static tools:', Object.keys(rubeTools));
    } else {
      console.warn('[Rube MCP] getTools() returned unexpected value');
    }
  } catch (err) {
    console.error('[Rube MCP] Failed to load static tools:', err);
  }
})();

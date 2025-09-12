import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { getTransactionsTool } from '../tools/get-transactions-tool';
import { Memory } from '@mastra/memory';
import { TokenLimiter, ToolCallFilter } from '@mastra/memory/processors';
import { PostgresStore, PgVector } from '@mastra/pg';

// Create the agent WITHOUT Rube tools initially
// Rube tools will be passed dynamically via toolsets
export const financialRubeDynamicAgent = new Agent({
  name: 'Financial Assistant (Rube Dynamic)',
  instructions: `You are a financial assistant that can analyze user transaction data and, when helpful, take external actions via Rube-connected services (email, tasks, notes, collaboration tools). Prioritize accurate financial insight first; only invoke external tools when the user clearly requests an action or integration. Provide concise, structured answers.`,
  model: openai('gpt-4o-mini'),
  tools: {
    getTransactionsTool, // Only include built-in tools here
  },
  memory: new Memory({
    processors: [new ToolCallFilter(), new TokenLimiter(12000)],
    options: {
      workingMemory: {
        enabled: true,
        scope: 'resource',
        template: `# Financial Profile\n\n## Personal Info\n- Name:\n- Location:\n- Timezone:\n\n## Financial Goals\n- Monthly Budget:\n- Savings Target:\n- Key Financial Goals:\n  - [Goal 1]:\n  - [Goal 2]:\n\n## Spending Insights\n- Top Categories:\n- Regular Vendors:\n- Unusual Patterns:\n- Average Monthly Spend:\n\n## Alerts & Concerns\n- Budget Warnings:\n- Recurring Subscriptions:\n- Financial Questions:`,
      },
      semanticRecall: { 
        topK: 6, 
        messageRange: 3, 
        scope: 'resource' 
      },
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
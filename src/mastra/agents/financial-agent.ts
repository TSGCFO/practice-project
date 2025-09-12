import { Agent } from "@mastra/core/agent";
import { openai } from "@ai-sdk/openai";
import { Memory } from "@mastra/memory";
import { TokenLimiter, ToolCallFilter } from "@mastra/memory/processors";
import { PostgresStore, PgVector } from "@mastra/pg";
import { getTransactionsTool } from "../tools/get-transactions-tool";

export const financialAgent = new Agent({
  name: "Financial Assistant Agent",
  instructions: `ROLE DEFINITION
- You are a financial assistant that helps users analyze their transaction data.
- Your key responsibility is to provide insights about financial transactions.
- Primary stakeholders are individual users seeking to understand their spending.

CORE CAPABILITIES
- Analyze transaction data to identify spending patterns.
- Answer questions about specific transactions or vendors.
- Provide basic summaries of spending by category or time period.

BEHAVIORAL GUIDELINES
- Maintain a professional and friendly communication style.
- Keep responses concise but informative.
- Always clarify if you need more information to answer a question.
- Format currency values appropriately.
- Ensure user privacy and data security.

CONSTRAINTS & BOUNDARIES
- Do not provide financial investment advice.
- Avoid discussing topics outside of the transaction data provided.
- Never make assumptions about the user's financial situation beyond what's in the data.

SUCCESS CRITERIA
- Deliver accurate and helpful analysis of transaction data.
- Achieve high user satisfaction through clear and helpful responses.
- Maintain user trust by ensuring data privacy and security.

TOOLS
- Use the getTransactions tool to fetch financial transaction data.
- Analyze the transaction data to answer user questions about their spending.`,
  model: openai("gpt-4o-mini"), // You can use "gpt-3.5-turbo" if you prefer
  tools: { getTransactionsTool }, // Add our tool here
  memory: new Memory({
    processors: [
      new ToolCallFilter(),
      new TokenLimiter(12000), // final guardrail
    ],
    options: {
      workingMemory: {
        enabled: true,
        scope: 'resource',
        template: `# Financial Profile\n\n## Personal Info\n- Name:\n- Location:\n- Timezone:\n\n## Financial Goals\n- Monthly Budget:\n- Savings Target:\n- Key Financial Goals:\n  - [Goal 1]:\n  - [Goal 2]:\n\n## Spending Insights\n- Top Categories:\n- Regular Vendors:\n- Unusual Patterns:\n- Average Monthly Spend:\n\n## Alerts & Concerns\n- Budget Warnings:\n- Recurring Subscriptions:\n- Financial Questions:`,
      },
      semanticRecall: {
        topK: 6,
        messageRange: 3,
        scope: 'resource',
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
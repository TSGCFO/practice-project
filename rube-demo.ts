import 'dotenv/config';
import { mastra } from './src/mastra/index.js';
import { getRubeToolsets } from './src/mastra/mcp/rube-mcp-client.js';

async function run() {
  const agent = mastra.getAgent('financialRubeAgent');
  if (!agent) throw new Error('financialRubeAgent not registered');

  const resourceId = 'demo-user';
  const threadId = `${resourceId}-rube-demo`;

  // Dynamically fetch Rube toolsets (ensures latest server metadata)
  const toolsets = await getRubeToolsets();

  const response = await agent.generate(
    'Draft an email to remind me to review my monthly discretionary spending tomorrow morning.',
    { resourceId, threadId, toolsets }
  );

  console.log('\n=== Agent Response ===');
  console.log(response.text);
  console.log('\n(If an email draft tool was available via Rube, the agent may choose to call it.)');
}

run().catch(err => {
  console.error('Rube demo failed:', err);
  process.exit(1);
});

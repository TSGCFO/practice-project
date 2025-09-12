import { financialRubeAgent } from './src/mastra/agents/financial-rube-agent';
import { createFinancialSession } from './src/mastra/agents/financial-session';

async function main() {
  console.log('=== Testing Rube Integration ===');
  
  // Create a session for memory context
  const session = createFinancialSession('test-user');
  
  try {
    // Test 1: Basic financial query
    console.log('\n--- Test 1: Basic Financial Query ---');
    const response1 = await financialRubeAgent.generate(
      "What are my recent transactions?",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
      }
    );
    console.log('Response:', response1.text);
    console.log('Tools used:', response1.toolCalls?.map(tc => tc.toolName) || 'none');
    
    // Test 2: Query that might use Rube tools
    console.log('\n--- Test 2: Search for External Information ---');
    const response2 = await financialRubeAgent.generate(
      "Search for information about budgeting strategies and financial planning using external tools",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
      }
    );
    console.log('Response:', response2.text);
    console.log('Tools used:', response2.toolCalls?.map(tc => tc.toolName) || 'none');
    
    // Test 3: Complex workflow
    console.log('\n--- Test 3: Complex Workflow ---');
    const response3 = await financialRubeAgent.generate(
      "Create a plan to help me organize my finances and find relevant financial tools I could connect",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
      }
    );
    console.log('Response:', response3.text);
    console.log('Tools used:', response3.toolCalls?.map(tc => tc.toolName) || 'none');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
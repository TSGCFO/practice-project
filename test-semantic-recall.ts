import { financialRubeAgent } from './src/mastra/agents/financial-rube-agent';
import { createFinancialSession } from './src/mastra/agents/financial-session';

async function main() {
  console.log('=== Testing Semantic Recall with Rube Integration ===');
  
  // Create a session for memory context
  const session = createFinancialSession('semantic-test-user');
  
  try {
    // Test 1: Initial conversation with financial data
    console.log('\n--- Test 1: Initial Financial Context ---');
    const response1 = await financialRubeAgent.generate(
      "I'm John Smith from San Francisco. I want to save $5000 by the end of the year for my vacation fund. My monthly budget is $3500. What are my recent transactions?",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
      }
    );
    console.log('Response:', response1.text);
    console.log('Tools used:', response1.toolCalls?.map(tc => tc.toolName) || 'none');
    
    // Test 2: Follow-up relying on semantic recall
    console.log('\n--- Test 2: Semantic Recall Test ---');
    const response2 = await financialRubeAgent.generate(
      "Based on what you know about me, what percentage of my budget should I save each month to reach my goal?",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
      }
    );
    console.log('Response:', response2.text);
    console.log('Should recall: John Smith, San Francisco, $5000 goal, $3500 budget');
    
    // Test 3: Combine semantic recall with Rube tools
    console.log('\n--- Test 3: Semantic Recall + Rube Tools ---');
    const response3 = await financialRubeAgent.generate(
      "Search for budgeting apps that could help someone with my financial goals and location",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
      }
    );
    console.log('Response:', response3.text);
    console.log('Tools used:', response3.toolCalls?.map(tc => tc.toolName) || 'none');
    
    // Test 4: Another conversation thread
    console.log('\n--- Test 4: New Thread (Should NOT recall previous info) ---');
    const newSession = createFinancialSession('semantic-test-user'); // Same user, new thread
    const response4 = await financialRubeAgent.generate(
      "What's my savings goal?",
      {
        resourceId: newSession.resourceId,
        threadId: newSession.threadId, // Different thread ID
      }
    );
    console.log('Response:', response4.text);
    console.log('Should NOT recall previous thread information');
    
    // Test 5: Working memory test
    console.log('\n--- Test 5: Working Memory Update ---');
    const response5 = await financialRubeAgent.generate(
      "Actually, I'm Maria Garcia from Miami. My new budget is $4500 and I want to save $8000 for a business investment.",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
      }
    );
    console.log('Response:', response5.text);
    
    // Test 6: Verify working memory was updated
    console.log('\n--- Test 6: Verify Working Memory ---');
    const response6 = await financialRubeAgent.generate(
      "Can you remind me of my personal details and financial goals?",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
      }
    );
    console.log('Response:', response6.text);
    console.log('Should show updated info: Maria Garcia, Miami, $8000 goal, $4500 budget');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
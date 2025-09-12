import { financialRubeDynamicAgent } from './src/mastra/agents/financial-rube-dynamic';
import { rubeMcpClient } from './src/mastra/mcp/rube-mcp-client';
import { createFinancialSession } from './src/mastra/agents/financial-session';

async function main() {
  try {
    console.log('Dynamic Rube Demo - Loading tools dynamically at runtime');
    
    // Create a session
    const session = createFinancialSession('demo-user-dynamic');
    
    // Get toolsets from Rube dynamically
    console.log('Fetching Rube toolsets...');
    const rubeToolsets = await rubeMcpClient.getToolsets();
    console.log('Rube toolsets loaded:', Object.keys(rubeToolsets));
    
    // Example 1: Simple query without Rube tools
    console.log('\n=== Query 1: Without Rube tools ===');
    const response1 = await financialRubeDynamicAgent.generate(
      "What are my recent transactions?",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
        // No toolsets passed - only built-in tools available
      }
    );
    console.log('Response:', response1.text);
    
    // Example 2: Query with Rube tools available
    console.log('\n=== Query 2: With Rube tools ===');
    const response2 = await financialRubeDynamicAgent.generate(
      "Search for information about financial planning strategies using external tools",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
        toolsets: rubeToolsets, // Pass Rube tools dynamically
      }
    );
    console.log('Response:', response2.text);
    
    // Example 3: Stream with Rube tools
    console.log('\n=== Query 3: Streaming with Rube tools ===');
    const streamResponse = await financialRubeDynamicAgent.stream(
      "Help me find my recent Gmail emails about finances and summarize them",
      {
        resourceId: session.resourceId,
        threadId: session.threadId,
        toolsets: rubeToolsets, // Pass Rube tools dynamically
        onStepFinish: (event) => {
          if (event.toolCalls && event.toolCalls.length > 0) {
            console.log('Tool calls made:', event.toolCalls.map(tc => tc.toolName));
          }
        },
      }
    );
    
    // Consume the stream
    let streamedText = '';
    for await (const chunk of streamResponse.textStream) {
      streamedText += chunk;
      process.stdout.write(chunk);
    }
    console.log('\n');
    
    // Disconnect when done
    await rubeMcpClient.disconnect();
    
  } catch (error) {
    console.error('Error in dynamic demo:', error);
  }
}

main();
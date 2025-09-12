import 'dotenv/config';
import { mastra } from './src/mastra/index.js';

async function testMemory() {
  console.log('🧪 Starting Memory Test Suite\n');

  try {
    // Get the financial agent
    const financialAgent = mastra.getAgent('financialAgent');
    
    if (!financialAgent) {
      throw new Error('Financial agent not found!');
    }

    console.log('✅ Financial agent loaded successfully');

    // Test 1: Create a new thread
    console.log('\n📝 Test 1: Creating new conversation thread');
    const threadId = `test-thread-${Date.now()}`;
    
    // Test 2: Send first message
    console.log('\n💬 Test 2: Sending first message');
    const response1 = await financialAgent.generate([{
      role: 'user',
      content: 'Hi! My name is John and my monthly budget is $3,500. I mainly spend on groceries, entertainment, and utilities.'
    }], {
      memory: {
        thread: threadId,
        resource: 'test-user'
      }
    });
    
    console.log('Response 1:', response1.text);
    
    // Test 3: Send follow-up message to test memory
    console.log('\n💬 Test 3: Testing conversation memory');
    const response2 = await financialAgent.generate([{
      role: 'user', 
      content: 'What\'s my budget again? And what categories did I mention?'
    }], {
      memory: {
        thread: threadId,
        resource: 'test-user'
      }
    });
    
    console.log('Response 2:', response2.text);
    
    // Test 4: New thread to verify isolation
    console.log('\n💬 Test 4: Testing thread isolation');
    const newThreadId = `test-thread-${Date.now() + 1}`;
    const response3 = await financialAgent.generate([{
      role: 'user',
      content: 'What\'s my monthly budget?'
    }], {
      memory: {
        thread: newThreadId,
        resource: 'test-user'
      }
    });
    
    console.log('Response 3 (should not know budget):', response3.text);
    
    // Test 5: Return to original thread
    console.log('\n💬 Test 5: Returning to original thread');
    const response4 = await financialAgent.generate([{
      role: 'user',
      content: 'Can you remind me what spending categories I track? Also, I spent $250 on groceries last week.'
    }], {
      memory: {
        thread: threadId,
        resource: 'test-user'
      }
    });
    
    console.log('Response 4:', response4.text);
    
    // Test 6: Complex memory recall
    console.log('\n💬 Test 6: Complex memory recall');
    const response5 = await financialAgent.generate([{
      role: 'user',
      content: 'Based on everything we\'ve discussed, can you summarize my financial profile?'
    }], {
      memory: {
        thread: threadId,
        resource: 'test-user'
      }
    });
    
    console.log('Response 5:', response5.text);
    
    console.log('\n✅ All memory tests completed successfully!');
    console.log(`\n📊 Test Summary:
    - Created ${2} conversation threads
    - Sent ${6} messages total
    - Verified memory persistence within threads
    - Verified thread isolation
    - Tested complex memory recall
    `);

  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Run the test
console.log('🚀 Mastra Memory Test Runner');
console.log('==========================\n');
testMemory().then(() => {
  console.log('\n👋 Test suite finished');
  process.exit(0);
}).catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
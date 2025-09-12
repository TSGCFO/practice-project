import { financialAgent } from './financial-agent';
import { Agent } from '@mastra/core/agent';

// Helper to wrap the financial agent with consistent resource/thread handling.
export function createFinancialSession(resourceId: string, threadSuffix: string = 'general') {
  const threadId = `${resourceId}-${threadSuffix}`;
  return {
    agent: financialAgent,
    resourceId,
    threadId,
    async generate(message: string) {
      return financialAgent.generate(message, { resourceId, threadId });
    },
    async stream(message: string) {
      return financialAgent.stream(message, { resourceId, threadId });
    },
  };
}

// Advanced: create a new unique thread (e.g., per session) with timestamp
export function createUniqueFinancialSession(resourceId: string, label: string) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  return createFinancialSession(resourceId, `${label}-${ts}`);
}

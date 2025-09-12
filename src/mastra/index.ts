import 'dotenv/config';

import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { weatherWorkflow } from './workflows/weather-workflow';
import { weatherAgent } from './agents/weather-agent';
import { financialAgent } from './agents/financial-agent';
import { financialRubeAgent } from './agents/financial-rube-agent';

// Minimal boot diagnostics (no secrets):
console.log('[Boot] Mastra index init');
console.log('[Boot] .env loaded? OPENAI key present:', Boolean(process.env.OPENAI_API_KEY));
console.log('[Boot] DATABASE_URL present?', Boolean(process.env.DATABASE_URL));
console.log('[Boot] RUBE_MCP_URL present?', Boolean(process.env.RUBE_MCP_URL));

export const mastra = new Mastra({
  workflows: { weatherWorkflow },
  agents: { 
    weatherAgent,           // Basic weather agent
    financialAgent,         // Financial agent with memory (no Rube)
    financialRubeAgent,     // Financial agent with Rube (static tools via top-level await)
  },
  storage: new LibSQLStore({
    url: ":memory:",
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
});
import { MCPClient } from '@mastra/mcp';

// Diagnostics (no secrets):
console.log('[Boot] Rube MCP client init');
console.log('[Boot] env.RUBE_MCP_URL present?', Boolean(process.env.RUBE_MCP_URL));
console.log('[Boot] env.RUBE_MCP_TOKEN length:', process.env.RUBE_MCP_TOKEN ? String(process.env.RUBE_MCP_TOKEN).length : 0);

/**
 * Rube MCP Client configuration.
 * Expect the following environment variables:
 *  RUBE_MCP_URL   - The SSE/HTTP URL shown in the Rube installation guide (do NOT commit).
 *  RUBE_MCP_TOKEN - The signed bearer token generated in the guide.
 */
export const rubeMcpClient = new MCPClient({
  id: 'rube-mcp-client',
  servers: {
    rube: {
      url: new URL(process.env.RUBE_MCP_URL || 'https://rube.app/mcp'),
      requestInit: {
        headers: {
          Authorization: `Bearer ${process.env.RUBE_MCP_TOKEN || ''}`,
        },
      },
    },
  },
});

/**
 * Helper to fetch dynamic toolsets for per-request usage.
 * Use when each user/session carries its own auth context.
 */
export async function getRubeToolsets() {
  return rubeMcpClient.getToolsets();
}

import { MCPClient } from '@mastra/mcp';

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

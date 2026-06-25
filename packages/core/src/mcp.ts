import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { ContextDatabase } from './database.js';
import { readProjectMemoryContent } from './export.js';
import { searchRepository } from './search.js';

export async function startMcpServer(rootPath: string): Promise<void> {
  const server = new Server(
    { name: 'contextosai', version: '0.1.0' },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'search_codebase',
        description: 'Semantic search across indexed repository files',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
            limit: { type: 'number', description: 'Max results (default 10)' },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_project_memory',
        description: 'Get the generated project memory overview',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_architecture_rules',
        description: 'Get detected architecture rules and frameworks',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_decisions',
        description: 'Get architectural decisions learned from git history',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'get_stats',
        description: 'Get indexing statistics',
        inputSchema: { type: 'object', properties: {} },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      if (name === 'search_codebase') {
        const query = (args as { query?: string })?.query;
        if (!query) {
          return { content: [{ type: 'text', text: 'Error: query is required' }], isError: true };
        }
        const limit = (args as { limit?: number })?.limit ?? 10;
        const results = await searchRepository(rootPath, query, limit);
        return {
          content: [{ type: 'text', text: JSON.stringify(results, null, 2) }],
        };
      }

      const db = new ContextDatabase(rootPath);
      try {
        if (name === 'get_project_memory') {
          return {
            content: [{ type: 'text', text: readProjectMemoryContent(rootPath) }],
          };
        }
        if (name === 'get_architecture_rules') {
          return {
            content: [{ type: 'text', text: JSON.stringify(db.getRules(), null, 2) }],
          };
        }
        if (name === 'get_decisions') {
          return {
            content: [{ type: 'text', text: JSON.stringify(db.getDecisions(), null, 2) }],
          };
        }
        if (name === 'get_stats') {
          return {
            content: [{ type: 'text', text: JSON.stringify(db.getStats(), null, 2) }],
          };
        }
      } finally {
        db.close();
      }

      return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { content: [{ type: 'text', text: `Error: ${message}` }], isError: true };
    }
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

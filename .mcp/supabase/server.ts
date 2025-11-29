#!/usr/bin/env node

/**
 * Supabase MCP Server
 * 
 * Provides database operations, storage, and authentication capabilities
 * through the Model Context Protocol.
 * 
 * @module @aibos/mcp-supabase
 * @version 1.0.0
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────
// Configuration & Validation
// ─────────────────────────────────────────────────────────────

const ConfigSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_KEY: z.string().min(1),
});

type Config = z.infer<typeof ConfigSchema>;

function getConfig(): Config {
  const config = {
    SUPABASE_URL: process.env.SUPABASE_URL || '',
    SUPABASE_KEY: process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '',
  };

  try {
    return ConfigSchema.parse(config);
  } catch (error) {
    console.error('❌ Invalid Supabase configuration:');
    console.error('Required environment variables:');
    console.error('  - SUPABASE_URL: Your Supabase project URL');
    console.error('  - SUPABASE_KEY: Your Supabase anon/service key');
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────
// Supabase Client
// ─────────────────────────────────────────────────────────────

let supabase: SupabaseClient;

function initializeSupabase(config: Config): void {
  supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
  console.error('✅ Supabase client initialized');
}

// ─────────────────────────────────────────────────────────────
// MCP Server Setup
// ─────────────────────────────────────────────────────────────

const server = new Server(
  {
    name: '@aibos/mcp-supabase',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ─────────────────────────────────────────────────────────────
// Tool Definitions
// ─────────────────────────────────────────────────────────────

const TOOLS = [
  {
    name: 'supabase_query',
    description: 'Execute a SELECT query on a Supabase table with filtering, sorting, and pagination',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        select: { type: 'string', description: 'Columns to select (comma-separated, default: *)', default: '*' },
        filters: {
          type: 'object',
          description: 'Filter conditions (e.g., {"id": 1, "status": "active"})',
          additionalProperties: true,
        },
        orderBy: { type: 'string', description: 'Column to order by (e.g., "created_at")' },
        ascending: { type: 'boolean', description: 'Sort direction (default: true)', default: true },
        limit: { type: 'number', description: 'Maximum number of rows to return' },
        offset: { type: 'number', description: 'Number of rows to skip' },
      },
      required: ['table'],
    },
  },
  {
    name: 'supabase_insert',
    description: 'Insert one or more rows into a Supabase table',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        data: {
          type: ['object', 'array'],
          description: 'Row data (object for single row, array of objects for multiple rows)',
        },
      },
      required: ['table', 'data'],
    },
  },
  {
    name: 'supabase_update',
    description: 'Update rows in a Supabase table matching filter conditions',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        filters: {
          type: 'object',
          description: 'Filter conditions (e.g., {"id": 1})',
          additionalProperties: true,
        },
        data: { type: 'object', description: 'Data to update', additionalProperties: true },
      },
      required: ['table', 'filters', 'data'],
    },
  },
  {
    name: 'supabase_delete',
    description: 'Delete rows from a Supabase table matching filter conditions',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
        filters: {
          type: 'object',
          description: 'Filter conditions (e.g., {"id": 1})',
          additionalProperties: true,
        },
      },
      required: ['table', 'filters'],
    },
  },
  {
    name: 'supabase_rpc',
    description: 'Call a Supabase RPC function (stored procedure)',
    inputSchema: {
      type: 'object',
      properties: {
        function: { type: 'string', description: 'Function name' },
        params: { type: 'object', description: 'Function parameters', additionalProperties: true },
      },
      required: ['function'],
    },
  },
  {
    name: 'supabase_storage_upload',
    description: 'Upload a file to Supabase Storage',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Storage bucket name' },
        path: { type: 'string', description: 'File path in bucket' },
        data: { type: 'string', description: 'File content (base64 encoded for binary files)' },
        contentType: { type: 'string', description: 'MIME type (e.g., "image/png")' },
      },
      required: ['bucket', 'path', 'data'],
    },
  },
  {
    name: 'supabase_storage_download',
    description: 'Download a file from Supabase Storage',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Storage bucket name' },
        path: { type: 'string', description: 'File path in bucket' },
      },
      required: ['bucket', 'path'],
    },
  },
  {
    name: 'supabase_storage_list',
    description: 'List files in a Supabase Storage bucket',
    inputSchema: {
      type: 'object',
      properties: {
        bucket: { type: 'string', description: 'Storage bucket name' },
        path: { type: 'string', description: 'Directory path (optional)', default: '' },
      },
      required: ['bucket'],
    },
  },
  {
    name: 'supabase_list_tables',
    description: 'List all tables in the Supabase database',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'supabase_table_schema',
    description: 'Get the schema (columns, types) of a table',
    inputSchema: {
      type: 'object',
      properties: {
        table: { type: 'string', description: 'Table name' },
      },
      required: ['table'],
    },
  },
] as const;

// ─────────────────────────────────────────────────────────────
// Tool Handlers
// ─────────────────────────────────────────────────────────────

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS,
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'supabase_query': {
        let query = supabase.from(args.table).select(args.select || '*');

        // Apply filters
        if (args.filters) {
          for (const [key, value] of Object.entries(args.filters)) {
            query = query.eq(key, value);
          }
        }

        // Apply ordering
        if (args.orderBy) {
          query = query.order(args.orderBy, { ascending: args.ascending ?? true });
        }

        // Apply pagination
        if (args.limit) {
          query = query.limit(args.limit);
        }
        if (args.offset) {
          query = query.range(args.offset, args.offset + (args.limit || 100) - 1);
        }

        const { data, error } = await query;

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'supabase_insert': {
        const { data, error } = await supabase
          .from(args.table)
          .insert(args.data)
          .select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Inserted ${Array.isArray(data) ? data.length : 1} row(s)\n${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'supabase_update': {
        let query = supabase.from(args.table).update(args.data);

        // Apply filters
        if (args.filters) {
          for (const [key, value] of Object.entries(args.filters)) {
            query = query.eq(key, value);
          }
        }

        const { data, error } = await query.select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Updated ${Array.isArray(data) ? data.length : 0} row(s)\n${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'supabase_delete': {
        let query = supabase.from(args.table).delete();

        // Apply filters
        if (args.filters) {
          for (const [key, value] of Object.entries(args.filters)) {
            query = query.eq(key, value);
          }
        }

        const { data, error } = await query.select();

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `✅ Deleted ${Array.isArray(data) ? data.length : 0} row(s)`,
            },
          ],
        };
      }

      case 'supabase_rpc': {
        const { data, error } = await supabase.rpc(args.function, args.params || {});

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'supabase_storage_upload': {
        const { data, error } = await supabase.storage
          .from(args.bucket)
          .upload(args.path, Buffer.from(args.data, 'base64'), {
            contentType: args.contentType,
            upsert: true,
          });

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: `✅ File uploaded: ${args.path}\n${JSON.stringify(data, null, 2)}`,
            },
          ],
        };
      }

      case 'supabase_storage_download': {
        const { data, error } = await supabase.storage
          .from(args.bucket)
          .download(args.path);

        if (error) throw error;

        const buffer = Buffer.from(await data.arrayBuffer());
        return {
          content: [
            {
              type: 'text',
              text: `✅ File downloaded: ${args.path} (${buffer.length} bytes)\n${buffer.toString('base64').slice(0, 100)}...`,
            },
          ],
        };
      }

      case 'supabase_storage_list': {
        const { data, error } = await supabase.storage
          .from(args.bucket)
          .list(args.path || '');

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'supabase_list_tables': {
        const { data, error } = await supabase.rpc('get_tables');

        if (error) {
          // Fallback: try to query information_schema
          const fallbackQuery = await supabase.from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public');

          if (fallbackQuery.error) throw fallbackQuery.error;

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(fallbackQuery.data?.map((t: any) => t.table_name) || [], null, 2),
              },
            ],
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      case 'supabase_table_schema': {
        const { data, error } = await supabase.rpc('get_table_schema', { table_name: args.table });

        if (error) throw error;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(data, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// ─────────────────────────────────────────────────────────────
// Resource Handlers (Database Metadata)
// ─────────────────────────────────────────────────────────────

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'supabase://tables',
      name: 'Database Tables',
      description: 'List of all tables in the Supabase database',
      mimeType: 'application/json',
    },
    {
      uri: 'supabase://buckets',
      name: 'Storage Buckets',
      description: 'List of all storage buckets',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;

  try {
    if (uri === 'supabase://tables') {
      // Try to get tables list
      const { data, error } = await supabase.rpc('get_tables');
      
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(data || [], null, 2),
          },
        ],
      };
    }

    if (uri === 'supabase://buckets') {
      const { data, error } = await supabase.storage.listBuckets();

      if (error) throw error;

      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    throw new Error(`Unknown resource: ${uri}`);
  } catch (error) {
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
    };
  }
});

// ─────────────────────────────────────────────────────────────
// Server Startup
// ─────────────────────────────────────────────────────────────

async function main() {
  console.error('🚀 Starting Supabase MCP Server...');

  const config = getConfig();
  initializeSupabase(config);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('✅ Supabase MCP Server running');
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

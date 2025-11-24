#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the workspace root (assuming tools/ is in the root)
const workspaceRoot = path.resolve(__dirname, "..");

async function getTailwindTokens() {
  const cssPath = path.resolve(workspaceRoot, "apps/web/app/globals.css");

  if (!fs.existsSync(cssPath)) {
    throw new Error(`Tailwind CSS file not found at: ${cssPath}`);
  }

  const content = fs.readFileSync(cssPath, "utf8");
  return {
    cssPath,
    content,
  };
}

// Create MCP server
const server = new Server(
  {
    name: "tailwind-tokens",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "read_tailwind_config",
        description:
          "Returns Tailwind v4 CSS tokens from globals.css for UI governance and token enforcement",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "read_tailwind_config") {
    try {
      const result = await getTailwindTokens();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error reading Tailwind config: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Tailwind tokens MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});

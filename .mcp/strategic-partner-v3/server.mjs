/**
 * AI-BOS Strategic Partner v3.0
 * Pipeline-Based MCP Server
 * 
 * Implements:
 * - Validation Pipelines (Skill #1)
 * - Performance Monitoring (Skill #2)
 * - Enhanced Error Handling (Skill #3)
 * - Framework-Agnostic Generation (Skill #5)
 * - Design Token Extraction (Skill #7)
 * - Interactive Showcase Generation (Skill #9)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DesignAuditPipeline, FileDesignAuditPipeline } from "./nano-agent.mjs";
import { ComponentGenPipeline, ShowcaseGenPipeline } from "./lynx-agent.mjs";

// Initialize Pipelines
const auditPipeline = new DesignAuditPipeline();
const fileAuditPipeline = new FileDesignAuditPipeline();
const genPipeline = new ComponentGenPipeline();
const showcasePipeline = new ShowcaseGenPipeline();

const server = new Server(
  { name: "aibos-strategic-partner-v3", version: "3.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "nano_audit",
        description: "Audits CSS design system with validation and performance tracking. Validates adaptive luminance, kinetic physics, and component adoption.",
        inputSchema: {
          type: "object",
          properties: {
            cssContent: {
              type: "string",
              description: "CSS content to audit (can be empty if using filePath)",
            },
            framework: {
              type: "string",
              enum: ["react", "vue", "html"],
              default: "html",
              description: "Target framework for validation",
            },
            filePath: {
              type: "string",
              description: "Optional: Path to CSS file (relative to workspace root). If provided, cssContent is ignored.",
            },
          },
          required: [],
        },
      },
      {
        name: "lynx_generate",
        description: "Generates framework-agnostic components. Supports React, Vue, Svelte, and HTML outputs from a single abstract definition.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Component name (e.g., 'Button', 'Card')",
            },
            type: {
              type: "string",
              enum: ["card", "button", "badge", "panel", "input"],
              description: "Component type",
            },
            targetFramework: {
              type: "string",
              enum: ["react", "vue", "svelte", "html"],
              description: "Target framework for code generation",
            },
          },
          required: ["name", "type", "targetFramework"],
        },
      },
      {
        name: "lynx_generate_showcase",
        description: "Generates a standalone HTML file demonstrating specific components. Creates an interactive living style guide with Nano Banana design system.",
        inputSchema: {
          type: "object",
          properties: {
            components: {
              type: "array",
              items: { type: "string" },
              description: "List of components to render (button, card, badge, panel, input)",
            },
            title: {
              type: "string",
              description: "Title for the showcase page",
            },
          },
          required: ["components"],
        },
      },
    ],
  };
});

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Unified Execution Pattern
    switch (name) {
      case "nano_audit": {
        let result;

        // If filePath is provided, use file-based audit
        if (args.filePath) {
          const filePipeline = new FileDesignAuditPipeline(args.filePath);
          result = await filePipeline.execute(
            { framework: args.framework || "html" },
            "nano_audit_file"
          );
        } else {
          // Otherwise use content-based audit
          result = await auditPipeline.execute(
            {
              cssContent: args.cssContent || "",
              framework: args.framework || "html",
            },
            "nano_audit"
          );
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "lynx_generate": {
        const result = await genPipeline.execute(
          {
            name: args.name,
            type: args.type,
            targetFramework: args.targetFramework,
          },
          "lynx_generate"
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "lynx_generate_showcase": {
        const result = await showcasePipeline.execute(
          {
            components: args.components,
            title: args.title,
          },
          "lynx_generate_showcase"
        );

        // Return the HTML directly as text
        return {
          content: [
            {
              type: "text",
              text: result.success ? result.data : JSON.stringify(result, null, 2),
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
          type: "text",
          text: JSON.stringify(
            {
              success: false,
              error: {
                type: "EXECUTION_ERROR",
                message: error.message,
                severity: "critical",
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AI-BOS Strategic Partner v3.0 (Pipelines Active)...");
}

main().catch(console.error);


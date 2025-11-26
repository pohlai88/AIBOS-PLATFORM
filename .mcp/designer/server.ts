#!/usr/bin/env node
/**
 * Designer MCP Server v3.0.0
 * AI-BOS Design Validation System
 *
 * Multi-tenant design governance for Figma + Next.js + AI-BOS
 * Validates design nodes against brand-specific rule configurations.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

import type { DesignNode } from "./types/DesignNode.js";
import type { ValidationError } from "./types/ValidationError.js";

import { validateTypography } from "./validators/validateTypography.js";
import { validateSpacing } from "./validators/validateSpacing.js";
import { validateLayout } from "./validators/validateLayout.js";
import { validateGeometry } from "./validators/validateGeometry.js";
import { validateVisual } from "./validators/validateVisual.js";
import { validateAll, validateAllWithSummary } from "./validators/validateAll.js";
import {
  loadDesignerRules,
  getAvailableThemes,
  type DesignerRules,
} from "./config/configLoader.js";
import { validateThemeSchemas } from "./config/schemaValidator.js";

// ---------------------------------------------------------------
// THEME CACHE (performance optimization)
// ---------------------------------------------------------------

const themeCache: Record<string, DesignerRules> = {};

function getRulesForTheme(theme: string): DesignerRules {
  if (themeCache[theme]) return themeCache[theme];

  // Validate schemas on first load
  try {
    validateThemeSchemas(theme);
  } catch (err) {
    console.error(`[Designer MCP] Schema validation warning for theme "${theme}":`, err);
  }

  const rules = loadDesignerRules(theme);
  themeCache[theme] = rules;
  return rules;
}

// ---------------------------------------------------------------
// MCP SERVER INITIALIZATION
// ---------------------------------------------------------------

const server = new Server(
  {
    name: "aibos-designer",
    version: "3.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// ---------------------------------------------------------------
// TOOL DEFINITIONS
// ---------------------------------------------------------------

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "designer_validate",
      description:
        "Validate design nodes against AI-BOS design system rules. Supports multi-tenant themes (default, dlbb, custom).",
      inputSchema: {
        type: "object" as const,
        properties: {
          nodes: {
            type: "array",
            description: "Array of DesignNode objects to validate",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                type: {
                  type: "string",
                  enum: ["text", "frame", "icon", "button", "component", "container"],
                },
                fontSize: { type: "number" },
                fontWeight: { type: "number" },
                lineHeight: { type: "number" },
                padding: { type: "object" },
                gap: { type: "number" },
                width: { type: "number" },
                height: { type: "number" },
                cornerRadius: { type: "number" },
                surfaceRole: { type: "string" },
                effects: { type: "array", items: { type: "string" } },
                alignment: { type: "string" },
                x: { type: "number" },
                y: { type: "number" },
                children: { type: "array" },
              },
              required: ["id", "type"],
            },
          },
          theme: {
            type: "string",
            description: "Theme/tenant name (default, dlbb, or custom tenant)",
            default: "default",
          },
        },
        required: ["nodes"],
      },
    },
    {
      name: "designer_validate_typography",
      description: "Validate typography rules only (font size, weight, line height)",
      inputSchema: {
        type: "object" as const,
        properties: {
          nodes: { type: "array", description: "Array of DesignNode objects" },
          theme: { type: "string", default: "default" },
        },
        required: ["nodes"],
      },
    },
    {
      name: "designer_validate_spacing",
      description: "Validate spacing rules only (padding, gap, grid alignment)",
      inputSchema: {
        type: "object" as const,
        properties: {
          nodes: { type: "array", description: "Array of DesignNode objects" },
          theme: { type: "string", default: "default" },
        },
        required: ["nodes"],
      },
    },
    {
      name: "designer_validate_layout",
      description: "Validate layout rules only (frame width, alignment)",
      inputSchema: {
        type: "object" as const,
        properties: {
          nodes: { type: "array", description: "Array of DesignNode objects" },
          theme: { type: "string", default: "default" },
        },
        required: ["nodes"],
      },
    },
    {
      name: "designer_validate_geometry",
      description: "Validate geometry rules only (icon sizes, button padding, radius)",
      inputSchema: {
        type: "object" as const,
        properties: {
          nodes: { type: "array", description: "Array of DesignNode objects" },
          theme: { type: "string", default: "default" },
        },
        required: ["nodes"],
      },
    },
    {
      name: "designer_validate_visual",
      description: "Validate visual rules only (surface roles, effects)",
      inputSchema: {
        type: "object" as const,
        properties: {
          nodes: { type: "array", description: "Array of DesignNode objects" },
          theme: { type: "string", default: "default" },
        },
        required: ["nodes"],
      },
    },
    {
      name: "designer_get_rules",
      description: "Get design system rules for a specific theme",
      inputSchema: {
        type: "object" as const,
        properties: {
          theme: {
            type: "string",
            description: "Theme name (default, dlbb, or custom)",
            default: "default",
          },
          category: {
            type: "string",
            enum: ["all", "typography", "spacing", "layout", "geometry", "visual"],
            description: "Rule category to retrieve",
            default: "all",
          },
        },
      },
    },
    {
      name: "designer_list_themes",
      description: "List all available design themes/tenants",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
    },
  ],
}));

// ---------------------------------------------------------------
// TOOL HANDLERS
// ---------------------------------------------------------------

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      // --------------------------------------------------------
      // Full validation (all engines)
      // --------------------------------------------------------
      case "designer_validate": {
        const { nodes, theme = "default" } = args as {
          nodes: DesignNode[];
          theme?: string;
        };

        // Load rules for theme (validates schemas on first load)
        getRulesForTheme(theme);

        const result = validateAllWithSummary(nodes);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  theme,
                  nodeCount: nodes.length,
                  ...result,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      // --------------------------------------------------------
      // Individual validators
      // --------------------------------------------------------
      case "designer_validate_typography": {
        const { nodes, theme = "default" } = args as {
          nodes: DesignNode[];
          theme?: string;
        };
        getRulesForTheme(theme);
        const errors = validateTypography(nodes);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ theme, valid: errors.length === 0, errors }, null, 2),
            },
          ],
        };
      }

      case "designer_validate_spacing": {
        const { nodes, theme = "default" } = args as {
          nodes: DesignNode[];
          theme?: string;
        };
        getRulesForTheme(theme);
        const errors = validateSpacing(nodes);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ theme, valid: errors.length === 0, errors }, null, 2),
            },
          ],
        };
      }

      case "designer_validate_layout": {
        const { nodes, theme = "default" } = args as {
          nodes: DesignNode[];
          theme?: string;
        };
        getRulesForTheme(theme);
        const errors = validateLayout(nodes);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ theme, valid: errors.length === 0, errors }, null, 2),
            },
          ],
        };
      }

      case "designer_validate_geometry": {
        const { nodes, theme = "default" } = args as {
          nodes: DesignNode[];
          theme?: string;
        };
        getRulesForTheme(theme);
        const errors = validateGeometry(nodes);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ theme, valid: errors.length === 0, errors }, null, 2),
            },
          ],
        };
      }

      case "designer_validate_visual": {
        const { nodes, theme = "default" } = args as {
          nodes: DesignNode[];
          theme?: string;
        };
        getRulesForTheme(theme);
        const errors = validateVisual(nodes);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ theme, valid: errors.length === 0, errors }, null, 2),
            },
          ],
        };
      }

      // --------------------------------------------------------
      // Get rules
      // --------------------------------------------------------
      case "designer_get_rules": {
        const { theme = "default", category = "all" } = args as {
          theme?: string;
          category?: string;
        };

        const rules = getRulesForTheme(theme);

        let result: unknown;
        switch (category) {
          case "typography":
            result = rules.typography;
            break;
          case "spacing":
            result = rules.spacing;
            break;
          case "layout":
            result = rules.layout;
            break;
          case "geometry":
            result = rules.geometry;
            break;
          case "visual":
            result = rules.visual;
            break;
          default:
            result = rules;
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ theme, category, rules: result }, null, 2),
            },
          ],
        };
      }

      // --------------------------------------------------------
      // List themes
      // --------------------------------------------------------
      case "designer_list_themes": {
        const themes = getAvailableThemes();
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ themes, count: themes.length }, null, 2),
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
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// ---------------------------------------------------------------
// SERVER STARTUP
// ---------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[Designer MCP] Server v3.0.0 running on stdio");
  console.error("[Designer MCP] Available themes:", getAvailableThemes().join(", "));
}

main().catch((err) => {
  console.error("[Designer MCP] Fatal error:", err);
  process.exit(1);
});

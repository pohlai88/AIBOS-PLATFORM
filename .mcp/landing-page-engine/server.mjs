#!/usr/bin/env node
/**
 * AI-BOS Landing Page Engine MCP Server
 *
 * Provides tools for generating Figma-level landing pages following the
 * AI-BOS "Artifact Layer" design system protocol.
 *
 * Tools:
 * - get_landing_page_protocol: Get the complete landing page generation protocol
 * - get_design_brief_template: Get the reusable request template
 * - get_design_principles: Get AI-BOS design system tokens and rules
 * - validate_landing_page: Validate HTML against AI-BOS design compliance
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const workspaceRoot = resolve(__dirname, "../../");

// AI-BOS Design Principles (from design_principle.md)
const DESIGN_PRINCIPLES = {
  colors: {
    canvas: "#0A0A0B",
    surface: "#161618",
    ink: "#F2F0E9",
    accent: "#D4A373",
    logic: "#64748B",
    glow: "rgba(212, 163, 115, 0.5)",
  },
  forbidden: {
    techBlue: "#2563eb",
    errorRed: "#ff0000",
    pureGrey: "#808080",
  },
  fonts: {
    primary: "Inter",
    data: "JetBrains Mono",
  },
  utilities: {
    bgNoise: "SVG fractal noise overlay at 3.5% opacity",
    borderPhotonic: "Top-light gradient border that simulates a bevel",
    textMetallic: "Linear gradient text fill (White → Grey)",
    livingString: "SVG/Canvas sine wave for hero moments",
  },
  motion: {
    rhythm: "60bpm",
    curve: "cubic-bezier(0.25, 0.8, 0.25, 1)",
    interaction: "Elements magnetize towards mouse cursor",
  },
  laws: [
    "Light, Not Paint: We do not draw borders; we catch light. (Use border-photonic)",
    "Texture, Not Flatness: We use atmospheric grain (bg-noise) to simulate film/paper",
    "Physics, Not Animation: Elements do not just 'fade in'; they float, drift, and react to magnetism",
  ],
};

class LandingPageEngineServer {
  constructor() {
    this.server = new Server(
      {
        name: "aibos-landing-page-engine",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: "get_landing_page_protocol",
          description:
            "Get the complete AI-BOS Landing Page Engine protocol and workflow instructions. This returns the master system instruction that defines how to generate Figma-level landing pages following the Artifact Layer design system.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_design_brief_template",
          description:
            "Get the reusable landing page request template. Use this to understand the required inputs for generating a new landing page.",
          inputSchema: {
            type: "object",
            properties: {},
          },
        },
        {
          name: "get_design_principles",
          description:
            "Get AI-BOS design system principles including color palette, typography, utilities, and motion guidelines. Use this to ensure design compliance.",
          inputSchema: {
            type: "object",
            properties: {
              category: {
                type: "string",
                description: "Category to retrieve (colors, typography, utilities, motion, all)",
                enum: ["colors", "typography", "utilities", "motion", "all"],
              },
            },
          },
        },
        {
          name: "validate_landing_page",
          description:
            "Validate HTML code against AI-BOS design system compliance. Checks for correct color usage, typography, utilities, accessibility, and structure.",
          inputSchema: {
            type: "object",
            properties: {
              html: {
                type: "string",
                description: "HTML code to validate",
              },
            },
            required: ["html"],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case "get_landing_page_protocol":
            return await this.getLandingPageProtocol();

          case "get_design_brief_template":
            return await this.getDesignBriefTemplate();

          case "get_design_principles":
            return await this.getDesignPrinciples(args?.category || "all");

          case "validate_landing_page":
            return await this.validateLandingPage(args?.html);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async getLandingPageProtocol() {
    try {
      const protocolPath = join(workspaceRoot, ".cursorrules");
      const protocol = await readFile(protocolPath, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `# AI-BOS Landing Page Engine Protocol\n\n${protocol}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error reading protocol: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getDesignBriefTemplate() {
    try {
      const templatePath = join(workspaceRoot, "LANDING_PAGE_TEMPLATE.md");
      const template = await readFile(templatePath, "utf-8");

      return {
        content: [
          {
            type: "text",
            text: `# Landing Page Request Template\n\n${template}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error reading template: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  }

  async getDesignPrinciples(category) {
    let principles = {};

    if (category === "all" || category === "colors") {
      principles.colors = DESIGN_PRINCIPLES.colors;
      principles.forbidden = DESIGN_PRINCIPLES.forbidden;
    }

    if (category === "all" || category === "typography") {
      principles.fonts = DESIGN_PRINCIPLES.fonts;
    }

    if (category === "all" || category === "utilities") {
      principles.utilities = DESIGN_PRINCIPLES.utilities;
    }

    if (category === "all" || category === "motion") {
      principles.motion = DESIGN_PRINCIPLES.motion;
    }

    if (category === "all") {
      principles.laws = DESIGN_PRINCIPLES.laws;
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(principles, null, 2),
        },
      ],
    };
  }

  async validateLandingPage(html) {
    if (!html) {
      return {
        content: [
          {
            type: "text",
            text: "Error: HTML code is required",
          },
        ],
        isError: true,
      };
    }

    const issues = [];
    const warnings = [];
    const checks = {
      structure: [],
      colors: [],
      typography: [],
      utilities: [],
      accessibility: [],
    };

    // Check for forbidden colors
    const forbiddenColors = [
      { name: "Tech Blue", value: "#2563eb", regex: /#2563eb|rgb\(37,\s*99,\s*235\)/gi },
      { name: "Error Red", value: "#ff0000", regex: /#ff0000|rgb\(255,\s*0,\s*0\)/gi },
      { name: "Pure Grey", value: "#808080", regex: /#808080|rgb\(128,\s*128,\s*128\)/gi },
    ];

    forbiddenColors.forEach((color) => {
      if (color.regex.test(html)) {
        issues.push(
          `Forbidden color detected: ${color.name} (${color.value}). Use AI-BOS approved colors instead.`
        );
        checks.colors.push({
          type: "error",
          message: `Found ${color.name}`,
        });
      }
    });

    // Check for required background color
    if (!html.includes("#0A0A0B") && !html.includes("bg-\\[#0A0A0B\\]")) {
      warnings.push("Background should use AI-BOS Canvas color (#0A0A0B). Consider adding it.");
      checks.colors.push({
        type: "warning",
        message: "Canvas background not found",
      });
    }

    // Check for bg-noise utility
    if (!html.includes("bg-noise")) {
      warnings.push("Consider adding .bg-noise class to body or large cards for texture.");
      checks.utilities.push({
        type: "warning",
        message: "bg-noise utility not found",
      });
    }

    // Check for border-photonic utility
    const cardCount = (html.match(/<div|card|section/gi) || []).length;
    const photonicCount = (html.match(/border-photonic/gi) || []).length;
    if (cardCount > 3 && photonicCount < cardCount / 2) {
      warnings.push("Consider using .border-photonic on cards and panels for AI-BOS aesthetic.");
      checks.utilities.push({
        type: "warning",
        message: "Insufficient border-photonic usage",
      });
    }

    // Check for text-metallic on headers
    const headerCount = (html.match(/<h[1-3]/gi) || []).length;
    const metallicCount = (html.match(/text-metallic/gi) || []).length;
    if (headerCount > 0 && metallicCount < headerCount) {
      warnings.push("Consider using .text-metallic class on H1, H2, H3 headers for engraved look.");
      checks.typography.push({
        type: "warning",
        message: "text-metallic not used on all headers",
      });
    }

    // Check for semantic HTML
    if (!html.includes("<main>") && !html.includes("<main ")) {
      issues.push("Missing <main> tag. Wrap main content in semantic <main> tag.");
      checks.structure.push({
        type: "error",
        message: "Missing main tag",
      });
    }

    const h1Count = (html.match(/<h1/gi) || []).length;
    if (h1Count === 0) {
      issues.push("Missing <h1> tag. Landing pages should have exactly one H1.");
      checks.structure.push({
        type: "error",
        message: "Missing H1",
      });
    } else if (h1Count > 1) {
      issues.push(`Found ${h1Count} H1 tags. Landing pages should have exactly one H1.`);
      checks.structure.push({
        type: "error",
        message: "Multiple H1 tags found",
      });
    }

    // Check for accessibility
    const imgTags = html.match(/<img[^>]*>/gi) || [];
    const imgWithoutAlt = imgTags.filter((img) => !img.includes("alt="));
    if (imgWithoutAlt.length > 0) {
      issues.push(
        `Found ${imgWithoutAlt.length} image(s) without alt attribute. All images must have alt text.`
      );
      checks.accessibility.push({
        type: "error",
        message: "Images missing alt attributes",
      });
    }

    // Check for CTA buttons
    const buttonCount = (html.match(/<button|role="button"/gi) || []).length;
    const linkCount = (html.match(/<a[^>]*class.*button|href.*#/gi) || []).length;
    if (buttonCount === 0 && linkCount === 0) {
      warnings.push(
        "No CTA buttons found. Landing pages should have clear call-to-action buttons."
      );
      checks.structure.push({
        type: "warning",
        message: "No CTAs found",
      });
    }

    // Summary
    const summary = {
      valid: issues.length === 0,
      issuesCount: issues.length,
      warningsCount: warnings.length,
      checks,
      issues,
      warnings,
    };

    let resultText = `# Landing Page Validation Report\n\n`;
    resultText += `**Status:** ${summary.valid ? "✅ Valid" : "❌ Issues Found"}\n\n`;
    resultText += `**Issues:** ${summary.issuesCount}\n`;
    resultText += `**Warnings:** ${summary.warningsCount}\n\n`;

    if (issues.length > 0) {
      resultText += `## Issues (Must Fix)\n\n`;
      issues.forEach((issue, i) => {
        resultText += `${i + 1}. ${issue}\n`;
      });
      resultText += `\n`;
    }

    if (warnings.length > 0) {
      resultText += `## Warnings (Consider Fixing)\n\n`;
      warnings.forEach((warning, i) => {
        resultText += `${i + 1}. ${warning}\n`;
      });
      resultText += `\n`;
    }

    resultText += `## Detailed Checks\n\n`;
    resultText += `\`\`\`json\n${JSON.stringify(checks, null, 2)}\n\`\`\`\n`;

    return {
      content: [
        {
          type: "text",
          text: resultText,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("AI-BOS Landing Page Engine MCP Server running on stdio");
  }
}

const server = new LandingPageEngineServer();
server.run().catch(console.error);

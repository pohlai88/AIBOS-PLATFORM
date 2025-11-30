#!/usr/bin/env node
// .mcp/ui-testing/server.mjs
// AIBOS UI Testing MCP Server
// Version: 1.0.0
// Test generation, coverage validation, and pattern checking

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

// Get workspace root
const workspaceRoot = path.resolve(__dirname, "../../");
const uiPackageRoot = path.resolve(workspaceRoot, "packages/ui");

// --- Governance / Metadata awareness ---------------------------------------

const GOVERNANCE_CONTEXT = {
  toolId: "aibos-ui-testing",
  domain: "ui_testing_validation",
  registryTable: "mdm_tool_registry",
};

function withGovernanceMetadata(payload, category, severity) {
  return {
    ...payload,
    governance: {
      ...GOVERNANCE_CONTEXT,
      category,
      severity,
    },
  };
}

// --- Utility Functions -------------------------------------------------------

/**
 * Read file content safely
 */
function readFileSafe(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { exists: false, content: null };
    }
    return { exists: true, content: fs.readFileSync(filePath, "utf8") };
  } catch (error) {
    return { exists: false, content: null, error: error.message };
  }
}

/**
 * Extract component name from file path
 */
function extractComponentName(filePath) {
  const basename = path.basename(filePath, path.extname(filePath));
  // Convert kebab-case to PascalCase
  return basename
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/**
 * Determine test file path from component path
 */
function getTestFilePath(componentPath) {
  const ext = path.extname(componentPath);
  const dir = path.dirname(componentPath);
  const basename = path.basename(componentPath, ext);
  return path.join(dir, `${basename}.test${ext}`);
}

/**
 * Check if path is within UI package
 */
function isWithinUIPackage(filePath) {
  const resolved = path.resolve(uiPackageRoot, filePath);
  return resolved.startsWith(uiPackageRoot);
}

// --- Test Generation Functions ----------------------------------------------

/**
 * Generate test file content for a component
 */
function generateComponentTest(componentPath, options = {}) {
  const { testType = "unit", includeSnapshots = false } = options;
  const componentName = extractComponentName(componentPath);
  const relativePath = path.relative(uiPackageRoot, componentPath);
  const testRelativePath = path.relative(
    uiPackageRoot,
    getTestFilePath(componentPath)
  );

  // Calculate import path depth
  const depth = relativePath.split(path.sep).length - 1;
  const importPath = "../".repeat(depth) + componentName;
  const utilsPath = "../".repeat(depth) + "tests/utils/render-helpers";

  let testContent = `/**
 * ${componentName} Component Tests
 * 
 * Tests for the ${componentName} component following GRCD-TESTING.md patterns
 */

import { describe, it, expect, vi } from "vitest";
import { renderWithTheme, screen } from "${utilsPath}";
import { expectAccessible } from "${utilsPath.replace("render-helpers", "accessibility-helpers")}";
import { ${componentName} } from "./${path.basename(componentPath, path.extname(componentPath))}";

describe("${componentName}", () => {
  describe("Rendering", () => {
    it("should render ${componentName.toLowerCase()} with text", async () => {
      const { container } = renderWithTheme(<${componentName}>Test Content</${componentName}>);
      const element = container.querySelector("div, button, input, span").firstChild;
      expect(element).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should meet WCAG AA standards", async () => {
      const { container } = renderWithTheme(<${componentName}>Test Content</${componentName}>);
      await expectAccessible(container);
    });
  });

  describe("Interactions", () => {
    it("should handle user interactions", () => {
      const handleAction = vi.fn();
      const { container } = renderWithTheme(
        <${componentName} onClick={handleAction}>Click me</${componentName}>
      );
      const element = container.querySelector("div, button");
      if (element) {
        element.click();
        expect(handleAction).toHaveBeenCalledTimes(1);
      }
    });
  });
});
`;

  if (includeSnapshots) {
    testContent += `
  describe("Snapshots", () => {
    it("should match snapshot", () => {
      const { container } = renderWithTheme(<${componentName}>Test Content</${componentName}>);
      expect(container).toMatchSnapshot();
    });
  });
`;
  }

  return testContent;
}

// --- Coverage Validation Functions ------------------------------------------

/**
 * Check test coverage for a component
 */
function checkTestCoverage(componentPath) {
  const coveragePath = path.join(
    uiPackageRoot,
    "coverage",
    "coverage-summary.json"
  );
  const { exists, content } = readFileSafe(coveragePath);

  if (!exists) {
    return {
      valid: false,
      coverage: 0,
      threshold: 95,
      message: "Coverage report not found. Run 'pnpm test:coverage' first.",
      componentPath,
    };
  }

  try {
    const coverage = JSON.parse(content);
    const relativePath = path.relative(uiPackageRoot, componentPath);
    const fileCoverage = coverage[relativePath];

    if (!fileCoverage) {
      return {
        valid: false,
        coverage: 0,
        threshold: 95,
        message: `No coverage data found for ${relativePath}`,
        componentPath,
      };
    }

    const lineCoverage = fileCoverage.lines?.pct || 0;
    const functionCoverage = fileCoverage.functions?.pct || 0;
    const branchCoverage = fileCoverage.branches?.pct || 0;
    const statementCoverage = fileCoverage.statements?.pct || 0;

    const minCoverage = Math.min(
      lineCoverage,
      functionCoverage,
      branchCoverage,
      statementCoverage
    );

    const valid = minCoverage >= 95;

    return {
      valid,
      coverage: {
        lines: lineCoverage,
        functions: functionCoverage,
        branches: branchCoverage,
        statements: statementCoverage,
        minimum: minCoverage,
      },
      threshold: 95,
      message: valid
        ? `Coverage meets threshold (${minCoverage.toFixed(2)}% >= 95%)`
        : `Coverage below threshold (${minCoverage.toFixed(2)}% < 95%)`,
      componentPath,
    };
  } catch (error) {
    return {
      valid: false,
      coverage: 0,
      threshold: 95,
      message: `Error parsing coverage report: ${error.message}`,
      componentPath,
    };
  }
}

// --- Pattern Validation Functions --------------------------------------------

/**
 * Validate test file follows GRCD patterns
 */
function validateTestPattern(testFilePath) {
  const { exists, content } = readFileSafe(testFilePath);

  if (!exists) {
    return {
      valid: false,
      violations: [
        {
          rule: "test_file_exists",
          severity: "error",
          message: `Test file does not exist: ${testFilePath}`,
        },
      ],
      testFilePath,
    };
  }

  const violations = [];
  const lines = content.split("\n");

  // Check for required imports
  const hasVitest = content.includes('from "vitest"');
  const hasRenderHelper = content.includes("renderWithTheme");
  const hasAccessibilityHelper = content.includes("expectAccessible");

  if (!hasVitest) {
    violations.push({
      rule: "vitest_import",
      severity: "error",
      message: "Test file must import from 'vitest'",
      line: 1,
    });
  }

  if (!hasRenderHelper) {
    violations.push({
      rule: "render_helper_usage",
      severity: "warning",
      message: "Test should use renderWithTheme helper",
      line: 1,
    });
  }

  if (!hasAccessibilityHelper) {
    violations.push({
      rule: "accessibility_test",
      severity: "warning",
      message: "Test should include accessibility tests using expectAccessible",
      line: 1,
    });
  }

  // Check for describe blocks
  const hasDescribe = content.includes("describe(");
  if (!hasDescribe) {
    violations.push({
      rule: "describe_blocks",
      severity: "error",
      message: "Test file must use describe() blocks",
      line: 1,
    });
  }

  // Check for it blocks
  const hasIt = content.includes("it(");
  if (!hasIt) {
    violations.push({
      rule: "test_cases",
      severity: "error",
      message: "Test file must have at least one it() test case",
      line: 1,
    });
  }

  // Check for accessibility test
  const hasA11yTest =
    content.includes("Accessibility") || content.includes("a11y");
  if (!hasA11yTest) {
    violations.push({
      rule: "accessibility_section",
      severity: "warning",
      message: "Test should include an 'Accessibility' describe section",
      line: 1,
    });
  }

  return {
    valid: violations.filter((v) => v.severity === "error").length === 0,
    violations,
    testFilePath,
    summary:
      violations.length === 0
        ? "Test file follows GRCD patterns"
        : `Found ${violations.length} violation(s)`,
  };
}

// --- MCP Server Setup -------------------------------------------------------

const server = new Server(
  {
    name: "aibos-ui-testing",
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
        name: "generate_component_test",
        description:
          "Generate test file for a React component following GRCD-TESTING.md patterns",
        inputSchema: {
          type: "object",
          properties: {
            componentPath: {
              type: "string",
              description:
                "Path to component file (relative to packages/ui or absolute)",
            },
            testType: {
              type: "string",
              enum: ["unit", "integration", "accessibility"],
              description: "Type of test to generate",
              default: "unit",
            },
            includeSnapshots: {
              type: "boolean",
              description: "Include snapshot tests",
              default: false,
            },
          },
          required: ["componentPath"],
        },
      },
      {
        name: "check_test_coverage",
        description:
          "Check if component meets 95% coverage threshold from coverage report",
        inputSchema: {
          type: "object",
          properties: {
            componentPath: {
              type: "string",
              description:
                "Path to component file (relative to packages/ui or absolute)",
            },
            threshold: {
              type: "number",
              description: "Coverage threshold percentage",
              default: 95,
            },
          },
          required: ["componentPath"],
        },
      },
      {
        name: "validate_test_pattern",
        description:
          "Validate test file follows GRCD-TESTING.md patterns and standards",
        inputSchema: {
          type: "object",
          properties: {
            testFilePath: {
              type: "string",
              description:
                "Path to test file (relative to packages/ui or absolute)",
            },
          },
          required: ["testFilePath"],
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "generate_component_test": {
        const { componentPath, testType, includeSnapshots } = args;

        // Resolve path
        const resolvedPath = isWithinUIPackage(componentPath)
          ? path.resolve(uiPackageRoot, componentPath)
          : path.resolve(componentPath);

        if (!fs.existsSync(resolvedPath)) {
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  withGovernanceMetadata(
                    {
                      success: false,
                      error: `Component file not found: ${resolvedPath}`,
                      componentPath: resolvedPath,
                    },
                    "test_generation",
                    "error"
                  ),
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        const testContent = generateComponentTest(resolvedPath, {
          testType,
          includeSnapshots,
        });
        const testFilePath = getTestFilePath(resolvedPath);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(
                  {
                    success: true,
                    testContent,
                    testFilePath: path.relative(uiPackageRoot, testFilePath),
                    componentPath: path.relative(uiPackageRoot, resolvedPath),
                    message: "Test file generated successfully",
                  },
                  "test_generation",
                  "info"
                ),
                null,
                2
              ),
            },
          ],
        };
      }

      case "check_test_coverage": {
        const { componentPath, threshold = 95 } = args;

        // Resolve path
        const resolvedPath = isWithinUIPackage(componentPath)
          ? path.resolve(uiPackageRoot, componentPath)
          : path.resolve(componentPath);

        const result = checkTestCoverage(resolvedPath);
        const severity = result.valid ? "info" : "error";

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(result, "coverage_validation", severity),
                null,
                2
              ),
            },
          ],
        };
      }

      case "validate_test_pattern": {
        const { testFilePath } = args;

        // Resolve path
        const resolvedPath = isWithinUIPackage(testFilePath)
          ? path.resolve(uiPackageRoot, testFilePath)
          : path.resolve(testFilePath);

        const result = validateTestPattern(resolvedPath);
        const severity = result.valid ? "info" : "warning";

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                withGovernanceMetadata(result, "pattern_validation", severity),
                null,
                2
              ),
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
            withGovernanceMetadata(
              {
                success: false,
                error: error.message,
                tool: name,
              },
              "error",
              "error"
            ),
            null,
            2
          ),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("AIBOS UI Testing MCP server running on stdio");
}

main().catch((error) => {
  console.error("[UI-TESTING] Fatal error in main():", error);
  process.exit(1);
});

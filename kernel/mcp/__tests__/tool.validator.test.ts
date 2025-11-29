/**
 * MCP Tool Validator Tests
 * 
 * Tests for GRCD-KERNEL F-9: Validate MCP tool invocations
 */

import { describe, it, expect } from "@jest/globals";
import { mcpToolValidator } from "../validator/tool.validator";
import type { MCPTool, MCPToolInvocation } from "../types";

describe("MCPToolValidator", () => {
  describe("validate()", () => {
    it("should validate correct tool invocation", () => {
      const tool: MCPTool = {
        name: "test_tool",
        description: "Test tool",
        inputSchema: {
          type: "object",
          properties: {
            input: { type: "string" },
          },
          required: ["input"],
        },
      };

      const invocation: MCPToolInvocation = {
        tool: "test_tool",
        arguments: {
          input: "test value",
        },
      };

      const result = mcpToolValidator.validate(tool, invocation);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invocation with wrong tool name", () => {
      const tool: MCPTool = {
        name: "correct_tool",
        description: "Test tool",
        inputSchema: {},
      };

      const invocation: MCPToolInvocation = {
        tool: "wrong_tool",
        arguments: {},
      };

      const result = mcpToolValidator.validate(tool, invocation);

      expect(result.valid).toBe(false);
      expect(result.errors?.[0]).toMatchObject({
        code: "TOOL_NAME_MISMATCH",
      });
    });

    it("should validate empty arguments for tool with no schema", () => {
      const tool: MCPTool = {
        name: "simple_tool",
        description: "Simple tool",
        inputSchema: {},
      };

      const invocation: MCPToolInvocation = {
        tool: "simple_tool",
        arguments: {},
      };

      const result = mcpToolValidator.validate(tool, invocation);

      expect(result.valid).toBe(true);
    });
  });

  describe("isValid()", () => {
    it("should return true for valid invocation", () => {
      const tool: MCPTool = {
        name: "test_tool",
        description: "Test tool",
        inputSchema: {},
      };

      const invocation: MCPToolInvocation = {
        tool: "test_tool",
        arguments: {},
      };

      expect(mcpToolValidator.isValid(tool, invocation)).toBe(true);
    });

    it("should return false for invalid invocation", () => {
      const tool: MCPTool = {
        name: "test_tool",
        description: "Test tool",
        inputSchema: {},
      };

      const invocation: MCPToolInvocation = {
        tool: "wrong_tool",
        arguments: {},
      };

      expect(mcpToolValidator.isValid(tool, invocation)).toBe(false);
    });
  });
});


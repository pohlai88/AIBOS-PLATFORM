/**
 * MCP Tool Validator
 * 
 * GRCD-KERNEL v4.0.0 F-9: Validate MCP tool invocations
 * Runtime validation of tool invocations against schemas
 */

import type { MCPTool, MCPToolInvocation, MCPValidationResult } from "../types";
import { z } from "zod";

export class MCPToolValidator {
  /**
   * Validate tool invocation against tool schema
   * 
   * @param tool - Tool definition from manifest
   * @param invocation - Tool invocation request
   * @returns Validation result
   */
  public validate(
    tool: MCPTool,
    invocation: MCPToolInvocation
  ): MCPValidationResult {
    const result: MCPValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // 1. Check tool name matches
    if (tool.name !== invocation.tool) {
      result.valid = false;
      result.errors?.push({
        path: "tool",
        message: `Tool name mismatch: expected ${tool.name}, got ${invocation.tool}`,
        code: "TOOL_NAME_MISMATCH",
      });
      return result;
    }

    // 2. Validate arguments against input schema
    try {
      // Convert JSON Schema to Zod schema (simplified)
      const zodSchema = this.jsonSchemaToZod(tool.inputSchema);
      const validation = zodSchema.safeParse(invocation.arguments);

      if (!validation.success) {
        result.valid = false;
        result.errors = validation.error.errors.map((err) => ({
          path: `arguments.${err.path.join(".")}`,
          message: err.message,
          code: err.code,
        }));
      }
    } catch (error) {
      result.valid = false;
      result.errors?.push({
        path: "inputSchema",
        message: `Failed to validate arguments: ${error instanceof Error ? error.message : "Unknown error"}`,
        code: "SCHEMA_VALIDATION_ERROR",
      });
    }

    return result;
  }

  /**
   * Quick validation (boolean only)
   */
  public isValid(tool: MCPTool, invocation: MCPToolInvocation): boolean {
    return this.validate(tool, invocation).valid;
  }

  /**
   * Convert JSON Schema to Zod schema (simplified implementation)
   * 
   * NOTE: This is a basic implementation. For production, consider using
   * a library like json-schema-to-zod for comprehensive support.
   */
  private jsonSchemaToZod(jsonSchema: Record<string, any>): z.ZodType {
    // For now, use a permissive schema
    // TODO: Implement full JSON Schema -> Zod conversion
    return z.record(z.any());
  }
}

/**
 * Export singleton instance
 */
export const mcpToolValidator = new MCPToolValidator();


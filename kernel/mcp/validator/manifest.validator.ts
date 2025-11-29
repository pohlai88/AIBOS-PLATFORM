/**
 * MCP Manifest Validator
 * 
 * GRCD-KERNEL v4.0.0 F-2: Validate manifests before hydration
 * Runtime validation of MCP manifests with detailed error reporting
 */

import type { MCPManifest, MCPValidationResult, MCPValidationError } from "../types";
import { validateMCPManifest } from "../schemas/mcp-manifest.schema";
import { MCP_PROTOCOL_VERSION } from "../types";

export class MCPManifestValidator {
  /**
   * Validate MCP manifest with detailed errors
   * 
   * @param manifest - Manifest to validate
   * @returns Validation result with errors/warnings
   */
  public validate(manifest: unknown): MCPValidationResult {
    const result: MCPValidationResult = {
      valid: true,
      errors: [],
      warnings: [],
    };

    // 1. Schema validation
    const schemaValidation = validateMCPManifest(manifest);
    if (!schemaValidation.success) {
      result.valid = false;
      result.errors = schemaValidation.error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
        code: err.code,
      }));
      return result; // Early return on schema errors
    }

    const validatedManifest = schemaValidation.data;

    // 2. Protocol version check
    if (validatedManifest.protocolVersion !== MCP_PROTOCOL_VERSION) {
      result.warnings?.push({
        path: "protocolVersion",
        message: `Protocol version ${validatedManifest.protocolVersion} may not be compatible with ${MCP_PROTOCOL_VERSION}`,
        code: "PROTOCOL_VERSION_MISMATCH",
      });
    }

    // 3. Tool name uniqueness
    if (validatedManifest.tools) {
      const toolNames = new Set<string>();
      validatedManifest.tools.forEach((tool, index) => {
        if (toolNames.has(tool.name)) {
          result.valid = false;
          result.errors?.push({
            path: `tools[${index}].name`,
            message: `Duplicate tool name: ${tool.name}`,
            code: "DUPLICATE_TOOL_NAME",
          });
        }
        toolNames.add(tool.name);
      });
    }

    // 4. Resource URI uniqueness
    if (validatedManifest.resources) {
      const resourceUris = new Set<string>();
      validatedManifest.resources.forEach((resource, index) => {
        if (resourceUris.has(resource.uri)) {
          result.valid = false;
          result.errors?.push({
            path: `resources[${index}].uri`,
            message: `Duplicate resource URI: ${resource.uri}`,
            code: "DUPLICATE_RESOURCE_URI",
          });
        }
        resourceUris.add(resource.uri);
      });
    }

    // 5. Prompt name uniqueness
    if (validatedManifest.prompts) {
      const promptNames = new Set<string>();
      validatedManifest.prompts.forEach((prompt, index) => {
        if (promptNames.has(prompt.name)) {
          result.valid = false;
          result.errors?.push({
            path: `prompts[${index}].name`,
            message: `Duplicate prompt name: ${prompt.name}`,
            code: "DUPLICATE_PROMPT_NAME",
          });
        }
        promptNames.add(prompt.name);
      });
    }

    return result;
  }

  /**
   * Quick validation (boolean only)
   */
  public isValid(manifest: unknown): boolean {
    return this.validate(manifest).valid;
  }
}

/**
 * Export singleton instance
 */
export const mcpManifestValidator = new MCPManifestValidator();


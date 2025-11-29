/**
 * MCP Manifest Schema (Zod)
 * 
 * GRCD-KERNEL v4.0.0 Section 7.2
 * Single Source of Truth for MCP manifest validation
 */

import { z } from "zod";

/**
 * SemVer Version Regex
 */
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * MCP Protocol Version Schema
 */
export const mcpProtocolVersionSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/**
 * MCP Tool Input Schema (JSON Schema)
 */
export const mcpToolInputSchema = z.record(z.any());

/**
 * MCP Tool Schema
 */
export const mcpToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  inputSchema: mcpToolInputSchema,
});

/**
 * MCP Resource Schema
 */
export const mcpResourceSchema = z.object({
  uri: z.string().url(),
  name: z.string().min(1),
  description: z.string().min(1),
  mimeType: z.string().optional(),
});

/**
 * MCP Prompt Argument Schema
 */
export const mcpPromptArgumentSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  required: z.boolean().optional(),
});

/**
 * MCP Prompt Schema
 */
export const mcpPromptSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  arguments: z.array(mcpPromptArgumentSchema).optional(),
});

/**
 * MCP Manifest Schema - Complete validation
 * 
 * This is the SSOT for all MCP manifest validation.
 * All manifests MUST conform to this schema.
 */
export const mcpManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(SEMVER_REGEX, "Version must be SemVer (e.g., 1.0.0)"),
  protocol: z.literal("mcp"),
  protocolVersion: mcpProtocolVersionSchema,
  description: z.string().optional(),
  tools: z.array(mcpToolSchema).optional(),
  resources: z.array(mcpResourceSchema).optional(),
  prompts: z.array(mcpPromptSchema).optional(),
});

/**
 * Type inference from schema
 */
export type MCPManifestSchema = z.infer<typeof mcpManifestSchema>;
export type MCPToolSchema = z.infer<typeof mcpToolSchema>;
export type MCPResourceSchema = z.infer<typeof mcpResourceSchema>;
export type MCPPromptSchema = z.infer<typeof mcpPromptSchema>;

/**
 * Validate MCP Manifest
 * 
 * @param manifest - Raw manifest object to validate
 * @returns Validation result with parsed manifest or errors
 */
export function validateMCPManifest(manifest: unknown) {
  return mcpManifestSchema.safeParse(manifest);
}


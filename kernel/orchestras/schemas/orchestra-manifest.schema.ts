/**
 * Orchestra Manifest Schema (Zod)
 * 
 * GRCD-KERNEL v4.0.0 Section 7.3: Orchestra Manifest Schema
 * Single Source of Truth for Orchestra manifest validation
 */

import { z } from "zod";
import { OrchestrationDomain } from "../types";

/**
 * SemVer Version Regex
 */
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

/**
 * Orchestra Domain Schema
 */
export const orchestrationDomainSchema = z.nativeEnum(OrchestrationDomain);

/**
 * Orchestra Agent Schema
 */
export const orchestraAgentSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  description: z.string().min(1),
  capabilities: z.array(z.string()),
  mcpTools: z.array(z.string()).optional(),
});

/**
 * Orchestra Tool Schema
 */
export const orchestraToolSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  inputSchema: z.record(z.any()),
  outputSchema: z.record(z.any()).optional(),
  requiredPermissions: z.array(z.string()).optional(),
});

/**
 * Orchestra Policy Schema
 */
export const orchestraPolicySchema = z.object({
  id: z.string().min(1),
  domain: orchestrationDomainSchema,
  rule: z.string().min(1),
  precedence: z.enum(["legal", "industry", "internal"]),
  enforced: z.boolean(),
});

/**
 * Orchestra Manifest Schema - Complete validation
 */
export const orchestraManifestSchema = z.object({
  name: z.string().min(1),
  version: z.string().regex(SEMVER_REGEX, "Version must be SemVer (e.g., 1.0.0)"),
  domain: orchestrationDomainSchema,
  description: z.string().min(1),
  agents: z.array(orchestraAgentSchema).min(1, "At least one agent required"),
  tools: z.array(orchestraToolSchema),
  policies: z.array(orchestraPolicySchema),
  dependencies: z.array(orchestrationDomainSchema).optional(),
  mcpServers: z.array(z.string()).optional(),
  metadata: z
    .object({
      author: z.string().optional(),
      tags: z.array(z.string()).optional(),
      priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    })
    .optional(),
});

/**
 * Orchestra Action Request Schema
 */
export const orchestraActionRequestSchema = z.object({
  domain: orchestrationDomainSchema,
  action: z.string().min(1),
  arguments: z.record(z.any()),
  context: z.object({
    tenantId: z.string().optional(),
    userId: z.string().optional(),
    traceId: z.string().optional(),
    sessionId: z.string().optional(),
    orchestrationId: z.string().optional(),
    parentDomain: orchestrationDomainSchema.optional(),
    permissions: z.array(z.string()).optional(),
    roles: z.array(z.string()).optional(),
  }),
});

/**
 * Type inference from schemas
 */
export type OrchestraManifestSchema = z.infer<typeof orchestraManifestSchema>;
export type OrchestraAgentSchema = z.infer<typeof orchestraAgentSchema>;
export type OrchestraToolSchema = z.infer<typeof orchestraToolSchema>;
export type OrchestraPolicySchema = z.infer<typeof orchestraPolicySchema>;
export type OrchestraActionRequestSchema = z.infer<typeof orchestraActionRequestSchema>;

/**
 * Validate Orchestra Manifest
 */
export function validateOrchestraManifest(manifest: unknown) {
  return orchestraManifestSchema.safeParse(manifest);
}

/**
 * Validate Orchestra Action Request
 */
export function validateOrchestraActionRequest(request: unknown) {
  return orchestraActionRequestSchema.safeParse(request);
}


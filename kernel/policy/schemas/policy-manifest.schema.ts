/**
 * Policy Manifest Schema
 * 
 * GRCD-KERNEL v4.0.0 C-6: Policy validation and schema enforcement
 */

import { z } from "zod";
import {
  PolicyPrecedence,
  PolicyStatus,
  PolicyEnforcementMode,
} from "../types";

/**
 * Policy Condition Schema
 */
export const policyConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(["eq", "ne", "gt", "lt", "gte", "lte", "in", "nin", "contains", "regex"]),
  value: z.any(),
});

/**
 * Policy Rule Schema
 */
export const policyRuleSchema = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  conditions: z.array(policyConditionSchema).min(1),
  effect: z.enum(["allow", "deny"]),
  metadata: z.record(z.any()).optional(),
});

/**
 * Policy Scope Schema
 */
export const policyScopeSchema = z.object({
  orchestras: z.array(z.string()).optional(),
  tenants: z.array(z.string()).optional(),
  roles: z.array(z.string()).optional(),
  actions: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
});

/**
 * Policy Manifest Schema
 */
export const policyManifestSchema = z.object({
  id: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/), // SemVer
  description: z.string().min(1),
  precedence: z.nativeEnum(PolicyPrecedence),
  status: z.nativeEnum(PolicyStatus),
  enforcementMode: z.nativeEnum(PolicyEnforcementMode),
  scope: policyScopeSchema,
  rules: z.array(policyRuleSchema).min(1),
  effectiveDate: z.coerce.date().optional(),
  expirationDate: z.coerce.date().optional(),
  owner: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Policy Evaluation Request Schema
 */
export const policyEvaluationRequestSchema = z.object({
  tenantId: z.string().optional(),
  userId: z.string().optional(),
  roles: z.array(z.string()).optional(),
  orchestra: z.string().optional(),
  action: z.string().min(1),
  resource: z.string().optional(),
  context: z.record(z.any()),
  traceId: z.string().optional(),
});

/**
 * Validate policy manifest
 */
export function validatePolicyManifest(manifest: unknown): {
  success: boolean;
  data?: any;
  error?: z.ZodError;
} {
  const result = policyManifestSchema.safeParse(manifest);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}

/**
 * Validate policy evaluation request
 */
export function validatePolicyEvaluationRequest(request: unknown): {
  success: boolean;
  data?: any;
  error?: z.ZodError;
} {
  const result = policyEvaluationRequestSchema.safeParse(request);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, error: result.error };
  }
}


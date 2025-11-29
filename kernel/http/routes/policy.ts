/**
 * Policy HTTP API Routes
 * 
 * GRCD-KERNEL v4.0.0 C-6: RESTful API for policy management
 */

import type { Hono } from "hono";
import { z } from "zod";
import {
  validateJsonBody,
  validateParams,
  getValidBody,
  getValidParams,
} from "../zod-middleware";
import { policyRegistry } from "../../policy/registry/policy-registry";
import { policyEngine } from "../../policy/engine/policy-engine";
import {
  policyManifestSchema,
  policyEvaluationRequestSchema,
} from "../../policy/schemas/policy-manifest.schema";
import { PolicyPrecedence } from "../../policy/types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("policy-routes");

export function registerPolicyRoutes(app: Hono) {
  // --- Policy Management ---

  // GET /policies - List all active policies
  app.get("/policies", async (c) => {
    const policies = policyRegistry.listActive();
    return c.json({ policies });
  });

  // GET /policies/precedence/:level - List policies by precedence level
  const GetByPrecedenceParams = z.object({
    level: z.enum(["legal", "industry", "internal"]),
  });
  app.get(
    "/policies/precedence/:level",
    validateParams(GetByPrecedenceParams),
    async (c) => {
      const { level } = getValidParams(c);
      const precedenceMap = {
        legal: PolicyPrecedence.LEGAL,
        industry: PolicyPrecedence.INDUSTRY,
        internal: PolicyPrecedence.INTERNAL,
      };
      const policies = policyRegistry.listByPrecedence(precedenceMap[level]);
      return c.json({ policies });
    }
  );

  // GET /policies/:id - Get policy by ID
  const GetPolicyParams = z.object({
    id: z.string().min(1),
  });
  app.get("/policies/:id", validateParams(GetPolicyParams), async (c) => {
    const { id } = getValidParams(c);
    const policy = policyRegistry.getById(id);
    if (!policy) {
      return c.json({ error: `Policy '${id}' not found` }, 404);
    }
    return c.json(policy);
  });

  // POST /policies - Register a new policy
  app.post("/policies", validateJsonBody(policyManifestSchema), async (c) => {
    const manifest = getValidBody(c);
    try {
      const result = await policyRegistry.register(manifest);
      if (result.success) {
        return c.json({ success: true, manifestHash: result.manifestHash }, 201);
      } else {
        return c.json({ error: result.error }, 400);
      }
    } catch (error) {
      logger.error({ error, manifest }, "[PolicyRoutes] Failed to register policy");
      return c.json({ error: error.message }, 500);
    }
  });

  // PUT /policies/:id/disable - Disable a policy
  const DisablePolicyBody = z.object({
    reason: z.string().optional(),
  });
  app.put(
    "/policies/:id/disable",
    validateParams(GetPolicyParams),
    validateJsonBody(DisablePolicyBody),
    async (c) => {
      const { id } = getValidParams(c);
      const { reason } = getValidBody(c);
      const success = await policyRegistry.disable(id, reason);
      if (success) {
        return c.json({ success: true, message: `Policy '${id}' disabled` });
      } else {
        return c.json({ error: `Policy '${id}' not found` }, 404);
      }
    }
  );

  // PUT /policies/:id/enable - Enable a policy
  app.put("/policies/:id/enable", validateParams(GetPolicyParams), async (c) => {
    const { id } = getValidParams(c);
    const success = await policyRegistry.enable(id);
    if (success) {
      return c.json({ success: true, message: `Policy '${id}' enabled` });
    } else {
      return c.json({ error: `Policy '${id}' not found` }, 404);
    }
  });

  // --- Policy Evaluation ---

  // POST /policies/evaluate - Evaluate a request against policies
  app.post(
    "/policies/evaluate",
    validateJsonBody(policyEvaluationRequestSchema),
    async (c) => {
      const request = getValidBody(c);
      try {
        const result = await policyEngine.evaluate(request);
        return c.json(result);
      } catch (error) {
        logger.error({ error, request }, "[PolicyRoutes] Policy evaluation failed");
        return c.json({ error: error.message }, 500);
      }
    }
  );

  // POST /policies/check - Quick check if action is allowed
  const CheckActionBody = z.object({
    action: z.string().min(1),
    orchestra: z.string().optional(),
    tenantId: z.string().optional(),
    userId: z.string().optional(),
    roles: z.array(z.string()).optional(),
    resource: z.string().optional(),
    context: z.record(z.any()).default({}),
  });
  app.post("/policies/check", validateJsonBody(CheckActionBody), async (c) => {
    const { action, orchestra, tenantId, userId, roles, resource, context } =
      getValidBody(c);
    try {
      const allowed = await policyEngine.isAllowed(action, context, {
        orchestra,
        tenantId,
        userId,
        roles,
        resource,
      });
      return c.json({ allowed });
    } catch (error) {
      logger.error({ error, action }, "[PolicyRoutes] Policy check failed");
      return c.json({ error: error.message }, 500);
    }
  });

  // --- Policy Statistics ---

  // GET /policies/stats - Get policy statistics
  app.get("/policies/stats", async (c) => {
    const counts = policyRegistry.getCountByPrecedence();
    const active = policyRegistry.listActive();
    return c.json({
      total: active.length,
      byPrecedence: {
        legal: counts[PolicyPrecedence.LEGAL] || 0,
        industry: counts[PolicyPrecedence.INDUSTRY] || 0,
        internal: counts[PolicyPrecedence.INTERNAL] || 0,
      },
    });
  });
}


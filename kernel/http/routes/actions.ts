/**
 * Action Routes
 * 
 * HTTP endpoints for action execution with full governance
 * Auth-aware and trace-aware for observability
 */

import { Hono } from "hono";
import { z } from "zod";
import {
  actionDispatcher,
  ActionNotFoundError,
  ActionHandlerNotFoundError,
  ActionInputValidationError,
  ActionOutputValidationError,
  ActionExecutionError,
} from "../../actions/action-dispatcher";
import { contractEngine } from "../../contracts/contract-engine";
import { getTraceIdFromContext } from "../middleware/trace-id";
import { getAuthContext } from "../middleware/auth";

const app = new Hono();

const ZExecuteActionRequest = z.object({
  actionId: z.string().min(1),
  input: z.unknown(),
});

/**
 * Execute an action
 * POST /actions/execute
 */
app.post("/execute", async (c) => {
  const json = await c.req.json().catch(() => null);
  if (!json) {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const parse = ZExecuteActionRequest.safeParse(json);
  if (!parse.success) {
    return c.json(
      { error: "ValidationError", details: parse.error.flatten() },
      422
    );
  }

  const { actionId, input } = parse.data;

  // Get context from middleware
  const traceId = getTraceIdFromContext(c);
  const auth = getAuthContext(c);

  try {
    const result = await actionDispatcher.execute(
      actionId,
      {
        tenantId: auth.tenantId,
        subject: auth.principal?.subject ?? null,
        traceId,
        roles: auth.roles,
        scopes: auth.scopes,
      },
      input
    );

    return c.json({
      success: true,
      mode: result.mode,
      contract: {
        name: result.contract.name,
        version: result.contract.version,
        actionId: result.contract.actionId,
      },
      output: result.output,
      timingMs: result.timingMs,
      traceId,
    });
  } catch (err: unknown) {
    if (err instanceof ActionNotFoundError) {
      return c.json(
        { error: "ActionNotFound", message: err.message, actionId: err.actionId, traceId },
        404
      );
    }

    if (err instanceof ActionHandlerNotFoundError) {
      return c.json(
        { error: "ActionHandlerNotFound", message: err.message, actionId: err.actionId, traceId },
        501
      );
    }

    if (err instanceof ActionInputValidationError) {
      return c.json(
        {
          error: "InputValidationError",
          message: err.message,
          actionId: err.actionId,
          details: err.cause,
          traceId,
        },
        422
      );
    }

    if (err instanceof ActionOutputValidationError) {
      return c.json(
        {
          error: "OutputValidationError",
          message: err.message,
          actionId: err.actionId,
          traceId,
        },
        500
      );
    }

    if (err instanceof ActionExecutionError) {
      return c.json(
        {
          error: "ActionExecutionError",
          message: err.message,
          actionId: err.actionId,
          traceId,
        },
        500
      );
    }

    return c.json(
      {
        error: "UnknownError",
        message: err instanceof Error ? err.message : "Unknown error",
        traceId,
      },
      500
    );
  }
});

/**
 * List all action contracts for tenant
 * GET /actions
 */
app.get("/", async (c) => {
  const traceId = getTraceIdFromContext(c);
  const auth = getAuthContext(c);

  try {
    const actions = await contractEngine.listActionContracts(auth.tenantId);
    return c.json({
      actions: actions.map((a) => ({
        actionId: a.actionId,
        name: a.name,
        description: a.description,
        version: a.version,
        mode: a.mode,
        riskBand: a.riskBand,
        sideEffectLevel: a.sideEffectLevel,
        tags: a.tags,
        deprecated: a.deprecated,
      })),
      traceId,
    });
  } catch (err) {
    return c.json({ error: "Failed to list actions", traceId }, 500);
  }
});

/**
 * Get action contract details
 * GET /actions/:actionId
 */
app.get("/:actionId", async (c) => {
  const actionId = c.req.param("actionId");
  const traceId = getTraceIdFromContext(c);
  const auth = getAuthContext(c);

  try {
    const contract = await contractEngine.getActionContract(auth.tenantId, actionId);
    if (!contract) {
      return c.json({ error: "ActionNotFound", actionId, traceId }, 404);
    }

    return c.json({
      actionId: contract.actionId,
      name: contract.name,
      description: contract.description,
      version: contract.version,
      mode: contract.mode,
      riskBand: contract.riskBand,
      sideEffectLevel: contract.sideEffectLevel,
      idempotency: contract.idempotency,
      tags: contract.tags,
      deprecated: contract.deprecated,
      inputSchema: contract.inputSchema,
      outputSchema: contract.outputSchema,
      traceId,
    });
  } catch (err) {
    return c.json({ error: "Failed to get action", traceId }, 500);
  }
});

export default app;

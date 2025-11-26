/**
 * Action Dispatcher v2
 *
 * Ties contracts + validation + sandbox + handler + audit + events together.
 * Policy-gated execution with trace-aware logging for full observability.
 *
 * Responsibilities:
 * - Load ActionContract
 * - Policy check (before execution)
 * - Validate input (Zod)
 * - Execute handler in sandbox
 * - Validate output (Zod)
 * - Emit audit + events
 * - Record metrics
 */

import { ZodTypeAny } from "zod";
import { contractEngine } from "../contracts/contract-engine";
import { ActionContract, ZActionContractSchema } from "../contracts/schemas";
import { zodFromSerializedSchema } from "../contracts/action-schema-runtime";
import { getActionHandler, ActionContext } from "./action-registry";
import { executeInSandbox, SandboxContext } from "../security/sandbox";
import { eventBus } from "../events/event-bus";
import { auditLogger } from "../audit/audit-logger";
import { createTraceLogger } from "../observability/logger";
import { policyEngine } from "../policy/policy-engine";
import type { PolicyContext } from "../policy/types";
import {
  actionsExecutedTotal,
  actionDurationSeconds,
} from "../observability/metrics";

export type ActionExecutionResult = {
  contract: ActionContract;
  input: unknown;
  output: unknown;
  mode: "sync" | "async";
  timingMs: number;
};

export class ActionDispatcher {
  /**
   * Execute an action by actionId.
   * 1. Load ActionContract
   * 2. Validate input
   * 3. Call handler
   * 4. Validate output
   * 5. Emit audit + events
   */
  async execute(
    actionId: string,
    ctx: ActionContext,
    rawInput: unknown
  ): Promise<ActionExecutionResult> {
    const { tenantId, subject, traceId } = ctx;
    const logger = createTraceLogger(traceId);
    const startedAt = process.hrtime.bigint();

    logger.info(
      { actionId, tenantId, subject },
      "[ActionDispatcher] Executing action"
    );

    try {
      // 1. Load the ActionContract
      const contract = await contractEngine.getActionContract(tenantId ?? null, actionId);
      if (!contract) {
        logger.error({ actionId }, "[ActionDispatcher] ActionContract not found");
        throw new ActionNotFoundError(actionId);
      }

      const parsedContract = ZActionContractSchema.parse(contract);

      // 2️⃣ Policy check BEFORE input validation or handler execution
      const policyCtx: PolicyContext = {
        tenantId: tenantId ?? null,
        traceId: traceId ?? null,
        auth: {
          tenantId: tenantId ?? null,
          principal: subject ? { type: "user", id: subject, subject } : null,
          roles: ctx.roles ?? [],
          scopes: ctx.scopes ?? [],
          tokenType: "jwt",
        },
      };

      const decision = await policyEngine.evaluateAction(policyCtx, parsedContract);
      if (decision.effect === "deny") {
        logger.warn(
          {
            actionId,
            reason: decision.reason,
            tenantId,
            subject,
            roles: ctx.roles,
            scopes: ctx.scopes,
          },
          "[ActionDispatcher] Policy denied action execution"
        );
        throw new ActionDeniedError(actionId, decision.reason);
      }

      // 3️⃣ Resolve & validate input
      const inputSchema: ZodTypeAny = zodFromSerializedSchema(parsedContract.inputSchema);
      let input: unknown;
      try {
        input = inputSchema.parse(rawInput);
      } catch (err) {
        logger.error({ actionId, err }, "[ActionDispatcher] Input validation failed");
        throw new ActionInputValidationError(actionId, err);
      }

      // 4️⃣ Find handler
      const handler = getActionHandler(actionId);
      if (!handler) {
        logger.error({ actionId }, "[ActionDispatcher] Handler not registered");
        throw new ActionHandlerNotFoundError(actionId);
      }

      // 5️⃣ Execute handler in sandbox
      let rawOutput: unknown;
      try {
        const sandboxCtx: SandboxContext = {
          input,
          tenantId: tenantId ?? null,
          principalId: subject ?? null,
        };
        rawOutput = await executeInSandbox(
          async (sCtx) => handler(ctx, sCtx.input),
          sandboxCtx,
        );
      } catch (err) {
        const finishedAt = process.hrtime.bigint();
        const durationSec = Number(finishedAt - startedAt) / 1e9;
        const durationMs = Math.round(durationSec * 1000);

        logger.error(
          { actionId, durationMs, err },
          "[ActionDispatcher] Handler execution failed"
        );

        // Log failure audit
        await auditLogger.log({
          tenantId: tenantId ?? null,
          subject: subject ?? null,
          action: "action.execute.failed",
          resource: `action:${actionId}`,
          severity: "error",
          category: "engine",
          details: {
            traceId,
            error: err instanceof Error ? err.message : String(err),
            durationMs,
          },
        });

        throw new ActionExecutionError(actionId, err);
      }

      // 6️⃣ Validate output
      const outputSchema: ZodTypeAny = zodFromSerializedSchema(parsedContract.outputSchema);
      let output: unknown;
      try {
        output = outputSchema.parse(rawOutput);
      } catch (err) {
        logger.error({ actionId, err }, "[ActionDispatcher] Output validation failed");
        throw new ActionOutputValidationError(actionId, err);
      }

      const finishedAt = process.hrtime.bigint();
      const durationSec = Number(finishedAt - startedAt) / 1e9;
      const durationMs = Math.round(durationSec * 1000);

      // ✅ Record success metrics
      actionsExecutedTotal.inc({
        actionId,
        effect: "allow",
        tenantId: tenantId ?? "null",
      });
      actionDurationSeconds.observe(
        { actionId, tenantId: tenantId ?? "null" },
        durationSec
      );

      logger.info(
        {
          actionId,
          durationMs,
          sideEffectLevel: parsedContract.sideEffectLevel,
          riskBand: parsedContract.riskBand,
        },
        "[ActionDispatcher] Action executed successfully"
      );

      // 7️⃣ Audit log
      await auditLogger.log({
        tenantId: tenantId ?? null,
        subject: subject ?? null,
        action: "action.execute",
        resource: `action:${actionId}`,
        severity: "info",
        category: "engine",
        details: {
          traceId,
          contract: {
            name: parsedContract.name,
            version: parsedContract.version,
            sideEffectLevel: parsedContract.sideEffectLevel,
            riskBand: parsedContract.riskBand,
          },
          durationMs,
        },
      });

      // 8️⃣ Emit event (fire-and-forget)
      try {
        eventBus.publish({
          name: "kernel.action.executed",
          tenant: tenantId ?? "system",
          engine: ctx.engineId ?? "kernel",
          timestamp: Date.now(),
          payload: {
            actionId,
            traceId,
            contract: {
              name: parsedContract.name,
              version: parsedContract.version,
            },
            sideEffectLevel: parsedContract.sideEffectLevel,
            riskBand: parsedContract.riskBand,
            durationMs,
          },
        });
      } catch (err) {
        logger.error({ err }, "[ActionDispatcher] Failed to publish event");
      }

      return {
        contract: parsedContract,
        input,
        output,
        mode: parsedContract.mode,
        timingMs: durationMs,
      };
    } catch (err: any) {
      // Record failure metrics
      const finishedAt = process.hrtime.bigint();
      const durationSec = Number(finishedAt - startedAt) / 1e9;

      const isDenied = err instanceof ActionDeniedError;
      actionsExecutedTotal.inc({
        actionId,
        effect: isDenied ? "deny" : "error",
        tenantId: tenantId ?? "null",
      });
      actionDurationSeconds.observe(
        { actionId, tenantId: tenantId ?? "null" },
        durationSec
      );

      throw err;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Custom Error Types
// ─────────────────────────────────────────────────────────────

export class ActionNotFoundError extends Error {
  constructor(public actionId: string) {
    super(`ActionContract not found for ${actionId}`);
    this.name = "ActionNotFoundError";
  }
}

export class ActionDeniedError extends Error {
  constructor(
    public actionId: string,
    public reason: string
  ) {
    super(`ActionDenied: ${reason} (actionId=${actionId})`);
    this.name = "ActionDeniedError";
  }
}

export class ActionHandlerNotFoundError extends Error {
  constructor(public actionId: string) {
    super(`ActionHandler not registered for ${actionId}`);
    this.name = "ActionHandlerNotFoundError";
  }
}

export class ActionInputValidationError extends Error {
  constructor(public actionId: string, public cause: unknown) {
    super(`Input validation failed for action ${actionId}`);
    this.name = "ActionInputValidationError";
  }
}

export class ActionOutputValidationError extends Error {
  constructor(public actionId: string, public cause: unknown) {
    super(`Output validation failed for action ${actionId}`);
    this.name = "ActionOutputValidationError";
  }
}

export class ActionExecutionError extends Error {
  constructor(public actionId: string, public cause: unknown) {
    super(`Execution failed for action ${actionId}`);
    this.name = "ActionExecutionError";
  }
}

// Singleton instance
export const actionDispatcher = new ActionDispatcher();

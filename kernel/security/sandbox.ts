import { metadataRegistry } from "../registry/metadata.registry";
import { engineRegistry } from "../registry/engine.registry";
import { log } from "../utils/logger";
import { publishEvent } from "../events/bus";
import { createDbProxy } from "./db.proxy";
import { createCacheProxy } from "./cache.proxy";
import { executeInSandbox } from "./sandbox.v2";
import { checkGlobalLimit } from "../hardening/rate-limit/global.limiter";
import { checkTenantLimit } from "../hardening/rate-limit/tenant.limiter";
import { checkEngineLimit } from "../hardening/rate-limit/engine.limiter";
import { recordEngineError } from "../hardening/rate-limit/circuit-breaker";
import { emitEngineEvent } from "../audit/emit";
import { logRateLimit, logSandboxViolation } from "../audit/security.events";

export async function runAction({
  engine,
  action,
  payload,
  tenant,
  user
}: {
  engine: string;
  action: string;
  payload: any;
  tenant: string;
  user: any;
}) {
  // Rate limiting (3 layers)
  checkGlobalLimit();
  checkTenantLimit(tenant);
  checkEngineLimit(engine);

  const engineDef = engineRegistry.get(engine);
  if (!engineDef) {
    throw new Error(`Engine '${engine}' not found.`);
  }

  const actionFn = engineDef.actions[action];
  if (!actionFn) {
    throw new Error(`Action '${engine}.${action}' not found.`);
  }

  // Prepare sandbox context (very important)
  const ctx = {
    input: payload,
    tenant,
    user,
    metadata: metadataRegistry.models,
    db: createDbProxy(tenant),
    cache: createCacheProxy(tenant),
    emit: (event: string, data: any) =>
      publishEvent(`${tenant}.${engine}.${event}`, data),
    log: (...a: any[]) => log.info(`[${engine}]`, ...a),
    engineConfig: engineDef.manifest,
    schema: engineDef.manifest?.actions?.[action]?.schema
  };

  // Audit: action start
  emitEngineEvent(engine, "engine.action.start", { action, tenant });

  try {
    log.info(`▶️ Running action: ${engine}.${action}`);

    // Execute in sandbox v2 (frozen ctx, hard blocks, validation)
    const result = await executeInSandbox(actionFn, ctx);

    log.info(`✅ Action completed: ${engine}.${action}`);

    // Audit: action success
    emitEngineEvent(engine, "engine.action.success", { action, tenant });

    return {
      ok: true,
      data: result
    };
  } catch (err: any) {
    log.error(`❌ Action failed: ${engine}.${action}`, err);

    // Security audit logging
    if (err.message.includes("forbidden")) {
      logSandboxViolation(engine, err.message);
    }
    if (err.message.includes("Rate limit")) {
      logRateLimit(engine, err.message);
    }

    // Track errors for circuit breaker
    recordEngineError(engine);

    // Audit: action error
    emitEngineEvent(engine, "engine.action.error", { action, tenant, error: err.message });

    return {
      ok: false,
      error: err.message
    };
  }
}

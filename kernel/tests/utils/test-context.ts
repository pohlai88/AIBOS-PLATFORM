// tests/utils/test-context.ts
import { kernelContainer } from "../../core/container";
import type { ActionContext } from "../../types/engine.types";

/**
 * Build a test ActionContext with full dependencies
 * 
 * @param overrides - Partial context to override defaults
 * @returns Complete ActionContext
 */
export async function buildTestContext<TInput = unknown>(
  overrides: Partial<ActionContext<TInput>> = {}
): Promise<ActionContext<TInput>> {
  const db = await kernelContainer.getDatabase();
  const cache = await kernelContainer.getCache();

  const events: Array<{ event: string; payload: unknown }> = [];

  return {
    input: overrides.input || ({} as TInput),
    tenant: overrides.tenant || "test-tenant",
    user: overrides.user || { id: "test-user", permissions: ["*"] },
    db: overrides.db || db,
    cache: overrides.cache || cache,
    metadata: overrides.metadata || {
      getEntity: async () => null,
      getSchema: async () => null,
      getContract: async () => null,
    },
    emit: overrides.emit || ((event, payload) => {
      events.push({ event, payload });
      console.log(`[TestEvent] ${event}:`, payload);
    }),
    log: overrides.log || ((...args) => console.log("[TestLog]", ...args)),
    engineConfig: overrides.engineConfig || {},
    requestId: overrides.requestId || `test-req-${Date.now()}`,
    correlationId: overrides.correlationId,
  };
}

/**
 * Build a minimal mock context (no real DB/cache)
 */
export function mockContext<TInput = unknown>(
  overrides: Partial<ActionContext<TInput>> = {}
): ActionContext<TInput> {
  return {
    input: overrides.input || ({} as TInput),
    tenant: overrides.tenant || "test-tenant",
    user: overrides.user || { id: "test-user", permissions: ["*"] },
    db: overrides.db || {
      query: async () => [],
      one: async () => null,
      many: async () => [],
      none: async () => 0,
    },
    cache: overrides.cache || {
      get: async () => null,
      set: async () => {},
      del: async () => {},
      exists: async () => false,
    },
    metadata: overrides.metadata || {
      getEntity: async () => null,
      getSchema: async () => null,
      getContract: async () => null,
    },
    emit: overrides.emit || ((event, payload) => {
      console.log(`[MockEvent] ${event}:`, payload);
    }),
    log: overrides.log || ((...args) => console.log("[MockLog]", ...args)),
    engineConfig: overrides.engineConfig || {},
    requestId: overrides.requestId || `mock-req-${Date.now()}`,
    correlationId: overrides.correlationId,
  };
}


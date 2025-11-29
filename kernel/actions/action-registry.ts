/**
 * Action Handler Registry
 * 
 * Maps actionId → handler function
 */

import { baseLogger } from "../observability/logger";

export type ActionContext = {
  tenantId: string | null;
  subject?: string | null;    // user / engine ID
  traceId?: string | null;    // for observability
  engineId?: string | null;   // source engine
  roles?: string[];           // for PolicyEngine
  scopes?: string[];          // for PolicyEngine
};

export type ActionHandler<Input = unknown, Output = unknown> = (
  ctx: ActionContext,
  input: Input
) => Promise<Output> | Output;

type HandlerMap = Map<string, ActionHandler>;

const handlers: HandlerMap = new Map();

/**
 * Register a handler for a given actionId. Usually called at boot.
 */
export function registerActionHandler<Input = unknown, Output = unknown>(
  actionId: string,
  handler: ActionHandler<Input, Output>
): void {
  if (handlers.has(actionId)) {
    baseLogger.warn({ actionId }, "[ActionRegistry] Overwriting handler for actionId=%s", actionId);
  }
  handlers.set(actionId, handler as ActionHandler);
}

/**
 * Get handler for actionId; returns undefined if not registered.
 */
export function getActionHandler(actionId: string): ActionHandler | undefined {
  return handlers.get(actionId);
}

/**
 * Check if a handler exists for actionId
 */
export function hasActionHandler(actionId: string): boolean {
  return handlers.has(actionId);
}

/**
 * List all registered action IDs
 */
export function listActionIds(): string[] {
  return Array.from(handlers.keys());
}

/**
 * Remove a handler (for testing or hot-reload)
 */
export function unregisterActionHandler(actionId: string): boolean {
  return handlers.delete(actionId);
}

/**
 * Clear all handlers (for testing)
 */
export function clearActionHandlers(): void {
  handlers.clear();
}


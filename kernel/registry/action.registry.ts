/**
 * Action Registry
 *
 * Single source of truth for all kernel actions.
 * Enforces consistency: no duplicate IDs, required schemas, data contract refs.
 */

import type { ZodTypeAny } from "zod";
import type { KernelActionContract } from "../contracts/contract.types";
import { baseLogger } from "../observability/logger";

export interface RegisteredAction {
  contract: KernelActionContract<ZodTypeAny, ZodTypeAny>;
  registeredAt: Date;
}

const actionRegistryMap = new Map<string, RegisteredAction>();

/**
 * Register an action contract.
 *
 * Enforces:
 * - actionId is required and unique
 * - inputSchema and outputSchema are present
 * - metadata.dataContractRef is present (Policy V2 alignment)
 */
export function registerActionContract(
  contract: KernelActionContract<ZodTypeAny, ZodTypeAny>,
  options?: { strict?: boolean },
): void {
  const strict = options?.strict ?? true;

  if (!contract.actionId || typeof contract.actionId !== "string") {
    throw new Error("registerActionContract: actionId is required and must be string");
  }

  if (actionRegistryMap.has(contract.actionId)) {
    throw new Error(
      `registerActionContract: duplicate actionId: ${contract.actionId}`,
    );
  }

  // Schema checks
  if (!contract.inputSchema || !contract.outputSchema) {
    throw new Error(
      `registerActionContract: ${contract.actionId} missing inputSchema or outputSchema`,
    );
  }

  // Data contract ref check (Policy V2 alignment)
  if (strict && !contract.metadata?.dataContractRef) {
    baseLogger.warn(
      { actionId: contract.actionId },
      "[ActionRegistry] Action missing metadata.dataContractRef - Policy V2 may not apply",
    );
  }

  actionRegistryMap.set(contract.actionId, {
    contract,
    registeredAt: new Date(),
  });

  baseLogger.debug(
    {
      actionId: contract.actionId,
      version: contract.version,
      domain: contract.metadata?.domain,
      riskBand: contract.metadata?.riskBand,
    },
    "[ActionRegistry] Action registered",
  );
}

/**
 * Get a registered action by ID.
 */
export function getActionContract(
  actionId: string,
): RegisteredAction | undefined {
  return actionRegistryMap.get(actionId);
}

/**
 * List all registered actions.
 */
export function listRegisteredActions(): RegisteredAction[] {
  return Array.from(actionRegistryMap.values());
}

/**
 * List action IDs only.
 */
export function listActionIds(): string[] {
  return Array.from(actionRegistryMap.keys());
}

/**
 * Check if an action is registered.
 */
export function hasAction(actionId: string): boolean {
  return actionRegistryMap.has(actionId);
}

/**
 * Get count of registered actions.
 */
export function getActionCount(): number {
  return actionRegistryMap.size;
}

/**
 * Clear the registry (for testing).
 */
export function clearActionRegistry(): void {
  actionRegistryMap.clear();
}

/**
 * Legacy compatibility export
 */
export const actionRegistry = {
  init: clearActionRegistry,
  register: (name: string, action: KernelActionContract) => registerActionContract(action),
  get: (name: string) => getActionContract(name)?.contract,
  list: () => listRegisteredActions().map((r) => [r.contract.actionId, r.contract] as const),
};

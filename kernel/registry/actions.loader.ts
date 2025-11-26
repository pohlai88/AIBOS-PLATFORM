/**
 * Actions Loader
 *
 * Loads and registers all action contracts at boot time.
 */

import * as fs from "fs";
import * as path from "path";
import type { KernelActionContract } from "../contracts/contract.types";
import { exampleActionContracts } from "../contracts/examples";
import { registerActionContract, getActionCount } from "./action.registry";
import { baseLogger } from "../observability/logger";

/**
 * Load and register all action contracts.
 *
 * Called during kernel bootstrap (step 04-contracts or similar).
 * Returns the list of registered contracts for diagnostics.
 */
export async function loadActionContracts(): Promise<KernelActionContract[]> {
  const contracts: KernelActionContract[] = [
    ...exampleActionContracts,
    // Future: marketplace contracts, plugin contracts, etc.
  ];

  const registered: KernelActionContract[] = [];

  for (const contract of contracts) {
    try {
      registerActionContract(contract);
      registered.push(contract);
    } catch (err) {
      baseLogger.error(
        { actionId: contract.actionId, err },
        "[ActionsLoader] Failed to register action contract",
      );
      // Continue loading other contracts
    }
  }

  baseLogger.info(
    {
      total: contracts.length,
      registered: registered.length,
      failed: contracts.length - registered.length,
    },
    "[ActionsLoader] Action contracts loaded",
  );

  return registered;
}

/**
 * Get summary of loaded actions for diagnostics.
 */
export function getActionLoadSummary(): {
  count: number;
  domains: string[];
} {
  const count = getActionCount();
  const domains = new Set<string>();

  // Note: We'd need to iterate registry to get domains
  // For now, return count only
  return {
    count,
    domains: Array.from(domains),
  };
}

/**
 * Load actions from an engine directory (legacy file-based loader).
 * Used by engine.loader.ts for plugin engines.
 */
export async function loadActions(enginePath: string): Promise<Record<string, unknown>> {
  const dir = path.join(enginePath, "actions");
  if (!fs.existsSync(dir)) return {};

  const files = fs.readdirSync(dir);
  const actions: Record<string, unknown> = {};

  for (const file of files) {
    if (!file.endsWith(".js") && !file.endsWith(".ts")) continue;
    const mod = require(path.join(dir, file));
    const fnName = file.replace(/\.(js|ts)$/, "");
    actions[fnName] = mod.default || mod[fnName];
  }

  return actions;
}

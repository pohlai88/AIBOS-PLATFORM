// registry/engine.loader.ts
import type { KernelEngine } from '../types/engine.types';
import { baseLogger } from '../observability/logger';

/**
 * Engine Registry
 * 
 * Central registry for all kernel engines.
 * Engines register themselves on startup via registerEngine().
 */
class EngineRegistry {
  private engines: Map<string, KernelEngine> = new Map();

  /**
   * Register an engine
   * 
   * @param engine - Kernel engine to register
   */
  register(engine: KernelEngine): void {
    if (this.engines.has(engine.id)) {
      throw new Error(`Engine "${engine.id}" is already registered`);
    }

    baseLogger.info(
      { engineId: engine.id, version: engine.manifest.version },
      "[EngineRegistry] Registering engine: %s (v%s)",
      engine.id,
      engine.manifest.version
    );
    this.engines.set(engine.id, engine);

    // Log registered actions
    const actionIds = Object.keys(engine.manifest.actions);
    baseLogger.info(
      { engineId: engine.id, actionCount: actionIds.length, actionIds },
      '[EngineRegistry] Engine "%s" registered %d actions',
      engine.id,
      actionIds.length
    );
  }

  /**
   * Get an engine by ID
   * 
   * @param id - Engine ID
   * @returns Engine or undefined
   */
  get(id: string): KernelEngine | undefined {
    return this.engines.get(id);
  }

  /**
   * Get all registered engines
   * 
   * @returns Array of engines
   */
  getAll(): KernelEngine[] {
    return Array.from(this.engines.values());
  }

  /**
   * Get an action handler by full action ID
   * 
   * @param actionId - Full action ID (e.g., accounting.read.journal_entries)
   * @returns Action handler or undefined
   */
  getActionHandler(actionId: string): ((ctx: unknown) => Promise<unknown>) | undefined {
    // Parse action ID: domain.verb.noun
    const parts = actionId.split('.');
    if (parts.length < 2) {
      throw new Error(`Invalid action ID format: ${actionId}. Expected: domain.verb.noun`);
    }

    const domain = parts[0];
    const actionName = parts.slice(1).join('.'); // e.g., read.journal_entries

    const engine = this.engines.get(domain);
    if (!engine) {
      return undefined;
    }

    return engine.actions[actionName];
  }

  /**
   * Check if an action exists
   * 
   * @param actionId - Full action ID
   * @returns True if action exists
   */
  hasAction(actionId: string): boolean {
    return this.getActionHandler(actionId) !== undefined;
  }

  /**
   * Get all registered action IDs
   * 
   * @returns Array of action IDs
   */
  getAllActionIds(): string[] {
    const actionIds: string[] = [];

    for (const engine of this.engines.values()) {
      for (const actionName of Object.keys(engine.actions)) {
        actionIds.push(`${engine.id}.${actionName}`);
      }
    }

    return actionIds;
  }

  /**
   * Search engines by tag
   * 
   * @param tag - Tag to search for
   * @returns Array of matching engines
   */
  findByTag(tag: string): KernelEngine[] {
    return this.getAll().filter((engine) =>
      engine.manifest.tags?.includes(tag)
    );
  }

  /**
   * Search actions by tag
   * 
   * @param tag - Tag to search for
   * @returns Array of action IDs
   */
  findActionsByTag(tag: string): string[] {
    const actionIds: string[] = [];

    for (const engine of this.engines.values()) {
      for (const [actionName, actionMeta] of Object.entries(engine.manifest.actions)) {
        if (actionMeta.contract.tags?.includes(tag)) {
          actionIds.push(`${engine.id}.${actionName}`);
        }
      }
    }

    return actionIds;
  }

  /**
   * Clear all engines (for testing)
   */
  clear(): void {
    this.engines.clear();
  }
}

/**
 * Global engine registry instance
 */
export const engineRegistry = new EngineRegistry();

/**
 * Helper function to register an engine
 * 
 * @param engine - Kernel engine to register
 */
export function registerEngine(engine: KernelEngine): void {
  engineRegistry.register(engine);
}

/**
 * Helper function to get an action handler
 * 
 * @param actionId - Full action ID (e.g., accounting.read.journal_entries)
 * @returns Action handler or undefined
 */
export function getActionHandler(actionId: string): ((ctx: unknown) => Promise<unknown>) | undefined {
  return engineRegistry.getActionHandler(actionId);
}

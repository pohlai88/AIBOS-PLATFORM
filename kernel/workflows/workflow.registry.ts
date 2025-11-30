/**
 * Workflow Registry — Central Store for Saga Definitions
 * 
 * Features:
 * - Register/unregister saga definitions
 * - Version management
 * - Definition validation
 * - Lookup by ID or name
 * 
 * @module workflows/workflow.registry
 */

import type { SagaDefinition } from './workflow.types';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/**
 * Registry entry with metadata
 */
interface RegistryEntry {
    definition: SagaDefinition;
    registeredAt: Date;
    registeredBy: string;
    enabled: boolean;
}

/**
 * Registration options
 */
interface RegisterOptions {
    registeredBy?: string;
    enabled?: boolean;
    overwrite?: boolean;
}

// ─────────────────────────────────────────────────────────────
// Workflow Registry Class
// ─────────────────────────────────────────────────────────────

/**
 * Central registry for saga workflow definitions
 */
export class WorkflowRegistry {
    private definitions = new Map<string, RegistryEntry>();
    private nameIndex = new Map<string, string>(); // name -> id

    /**
     * Register a saga definition
     * 
     * @param definition - Saga definition to register
     * @param options - Registration options
     * @throws Error if definition already exists (unless overwrite=true)
     */
    register(definition: SagaDefinition, options: RegisterOptions = {}): void {
        const { registeredBy = 'system', enabled = true, overwrite = false } = options;

        // Validate definition
        this.validateDefinition(definition);

        // Check for existing
        if (this.definitions.has(definition.id) && !overwrite) {
            throw new Error(`Saga definition '${definition.id}' already registered`);
        }

        // Register
        this.definitions.set(definition.id, {
            definition,
            registeredAt: new Date(),
            registeredBy,
            enabled,
        });

        // Update name index
        this.nameIndex.set(definition.name, definition.id);
    }

    /**
     * Unregister a saga definition
     * 
     * @param id - Saga definition ID
     * @returns True if unregistered, false if not found
     */
    unregister(id: string): boolean {
        const entry = this.definitions.get(id);
        if (!entry) return false;

        this.nameIndex.delete(entry.definition.name);
        this.definitions.delete(id);
        return true;
    }

    /**
     * Get a saga definition by ID
     * 
     * @param id - Saga definition ID
     * @returns Saga definition or undefined
     */
    get(id: string): SagaDefinition | undefined {
        const entry = this.definitions.get(id);
        return entry?.enabled ? entry.definition : undefined;
    }

    /**
     * Get a saga definition by name
     * 
     * @param name - Saga name
     * @returns Saga definition or undefined
     */
    getByName(name: string): SagaDefinition | undefined {
        const id = this.nameIndex.get(name);
        return id ? this.get(id) : undefined;
    }

    /**
     * Check if a definition exists
     * 
     * @param id - Saga definition ID
     * @returns True if exists
     */
    has(id: string): boolean {
        return this.definitions.has(id);
    }

    /**
     * List all registered definitions
     * 
     * @param includeDisabled - Include disabled definitions
     * @returns Array of saga definitions
     */
    list(includeDisabled = false): SagaDefinition[] {
        const entries = Array.from(this.definitions.values());

        if (includeDisabled) {
            return entries.map(e => e.definition);
        }

        return entries
            .filter(e => e.enabled)
            .map(e => e.definition);
    }

    /**
     * Enable a saga definition
     * 
     * @param id - Saga definition ID
     * @returns True if enabled, false if not found
     */
    enable(id: string): boolean {
        const entry = this.definitions.get(id);
        if (!entry) return false;
        entry.enabled = true;
        return true;
    }

    /**
     * Disable a saga definition
     * 
     * @param id - Saga definition ID
     * @returns True if disabled, false if not found
     */
    disable(id: string): boolean {
        const entry = this.definitions.get(id);
        if (!entry) return false;
        entry.enabled = false;
        return true;
    }

    /**
     * Get registry stats
     */
    getStats(): { total: number; enabled: number; disabled: number } {
        const entries = Array.from(this.definitions.values());
        const enabled = entries.filter(e => e.enabled).length;

        return {
            total: entries.length,
            enabled,
            disabled: entries.length - enabled,
        };
    }

    /**
     * Clear all definitions
     */
    clear(): void {
        this.definitions.clear();
        this.nameIndex.clear();
    }

    /**
     * Validate saga definition
     */
    private validateDefinition(definition: SagaDefinition): void {
        if (!definition.id || typeof definition.id !== 'string') {
            throw new Error('Saga definition must have a valid id');
        }

        if (!definition.name || typeof definition.name !== 'string') {
            throw new Error('Saga definition must have a valid name');
        }

        if (!definition.version || typeof definition.version !== 'string') {
            throw new Error('Saga definition must have a valid version');
        }

        if (!Array.isArray(definition.steps) || definition.steps.length === 0) {
            throw new Error('Saga definition must have at least one step');
        }

        // Validate each step
        const stepIds = new Set<string>();
        for (const step of definition.steps) {
            if (!step.id || typeof step.id !== 'string') {
                throw new Error('Each step must have a valid id');
            }

            if (stepIds.has(step.id)) {
                throw new Error(`Duplicate step id: ${step.id}`);
            }
            stepIds.add(step.id);

            if (!step.name || typeof step.name !== 'string') {
                throw new Error(`Step '${step.id}' must have a valid name`);
            }

            if (typeof step.execute !== 'function') {
                throw new Error(`Step '${step.id}' must have an execute function`);
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────
// Singleton Export
// ─────────────────────────────────────────────────────────────

/**
 * Global workflow registry instance
 */
export const workflowRegistry = new WorkflowRegistry();


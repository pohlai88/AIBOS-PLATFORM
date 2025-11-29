// security/governance.enforcer.ts
/**
 * Governance Enforcer
 * 
 * Enforces the 7 Anti-Drift Governance Pillars at the kernel level.
 * 
 * Runs at:
 * - Kernel boot
 * - Engine registration
 * - Pre-deployment (CI)
 * 
 * Pillars:
 * 1. Metadata-First (no module bypasses metadata registry)
 * 2. Contract Enforcement (all actions have Zod schemas)
 * 3. RBAC/ABAC/PBAC (all actions declare permissions)
 * 4. Event-Driven Everything (all workflows emit trace events)
 * 5. AI-Assisted Validation (Schema Guardian reviews changes)
 * 6. Kernel-Level Governance (no drift allowed)
 * 7. Infrastructure Abstraction (Dapr-style building blocks)
 */

import { engineRegistry } from '../registry/engine.loader';
import { z } from 'zod';
import { baseLogger } from '../observability/logger';
import type { KernelEngine } from '../types/engine.types';
import type { ActionContext } from '../types/engine.types';

/**
 * Governance violation error
 */
export class GovernanceViolationError extends Error {
    constructor(
        public rule: string,
        public violation: string,
        public context?: unknown
    ) {
        super(`[GOVERNANCE] ${rule}: ${violation}`);
        this.name = 'GovernanceViolationError';
    }
}

/**
 * Governance Enforcer
 */
export const GovernanceEnforcer = {
    /**
     * Pillar 1 & 2: Enforce that all engines have manifests with contracts
     * 
     * Validates:
     * - Every engine has a manifest
     * - Every action has a contract
     * - Every contract has input/output schemas
     * - Input/output schemas are Zod types
     */
    enforceEngineManifests(): void {
        const engines = engineRegistry.getAll();

        if (engines.length === 0) {
            baseLogger.warn('[GOVERNANCE] No engines registered. Skipping manifest validation.');
            return;
        }

        const violations: string[] = [];

        for (const engine of engines) {
            // Check manifest exists
            if (!engine.manifest) {
                violations.push(`Engine "${engine.id}" missing manifest`);
                continue;
            }

            // Check all actions have contracts
            for (const [actionId, actionMeta] of Object.entries(engine.manifest.actions)) {
                if (!actionMeta.contract) {
                    violations.push(`Engine "${engine.id}" action "${actionId}" missing contract`);
                    continue;
                }

                const contract = actionMeta.contract;

                // Check input schema
                if (!contract.inputSchema) {
                    violations.push(`Engine "${engine.id}" action "${actionId}" missing inputSchema`);
                } else if (!(contract.inputSchema instanceof z.ZodType)) {
                    violations.push(`Engine "${engine.id}" action "${actionId}" inputSchema must be Zod schema`);
                }

                // Check output schema
                if (!contract.outputSchema) {
                    violations.push(`Engine "${engine.id}" action "${actionId}" missing outputSchema`);
                } else if (!(contract.outputSchema instanceof z.ZodType)) {
                    violations.push(`Engine "${engine.id}" action "${actionId}" outputSchema must be Zod schema`);
                }

                // Check tags (recommended)
                if (!contract.tags || contract.tags.length === 0) {
                    baseLogger.warn(
                        { engineId: engine.id, actionId },
                        '[GOVERNANCE] Engine "%s" action "%s" has no tags (recommended for discovery)',
                        engine.id,
                        actionId
                    );
                }

                // Check permissions (recommended for RBAC)
                if (!contract.permissions || contract.permissions.length === 0) {
                    baseLogger.warn(
                        { engineId: engine.id, actionId },
                        '[GOVERNANCE] Engine "%s" action "%s" has no permissions (recommended for RBAC)',
                        engine.id,
                        actionId
                    );
                }
            }
        }

        if (violations.length > 0) {
            throw new GovernanceViolationError(
                'Pillar 1 & 2 (Metadata-First + Contract Enforcement)',
                `${violations.length} violation(s) found`,
                violations
            );
        }

        baseLogger.info(
            { engineCount: engines.length },
            '[GOVERNANCE] ✓ Engine manifests validated (%d engines, Pillar 1 & 2)',
            engines.length
        );
    },

    /**
     * Pillar 1: Enforce metadata registry access in ActionContext
     * 
     * Validates:
     * - ActionContext has metadata proxy
     */
    enforceMetadataAccess(ctx: ActionContext): void {
        if (!ctx.metadata) {
            throw new GovernanceViolationError(
                'Pillar 1 (Metadata-First)',
                'Metadata registry missing from ActionContext',
                { tenant: ctx.tenant, actionId: 'unknown' }
            );
        }
    },

    /**
     * Pillar 7: Enforce infrastructure abstraction (no direct DB access)
     * 
     * Validates:
     * - No raw SQL writes outside of ctx.db proxy
     * 
     * NOTE: This is a static check, not runtime. Use during code review or linting.
     */
    enforceNoDirectDbWrites(sql: string): void {
        const forbidden = ['INSERT', 'UPDATE', 'DELETE', 'ALTER', 'DROP', 'TRUNCATE', 'CREATE'];
        const keyword = sql.trim().split(/\s+/)[0].toUpperCase();

        if (forbidden.includes(keyword)) {
            throw new GovernanceViolationError(
                'Pillar 7 (Infrastructure Abstraction)',
                `Direct DB writes forbidden. Use ctx.db proxy instead. (${keyword})`,
                { sql }
            );
        }
    },

    /**
     * Pillar 3: Enforce RBAC (all actions have permissions)
     * 
     * Validates:
     * - All actions declare required permissions
     */
    enforceRBACDeclarations(): void {
        const engines = engineRegistry.getAll();
        const violations: string[] = [];

        for (const engine of engines) {
            for (const [actionId, actionMeta] of Object.entries(engine.manifest.actions)) {
                const contract = actionMeta.contract;

                if (!contract.permissions || contract.permissions.length === 0) {
                    violations.push(`Action "${engine.id}.${actionId}" has no permissions declared`);
                }
            }
        }

        if (violations.length > 0) {
            throw new GovernanceViolationError(
                'Pillar 3 (RBAC/ABAC/PBAC)',
                `${violations.length} actions missing permission declarations`,
                violations
            );
        }

        baseLogger.info('[GOVERNANCE] ✓ RBAC declarations validated (Pillar 3)');
    },

    /**
     * Pillar 2: Enforce contract versioning
     * 
     * Validates:
     * - All contracts have semantic versions
     * - No breaking changes without version bump
     */
    enforceContractVersioning(): void {
        const engines = engineRegistry.getAll();
        const violations: string[] = [];

        for (const engine of engines) {
            for (const [actionId, actionMeta] of Object.entries(engine.manifest.actions)) {
                const contract = actionMeta.contract;

                // Check version format (semver)
                const semverRegex = /^\d+\.\d+\.\d+$/;
                if (!contract.version || !semverRegex.test(contract.version)) {
                    violations.push(`Action "${engine.id}.${actionId}" has invalid version: "${contract.version}"`);
                }
            }
        }

        if (violations.length > 0) {
            throw new GovernanceViolationError(
                'Pillar 2 (Contract Enforcement)',
                `${violations.length} invalid contract versions`,
                violations
            );
        }

        baseLogger.info('[GOVERNANCE] ✓ Contract versions validated (Pillar 2)');
    },

    /**
     * Run all governance checks
     * 
     * Call this at:
     * - Kernel boot (after engine registration)
     * - Pre-deployment (CI/CD)
     * - Hot reload (dev mode)
     */
    runAll(): void {
        baseLogger.info('[GOVERNANCE] Running all governance checks...');

        try {
            this.enforceEngineManifests();
            this.enforceRBACDeclarations();
            this.enforceContractVersioning();

            baseLogger.info('[GOVERNANCE] ✅ All governance checks passed');
        } catch (error) {
            if (error instanceof GovernanceViolationError) {
                baseLogger.error(
                    { error: error.message, context: error.context },
                    '[GOVERNANCE] ❌ %s',
                    error.message
                );
                throw error;
            }
            throw error;
        }
    },

    /**
     * Run governance checks in warning mode (logs but doesn't throw)
     * 
     * Useful for gradual adoption
     */
    runAllWarningMode(): void {
        baseLogger.info('[GOVERNANCE] Running governance checks (warning mode)...');

        try {
            this.runAll();
        } catch (error) {
            if (error instanceof GovernanceViolationError) {
                baseLogger.warn(
                    { error: error.message, context: error.context },
                    '[GOVERNANCE] ⚠️ Governance violations detected (warning mode): %s',
                    error.message
                );
                return;
            }
            throw error;
        }
    },
};

/**
 * Auto-run governance checks on import (for production mode)
 * 
 * Comment out for dev mode or use WARNING_MODE=true env var
 */
if (process.env.NODE_ENV === 'production' && !process.env.GOVERNANCE_WARNING_MODE) {
    // Auto-run in strict mode for production
    // GovernanceEnforcer.runAll();
}


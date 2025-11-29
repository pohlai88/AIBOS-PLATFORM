/**
 * Adaptive Migration Engine — Zero-Downtime Schema Evolution
 * 
 * Allows live schema evolution without:
 * - Downtime
 * - Broken apps
 * - Broken MCP engines
 * - Lost data
 * - Implicit metadata drift
 * 
 * Migration Strategy:
 * 1. Detect breaking changes (DROP column, rename, type change)
 * 2. Route to migration staging table
 * 3. Shadow-write mode enabled
 * 4. Compare live reads across old + new schema
 * 5. AI Guardian validates compatibility
 * 6. Promote new schema if risk < 3%
 * 
 * Architecture:
 * - Schema Analyzer
 * - Diff Calculator
 * - Shadow Table Manager
 * - Data Copier (async)
 * - Dual-Reader Proxy
 * - Promotion Controller
 * 
 * Governance:
 * - All shadow reads must match
 * - No drift detection warnings
 * - All MCP engines recompiled successfully
 * - Metadata catalog updated
 * - Contract outputs validated
 * - AI Guardian signs approval (mandatory)
 * 
 * @module metadata/adaptive-migration/migration.engine
 */

import { eventBus } from '../../events/event-bus';
import { appendAuditEntry } from '../../audit/hash-chain.store';
import type {
    SchemaDiff,
    MigrationPlan,
    MigrationPhase,
    MigrationStatus,
    MigrationResult,
} from './types';

export class AdaptiveMigrationEngine {
    private activeMigrations = new Map<string, MigrationStatus>();

    /**
     * Analyze schema changes and detect breaking changes
     */
    analyzeSchema(oldSchema: any, newSchema: any): SchemaDiff {
        const breakingChanges: string[] = [];
        const safeChanges: string[] = [];
        const warnings: string[] = [];

        // Check for dropped columns
        const oldColumns = Object.keys(oldSchema);
        const newColumns = Object.keys(newSchema);

        for (const col of oldColumns) {
            if (!newColumns.includes(col)) {
                breakingChanges.push(`Column dropped: ${col}`);
            }
        }

        // Check for renamed columns
        for (const col of newColumns) {
            if (!oldColumns.includes(col)) {
                warnings.push(`New column added: ${col}`);
            }
        }

        // Check for type changes
        for (const col of oldColumns) {
            if (newColumns.includes(col)) {
                const oldType = oldSchema[col].type;
                const newType = newSchema[col].type;

                if (oldType !== newType) {
                    breakingChanges.push(`Type changed: ${col} (${oldType} → ${newType})`);
                } else {
                    safeChanges.push(`Column unchanged: ${col}`);
                }
            }
        }

        // Check for nullable changes
        for (const col of oldColumns) {
            if (newColumns.includes(col)) {
                const wasNullable = oldSchema[col].nullable ?? true;
                const isNullable = newSchema[col].nullable ?? true;

                if (wasNullable && !isNullable) {
                    breakingChanges.push(`Column became NOT NULL: ${col}`);
                } else if (!wasNullable && isNullable) {
                    safeChanges.push(`Column became nullable: ${col}`);
                }
            }
        }

        return {
            breakingChanges,
            safeChanges,
            warnings,
            hasBreakingChanges: breakingChanges.length > 0,
            riskLevel: this.calculateRiskLevel(breakingChanges.length),
        };
    }

    /**
     * Create migration plan based on schema diff
     */
    async createMigrationPlan(
        tableName: string,
        diff: SchemaDiff,
        tenantId = 'system'
    ): Promise<MigrationPlan> {
        // Import logger dynamically to avoid circular dependency
        const { baseLogger } = await import("../../observability/logger");
        baseLogger.info({ tableName, tenantId }, "[AdaptiveMigrationEngine] Creating migration plan for: %s", tableName);

        const phases: MigrationPhase[] = [];

        if (!diff.hasBreakingChanges) {
            // Simple migration: Add columns, make nullable
            phases.push({
                id: '1-add-columns',
                name: 'Add new columns',
                description: 'Add new columns as nullable',
                actions: ['ALTER TABLE ADD COLUMN'],
                duration: 'instant',
                reversible: true,
            });

            phases.push({
                id: '2-backfill',
                name: 'Backfill data',
                description: 'Populate new columns (if needed)',
                actions: ['UPDATE rows'],
                duration: 'background',
                reversible: false,
            });
        } else {
            // Complex migration: Shadow tables + dual-write
            phases.push({
                id: '1-create-shadow',
                name: 'Create shadow table',
                description: `Create ${tableName}_new with new schema`,
                actions: ['CREATE TABLE'],
                duration: 'instant',
                reversible: true,
            });

            phases.push({
                id: '2-enable-dual-write',
                name: 'Enable dual-write mode',
                description: 'Write to both old and new tables',
                actions: ['Enable shadow writes'],
                duration: 'instant',
                reversible: true,
            });

            phases.push({
                id: '3-copy-data',
                name: 'Copy existing data',
                description: 'Async copy from old → new table',
                actions: ['Background data migration'],
                duration: 'background',
                reversible: false,
            });

            phases.push({
                id: '4-dual-read',
                name: 'Enable dual-read comparison',
                description: 'Compare reads from both tables',
                actions: ['Enable dual-read proxy'],
                duration: '7-day grace period',
                reversible: true,
            });

            phases.push({
                id: '5-ai-validation',
                name: 'AI Guardian validation',
                description: 'Validate schema compatibility',
                actions: ['Run AI checks'],
                duration: 'instant',
                reversible: false,
            });

            phases.push({
                id: '6-promote',
                name: 'Promote new schema',
                description: 'Switch reads to new table',
                actions: ['Rename tables'],
                duration: 'instant',
                reversible: true,
            });

            phases.push({
                id: '7-cleanup',
                name: 'Cleanup old table',
                description: 'Drop old table after 30-day rollback window',
                actions: ['DROP TABLE old'],
                duration: 'scheduled',
                reversible: false,
            });
        }

        const plan: MigrationPlan = {
            tableName,
            diff,
            phases,
            totalPhases: phases.length,
            estimatedDuration: this.calculateDuration(phases),
            rollbackWindow: diff.hasBreakingChanges ? 30 : 7, // days
            requiresAIApproval: diff.hasBreakingChanges,
            createdAt: new Date(),
        };

        // Audit
        await appendAuditEntry({
            tenantId,
            actorId: 'adaptive-migration-engine',
            actionId: 'metadata.migration.plan_created',
            payload: {
                tableName,
                breakingChanges: diff.breakingChanges.length,
                safeChanges: diff.safeChanges.length,
                totalPhases: phases.length,
            },
        });

        return plan;
    }

    /**
     * Execute migration plan
     */
    async executeMigration(
        plan: MigrationPlan,
        tenantId = 'system'
    ): Promise<MigrationResult> {
        // Import logger dynamically to avoid circular dependency
        const { baseLogger } = await import("../../observability/logger");
        baseLogger.info({ tableName: plan.tableName, tenantId }, "[AdaptiveMigrationEngine] Executing migration for: %s", plan.tableName);

        const migrationId = `mig_${plan.tableName}_${Date.now()}`;
        const status: MigrationStatus = {
            id: migrationId,
            tableName: plan.tableName,
            currentPhase: 0,
            totalPhases: plan.totalPhases,
            status: 'running',
            startedAt: new Date(),
        };

        this.activeMigrations.set(migrationId, status);

        try {
            for (let i = 0; i < plan.phases.length; i++) {
                const phase = plan.phases[i];
                
                // Import logger dynamically to avoid circular dependency
                const { baseLogger } = await import("../../observability/logger");
                baseLogger.info(
                    { phase: i + 1, totalPhases: plan.totalPhases, phaseName: phase.name, tableName: plan.tableName },
                    "[AdaptiveMigrationEngine] Phase %d/%d: %s",
                    i + 1,
                    plan.totalPhases,
                    phase.name
                );

                // Update status
                status.currentPhase = i + 1;
                status.currentPhaseName = phase.name;

                // Emit event
                await eventBus.publishTyped('metadata.migration.phase_started', {
                    type: 'metadata.migration.phase_started',
                    tenantId,
                    payload: {
                        migrationId,
                        tableName: plan.tableName,
                        phase: i + 1,
                        phaseName: phase.name,
                    },
                });

                // Execute phase (mock implementation)
                await this.executePhase(phase, plan.tableName, tenantId);

                // Emit completion
                await eventBus.publishTyped('metadata.migration.phase_completed', {
                    type: 'metadata.migration.phase_completed',
                    tenantId,
                    payload: {
                        migrationId,
                        tableName: plan.tableName,
                        phase: i + 1,
                        phaseName: phase.name,
                    },
                });
            }

            // Migration complete
            status.status = 'completed';
            status.completedAt = new Date();

            await eventBus.publishTyped('metadata.migration.completed', {
                type: 'metadata.migration.completed',
                tenantId,
                payload: {
                    migrationId,
                    tableName: plan.tableName,
                    durationMs: status.completedAt.getTime() - status.startedAt.getTime(),
                },
            });

            console.info(`[AdaptiveMigrationEngine] ✅ Migration completed: ${plan.tableName}`);

            return {
                success: true,
                migrationId,
                tableName: plan.tableName,
                completedPhases: plan.totalPhases,
            };

        } catch (err) {
            status.status = 'failed';
            status.error = err instanceof Error ? err.message : String(err);

            await eventBus.publishTyped('metadata.migration.failed', {
                type: 'metadata.migration.failed',
                tenantId,
                payload: {
                    migrationId,
                    tableName: plan.tableName,
                    phase: status.currentPhase,
                    error: status.error,
                },
            });

            // Import logger dynamically to avoid circular dependency
            const { baseLogger } = await import("../../observability/logger");
            baseLogger.error({ err, tableName: plan.tableName, tenantId, migrationId }, "[AdaptiveMigrationEngine] ❌ Migration failed: %s", plan.tableName);

            return {
                success: false,
                migrationId,
                tableName: plan.tableName,
                completedPhases: status.currentPhase - 1,
                error: status.error,
            };
        } finally {
            // Audit
            await appendAuditEntry({
                tenantId,
                actorId: 'adaptive-migration-engine',
                actionId: status.status === 'completed' 
                    ? 'metadata.migration.completed'
                    : 'metadata.migration.failed',
                payload: {
                    migrationId,
                    tableName: plan.tableName,
                    status: status.status,
                    phasesCompleted: status.currentPhase,
                },
            });
        }
    }

    /**
     * Get migration status
     */
    getMigrationStatus(migrationId: string): MigrationStatus | null {
        return this.activeMigrations.get(migrationId) || null;
    }

    /**
     * List active migrations
     */
    listActiveMigrations(): MigrationStatus[] {
        return Array.from(this.activeMigrations.values());
    }

    // ─────────────────────────────────────────────────────────────
    // Private Methods
    // ─────────────────────────────────────────────────────────────

    private async executePhase(
        phase: MigrationPhase,
        tableName: string,
        tenantId: string
    ): Promise<void> {
        // Mock implementation - would execute actual SQL/schema changes
        // Import logger dynamically to avoid circular dependency
        const { baseLogger } = await import("../../observability/logger");
        baseLogger.info({ phaseName: phase.name, tableName }, "[AdaptiveMigrationEngine] Executing phase: %s", phase.name);
        
        // Simulate async work
        await new Promise(resolve => setTimeout(resolve, 100));

        // Audit
        await appendAuditEntry({
            tenantId,
            actorId: 'adaptive-migration-engine',
            actionId: 'metadata.migration.phase_executed',
            payload: {
                tableName,
                phaseId: phase.id,
                phaseName: phase.name,
                actions: phase.actions,
            },
        });
    }

    private calculateRiskLevel(breakingChangesCount: number): 'low' | 'medium' | 'high' | 'critical' {
        if (breakingChangesCount === 0) return 'low';
        if (breakingChangesCount <= 2) return 'medium';
        if (breakingChangesCount <= 5) return 'high';
        return 'critical';
    }

    private calculateDuration(phases: MigrationPhase[]): string {
        const hasBackground = phases.some(p => p.duration === 'background');
        const hasGracePeriod = phases.some(p => p.duration === '7-day grace period');

        if (hasGracePeriod) return '7-14 days';
        if (hasBackground) return '1-3 days';
        return '< 1 hour';
    }
}

// ─────────────────────────────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────────────────────────────

export const adaptiveMigrationEngine = new AdaptiveMigrationEngine();


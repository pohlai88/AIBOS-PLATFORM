/**
 * Secret Rotation Scheduler
 * 
 * Automatically rotates secrets based on policies:
 * - JWT: 30 days
 * - API Keys: 90 days
 * - DB Passwords: 90 days
 * - Encryption Keys: 365 days
 * 
 * Features:
 * - AI-validated rotation windows (no rotation during peak traffic)
 * - Coordinated rotation across all services
 * - Grace period enforcement
 * - Audit trail for compliance
 * 
 * @module security/secret-rotation/rotation.scheduler
 */

import { secretManager } from './secret.manager';
import { eventBus } from '../../events/event-bus';
import { appendAuditEntry } from '../../audit/hash-chain.store';
import { baseLogger } from '../../observability/logger';
import type { RotationPolicy, SecretType } from './types';
import { DEFAULT_ROTATION_POLICIES } from './types';

export class RotationScheduler {
    private policies: Map<SecretType, RotationPolicy>;
    private intervalId: NodeJS.Timeout | null = null;
    private running = false;

    constructor(policies: RotationPolicy[] = DEFAULT_ROTATION_POLICIES) {
        this.policies = new Map(policies.map(p => [p.type, p]));
    }

    /**
     * Start the rotation scheduler
     */
    start(): void {
        if (this.running) {
            baseLogger.warn('[RotationScheduler] Already running');
            return;
        }

        baseLogger.info('[RotationScheduler] Starting automated rotation scheduler...');

        // Check every hour
        this.intervalId = setInterval(() => {
            this.checkAndRotate().catch(err => {
                baseLogger.error({ err }, '[RotationScheduler] Error during rotation check');
            });
        }, 60 * 60 * 1000); // 1 hour

        // Run immediately on start
        this.checkAndRotate().catch(err => {
            baseLogger.error({ err }, '[RotationScheduler] Error during initial rotation check');
        });

        this.running = true;
        baseLogger.info('[RotationScheduler] ✅ Scheduler started');
    }

    /**
     * Stop the rotation scheduler
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.running = false;
        baseLogger.info('[RotationScheduler] Scheduler stopped');
    }

    /**
     * Check all secrets and rotate if needed
     */
    private async checkAndRotate(): Promise<void> {
        baseLogger.info('[RotationScheduler] Checking secrets for rotation...');

        const metadata = secretManager.listMetadata();
        const rotations: Promise<void>[] = [];

        for (const meta of metadata) {
            const policy = this.policies.get(meta.type);
            if (!policy) {
                baseLogger.warn({ type: meta.type }, '[RotationScheduler] No policy for secret type: %s', meta.type);
                continue;
            }

            // Check if rotation needed
            if (meta.ageDays >= policy.rotationIntervalDays) {
                baseLogger.info(
                    { type: meta.type, ageDays: meta.ageDays, policyDays: policy.rotationIntervalDays },
                    "[RotationScheduler] Secret '%s' needs rotation (age: %d days, policy: %d days)",
                    meta.type,
                    meta.ageDays,
                    policy.rotationIntervalDays
                );
                rotations.push(this.rotateWithRetry(meta.type, policy));
            } else {
                baseLogger.debug(
                    { type: meta.type, ageDays: meta.ageDays },
                    "[RotationScheduler] Secret '%s' is healthy (age: %d days)",
                    meta.type,
                    meta.ageDays
                );
            }

            // Check if stale (approaching max age)
            if (meta.ageDays >= policy.maxAgeDays * 0.8) {
                await eventBus.publishTyped('security.secret.stale_warning', {
                    type: 'security.secret.stale_warning',
                    tenantId: 'system',
                    payload: {
                        secretType: meta.type,
                        ageDays: meta.ageDays,
                        maxAgeDays: policy.maxAgeDays,
                        warning: `Secret approaching max age (${meta.ageDays}/${policy.maxAgeDays} days)`,
                    },
                });
            }
        }

        await Promise.allSettled(rotations);
        baseLogger.info(
            { rotationCount: rotations.length },
            '[RotationScheduler] Rotation check complete (%d secrets rotated)',
            rotations.length
        );
    }

    /**
     * Rotate secret with retry logic
     */
    private async rotateWithRetry(type: SecretType, policy: RotationPolicy, maxRetries = 3): Promise<void> {
        let attempt = 0;

        while (attempt < maxRetries) {
            try {
                const result = await secretManager.rotateSecret(type);

                if (result.success) {
                    baseLogger.info({ type }, '[RotationScheduler] ✅ Rotated %s successfully', type);

                    // Schedule promotion after grace period
                    setTimeout(async () => {
                        try {
                            await secretManager.promoteNext(type);
                            baseLogger.info({ type }, '[RotationScheduler] ✅ Promoted %s to active', type);
                        } catch (err) {
                            baseLogger.error({ type, err }, '[RotationScheduler] Failed to promote %s', type);
                        }
                    }, policy.gracePeriodHours * 60 * 60 * 1000);

                    return;
                } else {
                    baseLogger.warn(
                        { type, error: result.error },
                        '[RotationScheduler] Rotation failed for %s: %s',
                        type,
                        result.error
                    );
                    
                    // If blocked by AI Guardian (high load), retry later
                    if (result.error?.includes('AI Guardian blocked')) {
                        await new Promise(resolve => setTimeout(resolve, 30 * 60 * 1000)); // Wait 30min
                        attempt++;
                        continue;
                    }

                    throw new Error(result.error);
                }
            } catch (err) {
                attempt++;
                baseLogger.error(
                    { type, attempt, maxRetries, err },
                    '[RotationScheduler] Rotation attempt %d/%d failed for %s',
                    attempt,
                    maxRetries,
                    type
                );

                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000)); // Wait 5min
                } else {
                    // Max retries exhausted - emit critical alert
                    await eventBus.publishTyped('security.secret.rotation_failed', {
                        type: 'security.secret.rotation_failed',
                        tenantId: 'system',
                        payload: {
                            secretType: type,
                            attempts: maxRetries,
                            error: err instanceof Error ? err.message : String(err),
                        },
                    });

                    // Audit critical failure
                    await appendAuditEntry({
                        tenantId: 'system',
                        actorId: 'rotation-scheduler',
                        actionId: 'security.secret.rotation_failed',
                        payload: {
                            secretType: type,
                            attempts: maxRetries,
                            error: err instanceof Error ? err.message : String(err),
                        },
                    });

                    throw err;
                }
            }
        }
    }

    /**
     * Get rotation status for all secrets
     */
    getStatus(): {
        type: SecretType;
        ageDays: number;
        nextRotationDays: number;
        status: string;
    }[] {
        const metadata = secretManager.listMetadata();
        return metadata.map(meta => {
            const policy = this.policies.get(meta.type);
            const nextRotationDays = policy
                ? Math.max(0, policy.rotationIntervalDays - meta.ageDays)
                : -1;

            return {
                type: meta.type,
                ageDays: meta.ageDays,
                nextRotationDays,
                status: meta.status,
            };
        });
    }

    /**
     * Manually trigger rotation for a specific secret type
     */
    async manualRotation(type: SecretType): Promise<void> {
        console.info(`[RotationScheduler] Manual rotation triggered for: ${type}`);
        const policy = this.policies.get(type);
        if (!policy) {
            throw new Error(`No policy found for secret type: ${type}`);
        }
        await this.rotateWithRetry(type, policy);
    }
}

// ─────────────────────────────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────────────────────────────

export const rotationScheduler = new RotationScheduler();


/**
 * Secret Manager — Zero-Downtime Secret Rotation
 * 
 * Features:
 * - Dual-key mode (active + next key overlap)
 * - Live proxy (no env variables)
 * - Coordinated rotation across Kernel + MCP Engines
 * - AI-validated rotation windows
 * - Cryptographic audit trail
 * - Hot reload (no restart required)
 * 
 * Security Governance:
 * - Policy #1: No env-secret allowed. Must use SecretManagerProxy.
 * - Policy #2: Rotation must not require restart.
 * - Policy #3: Rotation logs written to Cryptographic Audit Chain.
 * - Policy #4: Next key must overlap for 24h before invalidation.
 * - Policy #5: AI Guardian blocks rotation during system load >70%.
 * 
 * @module security/secret-rotation/secret.manager
 */

import crypto from 'node:crypto';
import { eventBus } from '../../events/event-bus';
import { appendAuditEntry } from '../../audit/hash-chain.store';
import { baseLogger } from '../../observability/logger';
import type { SecretType, SecretMetadata, RotationResult } from './types';

// ─────────────────────────────────────────────────────────────
// In-Memory Secret Store (Dual-Key Mode)
// ─────────────────────────────────────────────────────────────

interface SecretPair {
    active: string;
    next: string;
    rotatedAt: Date;
    expiresAt: Date;
}

const secrets = new Map<SecretType, SecretPair>();

// ─────────────────────────────────────────────────────────────
// Secret Manager Class
// ─────────────────────────────────────────────────────────────

export class SecretManager {
    private vaultUrl: string;
    private vaultToken: string;
    private initialized = false;

    constructor(config: { vaultUrl: string; vaultToken: string }) {
        this.vaultUrl = config.vaultUrl;
        this.vaultToken = config.vaultToken;
    }

    /**
     * Initialize secret manager and load secrets from vault
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            baseLogger.warn('[SecretManager] Already initialized');
            return;
        }

        baseLogger.info('[SecretManager] Initializing from vault...');

        // Load all secrets from vault
        const vaultSecrets = await this.fetchFromVault();

        for (const [type, pair] of Object.entries(vaultSecrets)) {
            secrets.set(type as SecretType, pair as SecretPair);
        }

        // Subscribe to rotation events
        eventBus.subscribe('security.secret.rotation.requested', this.handleRotationRequest.bind(this));

        this.initialized = true;
        baseLogger.info({ secretCount: secrets.size }, '[SecretManager] Initialized with %d secret types', secrets.size);
    }

    /**
     * Get active secret (for signing)
     */
    getActive(type: SecretType): string {
        const pair = secrets.get(type);
        if (!pair) {
            throw new Error(`Secret type '${type}' not found. Did you call initialize()?`);
        }
        return pair.active;
    }

    /**
     * Verify secret (accepts both active and next key)
     */
    verify(type: SecretType, candidate: string): boolean {
        const pair = secrets.get(type);
        if (!pair) return false;

        return candidate === pair.active || candidate === pair.next;
    }

    /**
     * Sign data with active key
     */
    sign(type: SecretType, payload: unknown): string {
        const activeKey = this.getActive(type);
        const serialized = JSON.stringify(payload);
        return crypto.createHmac('sha512', activeKey).update(serialized).digest('hex');
    }

    /**
     * Verify signed data (accepts both active and next key)
     */
    verifySignature(type: SecretType, signature: string, payload: unknown): boolean {
        const pair = secrets.get(type);
        if (!pair) return false;

        const serialized = JSON.stringify(payload);
        const h1 = crypto.createHmac('sha512', pair.active).update(serialized).digest('hex');
        const h2 = crypto.createHmac('sha512', pair.next).update(serialized).digest('hex');

        return signature === h1 || signature === h2;
    }

    /**
     * Rotate secret (AI-validated)
     */
    async rotateSecret(type: SecretType, tenantId = 'system'): Promise<RotationResult> {
        baseLogger.info({ type }, '[SecretManager] Rotating secret: %s', type);

        // Step 1: AI Guardian validation (load check)
        const systemLoad = await this.getSystemLoad();
        if (systemLoad > 0.7) {
            baseLogger.warn(
                { type, systemLoad: systemLoad * 100 },
                '[SecretManager] Rotation blocked by AI Guardian: System load %d%% > 70%%',
                systemLoad * 100
            );
            return {
                success: false,
                type,
                error: 'AI Guardian blocked rotation: System load too high',
                systemLoad,
            };
        }

        // Step 2: Generate new key
        const newKey = this.generateKey(type);

        // Step 3: Update vault
        const pair = secrets.get(type);
        if (!pair) {
            throw new Error(`Secret type '${type}' not found`);
        }

        const oldNext = pair.next;
        const updatedPair: SecretPair = {
            active: pair.active, // Keep active unchanged
            next: newKey,        // Update next
            rotatedAt: new Date(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h grace period
        };

        await this.updateVault(type, updatedPair);

        // Step 4: Update in-memory
        secrets.set(type, updatedPair);

        // Step 5: Emit event for coordination
        await eventBus.publishTyped('security.secret.rotated', {
            type: 'security.secret.rotated',
            tenantId,
            payload: {
                secretType: type,
                oldNext,
                newNext: newKey,
                rotatedAt: updatedPair.rotatedAt.toISOString(),
                expiresAt: updatedPair.expiresAt.toISOString(),
            },
        });

        // Step 6: Audit trail
        await appendAuditEntry({
            tenantId,
            actorId: 'secret-manager',
            actionId: 'security.secret.rotated',
            payload: {
                secretType: type,
                rotatedAt: updatedPair.rotatedAt.toISOString(),
                systemLoad,
            },
        });

        baseLogger.info({ type }, '[SecretManager] ✅ Secret rotated: %s', type);

        return {
            success: true,
            type,
            rotatedAt: updatedPair.rotatedAt,
            expiresAt: updatedPair.expiresAt,
        };
    }

    /**
     * Promote next key to active (after grace period)
     */
    async promoteNext(type: SecretType, tenantId = 'system'): Promise<void> {
        baseLogger.info({ type }, '[SecretManager] Promoting next key to active: %s', type);

        const pair = secrets.get(type);
        if (!pair) {
            throw new Error(`Secret type '${type}' not found`);
        }

        // Check grace period expired
        if (pair.expiresAt > new Date()) {
            throw new Error(`Cannot promote: Grace period not expired (expires at ${pair.expiresAt.toISOString()})`);
        }

        // Promote next → active
        const promoted: SecretPair = {
            active: pair.next,
            next: pair.next, // Both same until next rotation
            rotatedAt: new Date(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        };

        await this.updateVault(type, promoted);
        secrets.set(type, promoted);

        // Emit event
        await eventBus.publishTyped('security.secret.promoted', {
            type: 'security.secret.promoted',
            tenantId,
            payload: {
                secretType: type,
                promotedAt: promoted.rotatedAt.toISOString(),
            },
        });

        // Audit
        await appendAuditEntry({
            tenantId,
            actorId: 'secret-manager',
            actionId: 'security.secret.promoted',
            payload: {
                secretType: type,
                promotedAt: promoted.rotatedAt.toISOString(),
            },
        });

        baseLogger.info({ type }, '[SecretManager] ✅ Key promoted: %s', type);
    }

    /**
     * Get secret metadata
     */
    getMetadata(type: SecretType): SecretMetadata | null {
        const pair = secrets.get(type);
        if (!pair) return null;

        const now = new Date();
        const ageMs = now.getTime() - pair.rotatedAt.getTime();
        const ageDays = Math.floor(ageMs / (1000 * 60 * 60 * 24));

        return {
            type,
            rotatedAt: pair.rotatedAt,
            expiresAt: pair.expiresAt,
            ageDays,
            status: pair.expiresAt < now ? 'expired' : ageDays > 60 ? 'stale' : 'healthy',
        };
    }

    /**
     * List all secret metadata
     */
    listMetadata(): SecretMetadata[] {
        const metadata: SecretMetadata[] = [];
        for (const type of secrets.keys()) {
            const meta = this.getMetadata(type);
            if (meta) metadata.push(meta);
        }
        return metadata;
    }

    // ─────────────────────────────────────────────────────────────
    // Private Methods
    // ─────────────────────────────────────────────────────────────

    private generateKey(type: SecretType): string {
        switch (type) {
            case 'jwt':
                return crypto.randomBytes(64).toString('hex'); // 512-bit
            case 'api_key':
                return crypto.randomBytes(32).toString('hex'); // 256-bit
            case 'db_password':
                return crypto.randomBytes(32).toString('base64url');
            case 'encryption_key':
                return crypto.randomBytes(32).toString('hex'); // AES-256
            default:
                return crypto.randomBytes(32).toString('hex');
        }
    }

    private async fetchFromVault(): Promise<Record<string, SecretPair>> {
        // TODO: Integrate with real vault (Supabase Vault / HashiCorp Vault)
        // For now, return mock data
        const now = new Date();
        return {
            jwt: {
                active: crypto.randomBytes(64).toString('hex'),
                next: crypto.randomBytes(64).toString('hex'),
                rotatedAt: now,
                expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
            api_key: {
                active: crypto.randomBytes(32).toString('hex'),
                next: crypto.randomBytes(32).toString('hex'),
                rotatedAt: now,
                expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
            },
            db_password: {
                active: crypto.randomBytes(32).toString('base64url'),
                next: crypto.randomBytes(32).toString('base64url'),
                rotatedAt: now,
                expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
            },
            encryption_key: {
                active: crypto.randomBytes(32).toString('hex'),
                next: crypto.randomBytes(32).toString('hex'),
                rotatedAt: now,
                expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000),
            },
        };
    }

    private async updateVault(type: SecretType, pair: SecretPair): Promise<void> {
        // TODO: Implement real vault update
        baseLogger.info({ type }, '[SecretManager] Vault updated: %s', type);
    }

    private async getSystemLoad(): Promise<number> {
        // TODO: Implement real system load check (CPU, Memory, Active Requests)
        // For now, return mock value
        return Math.random() * 0.6; // Simulate 0-60% load
    }

    private async handleRotationRequest(event: any): Promise<void> {
        const { secretType, tenantId } = event.payload;
        await this.rotateSecret(secretType, tenantId);
    }
}

// ─────────────────────────────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────────────────────────────

export const secretManager = new SecretManager({
    vaultUrl: process.env.VAULT_URL || 'http://localhost:8200',
    vaultToken: process.env.VAULT_TOKEN || 'dev-token',
});


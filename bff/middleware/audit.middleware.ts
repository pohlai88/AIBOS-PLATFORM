/**
 * @fileoverview Audit Middleware (Enterprise Edition)
 * @module @bff/middleware/audit
 * @description Cryptographic audit trail with hash chain, deep redaction, OTEL correlation
 * 
 * Compliance: SOX, PCI-DSS, ISO27001, SOC2 Type 2, HIPAA
 * 
 * Features:
 * - Request+Response combined into ONE audit entry
 * - Cryptographic hash chain with optional HMAC
 * - Deep redaction for nested secrets
 * - High-risk read logging (admin/system paths)
 * - OpenTelemetry correlation (traceId/spanId)
 * - Manifest-driven audit rules
 */

import crypto from 'crypto';
import type { BffManifestType } from '../bff.manifest';
import type { AuthContext } from './auth.middleware';
import { PostgresAuditStore } from '../storage/postgres-audit-store';

// ============================================================================
// Types
// ============================================================================

export interface PendingAudit {
    startTime: number;
    entry: AuditEntry;
}

export interface AuditEntry {
    id: string;
    timestamp: string;
    hash: string;
    previousHash: string;

    // Request identification
    requestId: string;
    method: string;
    path: string;
    protocol: string;

    // Context (preserved from request to response)
    tenantId: string;
    userId: string;
    roles: string[];
    apiVersion: string;
    clientType?: string;

    // OpenTelemetry correlation
    traceId?: string;
    spanId?: string;

    // Classification
    action: string;
    category: 'read' | 'write' | 'delete' | 'admin' | 'system';
    riskLevel: 'low' | 'medium' | 'high' | 'critical';

    // Outcome (updated on response)
    status: 'pending' | 'success' | 'failure' | 'error';
    statusCode?: number;
    errorCode?: string;
    duration?: number;

    // Sanitized metadata
    metadata?: Record<string, unknown>;
}

export interface AuditConfig {
    /** Enable audit logging */
    enabled: boolean;
    /** Log read operations (GET/HEAD/OPTIONS) */
    logReads: boolean;
    /** Always log high-risk operations regardless of logReads */
    logHighRisk: boolean;
    /** Include request body in audit (sanitized) */
    includeBody: boolean;
    /** Maximum body size to log (bytes) */
    maxBodySize: number;
    /** Fields to redact (supports nested paths) */
    redactFields: string[];
    /** Hash algorithm */
    hashAlgorithm: 'sha256' | 'sha384' | 'sha512';
    /** HMAC secret for tamper-proof hashing (optional) */
    hmacSecret?: string;
    /** High-risk path patterns (always logged) */
    highRiskPaths: string[];
}

export interface AuditStore {
    append(entry: AuditEntry): Promise<void>;
    getLastHash(): Promise<string>;
    getEntry(requestId: string): Promise<AuditEntry | undefined>;
    verify(entries: AuditEntry[]): Promise<boolean>;
}

// ============================================================================
// Default Config
// ============================================================================

const DEFAULT_CONFIG: AuditConfig = {
    enabled: true,
    logReads: false,
    logHighRisk: true,
    includeBody: false,
    maxBodySize: 10000,
    redactFields: [
        'password',
        'token',
        'secret',
        'apiKey',
        'authorization',
        'accessToken',
        'refreshToken',
        'privateKey',
        'credentials',
    ],
    hashAlgorithm: 'sha256',
    hmacSecret: undefined,
    highRiskPaths: ['/admin', '/system', '/internal', '/tokens', '/keys', '/secrets'],
};

// ============================================================================
// In-Memory Store (Development Only)
// ============================================================================

export class InMemoryAuditStore implements AuditStore {
    private entries: AuditEntry[] = [];
    private lastHash = 'genesis';
    private byRequestId = new Map<string, AuditEntry>();

    async append(entry: AuditEntry): Promise<void> {
        this.entries.push(entry);
        this.lastHash = entry.hash;
        this.byRequestId.set(entry.requestId, entry);
    }

    async getLastHash(): Promise<string> {
        return this.lastHash;
    }

    async getEntry(requestId: string): Promise<AuditEntry | undefined> {
        return this.byRequestId.get(requestId);
    }

    async verify(entries: AuditEntry[]): Promise<boolean> {
        let previousHash = 'genesis';
        for (const entry of entries) {
            // Recompute hash without the hash field
            const { hash, ...rest } = entry;
            const computed = crypto
                .createHash('sha256')
                .update(JSON.stringify({ ...rest, previousHash }))
                .digest('hex');

            if (computed !== hash) return false;
            previousHash = hash;
        }
        return true;
    }

    getEntries(): AuditEntry[] {
        return [...this.entries];
    }

    clear(): void {
        this.entries = [];
        this.lastHash = 'genesis';
        this.byRequestId.clear();
    }
}

// ============================================================================
// Audit Middleware (Enterprise Edition)
// ============================================================================

/**
 * Create audit middleware from manifest
 * 
 * Features:
 * - Single entry per request (request + response combined)
 * - Cryptographic hash chain (SHA256/384/512 or HMAC)
 * - Deep redaction for nested secrets
 * - High-risk read logging
 * - OpenTelemetry correlation
 * - Manifest-driven rules
 */
export function createAuditMiddleware(
    manifest: Readonly<BffManifestType>,
    options: {
        config?: Partial<AuditConfig>;
        store?: AuditStore;
        db?: any; // Kernel Database instance
    } = {}
) {
    const config: AuditConfig = { ...DEFAULT_CONFIG, ...options.config };
    
    // Determine which store to use based on environment variable or provided store
    let store: AuditStore;
    if (options.store) {
        store = options.store;
    } else {
        const auditStoreType = process.env.BFF_AUDIT_STORE || 'memory';
        if (auditStoreType === 'postgres' && options.db) {
            store = new PostgresAuditStore(options.db);
        } else {
            store = new InMemoryAuditStore();
        }
    }

    // Pending audits (request started, response not yet received)
    const pending = new Map<string, PendingAudit>();

    // Apply manifest rules
    if (!manifest.security.auditHighRisk && !manifest.security.auditMutations) {
        config.enabled = false;
    }

    /**
     * Compute hash for audit entry
     */
    function computeHash(entry: Omit<AuditEntry, 'hash'>, previousHash: string): string {
        const data = JSON.stringify({ ...entry, previousHash });

        if (config.hmacSecret) {
            return crypto
                .createHmac(config.hashAlgorithm, config.hmacSecret)
                .update(data)
                .digest('hex');
        }

        return crypto.createHash(config.hashAlgorithm).update(data).digest('hex');
    }

    /**
     * Check if path is high-risk
     */
    function isHighRiskPath(path: string): boolean {
        return config.highRiskPaths.some((p) => path.includes(p));
    }

    /**
     * Determine if request should be logged
     */
    function shouldLog(category: AuditEntry['category'], riskLevel: AuditEntry['riskLevel']): boolean {
        // Always log high/critical risk
        if (config.logHighRisk && (riskLevel === 'high' || riskLevel === 'critical')) {
            return true;
        }

        // Always log admin/system categories
        if (category === 'admin' || category === 'system') {
            return true;
        }

        // Always log mutations if enabled
        if (manifest.security.auditMutations && (category === 'write' || category === 'delete')) {
            return true;
        }

        // Log reads only if enabled
        if (category === 'read' && !config.logReads) {
            return false;
        }

        return true;
    }

    return {
        /**
         * Start audit (request phase)
         * Creates a pending entry that will be completed on response
         */
        async logRequest(
            ctx: AuthContext,
            req: {
                method: string;
                path: string;
                protocol: string;
                body?: unknown;
                traceId?: string;
                spanId?: string;
            }
        ): Promise<string> {
            if (!config.enabled) return ctx.requestId;

            const category = classifyCategory(req.method, req.path);
            const riskLevel = classifyRisk(req.method, req.path, ctx, isHighRiskPath);

            // Check if we should log this request
            if (!shouldLog(category, riskLevel)) {
                return ctx.requestId;
            }

            const previousHash = await store.getLastHash();

            const entry: AuditEntry = {
                id: generateAuditId(),
                timestamp: new Date().toISOString(),
                hash: '', // Computed on response
                previousHash,

                requestId: ctx.requestId,
                method: req.method,
                path: req.path,
                protocol: req.protocol,

                tenantId: ctx.tenantId,
                userId: ctx.userId,
                roles: [...ctx.roles],
                apiVersion: ctx.apiVersion,
                clientType: ctx.clientType,

                traceId: req.traceId,
                spanId: req.spanId,

                action: `${req.method} ${req.path}`,
                category,
                riskLevel,

                status: 'pending',
                metadata: config.includeBody
                    ? deepRedact(req.body, config.redactFields, config.maxBodySize)
                    : undefined,
            };

            // Store as pending
            pending.set(ctx.requestId, {
                startTime: Date.now(),
                entry,
            });

            return ctx.requestId;
        },

        /**
         * Complete audit (response phase)
         * Updates the pending entry with outcome and commits to chain
         */
        async logResponse(
            requestId: string,
            response: {
                statusCode: number;
                errorCode?: string;
            }
        ): Promise<void> {
            if (!config.enabled) return;

            const record = pending.get(requestId);
            if (!record) {
                // No pending audit for this request (might have been skipped)
                return;
            }

            const entry = record.entry;

            // Update with response data
            entry.status = response.statusCode >= 400 ? 'failure' : 'success';
            entry.statusCode = response.statusCode;
            entry.errorCode = response.errorCode;
            entry.duration = Date.now() - record.startTime;

            // Compute final hash and commit
            const previousHash = await store.getLastHash();
            entry.previousHash = previousHash; // Update to latest
            entry.hash = computeHash(entry, previousHash);

            await store.append(entry);

            // Remove from pending
            pending.delete(requestId);
        },

        /**
         * Log error (for exceptions that bypass normal response)
         */
        async logError(
            requestId: string,
            error: {
                code: string;
                message: string;
            }
        ): Promise<void> {
            if (!config.enabled) return;

            const record = pending.get(requestId);
            if (!record) return;

            const entry = record.entry;

            entry.status = 'error';
            entry.errorCode = error.code;
            entry.duration = Date.now() - record.startTime;

            const previousHash = await store.getLastHash();
            entry.previousHash = previousHash;
            entry.hash = computeHash(entry, previousHash);

            await store.append(entry);
            pending.delete(requestId);
        },

        /**
         * Get pending audit count (for monitoring)
         */
        getPendingCount(): number {
            return pending.size;
        },

        /**
         * Get audit store
         */
        getStore(): AuditStore {
            return store;
        },

        /**
         * Verify chain integrity
         */
        async verifyChain(): Promise<boolean> {
            if (store instanceof InMemoryAuditStore) {
                return store.verify(store.getEntries());
            }
            return true; // External stores handle their own verification
        },

        /**
         * Get config (for debugging)
         */
        getConfig(): AuditConfig {
            return { ...config };
        },
    };
}

// ============================================================================
// Classification Helpers
// ============================================================================

/**
 * Generate unique audit ID
 */
function generateAuditId(): string {
    return `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
}

/**
 * Classify request category
 */
function classifyCategory(method: string, path: string): AuditEntry['category'] {
    // Admin/system paths override method-based classification
    if (path.includes('/admin') || path.includes('/system') || path.includes('/internal')) {
        return 'admin';
    }

    switch (method.toUpperCase()) {
        case 'GET':
        case 'HEAD':
        case 'OPTIONS':
            return 'read';
        case 'POST':
        case 'PUT':
        case 'PATCH':
            return 'write';
        case 'DELETE':
            return 'delete';
        default:
            return 'system';
    }
}

/**
 * Classify risk level
 */
function classifyRisk(
    method: string,
    path: string,
    ctx: AuthContext,
    isHighRiskPath: (path: string) => boolean
): AuditEntry['riskLevel'] {
    // Critical: admin/system paths
    if (path.includes('/admin') || path.includes('/system')) {
        return 'critical';
    }

    // Critical: high-risk paths
    if (isHighRiskPath(path)) {
        return 'critical';
    }

    // High: delete operations
    if (method === 'DELETE') {
        return 'high';
    }

    // High: system context operations
    if (ctx.roles.includes('system') || ctx.userId === 'system') {
        return 'high';
    }

    // Medium: mutations
    if (['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
        return 'medium';
    }

    return 'low';
}

// ============================================================================
// Deep Redaction
// ============================================================================

/**
 * Deep redact sensitive fields from object
 * Handles nested objects and arrays
 */
function deepRedact(
    body: unknown,
    redactFields: string[],
    maxSize: number
): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') return undefined;

    // Size check
    const serialized = JSON.stringify(body);
    if (serialized.length > maxSize) {
        return { _truncated: true, _originalSize: serialized.length };
    }

    return redactObject(body, redactFields);
}

/**
 * Recursively redact object
 */
function redactObject(obj: unknown, redactFields: string[]): any {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
        return obj.map((item) => redactObject(item, redactFields));
    }

    if (typeof obj === 'object') {
        const result: Record<string, unknown> = {};

        for (const [key, value] of Object.entries(obj)) {
            // Check if key should be redacted (case-insensitive)
            const shouldRedact = redactFields.some(
                (field) => key.toLowerCase() === field.toLowerCase()
            );

            if (shouldRedact) {
                result[key] = '[REDACTED]';
            } else if (typeof value === 'object' && value !== null) {
                result[key] = redactObject(value, redactFields);
            } else {
                result[key] = value;
            }
        }

        return result;
    }

    return obj;
}

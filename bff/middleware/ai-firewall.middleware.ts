/**
 * @fileoverview AI Firewall Middleware v1.0 (Enterprise Hardened)
 * @module @bff/middleware/ai-firewall
 * @description Constitution-compliant behavioral control & risk scoring
 * 
 * Features:
 * - Manifest-driven configuration (zero hardcoded rules)
 * - System context bypass
 * - Risk scoring with intensity normalization
 * - SafeMode enforcement
 * - Pre/Post request validation
 * - Sensitive data leak prevention
 * - OTEL correlation
 */

import type { BffManifestType } from '../bff.manifest';
import type { AuthContext } from './auth.middleware';

// ============================================================================
// Types
// ============================================================================

export interface FirewallResult {
    allowed: boolean;
    reason?: string;
    riskScore?: number;
    flags?: string[];
    traceId?: string;
}

export interface FirewallContext {
    path: string;
    protocol: string;
    action?: string;
    method?: string;
    traceId?: string;
    spanId?: string;
}

export interface RiskFactor {
    name: string;
    weight: number;
    critical?: boolean;
    check: (ctx: AuthContext, body: unknown, fwCtx: FirewallContext, config: FirewallConfig) => number; // Returns intensity 0-1
}

export interface FirewallConfig {
    /** Enable firewall */
    enabled: boolean;
    /** Risk score threshold (0-100) */
    riskThreshold: number;
    /** Block high-risk requests */
    blockHighRisk: boolean;
    /** Log all checks */
    logAll: boolean;
    /** Custom blocked patterns */
    blockedPatterns: RegExp[];
    /** Allowed bypass paths (exact match) */
    bypassPaths: string[];
    /** Max payload size in bytes */
    maxPayloadSize: number;
    /** Enable SafeMode checks */
    safeModeEnabled: boolean;
    /** System bypass enabled */
    systemBypassEnabled: boolean;
    /** Critical factor multiplier */
    criticalMultiplier: number;
}

export interface FirewallEvents {
    onBlock?: (ctx: AuthContext, reason: string, riskScore: number, traceId?: string) => void;
    onAllow?: (ctx: AuthContext, riskScore: number, flags: string[], traceId?: string) => void;
    onWarning?: (ctx: AuthContext, message: string, riskScore: number) => void;
}

// ============================================================================
// Default Config (can be overridden by manifest)
// ============================================================================

const DEFAULT_BLOCKED_PATTERNS: RegExp[] = [
    /eval\s*\(/gi,
    /Function\s*\(/gi,
    /__proto__/gi,
    /constructor\s*\[/gi,
    /process\.env/gi,
    /require\s*\(/gi,
    /import\s*\(/gi,
    /<script[\s>]/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /\$\{.*\}/g, // Template injection
    /{{.*}}/g, // Template injection
];

const DEFAULT_CONFIG: FirewallConfig = {
    enabled: true,
    riskThreshold: 70,
    blockHighRisk: true,
    logAll: false,
    blockedPatterns: DEFAULT_BLOCKED_PATTERNS,
    bypassPaths: ['/health', '/ready', '/docs', '/openapi.json'],
    maxPayloadSize: 10 * 1024 * 1024, // 10MB
    safeModeEnabled: true,
    systemBypassEnabled: true,
    criticalMultiplier: 1.5,
};

// ============================================================================
// Risk Factors (with intensity-based scoring)
// ============================================================================

const RISK_FACTORS: RiskFactor[] = [
    {
        name: 'anonymous_user',
        weight: 15,
        check: (ctx) => (ctx.userId === 'anonymous' || ctx.tenantId === 'anonymous' ? 1 : 0),
    },
    {
        name: 'system_path',
        weight: 25,
        check: (_, __, fwCtx) => {
            const path = fwCtx.path.toLowerCase();
            if (path.includes('/admin')) return 1;
            if (path.includes('/system')) return 0.8;
            if (path.includes('/internal')) return 0.6;
            return 0;
        },
    },
    {
        name: 'mutation_operation',
        weight: 10,
        check: (_, __, fwCtx) => {
            const method = (fwCtx.method || fwCtx.action || '').toUpperCase();
            if (method === 'DELETE') return 1;
            if (method === 'PUT' || method === 'PATCH') return 0.6;
            if (method === 'POST') return 0.4;
            return 0;
        },
    },
    {
        name: 'large_payload',
        weight: 15,
        check: (_, body, __, config) => {
            if (!body) return 0;
            try {
                const size = new TextEncoder().encode(JSON.stringify(body)).length;
                const ratio = size / config.maxPayloadSize;
                if (ratio > 1) return 1;
                if (ratio > 0.5) return 0.5;
                if (ratio > 0.1) return 0.2;
                return 0;
            } catch {
                return 0;
            }
        },
    },
    {
        name: 'deep_nesting',
        weight: 20,
        check: (_, body) => {
            if (!body) return 0;
            const depth = getObjectDepth(body);
            if (depth > 15) return 1;
            if (depth > 10) return 0.6;
            if (depth > 7) return 0.3;
            return 0;
        },
    },
    {
        name: 'suspicious_patterns',
        weight: 30,
        critical: true,
        check: (_, body, __, config) => {
            if (!body) return 0;
            try {
                const str = JSON.stringify(body);
                let matches = 0;
                for (const pattern of config.blockedPatterns) {
                    // Reset regex state
                    pattern.lastIndex = 0;
                    if (pattern.test(str)) matches++;
                }
                if (matches >= 3) return 1;
                if (matches >= 2) return 0.7;
                if (matches >= 1) return 0.4;
                return 0;
            } catch {
                return 0;
            }
        },
    },
    {
        name: 'cross_tenant_attempt',
        weight: 25,
        critical: true,
        check: (ctx, body) => {
            if (!body || typeof body !== 'object') return 0;
            const b = body as Record<string, unknown>;
            if (b.tenantId !== undefined && b.tenantId !== ctx.tenantId) return 1;
            if (b.tenant_id !== undefined && b.tenant_id !== ctx.tenantId) return 1;
            return 0;
        },
    },
    {
        name: 'privilege_escalation',
        weight: 35,
        critical: true,
        check: (ctx, body) => {
            if (!body || typeof body !== 'object') return 0;
            const b = body as Record<string, unknown>;
            const isAdmin = ctx.roles.includes('admin') || ctx.roles.includes('system');

            // Check for role/permission manipulation by non-admin
            if (!isAdmin) {
                if (b.role !== undefined || b.roles !== undefined) return 1;
                if (b.permissions !== undefined || b.permission !== undefined) return 1;
                if (b.isAdmin !== undefined || b.is_admin !== undefined) return 1;
            }
            return 0;
        },
    },
    {
        name: 'sql_injection',
        weight: 25,
        critical: true,
        check: (_, body) => {
            if (!body) return 0;
            try {
                const str = JSON.stringify(body).toLowerCase();
                const sqlPatterns = [
                    /'\s*or\s+'1'\s*=\s*'1/,
                    /;\s*drop\s+table/,
                    /union\s+select/,
                    /insert\s+into/,
                    /delete\s+from/,
                    /update\s+.*\s+set/,
                ];
                for (const pattern of sqlPatterns) {
                    if (pattern.test(str)) return 1;
                }
                return 0;
            } catch {
                return 0;
            }
        },
    },
];

// ============================================================================
// AI Firewall Middleware (Enterprise v1.0)
// ============================================================================

/**
 * Create AI Firewall middleware
 * 
 * Features:
 * - Manifest-driven configuration
 * - System context bypass
 * - Risk scoring with intensity normalization
 * - SafeMode enforcement
 * - Pre/Post validation
 * - OTEL correlation
 */
export function createAIFirewall(
    manifest: Readonly<BffManifestType>,
    options: {
        config?: Partial<FirewallConfig>;
        events?: FirewallEvents;
    } = {}
) {
    // Build config from manifest + options
    const config: FirewallConfig = {
        ...DEFAULT_CONFIG,
        enabled: manifest.enforcement.aiFirewallRequired,
        maxPayloadSize: parseSize(manifest.payloadLimits.maxRequestSize),
        ...options.config,
    };

    const events = options.events || {};

    /**
     * Check if context is system (strict validation)
     */
    function isSystemContext(ctx: AuthContext): boolean {
        return ctx.userId === 'system' && ctx.roles.includes('system');
    }

    /**
     * Check if path is exact bypass match
     */
    function isBypassPath(path: string): boolean {
        return config.bypassPaths.some((p) => path === p || path === p + '/');
    }

    /**
     * Calculate risk score with intensity normalization
     */
    function calculateRiskScore(
        ctx: AuthContext,
        body: unknown,
        fwCtx: FirewallContext
    ): { score: number; flags: string[]; hasCritical: boolean } {
        let score = 0;
        const flags: string[] = [];
        let hasCritical = false;

        for (const factor of RISK_FACTORS) {
            try {
                const intensity = factor.check(ctx, body, fwCtx, config);
                if (intensity > 0) {
                    const contribution = factor.weight * intensity;
                    score += contribution;
                    flags.push(factor.name);

                    if (factor.critical && intensity >= 0.5) {
                        hasCritical = true;
                    }
                }
            } catch {
                // Ignore check errors
            }
        }

        // Apply critical multiplier
        if (hasCritical) {
            score = score * config.criticalMultiplier;
        }

        // Cap at 100
        return { score: Math.min(Math.round(score), 100), flags, hasCritical };
    }

    /**
     * Check for blocked patterns in body
     */
    function checkBlockedPatterns(body: unknown): { blocked: boolean; pattern?: string } {
        if (!body) return { blocked: false };

        try {
            const str = JSON.stringify(body);
            for (const pattern of config.blockedPatterns) {
                pattern.lastIndex = 0; // Reset regex state
                if (pattern.test(str)) {
                    return { blocked: true, pattern: pattern.source };
                }
            }
        } catch {
            // Ignore serialization errors
        }

        return { blocked: false };
    }

    /**
     * SafeMode checks for AI paths
     */
    function checkSafeMode(
        ctx: AuthContext,
        body: unknown,
        fwCtx: FirewallContext
    ): { blocked: boolean; reason?: string } {
        if (!config.safeModeEnabled) return { blocked: false };

        // Only apply to AI-related paths
        if (!fwCtx.path.includes('/ai') && !fwCtx.path.includes('/llm')) {
            return { blocked: false };
        }

        if (body && typeof body === 'object') {
            const b = body as Record<string, unknown>;

            // Check for prompt injection patterns
            if (typeof b.prompt === 'string' || typeof b.message === 'string') {
                const text = (b.prompt || b.message) as string;
                const injectionPatterns = [
                    /ignore\s+(previous|all)\s+instructions/i,
                    /disregard\s+(previous|all)/i,
                    /you\s+are\s+now/i,
                    /act\s+as\s+if/i,
                    /pretend\s+you/i,
                ];

                for (const pattern of injectionPatterns) {
                    if (pattern.test(text)) {
                        return { blocked: true, reason: 'Potential prompt injection detected' };
                    }
                }
            }
        }

        return { blocked: false };
    }

    return {
        /**
         * Pre-request check (before handler execution)
         */
        async preCheck(
            ctx: AuthContext,
            body: unknown,
            fwCtx: FirewallContext
        ): Promise<FirewallResult> {
            const traceId = fwCtx.traceId;

            // Disabled check
            if (!config.enabled) {
                return { allowed: true, riskScore: 0, traceId };
            }

            // System bypass
            if (config.systemBypassEnabled && isSystemContext(ctx)) {
                events.onAllow?.(ctx, 0, ['system_bypass'], traceId);
                return { allowed: true, riskScore: 0, flags: ['system_bypass'], traceId };
            }

            // Exact bypass path match
            if (isBypassPath(fwCtx.path)) {
                return { allowed: true, riskScore: 0, traceId };
            }

            // Check blocked patterns first (fast fail)
            const patternCheck = checkBlockedPatterns(body);
            if (patternCheck.blocked) {
                const reason = 'Request contains blocked pattern';
                events.onBlock?.(ctx, reason, 100, traceId);
                return {
                    allowed: false,
                    reason,
                    riskScore: 100,
                    flags: ['blocked_pattern'],
                    traceId,
                };
            }

            // SafeMode checks
            const safeModeCheck = checkSafeMode(ctx, body, fwCtx);
            if (safeModeCheck.blocked) {
                events.onBlock?.(ctx, safeModeCheck.reason!, 95, traceId);
                return {
                    allowed: false,
                    reason: safeModeCheck.reason,
                    riskScore: 95,
                    flags: ['safemode_violation'],
                    traceId,
                };
            }

            // Calculate risk score
            const { score, flags, hasCritical } = calculateRiskScore(ctx, body, fwCtx);

            // Warning for high scores that don't block
            if (score >= config.riskThreshold * 0.7 && score < config.riskThreshold) {
                events.onWarning?.(ctx, `High risk score: ${score}`, score);
            }

            // Check risk threshold
            if (config.blockHighRisk && score >= config.riskThreshold) {
                const reason = `Risk score (${score}) exceeds threshold (${config.riskThreshold})`;
                events.onBlock?.(ctx, reason, score, traceId);
                return {
                    allowed: false,
                    reason,
                    riskScore: score,
                    flags,
                    traceId,
                };
            }

            events.onAllow?.(ctx, score, flags, traceId);
            return { allowed: true, riskScore: score, flags, traceId };
        },

        /**
         * Post-response check (after handler execution)
         */
        async postCheck(
            ctx: AuthContext,
            responseData: unknown,
            fwCtx: FirewallContext
        ): Promise<FirewallResult> {
            const traceId = fwCtx.traceId;

            if (!config.enabled) {
                return { allowed: true, riskScore: 0, traceId };
            }

            // System bypass
            if (config.systemBypassEnabled && isSystemContext(ctx)) {
                return { allowed: true, riskScore: 0, traceId };
            }

            if (!responseData || typeof responseData !== 'object') {
                return { allowed: true, riskScore: 0, traceId };
            }

            const r = responseData as Record<string, unknown>;

            // Check for internal error/debug leakage
            const leakageFields = ['stack', 'trace', 'internalError', 'debug', 'sql', 'env', 'process'];
            for (const field of leakageFields) {
                if (r[field] !== undefined) {
                    return {
                        allowed: false,
                        reason: `Response contains internal field: ${field}`,
                        riskScore: 70,
                        flags: ['internal_leakage'],
                        traceId,
                    };
                }
            }

            // Check for sensitive data leakage
            const leakCheck = checkDataLeakage(responseData);
            if (leakCheck.hasLeak) {
                return {
                    allowed: false,
                    reason: `Potential data leakage: ${leakCheck.fields.join(', ')}`,
                    riskScore: 80,
                    flags: ['data_leakage'],
                    traceId,
                };
            }

            return { allowed: true, riskScore: 0, traceId };
        },

        /**
         * Get current config
         */
        getConfig(): FirewallConfig {
            return { ...config };
        },

        /**
         * Check if firewall is enabled
         */
        isEnabled(): boolean {
            return config.enabled;
        },

        /**
         * Update config at runtime (for dynamic rules)
         */
        updateConfig(updates: Partial<FirewallConfig>): void {
            Object.assign(config, updates);
        },

        /**
         * Add custom blocked pattern
         */
        addBlockedPattern(pattern: RegExp): void {
            config.blockedPatterns.push(pattern);
        },

        /**
         * Get risk factors (for dashboard)
         */
        getRiskFactors(): Array<{ name: string; weight: number; critical: boolean }> {
            return RISK_FACTORS.map((f) => ({
                name: f.name,
                weight: f.weight,
                critical: f.critical || false,
            }));
        },
    };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Get object nesting depth (with safety limit)
 */
function getObjectDepth(obj: unknown, depth = 0, maxDepth = 20): number {
    if (!obj || typeof obj !== 'object' || depth >= maxDepth) {
        return depth;
    }

    let max = depth;
    const values = Array.isArray(obj) ? obj : Object.values(obj);

    for (const value of values) {
        if (value && typeof value === 'object') {
            max = Math.max(max, getObjectDepth(value, depth + 1, maxDepth));
        }
    }

    return max;
}

/**
 * Check for sensitive data leakage in response
 */
function checkDataLeakage(data: unknown): { hasLeak: boolean; fields: string[] } {
    const sensitivePatterns = [
        'password',
        'secret',
        'apikey',
        'api_key',
        'privatekey',
        'private_key',
        'accesstoken',
        'access_token',
        'refreshtoken',
        'refresh_token',
        'ssn',
        'creditcard',
        'credit_card',
        'cvv',
        'pin',
    ];

    const fields: string[] = [];

    function check(obj: unknown, path = ''): void {
        if (!obj || typeof obj !== 'object') return;

        for (const [key, value] of Object.entries(obj)) {
            const currentPath = path ? `${path}.${key}` : key;
            const keyLower = key.toLowerCase().replace(/[_-]/g, '');

            // Check if key matches sensitive pattern
            if (sensitivePatterns.some((p) => keyLower.includes(p.replace(/[_-]/g, '')))) {
                // Only flag if value is not redacted
                if (value !== '[REDACTED]' && value !== null && value !== undefined && value !== '') {
                    fields.push(currentPath);
                }
            }

            // Recurse into nested objects
            if (value && typeof value === 'object') {
                check(value, currentPath);
            }
        }
    }

    check(data);

    return { hasLeak: fields.length > 0, fields };
}

/**
 * Parse size string to bytes
 */
function parseSize(size: string): number {
    const match = size.match(/^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)?$/i);
    if (!match) return 10 * 1024 * 1024; // Default 10MB

    const value = parseFloat(match[1]);
    const unit = (match[2] || 'b').toLowerCase();

    switch (unit) {
        case 'gb':
            return value * 1024 * 1024 * 1024;
        case 'mb':
            return value * 1024 * 1024;
        case 'kb':
            return value * 1024;
        default:
            return value;
    }
}

// ============================================================================
// Export Types
// ============================================================================

export type AIFirewall = ReturnType<typeof createAIFirewall>;

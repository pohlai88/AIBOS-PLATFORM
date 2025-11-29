/**
 * @fileoverview Zone Guard Middleware - Tenant Isolation Boundaries (Enterprise Edition)
 * @module @bff/middleware/zone-guard
 * @description Manifest-aware tenant isolation, cross-tenant prevention, system bypass
 */

import type { BffManifestType } from '../bff.manifest';
import type { AuthContext } from './auth.middleware';

// ============================================================================
// Types
// ============================================================================

export interface ZoneGuardResult {
    allowed: boolean;
    error?: {
        code: string;
        message: string;
    };
    /** AI Firewall risk flags */
    flags?: string[];
}

export interface ZoneGuardEvents {
    onAllow?: (ctx: AuthContext, resource: string) => void;
    onDeny?: (ctx: AuthContext, resource: string, reason: string, flags: string[]) => void;
    onCrossTenantAttempt?: (ctx: AuthContext, targetTenant: string) => void;
    onTenantMismatch?: (ctx: AuthContext, headerTenant: string, tokenTenant: string) => void;
    onSystemBypass?: (ctx: AuthContext, resource: string) => void;
}

/** Tenant ID validation pattern */
const TENANT_ID_PATTERN = /^[a-zA-Z0-9\-_]{3,64}$/;

/** Path tenant extraction (strict) */
const PATH_TENANT_PATTERN = /^\/tenants\/([a-zA-Z0-9\-_]{3,64})(?:\/|$)/;

// ============================================================================
// Default Zone Config (fallback if manifest missing)
// ============================================================================

const DEFAULT_ZONE_CONFIG = {
    systemBypassEnabled: false,
    crossTenantEnabled: false,
    crossTenantPermission: 'system:cross-tenant-access',
    isolatedResources: [] as string[],
    sharedResources: ['/api/v1/health', '/api/v1/ready'] as string[],
};

// ============================================================================
// Zone Guard Middleware (Enterprise Edition)
// ============================================================================

/**
 * Create zone guard middleware from manifest
 * 
 * Features:
 * - Manifest-driven configuration (no hardcoded values)
 * - Tenant isolation enforcement
 * - Cross-tenant access prevention
 * - System context bypass (strict validation)
 * - Path-embedded tenant detection
 * - Audit-safe error codes
 * - Tenant header mismatch detection
 */
export function createZoneGuardMiddleware(
    manifest: Readonly<BffManifestType>,
    options: {
        events?: ZoneGuardEvents;
    } = {}
) {
    const events = options.events || {};

    // Pull config from manifest with fallback (prevents crash if missing)
    const zoneConfig = manifest.enforcement?.zones || DEFAULT_ZONE_CONFIG;
    const policy = {
        systemBypassEnabled: zoneConfig.systemBypassEnabled ?? DEFAULT_ZONE_CONFIG.systemBypassEnabled,
        crossTenantEnabled: zoneConfig.crossTenantEnabled ?? DEFAULT_ZONE_CONFIG.crossTenantEnabled,
        crossTenantPermission: zoneConfig.crossTenantPermission ?? DEFAULT_ZONE_CONFIG.crossTenantPermission,
        isolatedResources: zoneConfig.isolatedResources ?? DEFAULT_ZONE_CONFIG.isolatedResources,
        sharedResources: zoneConfig.sharedResources ?? DEFAULT_ZONE_CONFIG.sharedResources,
    };

    return function zoneGuard(
        ctx: AuthContext,
        resourcePath: string,
        targetTenantId?: string,
        headerTenantId?: string
    ): ZoneGuardResult {
        const flags: string[] = [];

        // Normalize path to prevent traversal attacks
        const normalizedPath = normalizePath(resourcePath);

        // =========================================================================
        // 0. Tenant ID Format Validation (Prevent injection)
        // =========================================================================
        if (headerTenantId && !isValidTenantId(headerTenantId)) {
            flags.push('invalid_tenant_id');
            events.onDeny?.(ctx, normalizedPath, 'INVALID_TENANT_ID', flags);
            return fail('INVALID_TENANT_ID', 'Malformed X-Tenant-ID header', flags);
        }

        if (targetTenantId && !isValidTenantId(targetTenantId)) {
            flags.push('invalid_tenant_id');
            events.onDeny?.(ctx, normalizedPath, 'INVALID_TENANT_ID', flags);
            return fail('INVALID_TENANT_ID', 'Malformed target tenant ID', flags);
        }

        // =========================================================================
        // 1. Tenant Header Mismatch Detection (Security Check)
        // =========================================================================
        if (headerTenantId && ctx.tenantId !== 'anonymous' && headerTenantId !== ctx.tenantId) {
            flags.push('tenant_header_spoof');
            events.onTenantMismatch?.(ctx, headerTenantId, ctx.tenantId);
            return fail(
                'TENANT_HEADER_MISMATCH',
                'X-Tenant-ID header does not match authenticated tenant',
                flags
            );
        }

        // =========================================================================
        // 2. Shared Resources - Always allowed
        // =========================================================================
        if (isSharedResource(normalizedPath, policy.sharedResources)) {
            events.onAllow?.(ctx, normalizedPath);
            return { allowed: true };
        }

        // =========================================================================
        // 3. Anonymous Context - Only shared resources allowed
        // =========================================================================
        if (ctx.tenantId === 'anonymous') {
            flags.push('anonymous_isolation_denied');
            events.onDeny?.(ctx, normalizedPath, 'ANONYMOUS_ISOLATION_DENIED', flags);
            return fail('ANONYMOUS_ISOLATION_DENIED', 'Anonymous context cannot access isolated resources', flags);
        }

        // =========================================================================
        // 4. System Context Bypass (Strict Validation)
        // =========================================================================
        if (policy.systemBypassEnabled && isSystemContext(ctx)) {
            flags.push('system_bypass');
            events.onSystemBypass?.(ctx, normalizedPath);
            events.onAllow?.(ctx, normalizedPath);
            return { allowed: true, flags };
        }

        // =========================================================================
        // 5. Resolve Effective Target Tenant (with strict extraction)
        // =========================================================================
        const pathTenant = extractTenantFromPath(normalizedPath);
        const effectiveTargetTenant = targetTenantId || pathTenant || ctx.tenantId;

        // Validate extracted path tenant
        if (pathTenant && !isValidTenantId(pathTenant)) {
            flags.push('invalid_path_tenant');
            events.onDeny?.(ctx, normalizedPath, 'INVALID_PATH_TENANT', flags);
            return fail('INVALID_PATH_TENANT', 'Malformed tenant ID in path', flags);
        }

        // =========================================================================
        // 6. Cross-Tenant Attempt Detection
        // =========================================================================
        if (effectiveTargetTenant !== ctx.tenantId) {
            flags.push('cross_tenant_attempt');
            events.onCrossTenantAttempt?.(ctx, effectiveTargetTenant);

            if (!policy.crossTenantEnabled) {
                events.onDeny?.(ctx, normalizedPath, 'CROSS_TENANT_DISABLED', flags);
                return fail('CROSS_TENANT_DISABLED', 'Cross-tenant access is disabled by policy', flags);
            }

            if (!ctx.permissions.includes(policy.crossTenantPermission)) {
                events.onDeny?.(ctx, normalizedPath, 'CROSS_TENANT_PERMISSION_REQUIRED', flags);
                return fail('CROSS_TENANT_PERMISSION_REQUIRED', `Missing permission: ${policy.crossTenantPermission}`, flags);
            }
        }

        // =========================================================================
        // 7. Isolated Resource Rules
        // =========================================================================
        if (isIsolatedResource(normalizedPath, policy.isolatedResources)) {
            if (effectiveTargetTenant !== ctx.tenantId && !isSystemContext(ctx)) {
                flags.push('tenant_isolation_enforced');
                events.onDeny?.(ctx, normalizedPath, 'TENANT_ISOLATION_ENFORCED', flags);
                return fail('TENANT_ISOLATION_ENFORCED', `Resource ${normalizedPath} is tenant-isolated`, flags);
            }
        }

        // =========================================================================
        // 8. Default Allow
        // =========================================================================
        events.onAllow?.(ctx, normalizedPath);
        return { allowed: true, flags: flags.length > 0 ? flags : undefined };
    };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Create failure result with audit-safe error code and AI Firewall flags
 */
function fail(code: string, message: string, flags?: string[]): ZoneGuardResult {
    return {
        allowed: false,
        error: { code, message },
        flags,
    };
}

/**
 * Validate tenant ID format (prevent injection attacks)
 */
function isValidTenantId(id: string): boolean {
    return TENANT_ID_PATTERN.test(id);
}

/**
 * Normalize path to prevent traversal attacks
 * Removes: double slashes, ../, trailing slashes
 */
function normalizePath(path: string): string {
    // Remove double slashes
    let normalized = path.replace(/\/+/g, '/');
    // Remove path traversal attempts
    normalized = normalized.replace(/\/\.\.\//g, '/');
    normalized = normalized.replace(/\.\.\//g, '');
    // Remove trailing slash (except root)
    if (normalized.length > 1 && normalized.endsWith('/')) {
        normalized = normalized.slice(0, -1);
    }
    return normalized;
}

/**
 * Check if context is system (strict validation)
 * Must match BOTH userId AND role to prevent spoofing
 */
function isSystemContext(ctx: AuthContext): boolean {
    return ctx.userId === 'system' && ctx.roles.includes('system');
}

/**
 * Check if resource is shared (allows anonymous/any tenant)
 * Uses strict prefix matching to prevent traversal exploits
 */
function isSharedResource(path: string, sharedResources: string[]): boolean {
    return sharedResources.some((r) => path === r || path.startsWith(`${r}/`));
}

/**
 * Check if resource is isolated (tenant-specific)
 * Uses strict prefix matching to prevent traversal exploits
 */
function isIsolatedResource(path: string, isolatedResources: string[]): boolean {
    return isolatedResources.some((r) => path === r || path.startsWith(`${r}/`));
}

/**
 * Extract tenant ID from path if embedded (strict pattern)
 * Pattern: /tenants/{tenantId}/... or /tenants/{tenantId}
 * Only accepts valid tenant ID format
 */
export function extractTenantFromPath(path: string): string | undefined {
    const match = path.match(PATH_TENANT_PATTERN);
    return match?.[1];
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Validate tenant access (standalone helper)
 */
export function canAccessTenant(
    ctx: AuthContext,
    targetTenant: string,
    crossTenantPermission: string = 'cross_tenant_access'
): boolean {
    // Same tenant - always allowed
    if (ctx.tenantId === targetTenant) return true;

    // System context - always allowed
    if (isSystemContext(ctx)) return true;

    // Has cross-tenant permission
    if (ctx.permissions.includes(crossTenantPermission)) return true;

    return false;
}

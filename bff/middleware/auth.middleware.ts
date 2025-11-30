/**
 * @fileoverview Auth Middleware - Manifest-Aware Authentication (Enterprise Edition)
 * @module @bff/middleware/auth
 * @description Full manifest enforcement, version negotiation, anonymous bypass
 */

import type { BffManifestType } from '../bff.manifest';

// ============================================================================
// Kernel Auth Engine Integration
// ============================================================================

import { jwtService } from '../../kernel/auth/jwt.service';
import { apiKeyService } from '../../kernel/auth/api-key.service';
import type { AuthContext as KernelAuthContext } from '../../kernel/auth/types';

// ============================================================================
// Types
// ============================================================================

export interface AuthContext {
    tenantId: string;
    userId: string;
    roles: string[];
    permissions: string[];
    token?: string;
    apiVersion: string;
    requestId: string;
    clientType?: string;
    clientVersion?: string;
}

export interface AuthResult {
    success: boolean;
    context?: AuthContext;
    error?: {
        code: string;
        message: string;
        status: number;
    };
}

export interface AuthEvents {
    onSuccess?: (ctx: AuthContext, path: string) => void;
    onFailure?: (error: { code: string; message: string }, path: string) => void;
    onMissingHeader?: (header: string, path: string) => void;
}

export interface TokenValidationResult {
    valid: boolean;
    userId?: string;
    roles?: string[];
    permissions?: string[];
    error?: string;
}

export type TokenValidator = (
    token: string,
    manifest: Readonly<BffManifestType>
) => Promise<TokenValidationResult>;

// ============================================================================
// Default Token Validator (Kernel Auth Engine Integration)
// ============================================================================

/**
 * Production Token Validator - Integrates with Kernel Auth Engine
 * 
 * Supports:
 * - JWT Bearer tokens (via Kernel jwtService)
 * - API Keys (via Kernel apiKeyService)
 * - Multi-tenant isolation
 * - Role-based access control (RBAC)
 * - Fine-grained permissions (scopes)
 */
const defaultTokenValidator: TokenValidator = async (token, manifest) => {
    let kernelAuthCtx: KernelAuthContext | null = null;

    // =========================================================================
    // 1. Try JWT Bearer Token (Authorization: Bearer <token>)
    // =========================================================================
    if (token.startsWith('Bearer ')) {
        const jwtToken = token.slice('Bearer '.length).trim();

        if (!jwtToken || jwtToken.length < 10) {
            return { valid: false, error: 'JWT token too short' };
        }

        try {
            kernelAuthCtx = await jwtService.verify(jwtToken);
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'JWT verification failed'
            };
        }

        if (!kernelAuthCtx) {
            return { valid: false, error: 'Invalid or expired JWT token' };
        }
    }

    // =========================================================================
    // 2. Try API Key (Authorization: <api-key>)
    // =========================================================================
    else if (token.startsWith('aibos_')) {
        try {
            kernelAuthCtx = await apiKeyService.resolveApiKey(token);
        } catch (error) {
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'API key validation failed'
            };
        }

        if (!kernelAuthCtx) {
            return { valid: false, error: 'Invalid or revoked API key' };
        }
    }

    // =========================================================================
    // 3. Invalid Token Format
    // =========================================================================
    else {
        return {
            valid: false,
            error: 'Invalid token format. Expected: "Bearer <jwt>" or "aibos_<api-key>"'
        };
    }

    // =========================================================================
    // 4. Tenant Isolation Enforcement
    // =========================================================================
    if (manifest.security.requireTenantId) {
        if (!kernelAuthCtx.tenantId) {
            return {
                valid: false,
                error: 'Token missing tenantId (required by manifest)'
            };
        }
    }

    // =========================================================================
    // 5. Extract User ID from Principal
    // =========================================================================
    const userId = kernelAuthCtx.principal?.id || kernelAuthCtx.principal?.subject || 'anonymous';

    // =========================================================================
    // 6. Map Scopes to Permissions (BFF Convention)
    // =========================================================================
    // Kernel uses "scopes" (e.g., "data:read", "engines:execute")
    // BFF uses "permissions" (same concept, different name for legacy compatibility)
    const permissions = kernelAuthCtx.scopes || [];

    // =========================================================================
    // 7. Return Validated Context
    // =========================================================================
    return {
        valid: true,
        userId,
        roles: kernelAuthCtx.roles || [],
        permissions,
    };
};

// ============================================================================
// Auth Middleware Factory
// ============================================================================

/**
 * Create auth middleware from manifest
 * 
 * Features:
 * - Anonymous path bypass (skips ALL checks)
 * - Required headers enforcement
 * - API version negotiation
 * - Token validation pipeline
 * - Tenant isolation
 * - Immutable header protection
 * - Audit event hooks
 */
export function createAuthMiddleware(
    manifest: Readonly<BffManifestType>,
    options: {
        tokenValidator?: TokenValidator;
        events?: AuthEvents;
    } = {}
) {
    const { security, requiredHeaders, versioning } = manifest;
    const tokenValidator = options.tokenValidator || defaultTokenValidator;
    const events = options.events || {};

    return async function auth(req: Request, path: string): Promise<AuthResult> {
        // =========================================================================
        // 1. Anonymous Access - Bypass ALL checks
        // =========================================================================
        if (isAnonymousPath(path, security.allowAnonymous)) {
            const ctx: AuthContext = {
                tenantId: 'anonymous',
                userId: 'anonymous',
                roles: ['anonymous'],
                permissions: [],
                token: undefined,
                apiVersion: versioning.default,
                requestId: req.headers.get('X-Request-ID') || generateRequestId(),
                clientType: req.headers.get('X-Client-Type') || undefined,
                clientVersion: req.headers.get('X-Client-Version') || undefined,
            };

            events.onSuccess?.(ctx, path);
            return { success: true, context: ctx };
        }

        // =========================================================================
        // 2. Required Headers (Global - all requests)
        // =========================================================================
        for (const header of requiredHeaders.all) {
            const value = req.headers.get(header);
            if (!value) {
                // Auto-generate X-Request-ID if missing
                if (header === 'X-Request-ID') continue;

                events.onMissingHeader?.(header, path);
                return fail('VALIDATION_ERROR', `Missing required header: ${header}`, 400);
            }
        }

        // =========================================================================
        // 3. API Version Negotiation
        // =========================================================================
        let apiVersion = req.headers.get('X-API-Version') || versioning.default;

        // Handle "latest" alias
        if (apiVersion === 'latest' && versioning.allowLatestAlias) {
            apiVersion = versioning.latest;
        }

        if (!versioning.supported.includes(apiVersion)) {
            return fail(
                'VALIDATION_ERROR',
                `Unsupported API version: ${apiVersion}. Supported: ${versioning.supported.join(', ')}`,
                400
            );
        }

        // =========================================================================
        // 4. Authentication Required
        // =========================================================================
        let userId = 'system';
        let roles: string[] = [];
        let permissions: string[] = [];
        let token: string | undefined;

        if (security.requireAuth) {
            const authHeader = req.headers.get('Authorization');
            if (!authHeader) {
                events.onFailure?.({ code: 'UNAUTHORIZED', message: 'Missing Authorization header' }, path);
                return fail('UNAUTHORIZED', 'Missing Authorization header', 401);
            }

            const tokenResult = await tokenValidator(authHeader, manifest);
            if (!tokenResult.valid) {
                events.onFailure?.({ code: 'UNAUTHORIZED', message: tokenResult.error || 'Invalid token' }, path);
                return fail('UNAUTHORIZED', tokenResult.error || 'Invalid token', 401);
            }

            userId = tokenResult.userId || 'user';
            roles = tokenResult.roles || [];
            permissions = tokenResult.permissions || [];
            token = authHeader;
        }

        // =========================================================================
        // 5. Tenant Enforcement
        // =========================================================================
        let tenantId = req.headers.get('X-Tenant-ID');

        if (security.requireTenantId) {
            if (!tenantId) {
                events.onFailure?.({ code: 'VALIDATION_ERROR', message: 'Missing X-Tenant-ID' }, path);
                return fail('VALIDATION_ERROR', 'Missing X-Tenant-ID header', 400);
            }
        }

        tenantId = tenantId || 'default';

        // =========================================================================
        // 6. Immutable Headers Protection
        // =========================================================================
        const immutableHeaders = security.immutableHeaders || [];
        for (const header of immutableHeaders) {
            if (req.headers.get(header)) {
                events.onFailure?.({ code: 'FORBIDDEN', message: `Header ${header} is immutable` }, path);
                return fail('FORBIDDEN', `Header ${header} is immutable and cannot be provided by client`, 403);
            }
        }

        // =========================================================================
        // 7. Construct Auth Context
        // =========================================================================
        const context: AuthContext = {
            tenantId,
            userId,
            roles,
            permissions,
            token,
            apiVersion,
            requestId: req.headers.get('X-Request-ID') || generateRequestId(),
            clientType: req.headers.get('X-Client-Type') || undefined,
            clientVersion: req.headers.get('X-Client-Version') || undefined,
        };

        events.onSuccess?.(context, path);
        return { success: true, context };
    };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Create failure result
 */
function fail(code: string, message: string, status: number): AuthResult {
    return {
        success: false,
        error: { code, message, status },
    };
}

/**
 * Check if path allows anonymous access
 */
function isAnonymousPath(path: string, allowList: string[]): boolean {
    return allowList.some((pattern) => {
        if (pattern === '*') return true;
        if (pattern === path) return true;
        if (path.startsWith(pattern)) return true;
        return false;
    });
}

/**
 * Generate request ID
 */
function generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ============================================================================
// System Token Helper
// ============================================================================

/**
 * Create system auth context (for internal kernel calls)
 */
export function createSystemContext(
    tenantId: string = 'system',
    manifest: Readonly<BffManifestType>
): AuthContext {
    return {
        tenantId,
        userId: 'system',
        roles: ['system', 'admin'],
        permissions: ['*'],
        token: undefined,
        apiVersion: manifest.versioning.latest,
        requestId: generateRequestId(),
    };
}

/**
 * Check if context has system privileges
 */
export function isSystemContext(ctx: AuthContext): boolean {
    return ctx.roles.includes('system') || ctx.userId === 'system';
}

/**
 * @fileoverview Headers Middleware - Hardened & Constitution-Compliant
 * @module @bff/middleware/headers
 * @description Request/response header normalization, security, and CORS
 * 
 * Features:
 * - Header name normalization (case-insensitive)
 * - Immutable header blocking
 * - Host header validation
 * - Security headers on all responses
 * - Tenant traceability headers
 * - Wildcard CORS pattern support
 * - Zero-drift governance
 */

import type { BffManifestType } from '../bff.manifest';
import type { RateLimitResult } from './rate-limit.middleware';

// ============================================================================
// Types
// ============================================================================

export interface RequestHeadersResult {
    headers: Record<string, string>;
    errors: string[];
    normalized: Record<string, string>;
}

export interface TraceContext {
    tenantId?: string;
    userId?: string;
    protocol?: string;
    traceId?: string;
    spanId?: string;
}

// ============================================================================
// Utility: Normalize header name
// ============================================================================

/**
 * Normalize header name to lowercase for comparison
 */
function normalizeHeaderName(name: string): string {
    return name.trim().toLowerCase();
}

/**
 * Convert header name to Title-Case (X-Request-Id -> X-Request-ID)
 */
function titleCaseHeader(name: string): string {
    return name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join('-');
}

/**
 * Generate request ID
 */
function generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

// ============================================================================
// Forbidden Headers (security)
// ============================================================================

const FORBIDDEN_HEADERS = new Set([
    'via',
    'x-forwarded-for',
    'x-forwarded-host',
    'x-forwarded-proto',
    'x-real-ip',
    'cf-connecting-ip',
    'cf-ipcountry',
    'cf-ray',
    'true-client-ip',
]);

// ============================================================================
// Request Headers Middleware
// ============================================================================

/**
 * Create request headers middleware
 * 
 * Features:
 * - Normalize all incoming headers
 * - Auto-generate X-Request-ID
 * - Validate Host header
 * - Check mandatory headers
 * - Block immutable headers
 * - Strip forbidden headers
 */
export function createRequestHeadersMiddleware(manifest: Readonly<BffManifestType>) {
    const { requiredHeaders, security, hardening } = manifest;

    // Build immutable header set (lowercase for comparison)
    const immutableSet = new Set(
        (security.immutableHeaders || []).map((h) => normalizeHeaderName(h))
    );

    return (req: Request): RequestHeadersResult => {
        const errors: string[] = [];
        const headers: Record<string, string> = {};
        const normalized: Record<string, string> = {};

        // =========================================================================
        // 1. Normalize all incoming headers
        // =========================================================================
        req.headers.forEach((value, key) => {
            const normalizedKey = normalizeHeaderName(key);
            normalized[normalizedKey] = value;
        });

        // =========================================================================
        // 2. Auto-generate X-Request-ID if missing
        // =========================================================================
        if (!normalized['x-request-id']) {
            headers['X-Request-ID'] = generateRequestId();
        } else {
            headers['X-Request-ID'] = normalized['x-request-id'];
        }

        // =========================================================================
        // 3. Host Header Validation
        // =========================================================================
        if (hardening?.hostHeaderRequired) {
            const host = normalized['host'];
            if (!host) {
                errors.push('Missing required header: Host');
            } else if (hardening.hostWhitelist?.length) {
                const allowed = hardening.hostWhitelist.some(
                    (h) => h === host || h === '*'
                );
                if (!allowed) {
                    errors.push(`Invalid Host header: ${host}`);
                }
            }
        }

        // =========================================================================
        // 4. Validate mandatory headers
        // =========================================================================
        for (const header of requiredHeaders.all) {
            const h = normalizeHeaderName(header);
            // Skip X-Request-ID (auto-generated)
            if (h === 'x-request-id') continue;
            if (!normalized[h]) {
                errors.push(`Missing required header: ${header}`);
            }
        }

        // =========================================================================
        // 5. Block immutable headers (cannot be set by client)
        // =========================================================================
        for (const immutable of immutableSet) {
            if (normalized[immutable]) {
                errors.push(`Forbidden header: ${immutable} (immutable)`);
            }
        }

        // =========================================================================
        // 6. Strip forwarded headers if enabled
        // =========================================================================
        if (hardening?.stripForwardedHeaders) {
            for (const forbidden of FORBIDDEN_HEADERS) {
                if (normalized[forbidden]) {
                    // Don't add to errors, just strip silently
                    delete normalized[forbidden];
                }
            }
        }

        // =========================================================================
        // 7. Copy allowed headers with proper casing
        // =========================================================================
        const allowedHeaders = [
            ...requiredHeaders.all,
            ...(requiredHeaders.authenticated || []),
            ...(requiredHeaders.optional || []),
        ].map((h) => normalizeHeaderName(h));

        for (const allowed of allowedHeaders) {
            if (normalized[allowed] && !immutableSet.has(allowed)) {
                headers[titleCaseHeader(allowed)] = normalized[allowed];
            }
        }

        // Always include common headers if present
        const commonHeaders = ['content-type', 'accept', 'user-agent', 'origin'];
        for (const common of commonHeaders) {
            if (normalized[common] && !headers[titleCaseHeader(common)]) {
                headers[titleCaseHeader(common)] = normalized[common];
            }
        }

        return { headers, errors, normalized };
    };
}

// ============================================================================
// Response Headers Middleware
// ============================================================================

/**
 * Create response headers middleware
 * 
 * Features:
 * - Request ID propagation
 * - Rate limit headers
 * - Tenant traceability headers
 * - Security headers (OWASP recommended)
 * - API version header
 */
export function createResponseHeadersMiddleware(manifest: Readonly<BffManifestType>) {
    const { hardening, versioning } = manifest;

    return (
        requestId: string,
        rateLimit?: RateLimitResult,
        trace?: TraceContext
    ): Record<string, string> => {
        const headers: Record<string, string> = {
            'X-Request-ID': requestId,
            'X-API-Version': versioning.latest,
        };

        // =========================================================================
        // Tenant Traceability Headers
        // =========================================================================
        if (trace?.tenantId) {
            headers['X-Tenant-ID'] = trace.tenantId;
        }
        if (trace?.userId) {
            headers['X-User-ID'] = trace.userId;
        }
        if (trace?.protocol) {
            headers['X-Protocol'] = trace.protocol;
        }
        if (trace?.traceId) {
            headers['X-Trace-ID'] = trace.traceId;
        }
        if (trace?.spanId) {
            headers['X-Span-ID'] = trace.spanId;
        }

        // =========================================================================
        // Rate Limit Headers
        // =========================================================================
        if (rateLimit) {
            headers['X-RateLimit-Remaining'] = String(rateLimit.remaining);
            headers['X-RateLimit-Reset'] = String(Math.ceil(rateLimit.resetAt / 1000));
        }

        // =========================================================================
        // Security Headers (OWASP Recommended)
        // =========================================================================
        if (hardening?.securityHeadersEnabled !== false) {
            headers['X-Frame-Options'] = 'DENY';
            headers['X-Content-Type-Options'] = 'nosniff';
            headers['X-XSS-Protection'] = '1; mode=block';
            headers['Referrer-Policy'] = 'strict-origin-when-cross-origin';
            headers['Permissions-Policy'] = 'camera=(), microphone=(), geolocation=(), payment=()';

            if (hardening?.strictTransportSecurity) {
                headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
            }
        }

        return headers;
    };
}

// ============================================================================
// CORS Middleware (Hardened)
// ============================================================================

/**
 * Create CORS middleware
 * 
 * Features:
 * - Exact origin matching
 * - Wildcard pattern support (*.example.com)
 * - Environment-specific origins
 * - Configurable methods/headers
 */
export function createCorsMiddleware(manifest: Readonly<BffManifestType>) {
    const { cors } = manifest;

    // Pre-compile wildcard patterns
    const patternCache = new Map<string, RegExp>();

    function matchOrigin(origin: string, pattern: string): boolean {
        // Exact match
        if (pattern === origin) return true;

        // Wildcard match
        if (pattern.includes('*')) {
            let regex = patternCache.get(pattern);
            if (!regex) {
                // Escape special regex chars except *
                const escaped = pattern
                    .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
                    .replace(/\*/g, '[^/]*');
                regex = new RegExp(`^${escaped}$`);
                patternCache.set(pattern, regex);
            }
            return regex.test(origin);
        }

        return false;
    }

    return (
        origin: string | null,
        env: 'development' | 'staging' | 'production'
    ): Record<string, string> | null => {
        if (!origin) return null;

        const allowedOrigins = cors[env] || [];

        // Check if origin is allowed
        let allowed = false;
        for (const pattern of allowedOrigins) {
            if (matchOrigin(origin, pattern)) {
                allowed = true;
                break;
            }
        }

        if (!allowed) return null;

        return {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Methods': cors.methods.join(', '),
            'Access-Control-Allow-Headers': cors.headers.join(', '),
            'Access-Control-Expose-Headers': cors.exposedHeaders.join(', '),
            'Access-Control-Allow-Credentials': String(cors.credentials),
            'Access-Control-Max-Age': String(cors.maxAge),
        };
    };
}

// ============================================================================
// Utility Exports
// ============================================================================

/**
 * Check if header is immutable
 */
export function isImmutableHeader(
    header: string,
    manifest: Readonly<BffManifestType>
): boolean {
    const normalized = normalizeHeaderName(header);
    return (manifest.security.immutableHeaders || [])
        .map((h) => normalizeHeaderName(h))
        .includes(normalized);
}

/**
 * Get security headers
 */
export function getSecurityHeaders(): Record<string, string> {
    return {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    };
}

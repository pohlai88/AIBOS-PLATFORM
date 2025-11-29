/**
 * @fileoverview Enterprise Middleware Composer (AI-BOS Constitution v1.0)
 * @module @bff/middleware/compose
 * @description Ordered middleware stack with full manifest enforcement
 * 
 * Execution Order:
 * 1. CORS Preflight
 * 2. Request Headers Validation
 * 3. Body Extraction
 * 4. Burst Rate Limiting
 * 5. Normal Rate Limiting
 * 6. Authentication
 * 7. Zone Guard (Tenant Isolation)
 * 8. AI Firewall PreCheck
 * 9. Input Sanitization
 * 10. Audit Request
 * 11. [Handler Execution]
 * 12. Output Validation
 * 13. AI Firewall PostCheck
 * 14. Response Headers
 * 15. Audit Response
 */

import type { BffManifestType } from '../bff.manifest';
import { createAuthMiddleware, type AuthContext } from './auth.middleware';
import { createRateLimitMiddleware, type RateLimitResult } from './rate-limit.middleware';
import { createZoneGuardMiddleware, type ZoneGuardResult } from './zone-guard.middleware';
import { createAuditMiddleware } from './audit.middleware';
import { createSanitizerMiddleware } from './sanitizer.middleware';
import { createAIFirewall } from './ai-firewall.middleware';
import {
  createCorsMiddleware,
  createRequestHeadersMiddleware,
  createResponseHeadersMiddleware,
} from './headers.middleware';
import { standardError, createErrorFactory } from './error-format';

// ============================================================================
// Types
// ============================================================================

export interface MiddlewareContext {
  request: Request;
  path: string;
  protocol: string;

  // Parsed body
  body?: unknown;

  // Auth context
  auth: AuthContext;

  // Zone guard result
  zoneGuard: ZoneGuardResult;

  // Rate limit result
  rateLimit: RateLimitResult;

  // Sanitized input
  sanitizedInput?: unknown;

  // OpenTelemetry correlation
  traceId?: string;
  spanId?: string;

  // Timing
  startTime: number;
}

export interface MiddlewareResult {
  success: boolean;
  context?: MiddlewareContext;
  response?: Response;
  error?: Response;
}

export interface MiddlewareStack {
  /** Execute full middleware stack (pre-handler) */
  execute(req: Request, path: string, protocol: string): Promise<MiddlewareResult>;

  /** Finalize response (post-handler) */
  finalize(
    ctx: MiddlewareContext,
    response: Response,
    statusCode: number,
    errorCode?: string
  ): Promise<Response>;

  /** Get individual middleware */
  getAuth(): ReturnType<typeof createAuthMiddleware>;
  getRateLimit(): ReturnType<typeof createRateLimitMiddleware>;
  getZoneGuard(): ReturnType<typeof createZoneGuardMiddleware>;
  getAudit(): ReturnType<typeof createAuditMiddleware>;
  getSanitizer(): ReturnType<typeof createSanitizerMiddleware>;
  getAIFirewall(): ReturnType<typeof createAIFirewall>;
  getCors(): ReturnType<typeof createCorsMiddleware>;
}

// ============================================================================
// Middleware Composer
// ============================================================================

/**
 * Create composed middleware stack
 * 
 * Features:
 * - Full manifest enforcement
 * - Sanitizer input + output validation
 * - AI Firewall pre/post checks
 * - Burst + normal rate limiting
 * - OTEL correlation
 * - Standard error format
 */
export function createMiddlewareStack(
  manifest: Readonly<BffManifestType>,
  options: {
    env?: 'development' | 'staging' | 'production';
  } = {}
): MiddlewareStack {
  const env = options.env || 'production';

  // Create all middleware instances
  const auth = createAuthMiddleware(manifest);
  const rateLimit = createRateLimitMiddleware(manifest);
  const zoneGuard = createZoneGuardMiddleware(manifest);
  const audit = createAuditMiddleware(manifest);
  const sanitizer = createSanitizerMiddleware(manifest);
  const aiFirewall = createAIFirewall(manifest);
  const cors = createCorsMiddleware(manifest);
  const requestHeaders = createRequestHeadersMiddleware(manifest);
  const responseHeaders = createResponseHeadersMiddleware(manifest);

  // Create error factory from manifest
  const error = createErrorFactory(manifest);

  return {
    /**
     * Execute full middleware stack (pre-handler)
     */
    async execute(req: Request, path: string, protocol: string): Promise<MiddlewareResult> {
      const startTime = Date.now();

      // Generate trace IDs for OTEL correlation
      const traceId = req.headers.get('X-Trace-ID') || generateTraceId();
      const spanId = req.headers.get('X-Span-ID') || generateSpanId();

      // =====================================================================
      // 1. CORS Preflight
      // =====================================================================
      if (req.method === 'OPTIONS') {
        const origin = req.headers.get('Origin');
        const corsHeaders = cors(origin, env);

        if (corsHeaders) {
          return {
            success: true,
            response: new Response(null, {
              status: 204,
              headers: corsHeaders,
            }),
          };
        }

        return {
          success: false,
          error: standardError('CORS_ERROR', 'Origin not allowed', 403),
        };
      }

      // =====================================================================
      // 2. Request Headers Validation
      // =====================================================================
      const { headers: normalizedHeaders, errors: headerErrors } = requestHeaders(req);
      if (headerErrors.length > 0) {
        return {
          success: false,
          error: standardError('VALIDATION_ERROR', headerErrors.join(', '), 400),
        };
      }

      // =====================================================================
      // 3. Body Extraction
      // =====================================================================
      let body: unknown;
      if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        try {
          const contentType = req.headers.get('Content-Type') || '';
          if (contentType.includes('application/json')) {
            body = await req.json();
          } else if (contentType.includes('text/')) {
            body = await req.text();
          }
        } catch {
          body = undefined;
        }
      }

      // =====================================================================
      // 4. Burst Rate Limiting
      // =====================================================================
      const tenantId = req.headers.get('X-Tenant-ID') || 'anonymous';

      const burstResult = await rateLimit(tenantId, 'burst');
      if (!burstResult.allowed) {
        return {
          success: false,
          error: standardError('RATE_LIMITED', 'Burst limit exceeded', 429, {
            retryAfter: burstResult.retryAfter,
          }),
        };
      }

      // =====================================================================
      // 5. Normal Rate Limiting
      // =====================================================================
      const rateLimitResult = await rateLimit(tenantId, 'requests');
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: standardError(
            'RATE_LIMITED',
            `Rate limit exceeded. Retry after ${rateLimitResult.retryAfter}s`,
            429,
            { retryAfter: rateLimitResult.retryAfter }
          ),
        };
      }

      // =====================================================================
      // 6. Authentication
      // =====================================================================
      const authResult = await auth(req, path);
      if (!authResult.success || !authResult.context) {
        return {
          success: false,
          error: standardError(
            authResult.error?.code || 'UNAUTHORIZED',
            authResult.error?.message || 'Authentication failed',
            authResult.error?.status || 401
          ),
        };
      }

      const authContext = authResult.context;

      // =====================================================================
      // 7. Zone Guard (Tenant Isolation)
      // =====================================================================
      const zoneResult = zoneGuard(authContext, path, undefined, tenantId);
      if (!zoneResult.allowed) {
        return {
          success: false,
          error: standardError(
            zoneResult.error?.code || 'FORBIDDEN',
            zoneResult.error?.message || 'Access denied',
            403
          ),
        };
      }

      // =====================================================================
      // 8. AI Firewall PreCheck
      // =====================================================================
      const firewallPre = await aiFirewall.preCheck(authContext, body, {
        path,
        protocol,
        action: req.method,
      });

      if (!firewallPre.allowed) {
        return {
          success: false,
          error: standardError(
            'AI_FIREWALL_BLOCKED',
            firewallPre.reason || 'Request blocked by AI Firewall',
            400
          ),
        };
      }

      // =====================================================================
      // 9. Input Sanitization
      // =====================================================================
      const sanitizeResult = sanitizer.sanitizeInput(body);
      if (!sanitizeResult.valid) {
        return {
          success: false,
          error: standardError(
            'VALIDATION_ERROR',
            sanitizeResult.errors?.join(', ') || 'Input validation failed',
            400
          ),
        };
      }

      // =====================================================================
      // 10. Audit Request
      // =====================================================================
      await audit.logRequest(authContext, {
        method: req.method,
        path,
        protocol,
        body: sanitizeResult.sanitized,
        traceId,
        spanId,
      });

      // =====================================================================
      // Build Context
      // =====================================================================
      const ctx: MiddlewareContext = {
        request: req,
        path,
        protocol,
        body,
        auth: authContext,
        zoneGuard: zoneResult,
        rateLimit: rateLimitResult,
        sanitizedInput: sanitizeResult.sanitized,
        traceId,
        spanId,
        startTime,
      };

      return { success: true, context: ctx };
    },

    /**
     * Finalize response (post-handler)
     */
    async finalize(
      ctx: MiddlewareContext,
      response: Response,
      statusCode: number,
      errorCode?: string
    ): Promise<Response> {
      const duration = Date.now() - ctx.startTime;

      // =====================================================================
      // Extract Response Body for Validation
      // =====================================================================
      let responseData: unknown;
      try {
        const cloned = response.clone();
        const text = await cloned.text();
        responseData = text ? JSON.parse(text) : undefined;
      } catch {
        responseData = undefined;
      }

      // =====================================================================
      // Output Validation
      // =====================================================================
      const validateResult = sanitizer.validateOutput(responseData);
      if (!validateResult.valid) {
        // Block in production/strict mode, warn in development
        const strictMode = (manifest.enforcement as Record<string, unknown>).strictOutputValidation ?? (env === 'production');
        if (strictMode) {
          return standardError(
            'OUTPUT_VALIDATION_FAILED',
            'Response contains invalid or unsafe content',
            500,
            { requestId: ctx.auth.requestId, duration }
          );
        }
        // Development: warn only
        console.warn('Output validation failed:', validateResult.errors);
        errorCode = 'OUTPUT_VALIDATION_FAILED';
        statusCode = 500;
      }

      // =====================================================================
      // AI Firewall PostCheck
      // =====================================================================
      const firewallPost = await aiFirewall.postCheck(ctx.auth, responseData, {
        path: ctx.path,
        protocol: ctx.protocol,
      });

      if (!firewallPost.allowed) {
        // Block response with sensitive data
        return standardError(
          'AI_FIREWALL_BLOCKED',
          firewallPost.reason || 'Response blocked by AI Firewall',
          500,
          { requestId: ctx.auth.requestId, duration }
        );
      }

      // =====================================================================
      // Build Response Headers
      // =====================================================================
      const headers = new Headers(response.headers);

      // Add CORS headers
      const origin = ctx.request.headers.get('Origin');
      if (origin) {
        const corsHeaders = cors(origin, env);
        if (corsHeaders) {
          for (const [key, value] of Object.entries(corsHeaders)) {
            headers.set(key, value);
          }
        }
      }

      // Add response headers (rate limit, request ID, etc.)
      const respHeaders = responseHeaders(ctx.auth.requestId, ctx.rateLimit);
      for (const [key, value] of Object.entries(respHeaders)) {
        headers.set(key, value);
      }

      // Add OTEL headers
      if (ctx.traceId) headers.set('X-Trace-ID', ctx.traceId);
      if (ctx.spanId) headers.set('X-Span-ID', ctx.spanId);

      // Add timing
      headers.set('X-Response-Time', `${duration}ms`);

      // =====================================================================
      // Audit Response
      // =====================================================================
      await audit.logResponse(ctx.auth.requestId, {
        statusCode,
        errorCode,
      });

      // =====================================================================
      // Return Final Response
      // =====================================================================
      return new Response(response.body, {
        status: statusCode,
        statusText: response.statusText,
        headers,
      });
    },

    // Accessors
    getAuth: () => auth,
    getRateLimit: () => rateLimit,
    getZoneGuard: () => zoneGuard,
    getAudit: () => audit,
    getSanitizer: () => sanitizer,
    getAIFirewall: () => aiFirewall,
    getCors: () => cors,
  };
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Generate trace ID (OTEL compatible)
 */
function generateTraceId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate span ID (OTEL compatible)
 */
function generateSpanId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ============================================================================
// Re-export for convenience
// ============================================================================

export { standardError, createErrorFactory } from './error-format';

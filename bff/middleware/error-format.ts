/**
 * @fileoverview Standard Error Format - AI-BOS Constitution Compliant (Hardened)
 * @module @bff/middleware/error-format
 * @description Centralized error response factory for zero-drift error handling
 * 
 * Features:
 * - Manifest-driven status codes
 * - Error masking for production
 * - Per-error unique ID (errorId)
 * - Full context in meta (tenant, path, method, protocol)
 * - Multi-protocol support (JSON, JSON-RPC, MCP, LLM)
 * - OTEL correlation headers
 */

import type { BffManifestType } from '../bff.manifest';

// ============================================================================
// Types
// ============================================================================

export interface StandardError {
    success: false;
    error: {
        code: string;
        message: string;
        recoverable: boolean;
        retryAfter?: number;
        errorId: string;
    };
    meta: {
        requestId?: string;
        tenantId?: string;
        path?: string;
        method?: string;
        timestamp: string;
        duration?: number;
        protocol?: string;
        traceId?: string;
        spanId?: string;
    };
}

export interface ErrorOptions {
    requestId?: string;
    tenantId?: string;
    path?: string;
    method?: string;
    retryAfter?: number;
    recoverable?: boolean;
    duration?: number;
    protocol?: string;
    traceId?: string;
    spanId?: string;
    manifest?: Readonly<BffManifestType>;
    /** Override status (use with caution - prefer manifest) */
    statusOverride?: number;
}

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Generate per-error unique ID
 */
function generateErrorId(): string {
    return `err_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/**
 * Mask internal error messages depending on manifest settings
 * Prevents leaking DB errors, stack traces, internal details
 */
function maskMessage(
    rawMessage: string,
    code: string,
    manifest?: Readonly<BffManifestType>
): string {
    // Check if masking is enabled (default to true in production)
    const maskingEnabled = manifest?.enforcement?.errorMaskingEnabled ?? true;

    if (!maskingEnabled) {
        return rawMessage;
    }

    // Internal error codes should always be masked
    const internalCodes = ['INTERNAL_ERROR', 'SERVICE_UNAVAILABLE', 'GATEWAY_TIMEOUT'];
    if (internalCodes.includes(code)) {
        return 'An unexpected error occurred. Please try again later.';
    }

    // Check for patterns that indicate internal details
    const sensitivePatterns = [
        /sql/i,
        /database/i,
        /connection/i,
        /timeout/i,
        /stack/i,
        /at\s+\w+\s+\(/i, // Stack trace pattern
        /error\s*:\s*\w+error/i,
        /econnrefused/i,
        /enotfound/i,
        /eperm/i,
        /eacces/i,
    ];

    for (const pattern of sensitivePatterns) {
        if (pattern.test(rawMessage)) {
            return 'An error occurred while processing your request.';
        }
    }

    return rawMessage;
}

/**
 * Determine if error is recoverable by code
 */
function isRecoverable(code: string): boolean {
    const recoverableCodes = [
        'RATE_LIMITED',
        'SERVICE_UNAVAILABLE',
        'GATEWAY_TIMEOUT',
        'VALIDATION_ERROR',
        'CONFLICT',
        'PAYLOAD_TOO_LARGE',
    ];
    return recoverableCodes.includes(code);
}

/**
 * Get status code from manifest or default
 */
function getStatusCode(
    code: string,
    manifest?: Readonly<BffManifestType>,
    statusOverride?: number
): number {
    // Override takes precedence (for edge cases)
    if (statusOverride !== undefined) {
        return statusOverride;
    }

    // Use manifest if available
    if (manifest?.errorCodes?.[code]) {
        return manifest.errorCodes[code].status;
    }

    // Default status codes
    const defaultStatuses: Record<string, number> = {
        VALIDATION_ERROR: 400,
        AUTH_ERROR: 401,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        METHOD_NOT_ALLOWED: 405,
        CONFLICT: 409,
        PAYLOAD_TOO_LARGE: 413,
        RATE_LIMITED: 429,
        INTERNAL_ERROR: 500,
        NOT_IMPLEMENTED: 501,
        SERVICE_UNAVAILABLE: 503,
        GATEWAY_TIMEOUT: 504,
        CORS_ERROR: 403,
        AI_FIREWALL_BLOCKED: 400,
        OUTPUT_VALIDATION_FAILED: 500,
    };

    return defaultStatuses[code] ?? 500;
}

// ============================================================================
// Standard Error Factory (Base)
// ============================================================================

/**
 * Create standard error response
 * 
 * @param code - Error code (e.g., 'FORBIDDEN', 'RATE_LIMITED')
 * @param message - Error message (will be masked in production)
 * @param status - HTTP status code
 * @param options - Additional options
 */
export function standardError(
    code: string,
    message: string,
    status: number,
    options: ErrorOptions = {}
): Response {
    const errorId = generateErrorId();
    const safeMessage = maskMessage(message, code, options.manifest);
    const finalStatus = options.statusOverride ?? status;

    const body: StandardError = {
        success: false,
        error: {
            code,
            message: safeMessage,
            recoverable: options.recoverable ?? isRecoverable(code),
            retryAfter: options.retryAfter,
            errorId,
        },
        meta: {
            requestId: options.requestId,
            tenantId: options.tenantId,
            path: options.path,
            method: options.method,
            timestamp: new Date().toISOString(),
            duration: options.duration,
            protocol: options.protocol,
            traceId: options.traceId,
            spanId: options.spanId,
        },
    };

    // Build headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Error-ID': errorId,
    };

    if (options.requestId) {
        headers['X-Request-ID'] = options.requestId;
    }

    if (options.retryAfter) {
        headers['Retry-After'] = String(options.retryAfter);
    }

    if (options.traceId) {
        headers['X-Trace-ID'] = options.traceId;
    }

    if (options.spanId) {
        headers['X-Span-ID'] = options.spanId;
    }

    return new Response(JSON.stringify(body), {
        status: finalStatus,
        headers,
    });
}

// ============================================================================
// Manifest-Aware Error Factory
// ============================================================================

/**
 * Create error factory from manifest
 * Uses manifest error codes for status and recoverability
 */
export function createErrorFactory(manifest: Readonly<BffManifestType>) {
    return function error(
        code: string,
        message: string,
        options: Omit<ErrorOptions, 'manifest' | 'statusOverride' | 'recoverable'> = {}
    ): Response {
        const errorInfo = manifest.errorCodes[code];
        const status = getStatusCode(code, manifest);
        const recoverable = errorInfo?.recoverable ?? isRecoverable(code);

        return standardError(code, message, status, {
            ...options,
            recoverable,
            manifest,
        });
    };
}

// ============================================================================
// Multi-Protocol Error Formats
// ============================================================================

/**
 * Create JSON-RPC 2.0 error response
 */
export function jsonRpcError(
    code: string,
    message: string,
    id: string | number | null,
    options: ErrorOptions = {}
): Response {
    const errorId = generateErrorId();
    const safeMessage = maskMessage(message, code, options.manifest);

    // JSON-RPC error codes
    const jsonRpcCodes: Record<string, number> = {
        PARSE_ERROR: -32700,
        INVALID_REQUEST: -32600,
        METHOD_NOT_FOUND: -32601,
        INVALID_PARAMS: -32602,
        INTERNAL_ERROR: -32603,
    };

    const body = {
        jsonrpc: '2.0',
        error: {
            code: jsonRpcCodes[code] ?? -32000,
            message: safeMessage,
            data: {
                errorId,
                originalCode: code,
                recoverable: options.recoverable ?? isRecoverable(code),
                requestId: options.requestId,
                tenantId: options.tenantId,
            },
        },
        id,
    };

    return new Response(JSON.stringify(body), {
        status: 200, // JSON-RPC always returns 200
        headers: {
            'Content-Type': 'application/json',
            'X-Error-ID': errorId,
        },
    });
}

/**
 * Create MCP-compatible error response
 */
export function mcpError(
    code: string,
    message: string,
    options: ErrorOptions = {}
): Response {
    const errorId = generateErrorId();
    const safeMessage = maskMessage(message, code, options.manifest);

    const body = {
        type: 'error',
        error: {
            code,
            message: safeMessage,
            errorId,
            recoverable: options.recoverable ?? isRecoverable(code),
        },
        meta: {
            requestId: options.requestId,
            tenantId: options.tenantId,
            timestamp: new Date().toISOString(),
        },
    };

    return new Response(JSON.stringify(body), {
        status: getStatusCode(code, options.manifest),
        headers: {
            'Content-Type': 'application/json',
            'X-Error-ID': errorId,
        },
    });
}

/**
 * Create LLM-friendly error (for AI agents)
 */
export function llmError(
    code: string,
    message: string,
    options: ErrorOptions = {}
): Response {
    const errorId = generateErrorId();
    const safeMessage = maskMessage(message, code, options.manifest);

    // LLM-friendly format with natural language
    const body = {
        status: 'error',
        errorCode: code,
        errorMessage: safeMessage,
        errorId,
        canRetry: options.recoverable ?? isRecoverable(code),
        retryAfterSeconds: options.retryAfter,
        humanReadable: `Error ${code}: ${safeMessage}`,
        context: {
            requestId: options.requestId,
            tenant: options.tenantId,
            path: options.path,
            method: options.method,
        },
    };

    return new Response(JSON.stringify(body), {
        status: getStatusCode(code, options.manifest),
        headers: {
            'Content-Type': 'application/json',
            'X-Error-ID': errorId,
        },
    });
}

/**
 * Create streaming error (for SSE/WebSocket)
 */
export function streamingError(
    code: string,
    message: string,
    options: ErrorOptions = {}
): string {
    const errorId = generateErrorId();
    const safeMessage = maskMessage(message, code, options.manifest);

    const payload = {
        type: 'error',
        error: {
            code,
            message: safeMessage,
            errorId,
            recoverable: options.recoverable ?? isRecoverable(code),
        },
        meta: {
            requestId: options.requestId,
            timestamp: new Date().toISOString(),
        },
    };

    // SSE format
    return `event: error\ndata: ${JSON.stringify(payload)}\n\n`;
}

// ============================================================================
// Error Response Parser
// ============================================================================

/**
 * Parse error response to StandardError
 */
export async function parseErrorResponse(response: Response): Promise<StandardError | null> {
    try {
        const body = await response.json();

        // Standard format
        if (body.success === false && body.error?.code) {
            return body as StandardError;
        }

        // JSON-RPC format
        if (body.jsonrpc === '2.0' && body.error) {
            return {
                success: false,
                error: {
                    code: body.error.data?.originalCode ?? 'UNKNOWN',
                    message: body.error.message,
                    recoverable: body.error.data?.recoverable ?? false,
                    errorId: body.error.data?.errorId ?? 'unknown',
                },
                meta: {
                    requestId: body.error.data?.requestId,
                    tenantId: body.error.data?.tenantId,
                    timestamp: new Date().toISOString(),
                },
            };
        }

        // MCP format
        if (body.type === 'error' && body.error) {
            return {
                success: false,
                error: {
                    code: body.error.code,
                    message: body.error.message,
                    recoverable: body.error.recoverable ?? false,
                    errorId: body.error.errorId ?? 'unknown',
                },
                meta: body.meta ?? { timestamp: new Date().toISOString() },
            };
        }

        return null;
    } catch {
        return null;
    }
}

/**
 * Check if response is an error
 */
export function isErrorResponse(body: unknown): body is StandardError {
    if (!body || typeof body !== 'object') return false;
    const b = body as Record<string, unknown>;
    return b.success === false && typeof b.error === 'object';
}

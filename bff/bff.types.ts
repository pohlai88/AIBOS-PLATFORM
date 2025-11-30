/**
 * @fileoverview BFF Type Definitions
 * @module @kernel/bff/types
 */

// ============================================================================
// Client Types
// ============================================================================

export type BffClientType = 'web' | 'mobile' | 'cli' | 'mcp';

export type ApiVersion = 'v1' | 'v2';

// ============================================================================
// Context
// ============================================================================

export interface BffContext {
    /** Client type (web, mobile, cli, mcp) */
    clientType: BffClientType;
    /** Client version (e.g., "1.0.0") */
    clientVersion: string;
    /** API version (v1, v2) */
    apiVersion: ApiVersion;
    /** Tenant identifier */
    tenantId: string;
    /** User identifier */
    userId: string;
    /** Locale (e.g., "en-US") */
    locale: string;
    /** Timezone (e.g., "Asia/Singapore") */
    timezone: string;
    /** Request ID for tracing */
    requestId: string;
    /** Optional trace ID for distributed tracing */
    traceId?: string;
}

// ============================================================================
// Request / Response
// ============================================================================

export interface BffRequest<T = unknown> {
    /** Request context */
    context: BffContext;
    /** Request payload */
    payload: T;
    /** Optional metadata */
    metadata?: Record<string, unknown>;
}

// Discriminated union for type-safe responses
export interface BffSuccessResponse<T = unknown> {
    success: true;
    data: T;
    meta: BffResponseMeta;
}

export interface BffErrorResponse {
    success: false;
    error: BffError;
    meta: BffResponseMeta;
}

/** Discriminated union: success XOR error */
export type BffResponse<T = unknown> = BffSuccessResponse<T> | BffErrorResponse;

// ============================================================================
// Error
// ============================================================================

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface BffError {
    /** Machine-readable error code */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Additional error details */
    details?: Record<string, unknown>;
    /** Whether the error is recoverable */
    recoverable: boolean;
    /** Retry-After hint (seconds) */
    retryAfter?: number;
    /** Suggested action */
    suggestion?: string;
    /** Error severity for observability */
    severity?: ErrorSeverity;
    /** Error source */
    source?: 'kernel' | 'engine' | 'bff' | 'adapter';
}

// ============================================================================
// Metadata
// ============================================================================

export interface BffTrace {
    /** Kernel trace ID */
    kernel?: string;
    /** Engine trace ID */
    engine?: string;
    /** User trace ID */
    user?: string;
}

export interface BffResponseMeta {
    /** Request ID for tracing */
    requestId: string;
    /** Request duration (ms) */
    duration: number;
    /** Response timestamp (ISO 8601) */
    timestamp: string;
    /** API version used */
    apiVersion?: ApiVersion;
    /** Protocol used */
    protocol?: ProtocolType;
    /** Distributed trace IDs */
    trace?: BffTrace;
    /** Deprecation warning (if applicable) */
    deprecation?: string;
    /** Pagination info (if applicable) */
    pagination?: BffPagination;
    /** Cache control hints */
    cacheControl?: string;
    /** Rate limit info */
    rateLimit?: BffRateLimit;
}

export interface BffPagination {
    /** Current page number */
    page: number;
    /** Items per page */
    pageSize: number;
    /** Total items */
    total: number;
    /** Has next page */
    hasNext: boolean;
    /** Has previous page */
    hasPrev: boolean;
    /** Cursor for cursor-based pagination */
    cursor?: string;
    /** Next cursor */
    nextCursor?: string;
}

export interface BffRateLimit {
    /** Requests remaining in window */
    remaining: number;
    /** Window reset time (Unix timestamp) */
    reset: number;
    /** Total requests allowed in window */
    limit: number;
}

// ============================================================================
// Transformer Interface
// ============================================================================

export interface BffTransformer<TIn = unknown, TOut = unknown> {
    /** Transform input to output */
    transform(input: TIn, context: BffContext): TOut;
    /** Check if transformer supports client type */
    supports(clientType: BffClientType): boolean;
}

// ============================================================================
// Protocol Types
// ============================================================================

export type ProtocolType = 'openapi' | 'trpc' | 'graphql' | 'websocket' | 'grpc';

export interface ProtocolConfig {
    enabled: boolean;
    version?: string;
    path: string;
    status?: 'active' | 'deprecated' | 'planned';
}

// ============================================================================
// Gateway Types
// ============================================================================

export interface GatewayConfig {
    /** Gateway version */
    version: string;
    /** Base URL */
    baseUrl?: string;
    /** Environment */
    env?: 'development' | 'staging' | 'production';
    /** Protocol configurations */
    protocols?: Partial<Record<ProtocolType, ProtocolConfig>>;
}

export interface GatewayHealth {
    /** Overall status */
    status: 'healthy' | 'degraded' | 'unhealthy';
    /** Protocol statuses */
    protocols: Record<ProtocolType, boolean>;
    /** Gateway version */
    version: string;
    /** Timestamp */
    timestamp: string;
    /** Uptime (seconds) */
    uptime?: number;
}


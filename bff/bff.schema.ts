/**
 * @fileoverview BFF Schemas - Single Source of Truth for All Protocols
 * @module @kernel/bff/schema
 * @description All Zod schemas used by OpenAPI, tRPC, and GraphQL adapters
 */

import { z } from 'zod';

// ============================================================================
// Common Schemas
// ============================================================================

const TenantId = z.string().min(1).max(64).brand<'TenantId'>().describe('Tenant identifier');
const UserId = z.string().min(1).max(64).brand<'UserId'>().describe('User identifier');
const RequestId = z.string().uuid().brand<'RequestId'>().describe('Request identifier');
const IsoTimestamp = z.string().datetime().describe('ISO 8601 timestamp');

// Protocol identifier for MCP tracing
const Protocol = z.enum(['openapi', 'trpc', 'graphql', 'websocket']).describe('API protocol');

// Error severity (for observability + incident management)
const ErrorSeverity = z.enum(['low', 'medium', 'high', 'critical']).describe('Error severity level');

// Error codes (enumerated for governance)
const ErrorCode = z.enum([
    'VALIDATION_ERROR',
    'AUTH_ERROR',
    'UNAUTHORIZED',
    'FORBIDDEN',
    'TENANT_NOT_FOUND',
    'ENGINE_NOT_FOUND',
    'ACTION_NOT_FOUND',
    'ACTION_FAILED',
    'RATE_LIMIT_EXCEEDED',
    'PAYLOAD_TOO_LARGE',
    'INTERNAL_ERROR',
    'SERVICE_UNAVAILABLE',
    'DRIFT_DETECTED',
]).describe('Machine-readable error code');

// Metadata types (strict enum)
const MetadataType = z.enum([
    'string',
    'number',
    'boolean',
    'json',
    'date',
    'array',
    'object',
]).describe('Metadata value type');

// ============================================================================
// Health Schemas
// ============================================================================

const HealthCheck = z.object({
    status: z.enum(['pass', 'fail']),
    duration: z.number().describe('Check duration in ms'),
    message: z.string().optional(),
});

// Whitelisted health check categories (governance-driven)
const HealthChecks = z.object({
    database: HealthCheck.optional(),
    cache: HealthCheck.optional(),
    engineRegistry: HealthCheck.optional(),
    mcpFirewall: HealthCheck.optional(),
    tenancy: HealthCheck.optional(),
    sandbox: HealthCheck.optional(),
    eventBus: HealthCheck.optional(),
    storage: HealthCheck.optional(),
}).partial();

// ============================================================================
// Unified Meta Block (All Responses)
// ============================================================================

const ResponseMeta = z.object({
    requestId: RequestId,
    duration: z.number().describe('Response time in ms'),
    timestamp: IsoTimestamp,
    protocol: Protocol.optional(),
    trace: z.object({
        kernel: z.string().optional(),
        engine: z.string().optional(),
        user: z.string().optional(),
    }).optional(),
});

// ============================================================================
// Success Envelope Helper
// ============================================================================

const createSuccessEnvelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
    z.object({
        success: z.literal(true),
        data: dataSchema,
        meta: ResponseMeta,
    });

const HealthResponse = z.object({
    status: z.enum(['healthy', 'degraded', 'unhealthy']),
    version: z.string(),
    uptime: z.number().describe('Uptime in seconds'),
    checks: HealthChecks,
    meta: ResponseMeta.optional(), // Optional for backward compat
});

// ============================================================================
// Execute Schemas
// ============================================================================

const ExecuteRequest = z.object({
    action: z.string().min(1).max(256).describe('Action to execute'),
    input: z.unknown().optional().describe('Action input payload'),
    context: z.string().optional().describe('Execution context'),
});

const ExecuteResponse = z.object({
    success: z.boolean(),
    data: z.unknown().optional(),
    error: z
        .object({
            code: ErrorCode,
            message: z.string(),
            details: z.record(z.unknown()).optional(),
            recoverable: z.boolean().default(false),
            retryAfter: z.number().optional(),
            severity: ErrorSeverity.optional(),
        })
        .optional(),
    meta: ResponseMeta,
});

// ============================================================================
// Pagination Schemas
// ============================================================================

const PaginationParams = z.object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20),
    cursor: z.string().optional(),
    sortBy: z.string().regex(/^[a-zA-Z0-9_.]+$/).optional().describe('Safe column name for sorting'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

const PaginationMeta = z.object({
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean(),
    cursor: z.string().optional(),
    nextCursor: z.string().optional(),
});

// ============================================================================
// Engine Schemas
// ============================================================================

const EngineInfo = z.object({
    name: z.string(),
    version: z.string(),
    description: z.string().optional(),
    status: z.enum(['active', 'inactive', 'error']),
    actions: z.array(z.string()),
});

const EngineListResponse = z.object({
    success: z.literal(true),
    data: z.object({ engines: z.array(EngineInfo) }),
    meta: ResponseMeta.merge(PaginationMeta.partial()),
});

// ============================================================================
// Action Schemas
// ============================================================================

const ActionInfo = z.object({
    name: z.string(),
    engine: z.string(),
    description: z.string().optional(),
    inputSchema: z.any().optional().describe('JSON Schema for input'),
    outputSchema: z.any().optional().describe('JSON Schema for output'),
});

const ActionListResponse = z.object({
    success: z.literal(true),
    data: z.object({ actions: z.array(ActionInfo) }),
    meta: ResponseMeta.merge(PaginationMeta.partial()),
});

// ============================================================================
// Metadata Schemas
// ============================================================================

const MetadataEntry = z.object({
    key: z.string(),
    value: z.unknown(),
    type: MetadataType,
    createdAt: IsoTimestamp,
    updatedAt: IsoTimestamp,
});

// ============================================================================
// Error Schemas
// ============================================================================

const ErrorResponse = z.object({
    success: z.literal(false),
    error: z.object({
        code: ErrorCode,
        message: z.string(),
        details: z.record(z.unknown()).optional(),
        recoverable: z.boolean().default(false),
        retryAfter: z.number().optional(),
        suggestion: z.string().optional(),
        severity: ErrorSeverity.default('medium'),
    }),
    meta: ResponseMeta,
});

// ============================================================================
// Export All Schemas
// ============================================================================

export const BffSchemas = {
    // Common
    TenantId,
    UserId,
    RequestId,
    IsoTimestamp,
    Protocol,
    ErrorCode,
    ErrorSeverity,
    MetadataType,

    // Response Meta (unified)
    ResponseMeta,
    createSuccessEnvelope,

    // Health
    HealthCheck,
    HealthChecks,
    HealthResponse,

    // Execute
    ExecuteRequest,
    ExecuteResponse,

    // Pagination
    PaginationParams,
    PaginationMeta,

    // Engines
    EngineInfo,
    EngineListResponse,

    // Actions
    ActionInfo,
    ActionListResponse,

    // Metadata
    MetadataEntry,

    // Errors
    ErrorResponse,
} as const;

// ============================================================================
// Export Types (Inferred from Schemas)
// ============================================================================

export type TenantId = z.infer<typeof TenantId>;
export type UserId = z.infer<typeof UserId>;
export type RequestId = z.infer<typeof RequestId>;
export type Protocol = z.infer<typeof Protocol>;
export type ErrorCode = z.infer<typeof ErrorCode>;
export type ErrorSeverity = z.infer<typeof ErrorSeverity>;
export type MetadataType = z.infer<typeof MetadataType>;
export type ResponseMeta = z.infer<typeof ResponseMeta>;
export type HealthCheck = z.infer<typeof HealthCheck>;
export type HealthChecks = z.infer<typeof HealthChecks>;
export type HealthResponse = z.infer<typeof HealthResponse>;
export type ExecuteRequest = z.infer<typeof ExecuteRequest>;
export type ExecuteResponse = z.infer<typeof ExecuteResponse>;
export type PaginationParams = z.infer<typeof PaginationParams>;
export type PaginationMeta = z.infer<typeof PaginationMeta>;
export type EngineInfo = z.infer<typeof EngineInfo>;
export type EngineListResponse = z.infer<typeof EngineListResponse>;
export type ActionInfo = z.infer<typeof ActionInfo>;
export type ActionListResponse = z.infer<typeof ActionListResponse>;
export type MetadataEntry = z.infer<typeof MetadataEntry>;
export type ErrorResponse = z.infer<typeof ErrorResponse>;


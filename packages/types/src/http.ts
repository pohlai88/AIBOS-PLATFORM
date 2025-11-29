/**
 * HTTP/API Types - Shared request/response schemas
 */

import { z } from "zod";

/**
 * Standard error response
 */
export const ZErrorResponse = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  statusCode: z.number().optional(),
  traceId: z.string().optional(),
  details: z.unknown().optional(),
});

export type ErrorResponse = z.infer<typeof ZErrorResponse>;

/**
 * Pagination request
 */
export const ZPaginationQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type PaginationQuery = z.infer<typeof ZPaginationQuery>;

/**
 * Pagination response metadata
 */
export const ZPaginationMeta = z.object({
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  hasMore: z.boolean(),
});

export type PaginationMeta = z.infer<typeof ZPaginationMeta>;

/**
 * Generic paginated response
 */
export function createPaginatedResponse<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    data: z.array(dataSchema),
    meta: ZPaginationMeta,
  });
}

/**
 * Health check response
 */
export const ZHealthResponse = z.object({
  status: z.enum(["healthy", "degraded", "down"]),
  version: z.string(),
  timestamp: z.string().datetime(),
  checks: z.object({
    database: z.object({
      status: z.enum(["healthy", "degraded", "down"]),
      latencyMs: z.number().nonnegative(),
      error: z.string().optional(),
    }),
    redis: z.object({
      status: z.enum(["healthy", "degraded", "down"]),
      latencyMs: z.number().nonnegative(),
      error: z.string().optional(),
    }),
  }),
});

export type HealthResponse = z.infer<typeof ZHealthResponse>;


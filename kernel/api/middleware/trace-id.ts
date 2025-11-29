/**
 * Trace ID Middleware
 * 
 * Generates or propagates trace IDs for request tracing
 */

import type { Context, Next } from "hono";
import { randomUUID } from "crypto";

export const TRACE_ID_HEADER = "x-trace-id";

/**
 * Middleware to handle trace ID propagation
 */
export async function traceIdMiddleware(c: Context, next: Next) {
  // 1. Read incoming trace ID if present
  const incoming = c.req.header(TRACE_ID_HEADER);

  // 2. Generate if missing
  const traceId = incoming || randomUUID();

  // 3. Expose to downstream via context
  c.set("traceId", traceId);

  // 4. Execute next middleware/handler
  await next();

  // 5. Ensure it's in response header
  c.header(TRACE_ID_HEADER, traceId);
}

/**
 * Helper to read traceId from context in handlers
 */
export function getTraceIdFromContext(c: Context): string | undefined {
  const value = c.get("traceId");
  return typeof value === "string" ? value : undefined;
}


/**
 * HTTP Metrics Middleware
 * 
 * Records request counts and durations for Prometheus
 */

import type { Context, Next } from "hono";
import {
  httpRequestsTotal,
  httpRequestDurationSeconds,
} from "../../observability/metrics";

export async function httpMetricsMiddleware(c: Context, next: Next) {
  const start = process.hrtime.bigint();

  await next();

  const end = process.hrtime.bigint();
  const diffNs = Number(end - start);
  const durationSec = diffNs / 1e9;

  const method = c.req.method;
  // Use route path if available; fallback to URL path
  const route = c.req.routePath || c.req.path;
  const status = String(c.res.status);

  httpRequestsTotal.inc({ method, route, status });
  httpRequestDurationSeconds.observe({ method, route, status }, durationSec);
}


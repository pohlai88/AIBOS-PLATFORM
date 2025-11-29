/**
 * Tenant Rate Limiter
 * 
 * Uses Redis for distributed rate limiting
 */

import { RedisStore } from "../../storage/redis";

const WINDOW_MS = 60_000; // 1 minute
const MAX_TENANT_REQUESTS = 1000; // 1000 req/minute per tenant

export async function checkTenantLimit(tenantId: string): Promise<void> {
  const bucket = `tenant:${tenantId}`;
  const result = await RedisStore.rateLimit(bucket, WINDOW_MS, MAX_TENANT_REQUESTS);

  if (!result.allowed) {
    throw new Error(
      `Tenant '${tenantId}' exceeded request quota (${MAX_TENANT_REQUESTS}/min). Reset in ${Math.ceil(result.resetMs / 1000)}s`
    );
  }
}

export async function getTenantUsage(tenantId: string): Promise<{ count: number; remaining: number }> {
  const bucket = `tenant:${tenantId}`;
  const result = await RedisStore.rateLimit(bucket, WINDOW_MS, MAX_TENANT_REQUESTS);
  return {
    count: MAX_TENANT_REQUESTS - result.remaining,
    remaining: result.remaining,
  };
}

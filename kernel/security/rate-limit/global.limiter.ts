/**
 * Global Rate Limiter
 * 
 * Uses Redis for distributed rate limiting
 */

import { RedisStore } from "../../storage/redis";

const WINDOW_MS = 1000; // 1 second
const MAX_GLOBAL_REQUESTS = 200; // 200 req/sec cluster-wide

export async function checkGlobalLimit(): Promise<void> {
  const bucket = "global";
  const result = await RedisStore.rateLimit(bucket, WINDOW_MS, MAX_GLOBAL_REQUESTS);

  if (!result.allowed) {
    throw new Error(
      `Kernel rate limit exceeded (${MAX_GLOBAL_REQUESTS}/sec). Reset in ${result.resetMs}ms`
    );
  }
}

export async function getGlobalUsage(): Promise<{ count: number; remaining: number }> {
  const bucket = "global";
  const result = await RedisStore.rateLimit(bucket, WINDOW_MS, MAX_GLOBAL_REQUESTS);
  return {
    count: MAX_GLOBAL_REQUESTS - result.remaining,
    remaining: result.remaining,
  };
}

/**
 * Redis JSON Helpers
 * 
 * Convenience wrappers for storing/retrieving JSON in Redis
 */

import { RedisStore } from "./redis";

/**
 * Get and parse JSON from Redis
 */
export async function redisGetJson<T = unknown>(key: string): Promise<T | null> {
  const raw = await RedisStore.get(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Stringify and set JSON in Redis
 */
export async function redisSetJson(
  key: string,
  value: unknown,
  ttlSeconds?: number
): Promise<void> {
  await RedisStore.set(key, JSON.stringify(value), ttlSeconds);
}

/**
 * Delete JSON key
 */
export async function redisDelJson(key: string): Promise<void> {
  await RedisStore.del(key);
}

/**
 * Get JSON or set default if not exists
 */
export async function redisGetOrSetJson<T>(
  key: string,
  defaultFn: () => T | Promise<T>,
  ttlSeconds?: number
): Promise<T> {
  const cached = await redisGetJson<T>(key);
  if (cached !== null) return cached;

  const value = await defaultFn();
  await redisSetJson(key, value, ttlSeconds);
  return value;
}


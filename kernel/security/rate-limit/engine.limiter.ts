/**
 * Engine Rate Limiter
 * 
 * Uses Redis for distributed rate limiting
 * Falls back to in-memory for local dev
 */

import { RedisStore } from "../../storage/redis";

const WINDOW_MS = 60_000; // 1 minute
const MAX_ENGINE_ACTIONS = 300; // 300 actions/minute per engine

export async function checkEngineLimit(engineName: string): Promise<void> {
  const bucket = `engine:${engineName}`;
  const result = await RedisStore.rateLimit(bucket, WINDOW_MS, MAX_ENGINE_ACTIONS);

  if (!result.allowed) {
    throw new Error(
      `Engine '${engineName}' exceeded action quota (${MAX_ENGINE_ACTIONS}/min). Reset in ${Math.ceil(result.resetMs / 1000)}s`
    );
  }
}

export async function getEngineUsage(engineName: string): Promise<{ count: number; remaining: number }> {
  const bucket = `engine:${engineName}`;
  const result = await RedisStore.rateLimit(bucket, WINDOW_MS, MAX_ENGINE_ACTIONS);
  return {
    count: MAX_ENGINE_ACTIONS - result.remaining,
    remaining: result.remaining,
  };
}

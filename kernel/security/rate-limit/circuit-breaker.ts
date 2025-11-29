/**
 * Circuit Breaker
 * 
 * Uses Redis to track engine errors across instances
 * Puts engine into cooldown if error threshold exceeded
 */

import { RedisStore } from "../../storage/redis";

const MAX_ERRORS = 20; // 20 errors/min before circuit breaks
const COOLDOWN_MS = 60_000; // 1 minute cooldown
const ERROR_WINDOW_MS = 60_000; // 1 minute window

const ERROR_KEY_PREFIX = "kernel:circuit:errors:";
const COOLDOWN_KEY_PREFIX = "kernel:circuit:cooldown:";

/**
 * Check if engine is in cooldown
 */
export async function isInCooldown(engineName: string): Promise<boolean> {
  const cooldownKey = `${COOLDOWN_KEY_PREFIX}${engineName}`;
  const value = await RedisStore.get(cooldownKey);
  return value !== null;
}

/**
 * Record an engine error
 * Triggers cooldown if threshold exceeded
 */
export async function recordEngineError(engineName: string): Promise<void> {
  // Check if already in cooldown
  if (await isInCooldown(engineName)) {
    throw new Error(`Engine '${engineName}' is in cooldown mode.`);
  }

  // Use rate limiter to track errors
  const bucket = `circuit:${engineName}`;
  const result = await RedisStore.rateLimit(bucket, ERROR_WINDOW_MS, MAX_ERRORS);

  if (!result.allowed) {
    // Threshold exceeded - enter cooldown
    const cooldownKey = `${COOLDOWN_KEY_PREFIX}${engineName}`;
    await RedisStore.set(cooldownKey, "1", Math.ceil(COOLDOWN_MS / 1000));

    throw new Error(
      `Engine '${engineName}' entered cooldown due to too many errors (${MAX_ERRORS} in 1 min)`
    );
  }
}

/**
 * Get circuit breaker status for an engine
 */
export async function getCircuitStatus(engineName: string): Promise<{
  inCooldown: boolean;
  errorCount: number;
  maxErrors: number;
}> {
  const inCooldown = await isInCooldown(engineName);

  // Get current error count
  const bucket = `circuit:${engineName}`;
  const result = await RedisStore.rateLimit(bucket, ERROR_WINDOW_MS, MAX_ERRORS + 1); // +1 to not trigger

  return {
    inCooldown,
    errorCount: MAX_ERRORS - result.remaining,
    maxErrors: MAX_ERRORS,
  };
}

/**
 * Manually reset circuit breaker (for admin use)
 */
export async function resetCircuit(engineName: string): Promise<void> {
  const cooldownKey = `${COOLDOWN_KEY_PREFIX}${engineName}`;
  await RedisStore.del(cooldownKey);
}

/**
 * Retry Policy — Exponential Backoff with Jitter
 * 
 * Features:
 * - Configurable retry limits
 * - Exponential backoff
 * - Jitter to prevent thundering herd
 * - Retryable error filtering
 * 
 * @module workflows/retry.policy
 */

import type { RetryPolicy, StepError } from './workflow.types';
import { DEFAULT_RETRY_POLICY } from './workflow.types';

// ─────────────────────────────────────────────────────────────
// Retry Executor
// ─────────────────────────────────────────────────────────────

/**
 * Retry execution result
 */
export interface RetryResult<T> {
    success: boolean;
    result?: T;
    error?: StepError;
    attempts: number;
    totalDelay: number;
}

/**
 * Execute a function with retry logic
 * 
 * @param fn - Function to execute
 * @param policy - Retry policy
 * @param context - Context for error classification
 * @returns Retry result with success/failure details
 */
export async function executeWithRetry<T>(
    fn: () => Promise<T>,
    policy: RetryPolicy = DEFAULT_RETRY_POLICY,
    context?: { stepId?: string; stepName?: string }
): Promise<RetryResult<T>> {
    let attempts = 0;
    let totalDelay = 0;
    let lastError: StepError | undefined;

    while (attempts <= policy.maxRetries) {
        try {
            const result = await fn();
            return {
                success: true,
                result,
                attempts: attempts + 1,
                totalDelay,
            };
        } catch (err) {
            attempts++;
            lastError = toStepError(err, context);

            // Check if error is retryable
            if (!isRetryable(lastError, policy)) {
                return {
                    success: false,
                    error: lastError,
                    attempts,
                    totalDelay,
                };
            }

            // Check if we've exhausted retries
            if (attempts > policy.maxRetries) {
                return {
                    success: false,
                    error: lastError,
                    attempts,
                    totalDelay,
                };
            }

            // Calculate delay with jitter
            const delay = calculateDelay(attempts, policy);
            totalDelay += delay;

            // Wait before retry
            await sleep(delay);
        }
    }

    return {
        success: false,
        error: lastError,
        attempts,
        totalDelay,
    };
}

// ─────────────────────────────────────────────────────────────
// Delay Calculation
// ─────────────────────────────────────────────────────────────

/**
 * Calculate delay with exponential backoff and jitter
 * 
 * @param attempt - Current attempt number (1-based)
 * @param policy - Retry policy
 * @returns Delay in milliseconds
 */
export function calculateDelay(attempt: number, policy: RetryPolicy): number {
    // Exponential backoff: initialDelay * (multiplier ^ (attempt - 1))
    const exponentialDelay = policy.initialDelayMs *
        Math.pow(policy.backoffMultiplier, attempt - 1);

    // Cap at max delay
    const cappedDelay = Math.min(exponentialDelay, policy.maxDelayMs);

    // Add jitter (±25%)
    const jitter = cappedDelay * 0.25 * (Math.random() * 2 - 1);

    return Math.max(0, Math.floor(cappedDelay + jitter));
}

/**
 * Check if an error is retryable
 * 
 * @param error - Step error
 * @param policy - Retry policy
 * @returns True if error should be retried
 */
export function isRetryable(error: StepError, policy: RetryPolicy): boolean {
    // If error explicitly marked as non-retryable
    if (!error.retryable) {
        return false;
    }

    // If policy specifies retryable error codes
    if (policy.retryableErrors && policy.retryableErrors.length > 0) {
        return policy.retryableErrors.includes(error.code);
    }

    // Default: retry all errors
    return true;
}

// ─────────────────────────────────────────────────────────────
// Error Conversion
// ─────────────────────────────────────────────────────────────

/**
 * Convert unknown error to StepError
 * 
 * @param err - Unknown error
 * @param context - Optional context
 * @returns Typed StepError
 */
export function toStepError(
    err: unknown,
    context?: { stepId?: string; stepName?: string }
): StepError {
    if (isStepError(err)) {
        return err;
    }

    if (err instanceof Error) {
        return {
            code: classifyErrorCode(err),
            message: err.message,
            stack: err.stack,
            retryable: classifyRetryable(err),
        };
    }

    return {
        code: 'UNKNOWN_ERROR',
        message: String(err),
        retryable: true,
    };
}

/**
 * Type guard for StepError
 */
function isStepError(err: unknown): err is StepError {
    return (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        'message' in err &&
        'retryable' in err
    );
}

/**
 * Classify error code from Error instance
 */
function classifyErrorCode(err: Error): string {
    const name = err.name || err.constructor.name;

    // Network errors
    if (name === 'FetchError' || err.message.includes('ECONNREFUSED')) {
        return 'NETWORK_ERROR';
    }

    // Timeout errors
    if (name === 'TimeoutError' || err.message.includes('timeout')) {
        return 'TIMEOUT_ERROR';
    }

    // Validation errors
    if (name === 'ZodError' || name === 'ValidationError') {
        return 'VALIDATION_ERROR';
    }

    return 'EXECUTION_ERROR';
}

/**
 * Classify if error is retryable
 */
function classifyRetryable(err: Error): boolean {
    const name = err.name || err.constructor.name;

    // Non-retryable errors
    const nonRetryable = [
        'ValidationError',
        'ZodError',
        'AuthenticationError',
        'AuthorizationError',
        'NotFoundError',
    ];

    if (nonRetryable.includes(name)) {
        return false;
    }

    // Retryable by default
    return true;
}

// ─────────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────────

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a custom retry policy
 * 
 * @param overrides - Policy overrides
 * @returns Merged retry policy
 */
export function createRetryPolicy(
    overrides: Partial<RetryPolicy>
): RetryPolicy {
    return {
        ...DEFAULT_RETRY_POLICY,
        ...overrides,
    };
}

/**
 * Preset: Aggressive retry (for transient failures)
 */
export const AGGRESSIVE_RETRY: RetryPolicy = {
    maxRetries: 5,
    initialDelayMs: 50,
    maxDelayMs: 2000,
    backoffMultiplier: 2,
};

/**
 * Preset: Conservative retry (for external APIs)
 */
export const CONSERVATIVE_RETRY: RetryPolicy = {
    maxRetries: 3,
    initialDelayMs: 500,
    maxDelayMs: 10000,
    backoffMultiplier: 3,
};

/**
 * Preset: No retry
 */
export const NO_RETRY: RetryPolicy = {
    maxRetries: 0,
    initialDelayMs: 0,
    maxDelayMs: 0,
    backoffMultiplier: 1,
};


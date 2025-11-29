/**
 * Circuit Breaker for MCP Servers
 * 
 * Implements circuit breaker pattern for MCP server reliability
 * Based on industry best practices (Netflix Hystrix, Resilience4j)
 */

import { baseLogger as logger } from "../../observability/logger";

/**
 * Circuit Breaker State
 */
export type CircuitBreakerState = "closed" | "open" | "half-open";

/**
 * Circuit Breaker Configuration
 */
export interface CircuitBreakerConfig {
  /**
   * Number of consecutive failures before opening circuit
   * Default: 5
   */
  failureThreshold: number;

  /**
   * Time to wait before attempting recovery (ms)
   * Default: 30 seconds
   */
  recoveryTimeout: number;

  /**
   * Number of successful checks to close circuit
   * Default: 2
   */
  successThreshold: number;

  /**
   * Enable circuit breaker
   * Default: true
   */
  enabled: boolean;
}

/**
 * Circuit Breaker Statistics
 */
export interface CircuitBreakerStats {
  state: CircuitBreakerState;
  failures: number;
  successes: number;
  totalRequests: number;
  lastFailureAt?: Date;
  lastSuccessAt?: Date;
  openedAt?: Date;
  closedAt?: Date;
}

/**
 * Circuit Breaker
 * 
 * Implements circuit breaker pattern to prevent cascading failures
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = "closed";
  private failures: number = 0;
  private successes: number = 0;
  private totalRequests: number = 0;
  private lastFailureAt?: Date;
  private lastSuccessAt?: Date;
  private openedAt?: Date;
  private closedAt?: Date;
  private config: CircuitBreakerConfig;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: config.failureThreshold || 5,
      recoveryTimeout: config.recoveryTimeout || 30 * 1000,
      successThreshold: config.successThreshold || 2,
      enabled: config.enabled ?? true,
    };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  public async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T>
  ): Promise<T> {
    if (!this.config.enabled) {
      return fn();
    }

    this.totalRequests++;

    // Check if circuit is open
    if (this.state === "open") {
      if (this.canAttemptRecovery()) {
        this.state = "half-open";
        this.successes = 0;
        logger.info("[CircuitBreaker] Moving to half-open state (attempting recovery)");
      } else {
        // Circuit is open, use fallback or throw
        if (fallback) {
          return fallback();
        }
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      if (fallback) {
        return fallback();
      }
      throw error;
    }
  }

  /**
   * Get current state
   */
  public getState(): CircuitBreakerState {
    return this.state;
  }

  /**
   * Get statistics
   */
  public getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      totalRequests: this.totalRequests,
      lastFailureAt: this.lastFailureAt,
      lastSuccessAt: this.lastSuccessAt,
      openedAt: this.openedAt,
      closedAt: this.closedAt,
    };
  }

  /**
   * Reset circuit breaker
   */
  public reset(): void {
    this.state = "closed";
    this.failures = 0;
    this.successes = 0;
    this.lastFailureAt = undefined;
    this.lastSuccessAt = undefined;
    this.openedAt = undefined;
    this.closedAt = new Date();
  }

  /**
   * Record successful execution
   */
  private recordSuccess(): void {
    this.lastSuccessAt = new Date();

    if (this.state === "half-open") {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = "closed";
        this.failures = 0;
        this.successes = 0;
        this.closedAt = new Date();
        logger.info("[CircuitBreaker] Circuit breaker closed (recovered)");
      }
    } else if (this.state === "closed") {
      // Reset failure count on success
      this.failures = 0;
    }
  }

  /**
   * Record failed execution
   */
  private recordFailure(): void {
    this.lastFailureAt = new Date();
    this.failures++;

    if (this.failures >= this.config.failureThreshold) {
      if (this.state !== "open") {
        this.state = "open";
        this.openedAt = new Date();
        logger.warn(
          {
            failures: this.failures,
            threshold: this.config.failureThreshold,
          },
          "[CircuitBreaker] Circuit breaker opened"
        );
      }
    }
  }

  /**
   * Check if recovery can be attempted
   */
  private canAttemptRecovery(): boolean {
    if (!this.lastFailureAt) {
      return false;
    }

    const timeSinceFailure = Date.now() - this.lastFailureAt.getTime();
    return timeSinceFailure >= this.config.recoveryTimeout;
  }
}


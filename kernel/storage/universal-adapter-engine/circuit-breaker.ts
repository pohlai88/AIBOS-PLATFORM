/**
 * ⚡ Circuit Breaker + Error Mapper + Retry Engine
 * 
 * Provides resilience for all storage operations.
 * 
 * Features:
 * - Circuit breaker pattern (open/closed/half-open)
 * - Exponential backoff retry
 * - Error normalization
 * - Dead Letter Queue integration
 * - Health-based routing
 */

import { eventBus } from "../../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Circuit Breaker States
// ═══════════════════════════════════════════════════════════

export type CircuitState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface CircuitBreakerConfig {
  failureThreshold: number;     // Failures before opening
  successThreshold: number;     // Successes to close from half-open
  timeout: number;              // Time in OPEN state before half-open (ms)
  volumeThreshold: number;      // Minimum calls before calculating failure rate
}

export interface CircuitStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  openedAt?: Date;
}

// ═══════════════════════════════════════════════════════════
// Normalized Error
// ═══════════════════════════════════════════════════════════

export interface NormalizedError {
  code: string;
  message: string;
  provider: string;
  originalError?: any;
  retryable: boolean;
  httpStatus?: number;
  category: "network" | "auth" | "validation" | "rate_limit" | "server" | "unknown";
}

// ═══════════════════════════════════════════════════════════
// Error Mapper
// ═══════════════════════════════════════════════════════════

export class ErrorMapper {
  private static errorPatterns: Array<{
    pattern: RegExp | string;
    code: string;
    category: NormalizedError["category"];
    retryable: boolean;
  }> = [
    // Network errors
    { pattern: /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|ECONNRESET/i, code: "NETWORK_ERROR", category: "network", retryable: true },
    { pattern: /timeout/i, code: "TIMEOUT", category: "network", retryable: true },
    { pattern: /socket hang up/i, code: "CONNECTION_CLOSED", category: "network", retryable: true },
    
    // Auth errors
    { pattern: /unauthorized|401/i, code: "UNAUTHORIZED", category: "auth", retryable: false },
    { pattern: /forbidden|403/i, code: "FORBIDDEN", category: "auth", retryable: false },
    { pattern: /invalid.*token|token.*expired/i, code: "TOKEN_INVALID", category: "auth", retryable: false },
    
    // Rate limiting
    { pattern: /rate.*limit|too many requests|429/i, code: "RATE_LIMITED", category: "rate_limit", retryable: true },
    { pattern: /quota.*exceeded/i, code: "QUOTA_EXCEEDED", category: "rate_limit", retryable: true },
    
    // Validation
    { pattern: /validation|invalid.*input|bad.*request|400/i, code: "VALIDATION_ERROR", category: "validation", retryable: false },
    { pattern: /not.*found|404/i, code: "NOT_FOUND", category: "validation", retryable: false },
    { pattern: /duplicate|conflict|409/i, code: "CONFLICT", category: "validation", retryable: false },
    
    // Server errors
    { pattern: /internal.*error|500/i, code: "SERVER_ERROR", category: "server", retryable: true },
    { pattern: /service.*unavailable|503/i, code: "SERVICE_UNAVAILABLE", category: "server", retryable: true },
    { pattern: /bad.*gateway|502/i, code: "BAD_GATEWAY", category: "server", retryable: true },
  ];

  static normalize(error: any, provider: string): NormalizedError {
    const message = error.message || error.toString();
    const httpStatus = error.status || error.statusCode || error.httpStatus;

    // Find matching pattern
    for (const { pattern, code, category, retryable } of this.errorPatterns) {
      const matches = typeof pattern === "string"
        ? message.toLowerCase().includes(pattern.toLowerCase())
        : pattern.test(message);

      if (matches) {
        return {
          code,
          message,
          provider,
          originalError: error,
          retryable,
          httpStatus,
          category,
        };
      }
    }

    // Default unknown error
    return {
      code: "UNKNOWN_ERROR",
      message,
      provider,
      originalError: error,
      retryable: false,
      httpStatus,
      category: "unknown",
    };
  }
}

// ═══════════════════════════════════════════════════════════
// Circuit Breaker
// ═══════════════════════════════════════════════════════════

export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private circuits: Map<string, CircuitStats> = new Map();

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = {
      failureThreshold: 5,
      successThreshold: 3,
      timeout: 30000,
      volumeThreshold: 10,
      ...config,
    };
  }

  /**
   * Execute operation with circuit breaker
   */
  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    provider: string
  ): Promise<T> {
    const circuit = this.getOrCreateCircuit(key);

    // Check if circuit is open
    if (circuit.state === "OPEN") {
      // Check if timeout has passed
      if (circuit.openedAt && Date.now() - circuit.openedAt.getTime() > this.config.timeout) {
        this.transitionTo(key, "HALF_OPEN");
      } else {
        throw new Error(`Circuit breaker is OPEN for ${key}`);
      }
    }

    try {
      const result = await operation();
      this.recordSuccess(key);
      return result;
    } catch (error: any) {
      const normalized = ErrorMapper.normalize(error, provider);
      
      // Only count retryable errors toward circuit breaker
      if (normalized.retryable) {
        this.recordFailure(key);
      }

      throw error;
    }
  }

  /**
   * Get circuit state
   */
  getState(key: string): CircuitState {
    return this.getOrCreateCircuit(key).state;
  }

  /**
   * Get circuit stats
   */
  getStats(key: string): CircuitStats {
    return this.getOrCreateCircuit(key);
  }

  /**
   * Reset circuit
   */
  reset(key: string): void {
    this.circuits.set(key, {
      state: "CLOSED",
      failures: 0,
      successes: 0,
    });
  }

  private getOrCreateCircuit(key: string): CircuitStats {
    if (!this.circuits.has(key)) {
      this.circuits.set(key, {
        state: "CLOSED",
        failures: 0,
        successes: 0,
      });
    }
    return this.circuits.get(key)!;
  }

  private recordSuccess(key: string): void {
    const circuit = this.getOrCreateCircuit(key);
    circuit.successes++;
    circuit.lastSuccess = new Date();

    if (circuit.state === "HALF_OPEN" && circuit.successes >= this.config.successThreshold) {
      this.transitionTo(key, "CLOSED");
    }
  }

  private recordFailure(key: string): void {
    const circuit = this.getOrCreateCircuit(key);
    circuit.failures++;
    circuit.lastFailure = new Date();

    if (circuit.state === "HALF_OPEN") {
      this.transitionTo(key, "OPEN");
    } else if (circuit.state === "CLOSED" && circuit.failures >= this.config.failureThreshold) {
      this.transitionTo(key, "OPEN");
    }
  }

  private transitionTo(key: string, state: CircuitState): void {
    const circuit = this.getOrCreateCircuit(key);
    const previousState = circuit.state;
    circuit.state = state;

    if (state === "OPEN") {
      circuit.openedAt = new Date();
    } else if (state === "CLOSED") {
      circuit.failures = 0;
      circuit.successes = 0;
      circuit.openedAt = undefined;
    } else if (state === "HALF_OPEN") {
      circuit.successes = 0;
    }

    // Emit event
    eventBus.publish({
      type: "circuit.state.changed",
      key,
      previousState,
      newState: state,
      timestamp: new Date().toISOString(),
    } as any);
  }
}

// ═══════════════════════════════════════════════════════════
// Retry Engine
// ═══════════════════════════════════════════════════════════

export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors: string[];
}

export class RetryEngine {
  private config: RetryConfig;

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = {
      maxRetries: 3,
      initialDelayMs: 1000,
      maxDelayMs: 30000,
      backoffMultiplier: 2,
      retryableErrors: ["NETWORK_ERROR", "TIMEOUT", "RATE_LIMITED", "SERVER_ERROR", "SERVICE_UNAVAILABLE"],
      ...config,
    };
  }

  /**
   * Execute with retry
   */
  async execute<T>(
    operation: () => Promise<T>,
    provider: string,
    onRetry?: (attempt: number, error: NormalizedError, delayMs: number) => void
  ): Promise<T> {
    let lastError: NormalizedError | null = null;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = ErrorMapper.normalize(error, provider);

        // Check if error is retryable
        if (!lastError.retryable || !this.config.retryableErrors.includes(lastError.code)) {
          throw error;
        }

        // Check if we have retries left
        if (attempt >= this.config.maxRetries) {
          throw error;
        }

        // Calculate delay with exponential backoff
        const delayMs = Math.min(
          this.config.initialDelayMs * Math.pow(this.config.backoffMultiplier, attempt),
          this.config.maxDelayMs
        );

        // Add jitter (±20%)
        const jitter = delayMs * 0.2 * (Math.random() - 0.5);
        const finalDelay = Math.round(delayMs + jitter);

        // Callback
        if (onRetry) {
          onRetry(attempt + 1, lastError, finalDelay);
        }

        // Wait before retry
        await this.sleep(finalDelay);
      }
    }

    throw lastError;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ═══════════════════════════════════════════════════════════
// Resilience Manager (Combines All)
// ═══════════════════════════════════════════════════════════

export class ResilienceManager {
  private circuitBreaker: CircuitBreaker;
  private retryEngine: RetryEngine;

  constructor(
    circuitConfig?: Partial<CircuitBreakerConfig>,
    retryConfig?: Partial<RetryConfig>
  ) {
    this.circuitBreaker = new CircuitBreaker(circuitConfig);
    this.retryEngine = new RetryEngine(retryConfig);
  }

  /**
   * Execute with full resilience (circuit breaker + retry)
   */
  async execute<T>(
    key: string,
    operation: () => Promise<T>,
    provider: string
  ): Promise<T> {
    return this.circuitBreaker.execute(
      key,
      () => this.retryEngine.execute(operation, provider),
      provider
    );
  }

  getCircuitState(key: string): CircuitState {
    return this.circuitBreaker.getState(key);
  }

  getCircuitStats(key: string): CircuitStats {
    return this.circuitBreaker.getStats(key);
  }

  resetCircuit(key: string): void {
    this.circuitBreaker.reset(key);
  }
}

// Singleton instances
export const circuitBreaker = new CircuitBreaker();
export const retryEngine = new RetryEngine();
export const resilienceManager = new ResilienceManager();


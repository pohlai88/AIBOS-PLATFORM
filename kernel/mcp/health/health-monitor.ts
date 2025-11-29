/**
 * MCP Server Health Monitor
 * 
 * GRCD-KERNEL v4.0.0 - MCP Health Monitoring Enhancement
 * Based on Kubernetes health check patterns and circuit breaker patterns
 * 
 * Provides:
 * - Health checks for MCP servers
 * - Automatic failover and recovery
 * - Performance metrics per MCP server
 * - Circuit breaker pattern for reliability
 */

import type { MCPRegistryEntry } from "../types";
import { mcpRegistry } from "../registry/mcp-registry";
import { MCPClient } from "../sdk/mcp-client";
import { baseLogger as logger } from "../../observability/logger";
import { recordMCPHealthCheck, recordMCPHealthStatus } from "../telemetry/mcp-metrics";

/**
 * Health Check Status
 */
export type HealthStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

/**
 * Health Check Result
 */
export interface HealthCheckResult {
  serverName: string;
  status: HealthStatus;
  latencyMs: number;
  timestamp: Date;
  error?: string;
  details?: {
    connectionStatus?: string;
    lastSuccessfulCheck?: Date;
    consecutiveFailures?: number;
  };
}

/**
 * MCP Server Health Metrics
 */
export interface MCPHealthMetrics {
  serverName: string;
  status: HealthStatus;
  uptime: number; // seconds
  totalChecks: number;
  successfulChecks: number;
  failedChecks: number;
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  lastCheckAt: Date;
  lastSuccessAt?: Date;
  lastFailureAt?: Date;
  consecutiveFailures: number;
  circuitBreakerState: "closed" | "open" | "half-open";
}

/**
 * Circuit Breaker Configuration
 */
export interface CircuitBreakerConfig {
  /**
   * Number of consecutive failures before opening circuit
   * Default: 5
   */
  failureThreshold?: number;

  /**
   * Time to wait before attempting recovery (ms)
   * Default: 30 seconds
   */
  recoveryTimeout?: number;

  /**
   * Number of successful checks to close circuit
   * Default: 2
   */
  successThreshold?: number;
}

/**
 * Health Monitor Configuration
 */
export interface HealthMonitorConfig {
  /**
   * Health check interval (ms)
   * Default: 30 seconds
   */
  checkInterval?: number;

  /**
   * Health check timeout (ms)
   * Default: 5 seconds
   */
  checkTimeout?: number;

  /**
   * Circuit breaker configuration
   */
  circuitBreaker?: CircuitBreakerConfig;

  /**
   * Enable automatic health monitoring
   * Default: true
   */
  autoMonitor?: boolean;
}

/**
 * MCP Server Health Monitor
 * 
 * Monitors health of all registered MCP servers with:
 * - Periodic health checks
 * - Circuit breaker pattern
 * - Performance metrics
 * - Automatic recovery
 */
export class MCPHealthMonitor {
  private static instance: MCPHealthMonitor;
  private metrics: Map<string, MCPHealthMetrics> = new Map();
  private circuitBreakers: Map<string, {
    state: "closed" | "open" | "half-open";
    failures: number;
    successes: number;
    lastFailureAt?: Date;
    lastSuccessAt?: Date;
  }> = new Map();
  private monitoringInterval?: NodeJS.Timeout;
  private config: Required<HealthMonitorConfig>;

  private constructor(config: HealthMonitorConfig = {}) {
    this.config = {
      checkInterval: config.checkInterval || 30 * 1000, // 30 seconds
      checkTimeout: config.checkTimeout || 5 * 1000, // 5 seconds
      circuitBreaker: {
        failureThreshold: config.circuitBreaker?.failureThreshold || 5,
        recoveryTimeout: config.circuitBreaker?.recoveryTimeout || 30 * 1000,
        successThreshold: config.circuitBreaker?.successThreshold || 2,
      },
      autoMonitor: config.autoMonitor ?? true,
    };

    if (this.config.autoMonitor) {
      this.startMonitoring();
    }
  }

  public static getInstance(config?: HealthMonitorConfig): MCPHealthMonitor {
    if (!MCPHealthMonitor.instance) {
      MCPHealthMonitor.instance = new MCPHealthMonitor(config);
    }
    return MCPHealthMonitor.instance;
  }

  /**
   * Check health of a specific MCP server
   */
  public async checkHealth(serverName: string): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      // Get server from registry
      const entry = mcpRegistry.getByName(serverName);
      if (!entry) {
        return {
          serverName,
          status: "unknown",
          latencyMs: Date.now() - startTime,
          timestamp: new Date(),
          error: "Server not found in registry",
        };
      }

      // Check circuit breaker
      const circuitBreaker = this.getCircuitBreaker(serverName);
      if (circuitBreaker.state === "open") {
        // Check if recovery timeout has passed
        if (circuitBreaker.lastFailureAt) {
          const timeSinceFailure = Date.now() - circuitBreaker.lastFailureAt.getTime();
          if (timeSinceFailure < this.config.circuitBreaker.recoveryTimeout) {
            return {
              serverName,
              status: "unhealthy",
              latencyMs: Date.now() - startTime,
              timestamp: new Date(),
              error: "Circuit breaker is open",
              details: {
                connectionStatus: "circuit_breaker_open",
                consecutiveFailures: circuitBreaker.failures,
              },
            };
          } else {
            // Try recovery (move to half-open)
            circuitBreaker.state = "half-open";
            circuitBreaker.successes = 0;
          }
        }
      }

      // Perform health check
      const client = new MCPClient(entry.manifest);
      const isHealthy = await Promise.race([
        client.ping(),
        new Promise<boolean>((_, reject) =>
          setTimeout(() => reject(new Error("Health check timeout")), this.config.checkTimeout)
        ),
      ]);

      const latencyMs = Date.now() - startTime;

      if (isHealthy) {
        // Health check passed
        this.recordSuccess(serverName, latencyMs);
        recordMCPHealthCheck(serverName, true, latencyMs);

        return {
          serverName,
          status: "healthy",
          latencyMs,
          timestamp: new Date(),
          details: {
            connectionStatus: "connected",
            lastSuccessfulCheck: new Date(),
            consecutiveFailures: 0,
          },
        };
      } else {
        // Health check failed
        this.recordFailure(serverName);
        recordMCPHealthCheck(serverName, false, latencyMs);

        return {
          serverName,
          status: "unhealthy",
          latencyMs,
          timestamp: new Date(),
          error: "Health check failed",
          details: {
            connectionStatus: "disconnected",
            consecutiveFailures: this.getCircuitBreaker(serverName).failures,
          },
        };
      }
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      this.recordFailure(serverName);
      recordMCPHealthCheck(serverName, false, latencyMs);

      return {
        serverName,
        status: "unhealthy",
        latencyMs,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : String(error),
        details: {
          connectionStatus: "error",
          consecutiveFailures: this.getCircuitBreaker(serverName).failures,
        },
      };
    }
  }

  /**
   * Check health of all registered MCP servers
   */
  public async checkAllHealth(): Promise<HealthCheckResult[]> {
    const servers = mcpRegistry.listActive();
    const results = await Promise.all(
      servers.map((entry) => this.checkHealth(entry.manifest.name))
    );

    // Update aggregate metrics
    for (const result of results) {
      recordMCPHealthStatus(result.serverName, result.status);
    }

    return results;
  }

  /**
   * Get health metrics for a specific server
   */
  public getMetrics(serverName: string): MCPHealthMetrics | null {
    return this.metrics.get(serverName) || null;
  }

  /**
   * Get health metrics for all servers
   */
  public getAllMetrics(): Map<string, MCPHealthMetrics> {
    return new Map(this.metrics);
  }

  /**
   * Start automatic health monitoring
   */
  public startMonitoring(): void {
    if (this.monitoringInterval) {
      return; // Already monitoring
    }

    logger.info(
      {
        interval: this.config.checkInterval,
      },
      "[MCPHealthMonitor] Starting automatic health monitoring"
    );

    this.monitoringInterval = setInterval(async () => {
      try {
        await this.checkAllHealth();
      } catch (error) {
        logger.error(
          { error: error instanceof Error ? error.message : String(error) },
          "[MCPHealthMonitor] Error during health check cycle"
        );
      }
    }, this.config.checkInterval);
  }

  /**
   * Stop automatic health monitoring
   */
  public stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      logger.info("[MCPHealthMonitor] Stopped automatic health monitoring");
    }
  }

  /**
   * Record successful health check
   */
  private recordSuccess(serverName: string, latencyMs: number): void {
    const metrics = this.getOrCreateMetrics(serverName);
    const circuitBreaker = this.getCircuitBreaker(serverName);

    // Update metrics
    metrics.totalChecks++;
    metrics.successfulChecks++;
    metrics.lastCheckAt = new Date();
    metrics.lastSuccessAt = new Date();
    metrics.consecutiveFailures = 0;

    // Update latency metrics (simplified - in production, use proper histogram)
    const latencies = [metrics.averageLatencyMs, latencyMs];
    metrics.averageLatencyMs = latencies.reduce((sum, l) => sum + l, 0) / latencies.length;
    metrics.p95LatencyMs = Math.max(metrics.p95LatencyMs, latencyMs * 0.95);
    metrics.p99LatencyMs = Math.max(metrics.p99LatencyMs, latencyMs * 0.99);

    // Update circuit breaker
    if (circuitBreaker.state === "half-open") {
      circuitBreaker.successes++;
      if (circuitBreaker.successes >= this.config.circuitBreaker.successThreshold) {
        circuitBreaker.state = "closed";
        circuitBreaker.failures = 0;
        circuitBreaker.successes = 0;
        logger.info({ serverName }, "[MCPHealthMonitor] Circuit breaker closed (recovered)");
      }
    } else if (circuitBreaker.state === "open") {
      circuitBreaker.state = "half-open";
      circuitBreaker.successes = 1;
    }

    circuitBreaker.lastSuccessAt = new Date();
    metrics.status = "healthy";
    metrics.circuitBreakerState = circuitBreaker.state;
  }

  /**
   * Record failed health check
   */
  private recordFailure(serverName: string): void {
    const metrics = this.getOrCreateMetrics(serverName);
    const circuitBreaker = this.getCircuitBreaker(serverName);

    // Update metrics
    metrics.totalChecks++;
    metrics.failedChecks++;
    metrics.lastCheckAt = new Date();
    metrics.lastFailureAt = new Date();
    metrics.consecutiveFailures++;

    // Update circuit breaker
    circuitBreaker.failures++;
    circuitBreaker.lastFailureAt = new Date();

    if (circuitBreaker.failures >= this.config.circuitBreaker.failureThreshold) {
      if (circuitBreaker.state !== "open") {
        circuitBreaker.state = "open";
        logger.warn(
          {
            serverName,
            failures: circuitBreaker.failures,
          },
          "[MCPHealthMonitor] Circuit breaker opened"
        );
      }
    }

    // Determine status
    if (circuitBreaker.state === "open") {
      metrics.status = "unhealthy";
    } else if (metrics.consecutiveFailures >= 3) {
      metrics.status = "degraded";
    } else {
      metrics.status = "healthy"; // Still healthy, just one failure
    }

    metrics.circuitBreakerState = circuitBreaker.state;
  }

  /**
   * Get or create metrics for a server
   */
  private getOrCreateMetrics(serverName: string): MCPHealthMetrics {
    if (!this.metrics.has(serverName)) {
      const entry = mcpRegistry.getByName(serverName);
      const registeredAt = entry?.registeredAt || new Date();
      const uptime = Math.floor((Date.now() - registeredAt.getTime()) / 1000);

      this.metrics.set(serverName, {
        serverName,
        status: "unknown",
        uptime,
        totalChecks: 0,
        successfulChecks: 0,
        failedChecks: 0,
        averageLatencyMs: 0,
        p95LatencyMs: 0,
        p99LatencyMs: 0,
        lastCheckAt: new Date(),
        consecutiveFailures: 0,
        circuitBreakerState: "closed",
      });
    }

    return this.metrics.get(serverName)!;
  }

  /**
   * Get or create circuit breaker for a server
   */
  private getCircuitBreaker(serverName: string) {
    if (!this.circuitBreakers.has(serverName)) {
      this.circuitBreakers.set(serverName, {
        state: "closed",
        failures: 0,
        successes: 0,
      });
    }

    return this.circuitBreakers.get(serverName)!;
  }
}

/**
 * Singleton instance
 */
export const mcpHealthMonitor = MCPHealthMonitor.getInstance();


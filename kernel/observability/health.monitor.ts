/**
 * Health Monitor — System Health & Observability
 * 
 * Features:
 * - Component health checks
 * - Dependency status monitoring
 * - Health aggregation
 * - Event emission for alerts
 * 
 * @module observability/health.monitor
 */

import { eventBus } from '../events/event-bus';
import { sagaEngine } from '../workflows/saga.engine';
import { workflowRegistry } from '../workflows/workflow.registry';

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

/**
 * Health status
 */
export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

/**
 * Component health check result
 */
export interface ComponentHealth {
  name: string;
  status: HealthStatus;
  message?: string;
  latency?: number;
  lastChecked: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Overall system health
 */
export interface SystemHealth {
  status: HealthStatus;
  components: ComponentHealth[];
  timestamp: Date;
  uptime: number;
}

/**
 * Health check function
 */
export type HealthCheckFn = () => Promise<ComponentHealth>;

// ─────────────────────────────────────────────────────────────
// Health Monitor Class
// ─────────────────────────────────────────────────────────────

/**
 * System health monitor
 */
export class HealthMonitor {
  private checks = new Map<string, HealthCheckFn>();
  private lastResults = new Map<string, ComponentHealth>();
  private startTime = Date.now();
  private checkInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Register default checks
    this.registerDefaultChecks();
  }

  /**
   * Register a health check
   * 
   * @param name - Component name
   * @param check - Health check function
   */
  register(name: string, check: HealthCheckFn): void {
    this.checks.set(name, check);
  }

  /**
   * Unregister a health check
   * 
   * @param name - Component name
   */
  unregister(name: string): void {
    this.checks.delete(name);
    this.lastResults.delete(name);
  }

  /**
   * Run all health checks
   * 
   * @returns System health status
   */
  async check(): Promise<SystemHealth> {
    const components: ComponentHealth[] = [];

    for (const [name, checkFn] of this.checks) {
      try {
        const start = Date.now();
        const result = await checkFn();
        result.latency = Date.now() - start;
        result.lastChecked = new Date();
        
        components.push(result);
        this.lastResults.set(name, result);
      } catch (err) {
        const errorResult: ComponentHealth = {
          name,
          status: 'unhealthy',
          message: err instanceof Error ? err.message : String(err),
          lastChecked: new Date(),
        };
        components.push(errorResult);
        this.lastResults.set(name, errorResult);
      }
    }

    // Aggregate status
    const status = this.aggregateStatus(components);

    const health: SystemHealth = {
      status,
      components,
      timestamp: new Date(),
      uptime: Date.now() - this.startTime,
    };

    // Emit health event if degraded or unhealthy
    if (status !== 'healthy') {
      await eventBus.publish('kernel.warning', {
        type: 'kernel.warning',
        tenantId: 'system',
        payload: {
          message: `System health: ${status}`,
          components: components.filter(c => c.status !== 'healthy'),
        },
      });
    }

    return health;
  }

  /**
   * Get last health check results
   */
  getLastResults(): SystemHealth {
    const components = Array.from(this.lastResults.values());
    
    return {
      status: this.aggregateStatus(components),
      components,
      timestamp: new Date(),
      uptime: Date.now() - this.startTime,
    };
  }

  /**
   * Start periodic health checks
   * 
   * @param intervalMs - Check interval in milliseconds
   */
  startPeriodicChecks(intervalMs = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      await this.check();
    }, intervalMs);

    // Run initial check
    this.check().catch(console.error);
  }

  /**
   * Stop periodic health checks
   */
  stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Aggregate component statuses
   */
  private aggregateStatus(components: ComponentHealth[]): HealthStatus {
    if (components.length === 0) return 'unknown';

    const hasUnhealthy = components.some(c => c.status === 'unhealthy');
    const hasDegraded = components.some(c => c.status === 'degraded');

    if (hasUnhealthy) return 'unhealthy';
    if (hasDegraded) return 'degraded';
    return 'healthy';
  }

  /**
   * Register default health checks
   */
  private registerDefaultChecks(): void {
    // Event Bus check
    this.register('eventBus', async () => ({
      name: 'eventBus',
      status: 'healthy' as HealthStatus,
      message: `DLQ: ${eventBus.getDeadLetters().length} items`,
      lastChecked: new Date(),
      metadata: {
        dlqSize: eventBus.getDeadLetters().length,
      },
    }));

    // Saga Engine check
    this.register('sagaEngine', async () => ({
      name: 'sagaEngine',
      status: 'healthy' as HealthStatus,
      message: `Running: ${sagaEngine.getRunningCount()} sagas`,
      lastChecked: new Date(),
      metadata: {
        runningCount: sagaEngine.getRunningCount(),
      },
    }));

    // Workflow Registry check
    this.register('workflowRegistry', async () => {
      const stats = workflowRegistry.getStats();
      return {
        name: 'workflowRegistry',
        status: 'healthy' as HealthStatus,
        message: `${stats.enabled}/${stats.total} workflows enabled`,
        lastChecked: new Date(),
        metadata: stats,
      };
    });

    // Memory check
    this.register('memory', async () => {
      const used = process.memoryUsage();
      const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
      const heapTotalMB = Math.round(used.heapTotal / 1024 / 1024);
      const usage = heapUsedMB / heapTotalMB;

      let status: HealthStatus = 'healthy';
      if (usage > 0.9) status = 'unhealthy';
      else if (usage > 0.7) status = 'degraded';

      return {
        name: 'memory',
        status,
        message: `Heap: ${heapUsedMB}/${heapTotalMB} MB (${Math.round(usage * 100)}%)`,
        lastChecked: new Date(),
        metadata: {
          heapUsedMB,
          heapTotalMB,
          usage: Math.round(usage * 100),
        },
      };
    });
  }

  /**
   * Get uptime in milliseconds
   */
  getUptime(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get uptime formatted as string
   */
  getUptimeFormatted(): string {
    const uptime = this.getUptime();
    const seconds = Math.floor(uptime / 1000) % 60;
    const minutes = Math.floor(uptime / 60000) % 60;
    const hours = Math.floor(uptime / 3600000) % 24;
    const days = Math.floor(uptime / 86400000);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return parts.join(' ');
  }
}

// ─────────────────────────────────────────────────────────────
// Singleton Export
// ─────────────────────────────────────────────────────────────

/**
 * Global health monitor instance
 */
export const healthMonitor = new HealthMonitor();


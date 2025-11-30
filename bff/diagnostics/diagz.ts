/**
 * @fileoverview BFF Diagnostics Endpoint (/diagz)
 * @module @bff/diagnostics
 * @description Comprehensive diagnostic information for operations and monitoring
 * 
 * Features:
 * - Request metrics (RPS, latency, error rates)
 * - Middleware performance stats
 * - Protocol adapter status
 * - Storage backend health
 * - Memory usage
 * - Cache hit rates
 */

import type { BffManifestType } from '../bff.manifest';
import type { MiddlewareStack } from '../middleware/compose.middleware';

// ============================================================================
// Types
// ============================================================================

export interface DiagnosticData {
  uptime: number;
  version: string;
  timestamp: string;
  requests: {
    total: number;
    perSecond: number;
    errors: number;
    errorRate: number;
  };
  latency: {
    p50: number;
    p95: number;
    p99: number;
    p999: number;
  };
  middleware: {
    [name: string]: {
      calls: number;
      avgTime: number;
      errors: number;
      slowest: number;
    };
  };
  adapters: {
    [protocol: string]: {
      enabled: boolean;
      activeConnections: number;
      requests: number;
      errors: number;
    };
  };
  stores: {
    audit: { type: string; connected: boolean; entries?: number };
    rateLimit: { type: string; connected: boolean; buckets?: number };
    cache: { type: string; connected: boolean; hitRate?: number };
  };
  memory: {
    heapUsed: number;
    heapTotal: number;
    rss: number;
    external: number;
  };
  system: {
    nodeVersion: string;
    platform: string;
    arch: string;
  };
}

// ============================================================================
// Metrics Collector
// ============================================================================

interface RequestMetric {
  timestamp: number;
  duration: number;
  statusCode: number;
  middlewareTimes: Record<string, number>;
}

class MetricsCollector {
  private requests: RequestMetric[] = [];
  private readonly maxSize = 10000; // Keep last 10k requests
  private readonly windowMs = 60000; // 1 minute window

  record(metric: RequestMetric): void {
    this.requests.push(metric);
    
    // Trim old entries
    if (this.requests.length > this.maxSize) {
      this.requests = this.requests.slice(-this.maxSize);
    }
  }

  getRecentMetrics(windowMs: number = this.windowMs): RequestMetric[] {
    const cutoff = Date.now() - windowMs;
    return this.requests.filter((m) => m.timestamp >= cutoff);
  }

  getAllMetrics(): RequestMetric[] {
    return [...this.requests];
  }

  clear(): void {
    this.requests = [];
  }
}

// Global metrics collector
const metricsCollector = new MetricsCollector();

// ============================================================================
// Diagnostics Generator
// ============================================================================

/**
 * Generate diagnostic data
 */
export async function generateDiagnostics(
  manifest: Readonly<BffManifestType>,
  middlewareStack: MiddlewareStack,
  startTime: number,
  adapters: Map<string, any>
): Promise<DiagnosticData> {
  const now = Date.now();
  const uptime = Math.floor((now - startTime) / 1000);
  
  // Get recent metrics (last 1 minute)
  const recentMetrics = metricsCollector.getRecentMetrics(60000);
  const allMetrics = metricsCollector.getAllMetrics();

  // Calculate request stats
  const totalRequests = allMetrics.length;
  const recentRequests = recentMetrics.length;
  const requestsPerSecond = recentRequests / 60; // Average over 1 minute
  
  const errors = allMetrics.filter((m) => m.statusCode >= 400).length;
  const recentErrors = recentMetrics.filter((m) => m.statusCode >= 400).length;
  const errorRate = recentRequests > 0 ? recentErrors / recentRequests : 0;

  // Calculate latency percentiles
  const durations = allMetrics.map((m) => m.duration).sort((a, b) => a - b);
  const getPercentile = (p: number): number => {
    if (durations.length === 0) return 0;
    const index = Math.floor((p / 100) * durations.length);
    return durations[index] || 0;
  };

  // Calculate middleware stats
  const middlewareStats: DiagnosticData['middleware'] = {};
  const middlewareNames = ['auth', 'rateLimit', 'zoneGuard', 'audit', 'sanitizer', 'aiFirewall', 'cache'];
  
  for (const name of middlewareNames) {
    const times = allMetrics
      .map((m) => m.middlewareTimes[name] || 0)
      .filter((t) => t > 0);
    
    if (times.length > 0) {
      const sorted = times.sort((a, b) => a - b);
      middlewareStats[name] = {
        calls: times.length,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
        errors: 0, // Would need error tracking per middleware
        slowest: sorted[sorted.length - 1] || 0,
      };
    }
  }

  // Get adapter status
  const adapterStats: DiagnosticData['adapters'] = {};
  for (const [protocol, adapter] of adapters) {
    adapterStats[protocol] = {
      enabled: adapter?.enabled || false,
      activeConnections: 0, // Would need adapter-specific tracking
      requests: 0, // Would need adapter-specific tracking
      errors: 0, // Would need adapter-specific tracking
    };
  }

  // Get store status
  const auditStore = middlewareStack.getAudit().getStore();
  const rateLimitStore = middlewareStack.getRateLimit();
  const cacheStore = middlewareStack.getCache()?.getStore();
  
  const stores: DiagnosticData['stores'] = {
    audit: {
      type: process.env.BFF_AUDIT_STORE || 'memory',
      connected: true, // Would need actual connection check
    },
    rateLimit: {
      type: process.env.BFF_RATE_LIMIT_STORE || 'memory',
      connected: true,
    },
    cache: {
      type: process.env.BFF_CACHE_STORE || 'memory',
      connected: true,
      hitRate: 0, // Would need cache hit tracking
    },
  };

  // Get memory stats
  const memUsage = process.memoryUsage();
  const memory: DiagnosticData['memory'] = {
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal,
    rss: memUsage.rss,
    external: memUsage.external,
  };

  // System info
  const system: DiagnosticData['system'] = {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };

  return {
    uptime,
    version: manifest.version,
    timestamp: new Date().toISOString(),
    requests: {
      total: totalRequests,
      perSecond: Math.round(requestsPerSecond * 100) / 100,
      errors: errors,
      errorRate: Math.round(errorRate * 10000) / 100, // Percentage
    },
    latency: {
      p50: getPercentile(50),
      p95: getPercentile(95),
      p99: getPercentile(99),
      p999: getPercentile(99.9),
    },
    middleware: middlewareStats,
    adapters: adapterStats,
    stores,
    memory,
    system,
  };
}

/**
 * Record request metric
 */
export function recordRequestMetric(metric: RequestMetric): void {
  metricsCollector.record(metric);
}

/**
 * Clear metrics (for testing)
 */
export function clearMetrics(): void {
  metricsCollector.clear();
}


/**
 * 🎚️ Resource Throttler v1.0
 * 
 * Dynamic resource throttling:
 * - CPU-aware throttling
 * - Memory pressure handling
 * - Backpressure management
 * 
 * @version 1.0.0
 */

import os from "os";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ResourceState {
  cpuPercent: number;
  memoryPercent: number;
  eventLoopLagMs: number;
  pressure: "low" | "medium" | "high" | "critical";
}

export interface ThrottleConfig {
  cpuThreshold: number;
  memoryThreshold: number;
  eventLoopThresholdMs: number;
  checkIntervalMs: number;
}

// ═══════════════════════════════════════════════════════════
// Resource Throttler
// ═══════════════════════════════════════════════════════════

export class ResourceThrottler {
  private static config: ThrottleConfig = {
    cpuThreshold: 80,
    memoryThreshold: 85,
    eventLoopThresholdMs: 100,
    checkIntervalMs: 1000,
  };

  private static lastCheck = 0;
  private static lastCpuUsage = process.cpuUsage();
  private static lastCpuTime = Date.now();
  private static eventLoopLag = 0;
  private static lagCheckTimer: NodeJS.Timeout | null = null;

  /**
   * Start monitoring
   */
  static startMonitoring(): void {
    if (this.lagCheckTimer) return;

    // Event loop lag detection
    this.lagCheckTimer = setInterval(() => {
      const start = Date.now();
      setImmediate(() => {
        this.eventLoopLag = Date.now() - start;
      });
    }, this.config.checkIntervalMs);
  }

  /**
   * Stop monitoring
   */
  static stopMonitoring(): void {
    if (this.lagCheckTimer) {
      clearInterval(this.lagCheckTimer);
      this.lagCheckTimer = null;
    }
  }

  /**
   * Get current resource state
   */
  static getState(): ResourceState {
    const now = Date.now();

    // CPU calculation
    const currentCpuUsage = process.cpuUsage(this.lastCpuUsage);
    const elapsedMs = now - this.lastCpuTime;
    const cpuPercent = elapsedMs > 0
      ? ((currentCpuUsage.user + currentCpuUsage.system) / 1000 / elapsedMs) * 100
      : 0;

    this.lastCpuUsage = process.cpuUsage();
    this.lastCpuTime = now;

    // Memory calculation
    const mem = process.memoryUsage();
    const totalMem = os.totalmem();
    const memoryPercent = (mem.heapUsed / totalMem) * 100;

    // Determine pressure level
    let pressure: ResourceState["pressure"] = "low";
    
    if (cpuPercent > 90 || memoryPercent > 90 || this.eventLoopLag > 200) {
      pressure = "critical";
    } else if (cpuPercent > this.config.cpuThreshold || 
               memoryPercent > this.config.memoryThreshold ||
               this.eventLoopLag > this.config.eventLoopThresholdMs) {
      pressure = "high";
    } else if (cpuPercent > 60 || memoryPercent > 70 || this.eventLoopLag > 50) {
      pressure = "medium";
    }

    return {
      cpuPercent: Math.min(100, cpuPercent),
      memoryPercent,
      eventLoopLagMs: this.eventLoopLag,
      pressure,
    };
  }

  /**
   * Should throttle based on current pressure
   */
  static shouldThrottle(): boolean {
    const state = this.getState();
    return state.pressure === "high" || state.pressure === "critical";
  }

  /**
   * Get throttle delay based on pressure
   */
  static getThrottleDelayMs(): number {
    const state = this.getState();
    
    switch (state.pressure) {
      case "critical": return 500;
      case "high": return 100;
      case "medium": return 20;
      default: return 0;
    }
  }

  /**
   * Get concurrency multiplier (reduce concurrency under pressure)
   */
  static getConcurrencyMultiplier(): number {
    const state = this.getState();
    
    switch (state.pressure) {
      case "critical": return 0.25;
      case "high": return 0.5;
      case "medium": return 0.75;
      default: return 1.0;
    }
  }

  /**
   * Throttled execution wrapper
   */
  static async throttle<T>(fn: () => Promise<T>): Promise<T> {
    const delay = this.getThrottleDelayMs();
    
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    return fn();
  }

  /**
   * Wait until pressure is acceptable
   */
  static async waitForCapacity(maxWaitMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitMs) {
      const state = this.getState();
      if (state.pressure === "low" || state.pressure === "medium") {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }

  /**
   * Configure thresholds
   */
  static configure(config: Partial<ThrottleConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Force garbage collection if available
   */
  static requestGC(): void {
    if (global.gc) {
      global.gc();
    }
  }
}

export const resourceThrottler = ResourceThrottler;


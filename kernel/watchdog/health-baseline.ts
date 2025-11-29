/**
 * 📊 Health Baseline Model v1.0
 * 
 * Learns normal kernel behavior patterns:
 * - CPU/memory baselines
 * - Request rate patterns
 * - Error rate thresholds
 * - Latency expectations
 * 
 * @version 1.0.0
 */

import os from "os";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface HealthSample {
  timestamp: number;
  cpuLoad: number;
  memoryUsedMB: number;
  heapUsedMB: number;
  heapRatio: number;
  activeRequests: number;
  errorRate: number;
  avgLatencyMs: number;
}

export interface HealthBaseline {
  cpuLoadAvg: number;
  cpuLoadStdDev: number;
  memoryAvg: number;
  memoryStdDev: number;
  heapRatioAvg: number;
  errorRateAvg: number;
  latencyAvg: number;
  latencyP95: number;
  sampleCount: number;
  lastUpdated: number;
}

// ═══════════════════════════════════════════════════════════
// Health Baseline Model
// ═══════════════════════════════════════════════════════════

export class HealthBaselineModel {
  private static samples: HealthSample[] = [];
  private static baseline: HealthBaseline | null = null;
  private static readonly MAX_SAMPLES = 1000;
  private static readonly MIN_SAMPLES_FOR_BASELINE = 30;

  // Request tracking
  private static activeRequests = 0;
  private static recentErrors = 0;
  private static recentLatencies: number[] = [];

  /**
   * Collect current health sample
   */
  static collectSample(): HealthSample {
    const mem = process.memoryUsage();
    const load = os.loadavg()[0];

    const sample: HealthSample = {
      timestamp: Date.now(),
      cpuLoad: load,
      memoryUsedMB: mem.rss / 1024 / 1024,
      heapUsedMB: mem.heapUsed / 1024 / 1024,
      heapRatio: mem.heapUsed / mem.heapTotal,
      activeRequests: this.activeRequests,
      errorRate: this.calculateErrorRate(),
      avgLatencyMs: this.calculateAvgLatency(),
    };

    this.samples.push(sample);
    if (this.samples.length > this.MAX_SAMPLES) {
      this.samples.shift();
    }

    // Update baseline if enough samples
    if (this.samples.length >= this.MIN_SAMPLES_FOR_BASELINE) {
      this.updateBaseline();
    }

    return sample;
  }

  /**
   * Update baseline from collected samples
   */
  private static updateBaseline(): void {
    const cpuLoads = this.samples.map(s => s.cpuLoad);
    const memories = this.samples.map(s => s.memoryUsedMB);
    const heapRatios = this.samples.map(s => s.heapRatio);
    const errorRates = this.samples.map(s => s.errorRate);
    const latencies = this.samples.map(s => s.avgLatencyMs).filter(l => l > 0);

    this.baseline = {
      cpuLoadAvg: this.average(cpuLoads),
      cpuLoadStdDev: this.stdDev(cpuLoads),
      memoryAvg: this.average(memories),
      memoryStdDev: this.stdDev(memories),
      heapRatioAvg: this.average(heapRatios),
      errorRateAvg: this.average(errorRates),
      latencyAvg: latencies.length > 0 ? this.average(latencies) : 0,
      latencyP95: latencies.length > 0 ? this.percentile(latencies, 95) : 0,
      sampleCount: this.samples.length,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Get current baseline
   */
  static getBaseline(): HealthBaseline | null {
    return this.baseline;
  }

  /**
   * Get latest sample
   */
  static getLatestSample(): HealthSample | null {
    return this.samples[this.samples.length - 1] || null;
  }

  /**
   * Check if current state deviates from baseline
   */
  static checkDeviation(): { deviating: boolean; factors: string[] } {
    if (!this.baseline) {
      return { deviating: false, factors: [] };
    }

    const current = this.collectSample();
    const factors: string[] = [];

    // CPU deviation (> 2 std devs)
    if (current.cpuLoad > this.baseline.cpuLoadAvg + 2 * this.baseline.cpuLoadStdDev) {
      factors.push(`CPU load ${current.cpuLoad.toFixed(2)} exceeds baseline`);
    }

    // Memory deviation
    if (current.memoryUsedMB > this.baseline.memoryAvg + 2 * this.baseline.memoryStdDev) {
      factors.push(`Memory ${current.memoryUsedMB.toFixed(0)}MB exceeds baseline`);
    }

    // Heap ratio
    if (current.heapRatio > this.baseline.heapRatioAvg * 1.5) {
      factors.push(`Heap ratio ${(current.heapRatio * 100).toFixed(1)}% exceeds baseline`);
    }

    // Error rate
    if (current.errorRate > this.baseline.errorRateAvg * 2 && current.errorRate > 0.05) {
      factors.push(`Error rate ${(current.errorRate * 100).toFixed(1)}% exceeds baseline`);
    }

    // Latency
    if (current.avgLatencyMs > this.baseline.latencyP95 * 1.5 && current.avgLatencyMs > 100) {
      factors.push(`Latency ${current.avgLatencyMs.toFixed(0)}ms exceeds P95 baseline`);
    }

    return { deviating: factors.length > 0, factors };
  }

  /**
   * Record request start
   */
  static recordRequestStart(): void {
    this.activeRequests++;
  }

  /**
   * Record request end
   */
  static recordRequestEnd(latencyMs: number, isError: boolean): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    
    this.recentLatencies.push(latencyMs);
    if (this.recentLatencies.length > 100) {
      this.recentLatencies.shift();
    }

    if (isError) {
      this.recentErrors++;
    }
  }

  /**
   * Reset error tracking (call periodically)
   */
  static resetErrorTracking(): void {
    this.recentErrors = 0;
  }

  private static calculateErrorRate(): number {
    const totalRecent = this.recentLatencies.length;
    if (totalRecent === 0) return 0;
    return this.recentErrors / totalRecent;
  }

  private static calculateAvgLatency(): number {
    if (this.recentLatencies.length === 0) return 0;
    return this.average(this.recentLatencies);
  }

  private static average(arr: number[]): number {
    if (arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }

  private static stdDev(arr: number[]): number {
    if (arr.length === 0) return 0;
    const avg = this.average(arr);
    const squareDiffs = arr.map(v => Math.pow(v - avg, 2));
    return Math.sqrt(this.average(squareDiffs));
  }

  private static percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
  }

  /**
   * Get sample history
   */
  static getSamples(limit?: number): HealthSample[] {
    return limit ? this.samples.slice(-limit) : [...this.samples];
  }

  /**
   * Clear all data
   */
  static reset(): void {
    this.samples = [];
    this.baseline = null;
    this.activeRequests = 0;
    this.recentErrors = 0;
    this.recentLatencies = [];
  }
}

export const healthBaselineModel = HealthBaselineModel;


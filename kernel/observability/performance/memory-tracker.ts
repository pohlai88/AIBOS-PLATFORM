/**
 * Memory Tracker
 * 
 * GRCD Compliance: NF-4 (Memory <512MB baseline)
 * Standard: Performance SLA
 * 
 * Tracks memory usage and detects leaks.
 */

import { createTraceLogger } from "../logger";

const logger = createTraceLogger("memory-tracker");

export interface MemorySnapshot {
  /** Timestamp */
  timestamp: number;
  
  /** Heap used (bytes) */
  heapUsed: number;
  
  /** Heap total (bytes) */
  heapTotal: number;
  
  /** External (bytes) */
  external: number;
  
  /** RSS (Resident Set Size) in bytes */
  rss: number;
}

export interface MemoryLeakReport {
  /** Leak detected? */
  detected: boolean;
  
  /** Growth rate (bytes per minute) */
  growthRate: number;
  
  /** Baseline memory (bytes) */
  baseline: number;
  
  /** Current memory (bytes) */
  current: number;
  
  /** Growth percentage */
  growthPercentage: number;
  
  /** Recommendations */
  recommendations: string[];
}

export class MemoryTracker {
  private snapshots: MemorySnapshot[] = [];
  private baselineMemory: number | null = null;
  private slaTarget: number = 512 * 1024 * 1024; // 512MB default
  private maxSnapshots: number = 100;

  constructor(slaTarget: number = 512 * 1024 * 1024) {
    this.slaTarget = slaTarget;
    this.recordMemoryUsage(); // Record initial baseline
    this.baselineMemory = this.getCurrentMemory();
    logger.info("MemoryTracker initialized", { slaTargetMB: slaTarget / (1024 * 1024) });
  }

  /**
   * Record memory usage
   */
  recordMemoryUsage(): void {
    const usage = process.memoryUsage();
    
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
    };

    this.snapshots.push(snapshot);

    // Keep only last N snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    // Update baseline if this is the first snapshot
    if (this.baselineMemory === null) {
      this.baselineMemory = snapshot.rss;
    }
  }

  /**
   * Get current memory usage
   */
  getCurrentMemory(): number {
    return process.memoryUsage().rss;
  }

  /**
   * Get baseline memory
   */
  getBaselineMemory(): number {
    return this.baselineMemory || this.getCurrentMemory();
  }

  /**
   * Detect memory leaks
   */
  detectMemoryLeaks(): MemoryLeakReport {
    if (this.snapshots.length < 10) {
      return {
        detected: false,
        growthRate: 0,
        baseline: this.getBaselineMemory(),
        current: this.getCurrentMemory(),
        growthPercentage: 0,
        recommendations: ["Insufficient data for leak detection. Record more snapshots."],
      };
    }

    // Calculate growth rate (bytes per minute)
    const recentSnapshots = this.snapshots.slice(-10);
    const oldest = recentSnapshots[0];
    const newest = recentSnapshots[recentSnapshots.length - 1];
    
    const timeDiff = (newest.timestamp - oldest.timestamp) / 1000 / 60; // minutes
    const memoryDiff = newest.rss - oldest.rss;
    const growthRate = timeDiff > 0 ? memoryDiff / timeDiff : 0;

    // Check for significant growth (>10% over baseline)
    const current = this.getCurrentMemory();
    const baseline = this.getBaselineMemory();
    const growthPercentage = ((current - baseline) / baseline) * 100;

    const detected = growthRate > 1024 * 1024 || growthPercentage > 10; // >1MB/min or >10% growth

    const recommendations: string[] = [];
    if (detected) {
      recommendations.push("Memory leak detected. Review object references and event listeners.");
      recommendations.push("Check for unclosed database connections or file handles.");
      recommendations.push("Review caching strategies and memory retention policies.");
    }

    return {
      detected,
      growthRate,
      baseline,
      current,
      growthPercentage: Math.round(growthPercentage * 100) / 100,
      recommendations,
    };
  }

  /**
   * Verify memory SLA
   */
  verifyMemorySLA(): boolean {
    const current = this.getCurrentMemory();
    return current < this.slaTarget;
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): {
    current: number;
    baseline: number;
    peak: number;
    average: number;
    slaTarget: number;
    compliant: boolean;
  } {
    const current = this.getCurrentMemory();
    const baseline = this.getBaselineMemory();
    
    const rssValues = this.snapshots.map((s) => s.rss);
    const peak = rssValues.length > 0 ? Math.max(...rssValues) : current;
    const average = rssValues.length > 0
      ? rssValues.reduce((sum, val) => sum + val, 0) / rssValues.length
      : current;

    return {
      current,
      baseline,
      peak,
      average,
      slaTarget: this.slaTarget,
      compliant: current < this.slaTarget,
    };
  }
}

// Singleton instance
export const memoryTracker = new MemoryTracker();


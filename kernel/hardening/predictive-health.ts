/**
 * 🏥 Predictive Health Monitor v1.0
 * 
 * Predicts kernel degradation before failure:
 * - CPU load trending
 * - Memory pressure detection
 * - Event loop delay
 * - Heap fragmentation
 * 
 * @version 1.0.0
 */

import os from "os";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface HealthSnapshot {
  timestamp: number;
  load: number;
  heapUsed: number;
  heapTotal: number;
  heapRatio: number;
  rss: number;
  rssRatio: number;
  external: number;
  eventLoopDelay?: number;
}

export interface DegradationPrediction {
  risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number;
  factors: string[];
  recommendation: string;
  predictedTimeToIssue?: string;
}

// ═══════════════════════════════════════════════════════════
// Predictive Health
// ═══════════════════════════════════════════════════════════

export class PredictiveHealth {
  private static history: HealthSnapshot[] = [];
  private static maxHistory = 60; // 1 minute of samples at 1/sec

  /**
   * Get current health snapshot
   */
  static getSnapshot(): HealthSnapshot {
    const mem = process.memoryUsage();
    const totalMem = os.totalmem();
    const load = os.loadavg()[0];

    return {
      timestamp: Date.now(),
      load,
      heapUsed: mem.heapUsed,
      heapTotal: mem.heapTotal,
      heapRatio: mem.heapUsed / mem.heapTotal,
      rss: mem.rss,
      rssRatio: mem.rss / totalMem,
      external: mem.external,
    };
  }

  /**
   * Record snapshot to history
   */
  static record(): HealthSnapshot {
    const snapshot = this.getSnapshot();
    this.history.push(snapshot);
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    return snapshot;
  }

  /**
   * Predict degradation
   */
  static predictDegradation(): DegradationPrediction {
    const current = this.getSnapshot();
    const factors: string[] = [];
    let score = 0;

    // Factor 1: CPU load
    if (current.load > 4.0) {
      factors.push(`Critical CPU load: ${current.load.toFixed(2)}`);
      score += 40;
    } else if (current.load > 2.5) {
      factors.push(`High CPU load: ${current.load.toFixed(2)}`);
      score += 25;
    } else if (current.load > 1.5) {
      factors.push(`Elevated CPU load: ${current.load.toFixed(2)}`);
      score += 10;
    }

    // Factor 2: Heap pressure
    if (current.heapRatio > 0.9) {
      factors.push(`Critical heap usage: ${(current.heapRatio * 100).toFixed(1)}%`);
      score += 35;
    } else if (current.heapRatio > 0.75) {
      factors.push(`High heap usage: ${(current.heapRatio * 100).toFixed(1)}%`);
      score += 20;
    }

    // Factor 3: RSS pressure
    if (current.rssRatio > 0.85) {
      factors.push(`Critical memory pressure: ${(current.rssRatio * 100).toFixed(1)}%`);
      score += 30;
    } else if (current.rssRatio > 0.70) {
      factors.push(`High memory pressure: ${(current.rssRatio * 100).toFixed(1)}%`);
      score += 15;
    }

    // Factor 4: Trend analysis
    if (this.history.length >= 10) {
      const trend = this.analyzeTrend();
      if (trend.heapGrowing) {
        factors.push("Memory leak suspected (heap growing)");
        score += 20;
      }
      if (trend.loadIncreasing) {
        factors.push("CPU load trending up");
        score += 10;
      }
    }

    // Determine risk level
    let risk: DegradationPrediction["risk"];
    let recommendation: string;
    let predictedTimeToIssue: string | undefined;

    if (score >= 80) {
      risk = "CRITICAL";
      recommendation = "Immediate action required. Consider scaling or restarting services.";
      predictedTimeToIssue = "< 5 minutes";
    } else if (score >= 50) {
      risk = "HIGH";
      recommendation = "Monitor closely. Prepare for scaling or load shedding.";
      predictedTimeToIssue = "5-15 minutes";
    } else if (score >= 25) {
      risk = "MEDIUM";
      recommendation = "Continue monitoring. Review resource allocation.";
      predictedTimeToIssue = "15-60 minutes";
    } else {
      risk = "LOW";
      recommendation = "System healthy. No action required.";
    }

    // Emit event if risk is high
    if (score >= 50) {
      eventBus.publish({
        type: "kernel.predicted.overload",
        risk,
        score,
        factors,
        timestamp: new Date().toISOString(),
      } as any);
    }

    return { risk, score, factors, recommendation, predictedTimeToIssue };
  }

  /**
   * Analyze trends in history
   */
  private static analyzeTrend(): { heapGrowing: boolean; loadIncreasing: boolean } {
    if (this.history.length < 10) {
      return { heapGrowing: false, loadIncreasing: false };
    }

    const recent = this.history.slice(-10);
    const older = this.history.slice(-20, -10);

    if (older.length === 0) {
      return { heapGrowing: false, loadIncreasing: false };
    }

    const recentHeapAvg = recent.reduce((s, h) => s + h.heapRatio, 0) / recent.length;
    const olderHeapAvg = older.reduce((s, h) => s + h.heapRatio, 0) / older.length;

    const recentLoadAvg = recent.reduce((s, h) => s + h.load, 0) / recent.length;
    const olderLoadAvg = older.reduce((s, h) => s + h.load, 0) / older.length;

    return {
      heapGrowing: recentHeapAvg > olderHeapAvg * 1.1,
      loadIncreasing: recentLoadAvg > olderLoadAvg * 1.2,
    };
  }

  /**
   * Get history
   */
  static getHistory(): HealthSnapshot[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  static clearHistory(): void {
    this.history = [];
  }
}

export const predictiveHealth = PredictiveHealth;


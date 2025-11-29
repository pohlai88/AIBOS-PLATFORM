/**
 * 🔍 Anomaly Detector v1.0
 * 
 * Detects abnormal kernel behavior:
 * - Statistical anomaly detection
 * - Pattern recognition
 * - Trend analysis
 * 
 * @version 1.0.0
 */

import { HealthBaselineModel, type HealthSample, type HealthBaseline } from "./health-baseline";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type AnomalyType = 
  | "cpu_spike"
  | "memory_leak"
  | "heap_pressure"
  | "error_surge"
  | "latency_spike"
  | "request_flood"
  | "resource_exhaustion";

export interface Anomaly {
  id: string;
  type: AnomalyType;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  value: number;
  threshold: number;
  detectedAt: number;
  resolved: boolean;
  resolvedAt?: number;
}

export interface AnomalyReport {
  hasAnomalies: boolean;
  anomalies: Anomaly[];
  overallHealth: "healthy" | "degraded" | "critical";
  recommendation: string;
}

// ═══════════════════════════════════════════════════════════
// Anomaly Detector
// ═══════════════════════════════════════════════════════════

export class AnomalyDetector {
  private static activeAnomalies = new Map<string, Anomaly>();
  private static anomalyHistory: Anomaly[] = [];
  private static readonly MAX_HISTORY = 500;

  /**
   * Run anomaly detection
   */
  static detect(): AnomalyReport {
    const sample = HealthBaselineModel.collectSample();
    const baseline = HealthBaselineModel.getBaseline();
    const anomalies: Anomaly[] = [];

    // CPU spike detection
    const cpuAnomaly = this.detectCpuAnomaly(sample, baseline);
    if (cpuAnomaly) anomalies.push(cpuAnomaly);

    // Memory leak detection
    const memoryAnomaly = this.detectMemoryAnomaly(sample, baseline);
    if (memoryAnomaly) anomalies.push(memoryAnomaly);

    // Heap pressure detection
    const heapAnomaly = this.detectHeapAnomaly(sample, baseline);
    if (heapAnomaly) anomalies.push(heapAnomaly);

    // Error surge detection
    const errorAnomaly = this.detectErrorAnomaly(sample, baseline);
    if (errorAnomaly) anomalies.push(errorAnomaly);

    // Latency spike detection
    const latencyAnomaly = this.detectLatencyAnomaly(sample, baseline);
    if (latencyAnomaly) anomalies.push(latencyAnomaly);

    // Update active anomalies
    this.updateActiveAnomalies(anomalies);

    // Determine overall health
    const overallHealth = this.calculateOverallHealth(anomalies);
    const recommendation = this.generateRecommendation(anomalies, overallHealth);

    // Emit events for new anomalies
    for (const anomaly of anomalies) {
      if (!this.activeAnomalies.has(anomaly.id)) {
        eventBus.publish({
          type: "watchdog.anomaly.detected",
          anomaly,
          timestamp: new Date().toISOString(),
        } as any);
      }
    }

    return {
      hasAnomalies: anomalies.length > 0,
      anomalies,
      overallHealth,
      recommendation,
    };
  }

  private static detectCpuAnomaly(sample: HealthSample, baseline: HealthBaseline | null): Anomaly | null {
    const threshold = baseline 
      ? baseline.cpuLoadAvg + 3 * baseline.cpuLoadStdDev 
      : 4.0;

    if (sample.cpuLoad > threshold) {
      const severity = sample.cpuLoad > threshold * 1.5 ? "critical" 
        : sample.cpuLoad > threshold * 1.2 ? "high" 
        : "medium";

      return {
        id: "cpu_spike",
        type: "cpu_spike",
        severity,
        description: `CPU load ${sample.cpuLoad.toFixed(2)} exceeds threshold ${threshold.toFixed(2)}`,
        value: sample.cpuLoad,
        threshold,
        detectedAt: Date.now(),
        resolved: false,
      };
    }
    return null;
  }

  private static detectMemoryAnomaly(sample: HealthSample, baseline: HealthBaseline | null): Anomaly | null {
    const threshold = baseline 
      ? baseline.memoryAvg + 3 * baseline.memoryStdDev 
      : 1024; // 1GB default

    if (sample.memoryUsedMB > threshold) {
      const severity = sample.memoryUsedMB > threshold * 1.3 ? "critical" 
        : sample.memoryUsedMB > threshold * 1.15 ? "high" 
        : "medium";

      return {
        id: "memory_leak",
        type: "memory_leak",
        severity,
        description: `Memory ${sample.memoryUsedMB.toFixed(0)}MB exceeds threshold ${threshold.toFixed(0)}MB`,
        value: sample.memoryUsedMB,
        threshold,
        detectedAt: Date.now(),
        resolved: false,
      };
    }
    return null;
  }

  private static detectHeapAnomaly(sample: HealthSample, baseline: HealthBaseline | null): Anomaly | null {
    const threshold = baseline ? Math.min(baseline.heapRatioAvg * 1.5, 0.9) : 0.85;

    if (sample.heapRatio > threshold) {
      const severity = sample.heapRatio > 0.95 ? "critical" 
        : sample.heapRatio > 0.9 ? "high" 
        : "medium";

      return {
        id: "heap_pressure",
        type: "heap_pressure",
        severity,
        description: `Heap ratio ${(sample.heapRatio * 100).toFixed(1)}% exceeds threshold ${(threshold * 100).toFixed(1)}%`,
        value: sample.heapRatio,
        threshold,
        detectedAt: Date.now(),
        resolved: false,
      };
    }
    return null;
  }

  private static detectErrorAnomaly(sample: HealthSample, baseline: HealthBaseline | null): Anomaly | null {
    const threshold = baseline ? Math.max(baseline.errorRateAvg * 3, 0.1) : 0.1;

    if (sample.errorRate > threshold) {
      const severity = sample.errorRate > 0.5 ? "critical" 
        : sample.errorRate > 0.25 ? "high" 
        : "medium";

      return {
        id: "error_surge",
        type: "error_surge",
        severity,
        description: `Error rate ${(sample.errorRate * 100).toFixed(1)}% exceeds threshold ${(threshold * 100).toFixed(1)}%`,
        value: sample.errorRate,
        threshold,
        detectedAt: Date.now(),
        resolved: false,
      };
    }
    return null;
  }

  private static detectLatencyAnomaly(sample: HealthSample, baseline: HealthBaseline | null): Anomaly | null {
    if (sample.avgLatencyMs === 0) return null;

    const threshold = baseline && baseline.latencyP95 > 0 
      ? baseline.latencyP95 * 2 
      : 1000;

    if (sample.avgLatencyMs > threshold) {
      const severity = sample.avgLatencyMs > threshold * 2 ? "critical" 
        : sample.avgLatencyMs > threshold * 1.5 ? "high" 
        : "medium";

      return {
        id: "latency_spike",
        type: "latency_spike",
        severity,
        description: `Latency ${sample.avgLatencyMs.toFixed(0)}ms exceeds threshold ${threshold.toFixed(0)}ms`,
        value: sample.avgLatencyMs,
        threshold,
        detectedAt: Date.now(),
        resolved: false,
      };
    }
    return null;
  }

  private static updateActiveAnomalies(currentAnomalies: Anomaly[]): void {
    const currentIds = new Set(currentAnomalies.map(a => a.id));

    // Mark resolved anomalies
    for (const [id, anomaly] of this.activeAnomalies) {
      if (!currentIds.has(id)) {
        anomaly.resolved = true;
        anomaly.resolvedAt = Date.now();
        this.anomalyHistory.push(anomaly);
        this.activeAnomalies.delete(id);

        eventBus.publish({
          type: "watchdog.anomaly.resolved",
          anomalyId: id,
          timestamp: new Date().toISOString(),
        } as any);
      }
    }

    // Add new anomalies
    for (const anomaly of currentAnomalies) {
      this.activeAnomalies.set(anomaly.id, anomaly);
    }

    // Trim history
    if (this.anomalyHistory.length > this.MAX_HISTORY) {
      this.anomalyHistory = this.anomalyHistory.slice(-this.MAX_HISTORY);
    }
  }

  private static calculateOverallHealth(anomalies: Anomaly[]): "healthy" | "degraded" | "critical" {
    if (anomalies.length === 0) return "healthy";
    
    const hasCritical = anomalies.some(a => a.severity === "critical");
    const hasHigh = anomalies.some(a => a.severity === "high");

    if (hasCritical) return "critical";
    if (hasHigh || anomalies.length >= 3) return "degraded";
    return "degraded";
  }

  private static generateRecommendation(anomalies: Anomaly[], health: string): string {
    if (health === "healthy") {
      return "System operating normally. No action required.";
    }

    if (health === "critical") {
      return "CRITICAL: Immediate attention required. Consider scaling resources or restarting affected services.";
    }

    const types = anomalies.map(a => a.type);
    const recommendations: string[] = [];

    if (types.includes("cpu_spike")) {
      recommendations.push("Review CPU-intensive operations");
    }
    if (types.includes("memory_leak")) {
      recommendations.push("Check for memory leaks, consider restart");
    }
    if (types.includes("heap_pressure")) {
      recommendations.push("Increase heap size or optimize memory usage");
    }
    if (types.includes("error_surge")) {
      recommendations.push("Investigate error sources, check dependencies");
    }
    if (types.includes("latency_spike")) {
      recommendations.push("Check database/network latency, optimize queries");
    }

    return recommendations.join(". ") || "Monitor closely and investigate if issues persist.";
  }

  /**
   * Get active anomalies
   */
  static getActiveAnomalies(): Anomaly[] {
    return Array.from(this.activeAnomalies.values());
  }

  /**
   * Get anomaly history
   */
  static getHistory(limit?: number): Anomaly[] {
    return limit ? this.anomalyHistory.slice(-limit) : [...this.anomalyHistory];
  }

  /**
   * Clear all data
   */
  static reset(): void {
    this.activeAnomalies.clear();
    this.anomalyHistory = [];
  }
}

export const anomalyDetector = AnomalyDetector;


/**
 * 🐕 Watchdog Daemon v1.0
 * 
 * Main watchdog orchestrator:
 * - Continuous health monitoring
 * - Anomaly detection loop
 * - Auto-tuning cycle
 * - Self-healing triggers
 * 
 * @version 1.0.0
 */

import { HealthBaselineModel, type HealthBaseline } from "./health-baseline";
import { AnomalyDetector, type AnomalyReport } from "./anomaly-detector";
import { AutoTuner, type TunableParameters } from "./auto-tuner";
import { SelfHealer } from "./self-healer";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface WatchdogStatus {
  running: boolean;
  health: "healthy" | "degraded" | "critical";
  uptime: number;
  lastCheck: number;
  checksPerformed: number;
  anomaliesDetected: number;
  healingAttempts: number;
  tuningActions: number;
}

export interface WatchdogConfig {
  checkIntervalMs: number;
  enableAutoTuning: boolean;
  enableSelfHealing: boolean;
  enableAnomalyDetection: boolean;
}

// ═══════════════════════════════════════════════════════════
// Watchdog Daemon
// ═══════════════════════════════════════════════════════════

export class WatchdogDaemon {
  private static interval: NodeJS.Timeout | null = null;
  private static startTime: number = 0;
  private static checksPerformed = 0;
  private static anomaliesDetected = 0;
  private static healingAttempts = 0;
  private static tuningActions = 0;
  private static lastCheck = 0;
  private static lastReport: AnomalyReport | null = null;

  private static config: WatchdogConfig = {
    checkIntervalMs: 10000,
    enableAutoTuning: true,
    enableSelfHealing: true,
    enableAnomalyDetection: true,
  };

  /**
   * Start the watchdog daemon
   */
  static start(config?: Partial<WatchdogConfig>): void {
    if (this.interval) {
      console.warn("Watchdog already running");
      return;
    }

    this.config = { ...this.config, ...config };
    this.startTime = Date.now();

    // Initial baseline collection
    for (let i = 0; i < 5; i++) {
      HealthBaselineModel.collectSample();
    }

    // Start monitoring loop
    this.interval = setInterval(() => {
      this.runCycle();
    }, this.config.checkIntervalMs);

    eventBus.publish({
      type: "watchdog.started",
      config: this.config,
      timestamp: new Date().toISOString(),
    } as any);

    console.log("🐕 Watchdog Daemon started");
  }

  /**
   * Stop the watchdog daemon
   */
  static stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;

      eventBus.publish({
        type: "watchdog.stopped",
        uptime: Date.now() - this.startTime,
        checksPerformed: this.checksPerformed,
        timestamp: new Date().toISOString(),
      } as any);

      console.log("🐕 Watchdog Daemon stopped");
    }
  }

  /**
   * Run a single monitoring cycle
   */
  static runCycle(): void {
    this.checksPerformed++;
    this.lastCheck = Date.now();

    try {
      // 1. Collect health sample
      HealthBaselineModel.collectSample();

      // 2. Detect anomalies
      if (this.config.enableAnomalyDetection) {
        this.lastReport = AnomalyDetector.detect();
        this.anomaliesDetected += this.lastReport.anomalies.length;
      }

      // 3. Auto-tune if needed
      if (this.config.enableAutoTuning && this.lastReport) {
        const actions = AutoTuner.tune();
        this.tuningActions += actions.length;
      }

      // 4. Self-heal if needed
      if (this.config.enableSelfHealing && this.lastReport?.hasAnomalies) {
        const attempts = SelfHealer.heal();
        this.healingAttempts += attempts.length;
      }

      // 5. Reset error tracking periodically
      if (this.checksPerformed % 6 === 0) {
        HealthBaselineModel.resetErrorTracking();
      }

    } catch (error: any) {
      console.error("Watchdog cycle error:", error.message);
      eventBus.publish({
        type: "watchdog.error",
        error: error.message,
        timestamp: new Date().toISOString(),
      } as any);
    }
  }

  /**
   * Get current status
   */
  static getStatus(): WatchdogStatus {
    return {
      running: this.interval !== null,
      health: this.lastReport?.overallHealth || "healthy",
      uptime: this.interval ? Date.now() - this.startTime : 0,
      lastCheck: this.lastCheck,
      checksPerformed: this.checksPerformed,
      anomaliesDetected: this.anomaliesDetected,
      healingAttempts: this.healingAttempts,
      tuningActions: this.tuningActions,
    };
  }

  /**
   * Get comprehensive diagnostics
   */
  static getDiagnostics(): Record<string, any> {
    return {
      status: this.getStatus(),
      config: this.config,
      baseline: HealthBaselineModel.getBaseline(),
      latestSample: HealthBaselineModel.getLatestSample(),
      activeAnomalies: AnomalyDetector.getActiveAnomalies(),
      lastReport: this.lastReport,
      parameters: AutoTuner.getParameters(),
      healingSuccessRate: SelfHealer.getSuccessRate(),
      recentHealing: SelfHealer.getHistory(10),
      recentTuning: AutoTuner.getHistory(10),
    };
  }

  /**
   * Update configuration
   */
  static configure(config: Partial<WatchdogConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart with new interval if running
    if (this.interval && config.checkIntervalMs) {
      this.stop();
      this.start(this.config);
    }
  }

  /**
   * Check if running
   */
  static isRunning(): boolean {
    return this.interval !== null;
  }

  /**
   * Get last anomaly report
   */
  static getLastReport(): AnomalyReport | null {
    return this.lastReport;
  }

  /**
   * Force a check cycle
   */
  static forceCheck(): AnomalyReport | null {
    this.runCycle();
    return this.lastReport;
  }

  /**
   * Reset all statistics
   */
  static resetStats(): void {
    this.checksPerformed = 0;
    this.anomaliesDetected = 0;
    this.healingAttempts = 0;
    this.tuningActions = 0;
    HealthBaselineModel.reset();
    AnomalyDetector.reset();
    AutoTuner.reset();
    SelfHealer.reset();
  }
}

export const watchdogDaemon = WatchdogDaemon;


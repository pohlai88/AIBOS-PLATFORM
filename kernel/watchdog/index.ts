/**
 * 🐕 AI-BOS Watchdog Module v1.0
 * 
 * Self-learning kernel health system:
 * - Health baseline modeling
 * - Anomaly detection
 * - Auto-tuning
 * - Self-healing
 * - Continuous monitoring
 * 
 * @module @aibos/kernel/watchdog
 * @version 1.0.0
 */

// Health Baseline
export { HealthBaselineModel, healthBaselineModel } from "./health-baseline";
export type { HealthSample, HealthBaseline } from "./health-baseline";

// Anomaly Detector
export { AnomalyDetector, anomalyDetector } from "./anomaly-detector";
export type { AnomalyType, Anomaly, AnomalyReport } from "./anomaly-detector";

// Auto-Tuner
export { AutoTuner, autoTuner } from "./auto-tuner";
export type { TunableParameters, TuningAction } from "./auto-tuner";

// Self-Healer
export { SelfHealer, selfHealer } from "./self-healer";
export type { HealingAction, HealingAttempt, HealingPolicy } from "./self-healer";

// Watchdog Daemon
export { WatchdogDaemon, watchdogDaemon } from "./watchdog-daemon";
export type { WatchdogStatus, WatchdogConfig } from "./watchdog-daemon";


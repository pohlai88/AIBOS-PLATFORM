/**
 * 🧠 Conscious Loop v1.0
 * 
 * The Kernel's brain - orchestrates all AI optimization:
 * - Pattern learning
 * - Autonomous tuning
 * - Self-healing
 * - Conscious routing
 * 
 * @version 1.0.0
 */

import { PatternRecognitionEngine } from "./pattern-engine";
import { AutonomousTuner } from "./autonomous-tuner";
import { ConsciousRouter, type RoutingDecision } from "./conscious-router";
import { SelfHealingEngine, type HealthIndicators } from "./self-healer";
import { ResourceThrottler } from "../performance/resource-throttler";
import { ExecutionPool } from "../performance/execution-pool";
import { eventBus } from "../events/event-bus";
import { baseLogger } from "../observability/logger";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface ConsciousState {
  isRunning: boolean;
  cycleCount: number;
  lastCycleTime: number;
  healthIndicators: HealthIndicators;
  tuningActions: number;
  healingActions: number;
}

// ═══════════════════════════════════════════════════════════
// Conscious Loop
// ═══════════════════════════════════════════════════════════

export class ConsciousLoop {
  private static isRunning = false;
  private static cycleCount = 0;
  private static lastCycleTime = 0;
  private static loopInterval: NodeJS.Timeout | null = null;
  private static readonly CYCLE_INTERVAL_MS = 10000;

  /**
   * Start the conscious loop
   */
  static start(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    // Start sub-systems
    AutonomousTuner.start();
    ResourceThrottler.startMonitoring();

    // Main loop
    this.loopInterval = setInterval(() => {
      this.cycle();
    }, this.CYCLE_INTERVAL_MS);

    baseLogger.info("🧠 Conscious Loop activated — Kernel is now self-aware");

    eventBus.publish({
      type: "conscious.started",
      timestamp: new Date().toISOString(),
    } as any);
  }

  /**
   * Stop the conscious loop
   */
  static stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.loopInterval) {
      clearInterval(this.loopInterval);
      this.loopInterval = null;
    }

    AutonomousTuner.stop();
    ResourceThrottler.stopMonitoring();

    baseLogger.info("🧠 Conscious Loop deactivated");

    eventBus.publish({
      type: "conscious.stopped",
      timestamp: new Date().toISOString(),
    } as any);
  }

  /**
   * Perform a conscious cycle
   */
  private static cycle(): void {
    this.cycleCount++;
    this.lastCycleTime = Date.now();

    // Gather health indicators
    const indicators = this.gatherHealthIndicators();

    // Self-healing assessment
    const healingEvents = SelfHealingEngine.assess(indicators);

    // Log cycle if significant
    if (healingEvents.length > 0 || this.cycleCount % 6 === 0) {
      eventBus.publish({
        type: "conscious.cycle",
        cycleCount: this.cycleCount,
        indicators,
        healingActions: healingEvents.length,
        timestamp: new Date().toISOString(),
      } as any);
    }
  }

  /**
   * Record an execution (call from pipeline)
   */
  static record(context: string, durationMs: number, success: boolean = true): void {
    PatternRecognitionEngine.record(context, durationMs, success);
  }

  /**
   * Get routing decision (call from pipeline)
   */
  static route(context: string, tenantId: string, riskScore?: number): RoutingDecision {
    return ConsciousRouter.route({ context, tenantId, riskScore });
  }

  /**
   * Get current state
   */
  static getState(): ConsciousState {
    return {
      isRunning: this.isRunning,
      cycleCount: this.cycleCount,
      lastCycleTime: this.lastCycleTime,
      healthIndicators: this.gatherHealthIndicators(),
      tuningActions: AutonomousTuner.getHistory().length,
      healingActions: SelfHealingEngine.getStats().totalHeals,
    };
  }

  /**
   * Get insights
   */
  static getInsights(): {
    patterns: ReturnType<typeof PatternRecognitionEngine.generateInsights>;
    fastPaths: string[];
    tuningHistory: ReturnType<typeof AutonomousTuner.getHistory>;
    healingHistory: ReturnType<typeof SelfHealingEngine.getHistory>;
  } {
    return {
      patterns: PatternRecognitionEngine.generateInsights(),
      fastPaths: AutonomousTuner.getFastPaths(),
      tuningHistory: AutonomousTuner.getHistory(20),
      healingHistory: SelfHealingEngine.getHistory(20),
    };
  }

  /**
   * Gather health indicators
   */
  private static gatherHealthIndicators(): HealthIndicators {
    const resourceState = ResourceThrottler.getState();
    const poolStats = ExecutionPool.getStats();
    const errorPatterns = PatternRecognitionEngine.getErrorPronePatterns(0.2);

    // Calculate error rate from patterns
    const allPatterns = PatternRecognitionEngine.getTopPatterns(100);
    const totalErrors = allPatterns.reduce((sum, p) => sum + p.errorCount, 0);
    const totalCalls = allPatterns.reduce((sum, p) => sum + p.count, 0);
    const errorRate = totalCalls > 0 ? totalErrors / totalCalls : 0;

    // Simple risk score calculation
    let riskScore = 0;
    riskScore += resourceState.cpuPercent * 0.3;
    riskScore += resourceState.memoryPercent * 0.3;
    riskScore += errorRate * 100 * 0.2;
    riskScore += Math.min(50, poolStats.queuedTasks) * 0.2;

    return {
      riskScore: Math.min(100, riskScore),
      errorRate,
      memoryPressure: resourceState.pressure === "high" || resourceState.pressure === "critical",
      queueBacklog: poolStats.queuedTasks > 50,
      anomalyDetected: errorPatterns.length > 3,
    };
  }
}

export const consciousLoop = ConsciousLoop;


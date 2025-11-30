/**
 * 🎯 Autonomous Tuner v1.0
 * 
 * Self-adjusting kernel parameters:
 * - Auto-optimize hot paths
 * - Dynamic rate limits
 * - Adaptive caching
 * - Resource balancing
 * 
 * @version 1.0.0
 */

import { PatternRecognitionEngine } from "./pattern-engine";
import { CacheManager } from "../performance/cache-manager";
import { ExecutionPool } from "../performance/execution-pool";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface TuningAction {
  type: "cache" | "rate_limit" | "concurrency" | "fast_path" | "throttle";
  target: string;
  oldValue: any;
  newValue: any;
  reason: string;
  timestamp: number;
}

export interface TunerConfig {
  enabled: boolean;
  tuneIntervalMs: number;
  hotPathThreshold: number;
  cacheHitRateTarget: number;
  maxConcurrencyAdjustment: number;
}

// ═══════════════════════════════════════════════════════════
// Autonomous Tuner
// ═══════════════════════════════════════════════════════════

export class AutonomousTuner {
  private static config: TunerConfig = {
    enabled: true,
    tuneIntervalMs: 30000,
    hotPathThreshold: 50,
    cacheHitRateTarget: 0.8,
    maxConcurrencyAdjustment: 5,
  };

  private static fastPaths = new Set<string>();
  private static tuningHistory: TuningAction[] = [];
  private static tuneInterval: NodeJS.Timeout | null = null;
  private static readonly MAX_HISTORY = 100;

  /**
   * Start autonomous tuning
   */
  static start(): void {
    if (this.tuneInterval) return;

    this.tuneInterval = setInterval(() => {
      if (this.config.enabled) {
        this.tune();
      }
    }, this.config.tuneIntervalMs);

    console.log("🎯 Autonomous Tuner started");
  }

  /**
   * Stop tuning
   */
  static stop(): void {
    if (this.tuneInterval) {
      clearInterval(this.tuneInterval);
      this.tuneInterval = null;
    }
  }

  /**
   * Perform a tuning cycle
   */
  static tune(): TuningAction[] {
    const actions: TuningAction[] = [];

    // 1. Optimize hot paths
    actions.push(...this.optimizeHotPaths());

    // 2. Adjust cache strategy
    actions.push(...this.adjustCaching());

    // 3. Balance concurrency
    actions.push(...this.balanceConcurrency());

    // 4. Apply pattern decay
    PatternRecognitionEngine.applyDecay();

    // Record actions
    for (const action of actions) {
      this.recordAction(action);
    }

    if (actions.length > 0) {
      eventBus.publish({
        type: "tuner.cycle.complete",
        actionsCount: actions.length,
        actions: actions.map(a => ({ type: a.type, target: a.target })),
        timestamp: new Date().toISOString(),
      } as any);
    }

    return actions;
  }

  /**
   * Optimize hot paths
   */
  private static optimizeHotPaths(): TuningAction[] {
    const actions: TuningAction[] = [];
    const hotPatterns = PatternRecognitionEngine.getHotPatterns(10);

    for (const pattern of hotPatterns) {
      if (pattern.count >= this.config.hotPathThreshold && !this.fastPaths.has(pattern.context)) {
        this.fastPaths.add(pattern.context);
        
        actions.push({
          type: "fast_path",
          target: pattern.context,
          oldValue: false,
          newValue: true,
          reason: `High frequency (${pattern.count} calls)`,
          timestamp: Date.now(),
        });
      }
    }

    // Remove cold fast paths
    for (const path of this.fastPaths) {
      const pattern = PatternRecognitionEngine.getPattern(path);
      if (!pattern || pattern.count < this.config.hotPathThreshold / 2) {
        this.fastPaths.delete(path);
        
        actions.push({
          type: "fast_path",
          target: path,
          oldValue: true,
          newValue: false,
          reason: "Usage declined",
          timestamp: Date.now(),
        });
      }
    }

    return actions;
  }

  /**
   * Adjust caching strategy
   */
  private static adjustCaching(): TuningAction[] {
    const actions: TuningAction[] = [];
    const stats = CacheManager.getStats();

    // Check global cache hit rate
    if (stats.global.hitRate < this.config.cacheHitRateTarget && stats.global.entries > 100) {
      // Suggest more aggressive caching for slow patterns
      const slowPatterns = PatternRecognitionEngine.getSlowPatterns(200);
      
      for (const pattern of slowPatterns.slice(0, 3)) {
        if (!CacheManager.has(`auto_cache:${pattern.context}`)) {
          actions.push({
            type: "cache",
            target: pattern.context,
            oldValue: null,
            newValue: "enabled",
            reason: `Slow pattern (${pattern.avgDurationMs.toFixed(0)}ms avg)`,
            timestamp: Date.now(),
          });
        }
      }
    }

    return actions;
  }

  /**
   * Balance concurrency
   */
  private static balanceConcurrency(): TuningAction[] {
    const actions: TuningAction[] = [];
    const poolStats = ExecutionPool.getStats();

    // If queue is consistently long, increase concurrency
    if (poolStats.queuedTasks > 20 && poolStats.avgDurationMs < 100) {
      const oldMax = 10; // Would need getter
      const newMax = Math.min(20, oldMax + this.config.maxConcurrencyAdjustment);
      
      ExecutionPool.setMaxConcurrent(newMax);
      
      actions.push({
        type: "concurrency",
        target: "execution_pool",
        oldValue: oldMax,
        newValue: newMax,
        reason: `High queue depth (${poolStats.queuedTasks})`,
        timestamp: Date.now(),
      });
    }

    return actions;
  }

  /**
   * Check if path is fast
   */
  static isFastPath(context: string): boolean {
    return this.fastPaths.has(context);
  }

  /**
   * Get fast paths
   */
  static getFastPaths(): string[] {
    return Array.from(this.fastPaths);
  }

  /**
   * Get tuning history
   */
  static getHistory(limit?: number): TuningAction[] {
    return limit ? this.tuningHistory.slice(-limit) : [...this.tuningHistory];
  }

  /**
   * Configure tuner
   */
  static configure(config: Partial<TunerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get config
   */
  static getConfig(): TunerConfig {
    return { ...this.config };
  }

  private static recordAction(action: TuningAction): void {
    this.tuningHistory.push(action);
    if (this.tuningHistory.length > this.MAX_HISTORY) {
      this.tuningHistory.shift();
    }
  }
}

export const autonomousTuner = AutonomousTuner;


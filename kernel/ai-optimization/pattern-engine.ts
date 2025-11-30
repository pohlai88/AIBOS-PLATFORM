/**
 * 🧠 Pattern Recognition Engine v1.0
 * 
 * ML-inspired pattern detection:
 * - Frequency analysis
 * - Temporal patterns
 * - Anomaly detection
 * - Trend prediction
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface PatternEntry {
  context: string;
  count: number;
  totalDurationMs: number;
  avgDurationMs: number;
  lastSeen: number;
  errorCount: number;
  successRate: number;
  trend: "rising" | "stable" | "falling";
  hourlyDistribution: number[];
}

export interface PatternInsight {
  pattern: string;
  type: "hot_path" | "error_prone" | "slow" | "bursty" | "declining";
  confidence: number;
  recommendation: string;
}

// ═══════════════════════════════════════════════════════════
// Pattern Recognition Engine
// ═══════════════════════════════════════════════════════════

export class PatternRecognitionEngine {
  private static patterns = new Map<string, PatternEntry>();
  private static readonly DECAY_FACTOR = 0.95;
  private static readonly MAX_PATTERNS = 1000;

  /**
   * Record an execution pattern
   */
  static record(
    context: string,
    durationMs: number,
    success: boolean = true
  ): void {
    let entry = this.patterns.get(context);
    const hour = new Date().getHours();

    if (!entry) {
      entry = {
        context,
        count: 0,
        totalDurationMs: 0,
        avgDurationMs: 0,
        lastSeen: 0,
        errorCount: 0,
        successRate: 1,
        trend: "stable",
        hourlyDistribution: new Array(24).fill(0),
      };
      this.patterns.set(context, entry);
    }

    // Update metrics
    entry.count++;
    entry.totalDurationMs += durationMs;
    entry.avgDurationMs = entry.totalDurationMs / entry.count;
    entry.lastSeen = Date.now();
    entry.hourlyDistribution[hour]++;

    if (!success) {
      entry.errorCount++;
    }
    entry.successRate = 1 - entry.errorCount / entry.count;

    // Calculate trend
    entry.trend = this.calculateTrend(entry);

    // Enforce max patterns
    if (this.patterns.size > this.MAX_PATTERNS) {
      this.evictColdPatterns();
    }
  }

  /**
   * Get top patterns by frequency
   */
  static getTopPatterns(limit: number = 20): PatternEntry[] {
    return Array.from(this.patterns.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get hot patterns (frequent + recent)
   */
  static getHotPatterns(limit: number = 10): PatternEntry[] {
    const now = Date.now();
    const hourMs = 3600000;

    return Array.from(this.patterns.values())
      .map(p => ({
        ...p,
        hotness: p.count * Math.exp(-(now - p.lastSeen) / hourMs),
      }))
      .sort((a, b) => b.hotness - a.hotness)
      .slice(0, limit);
  }

  /**
   * Get error-prone patterns
   */
  static getErrorPronePatterns(threshold: number = 0.1): PatternEntry[] {
    return Array.from(this.patterns.values())
      .filter(p => p.count > 10 && (1 - p.successRate) > threshold)
      .sort((a, b) => b.errorCount - a.errorCount);
  }

  /**
   * Get slow patterns
   */
  static getSlowPatterns(thresholdMs: number = 500): PatternEntry[] {
    return Array.from(this.patterns.values())
      .filter(p => p.avgDurationMs > thresholdMs)
      .sort((a, b) => b.avgDurationMs - a.avgDurationMs);
  }

  /**
   * Generate insights from patterns
   */
  static generateInsights(): PatternInsight[] {
    const insights: PatternInsight[] = [];

    // Hot paths
    for (const pattern of this.getHotPatterns(5)) {
      insights.push({
        pattern: pattern.context,
        type: "hot_path",
        confidence: Math.min(0.95, pattern.count / 100),
        recommendation: `Consider caching results for "${pattern.context}"`,
      });
    }

    // Error-prone
    for (const pattern of this.getErrorPronePatterns()) {
      insights.push({
        pattern: pattern.context,
        type: "error_prone",
        confidence: 1 - pattern.successRate,
        recommendation: `Investigate errors in "${pattern.context}" (${(pattern.errorCount)} failures)`,
      });
    }

    // Slow patterns
    for (const pattern of this.getSlowPatterns()) {
      insights.push({
        pattern: pattern.context,
        type: "slow",
        confidence: Math.min(0.9, pattern.avgDurationMs / 1000),
        recommendation: `Optimize "${pattern.context}" (avg: ${pattern.avgDurationMs.toFixed(0)}ms)`,
      });
    }

    // Declining patterns
    const declining = Array.from(this.patterns.values())
      .filter(p => p.trend === "falling" && p.count > 50);
    
    for (const pattern of declining) {
      insights.push({
        pattern: pattern.context,
        type: "declining",
        confidence: 0.7,
        recommendation: `Usage of "${pattern.context}" is declining - consider deprecation`,
      });
    }

    return insights.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Predict next hour's load
   */
  static predictLoad(context: string): number {
    const entry = this.patterns.get(context);
    if (!entry) return 0;

    const nextHour = (new Date().getHours() + 1) % 24;
    const hourlyAvg = entry.hourlyDistribution[nextHour];
    const totalAvg = entry.count / 24;

    return hourlyAvg > 0 ? hourlyAvg : totalAvg;
  }

  /**
   * Get pattern entry
   */
  static getPattern(context: string): PatternEntry | undefined {
    return this.patterns.get(context);
  }

  /**
   * Apply decay to all patterns (call periodically)
   */
  static applyDecay(): void {
    for (const entry of this.patterns.values()) {
      entry.count = Math.floor(entry.count * this.DECAY_FACTOR);
      entry.errorCount = Math.floor(entry.errorCount * this.DECAY_FACTOR);
    }
  }

  /**
   * Clear patterns
   */
  static clear(): void {
    this.patterns.clear();
  }

  private static calculateTrend(entry: PatternEntry): PatternEntry["trend"] {
    const recentHours = entry.hourlyDistribution.slice(-6);
    const olderHours = entry.hourlyDistribution.slice(0, 6);

    const recentAvg = recentHours.reduce((a, b) => a + b, 0) / 6;
    const olderAvg = olderHours.reduce((a, b) => a + b, 0) / 6;

    if (recentAvg > olderAvg * 1.2) return "rising";
    if (recentAvg < olderAvg * 0.8) return "falling";
    return "stable";
  }

  private static evictColdPatterns(): void {
    const sorted = Array.from(this.patterns.entries())
      .sort((a, b) => a[1].lastSeen - b[1].lastSeen);

    // Remove oldest 10%
    const toRemove = Math.floor(sorted.length * 0.1);
    for (let i = 0; i < toRemove; i++) {
      this.patterns.delete(sorted[i][0]);
    }
  }
}

export const patternRecognitionEngine = PatternRecognitionEngine;


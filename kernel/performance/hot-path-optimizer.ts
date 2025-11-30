/**
 * 🔥 Hot Path Optimizer v1.0
 * 
 * Identifies and optimizes frequently executed code paths:
 * - Call frequency tracking
 * - Latency profiling
 * - Optimization suggestions
 * 
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface PathProfile {
  path: string;
  calls: number;
  totalMs: number;
  avgMs: number;
  minMs: number;
  maxMs: number;
  p95Ms: number;
  lastCalled: number;
  hotness: number; // 0-100
}

export interface OptimizationSuggestion {
  path: string;
  type: "cache" | "parallelize" | "debounce" | "batch" | "precompute";
  reason: string;
  impact: "low" | "medium" | "high";
}

// ═══════════════════════════════════════════════════════════
// Hot Path Optimizer
// ═══════════════════════════════════════════════════════════

export class HotPathOptimizer {
  private static profiles = new Map<string, { calls: number; durations: number[]; lastCalled: number }>();
  private static readonly MAX_SAMPLES = 100;

  /**
   * Record a path execution
   */
  static record(path: string, durationMs: number): void {
    let profile = this.profiles.get(path);
    
    if (!profile) {
      profile = { calls: 0, durations: [], lastCalled: 0 };
      this.profiles.set(path, profile);
    }

    profile.calls++;
    profile.lastCalled = Date.now();
    profile.durations.push(durationMs);

    // Keep only recent samples
    if (profile.durations.length > this.MAX_SAMPLES) {
      profile.durations.shift();
    }
  }

  /**
   * Wrap a function with profiling
   */
  static profile<T extends (...args: any[]) => any>(
    path: string,
    fn: T
  ): T {
    return ((...args: Parameters<T>): ReturnType<T> => {
      const start = performance.now();
      try {
        const result = fn(...args);
        
        // Handle promises
        if (result instanceof Promise) {
          return result.finally(() => {
            this.record(path, performance.now() - start);
          }) as ReturnType<T>;
        }
        
        this.record(path, performance.now() - start);
        return result;
      } catch (error) {
        this.record(path, performance.now() - start);
        throw error;
      }
    }) as T;
  }

  /**
   * Get profile for a path
   */
  static getProfile(path: string): PathProfile | null {
    const data = this.profiles.get(path);
    if (!data || data.durations.length === 0) return null;

    const sorted = [...data.durations].sort((a, b) => a - b);
    const total = sorted.reduce((a, b) => a + b, 0);
    const p95Index = Math.floor(sorted.length * 0.95);

    // Calculate hotness based on frequency and recency
    const recencyFactor = Math.max(0, 1 - (Date.now() - data.lastCalled) / 3600000);
    const frequencyFactor = Math.min(1, data.calls / 1000);
    const hotness = Math.round((recencyFactor * 0.4 + frequencyFactor * 0.6) * 100);

    return {
      path,
      calls: data.calls,
      totalMs: total,
      avgMs: total / sorted.length,
      minMs: sorted[0],
      maxMs: sorted[sorted.length - 1],
      p95Ms: sorted[p95Index] || sorted[sorted.length - 1],
      lastCalled: data.lastCalled,
      hotness,
    };
  }

  /**
   * Get all hot paths (sorted by hotness)
   */
  static getHotPaths(limit: number = 20): PathProfile[] {
    const profiles: PathProfile[] = [];

    for (const path of this.profiles.keys()) {
      const profile = this.getProfile(path);
      if (profile) profiles.push(profile);
    }

    return profiles
      .sort((a, b) => b.hotness - a.hotness)
      .slice(0, limit);
  }

  /**
   * Get slow paths (sorted by p95)
   */
  static getSlowPaths(thresholdMs: number = 100, limit: number = 20): PathProfile[] {
    const profiles: PathProfile[] = [];

    for (const path of this.profiles.keys()) {
      const profile = this.getProfile(path);
      if (profile && profile.p95Ms > thresholdMs) {
        profiles.push(profile);
      }
    }

    return profiles
      .sort((a, b) => b.p95Ms - a.p95Ms)
      .slice(0, limit);
  }

  /**
   * Generate optimization suggestions
   */
  static getSuggestions(): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];
    const hotPaths = this.getHotPaths(50);

    for (const profile of hotPaths) {
      // High frequency + stable output = cache candidate
      if (profile.calls > 100 && profile.avgMs < 50) {
        suggestions.push({
          path: profile.path,
          type: "cache",
          reason: `Called ${profile.calls} times with avg ${profile.avgMs.toFixed(1)}ms - cacheable`,
          impact: profile.hotness > 70 ? "high" : "medium",
        });
      }

      // High latency variance = batch candidate
      if (profile.maxMs > profile.avgMs * 3) {
        suggestions.push({
          path: profile.path,
          type: "batch",
          reason: `High variance (avg: ${profile.avgMs.toFixed(1)}ms, max: ${profile.maxMs.toFixed(1)}ms)`,
          impact: "medium",
        });
      }

      // Very high frequency = debounce candidate
      if (profile.calls > 500 && profile.hotness > 80) {
        suggestions.push({
          path: profile.path,
          type: "debounce",
          reason: `Extremely high frequency (${profile.calls} calls)`,
          impact: "high",
        });
      }

      // Slow but predictable = precompute candidate
      if (profile.avgMs > 200 && profile.maxMs < profile.avgMs * 1.5) {
        suggestions.push({
          path: profile.path,
          type: "precompute",
          reason: `Consistently slow (${profile.avgMs.toFixed(1)}ms) - precompute if possible`,
          impact: "high",
        });
      }
    }

    return suggestions.sort((a, b) => {
      const impactOrder = { high: 0, medium: 1, low: 2 };
      return impactOrder[a.impact] - impactOrder[b.impact];
    });
  }

  /**
   * Clear all profiles
   */
  static clear(): void {
    this.profiles.clear();
  }
}

export const hotPathOptimizer = HotPathOptimizer;


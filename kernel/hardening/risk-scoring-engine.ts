/**
 * 📊 Risk Scoring Engine v1.0
 * 
 * Real-time kernel behavioral risk scoring:
 * - Multi-factor analysis
 * - Weighted scoring
 * - Trend-aware
 * - Action recommendations
 * 
 * @version 1.0.0
 */

import { PredictiveHealth } from "./predictive-health";
import { ThreatMatrix } from "./threat-matrix";
import { IntegrityGuardian } from "./integrity-guardian";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface RiskFactor {
  name: string;
  weight: number;
  score: number;
  details: string;
}

export interface RiskScore {
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  score: number; // 0-100
  factors: RiskFactor[];
  timestamp: number;
  recommendation: string;
}

// ═══════════════════════════════════════════════════════════
// Risk Scoring Engine
// ═══════════════════════════════════════════════════════════

export class RiskScoringEngine {
  private static history: RiskScore[] = [];
  private static maxHistory = 100;

  /**
   * Calculate comprehensive risk score
   */
  static score(): RiskScore {
    const factors: RiskFactor[] = [];
    let totalScore = 0;
    let totalWeight = 0;

    // Factor 1: System Health (weight: 30%)
    const health = PredictiveHealth.getSnapshot();
    const healthScore = this.calculateHealthScore(health);
    factors.push({
      name: "System Health",
      weight: 0.30,
      score: healthScore,
      details: `Load: ${health.load.toFixed(2)}, Heap: ${(health.heapRatio * 100).toFixed(1)}%`,
    });
    totalScore += healthScore * 0.30;
    totalWeight += 0.30;

    // Factor 2: Integrity Status (weight: 25%)
    const integrity = IntegrityGuardian.verify();
    const integrityScore = integrity.valid ? 0 : Math.min(100, integrity.violations.length * 25);
    factors.push({
      name: "File Integrity",
      weight: 0.25,
      score: integrityScore,
      details: integrity.valid ? "All files intact" : `${integrity.violations.length} violations`,
    });
    totalScore += integrityScore * 0.25;
    totalWeight += 0.25;

    // Factor 3: Recent Violations (weight: 20%)
    const violations = IntegrityGuardian.getViolations();
    const recentViolations = violations.filter(v => Date.now() - v.detectedAt < 3600000);
    const violationScore = Math.min(100, recentViolations.length * 20);
    factors.push({
      name: "Recent Violations",
      weight: 0.20,
      score: violationScore,
      details: `${recentViolations.length} in last hour`,
    });
    totalScore += violationScore * 0.20;
    totalWeight += 0.20;

    // Factor 4: Degradation Prediction (weight: 25%)
    const prediction = PredictiveHealth.predictDegradation();
    const predictionScore = prediction.score;
    factors.push({
      name: "Degradation Risk",
      weight: 0.25,
      score: predictionScore,
      details: prediction.risk,
    });
    totalScore += predictionScore * 0.25;
    totalWeight += 0.25;

    // Normalize score
    const finalScore = Math.round(totalScore / totalWeight);

    // Determine level
    let level: RiskScore["level"];
    let recommendation: string;

    if (finalScore >= 75) {
      level = "CRITICAL";
      recommendation = "Immediate action required. Consider emergency lockdown.";
    } else if (finalScore >= 50) {
      level = "HIGH";
      recommendation = "Elevated risk. Monitor closely and prepare contingencies.";
    } else if (finalScore >= 25) {
      level = "MEDIUM";
      recommendation = "Moderate risk. Review factors and address concerns.";
    } else {
      level = "LOW";
      recommendation = "System operating normally. Continue monitoring.";
    }

    const result: RiskScore = {
      level,
      score: finalScore,
      factors,
      timestamp: Date.now(),
      recommendation,
    };

    // Store in history
    this.history.push(result);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    return result;
  }

  /**
   * Get quick risk level
   */
  static getLevel(): RiskScore["level"] {
    return this.score().level;
  }

  /**
   * Get risk history
   */
  static getHistory(): RiskScore[] {
    return [...this.history];
  }

  /**
   * Get trend
   */
  static getTrend(): "improving" | "stable" | "degrading" {
    if (this.history.length < 5) return "stable";

    const recent = this.history.slice(-5);
    const older = this.history.slice(-10, -5);

    if (older.length === 0) return "stable";

    const recentAvg = recent.reduce((s, r) => s + r.score, 0) / recent.length;
    const olderAvg = older.reduce((s, r) => s + r.score, 0) / older.length;

    if (recentAvg < olderAvg - 10) return "improving";
    if (recentAvg > olderAvg + 10) return "degrading";
    return "stable";
  }

  private static calculateHealthScore(health: ReturnType<typeof PredictiveHealth.getSnapshot>): number {
    let score = 0;

    // CPU load contribution
    if (health.load > 4) score += 40;
    else if (health.load > 2) score += 25;
    else if (health.load > 1) score += 10;

    // Heap contribution
    if (health.heapRatio > 0.9) score += 35;
    else if (health.heapRatio > 0.75) score += 20;
    else if (health.heapRatio > 0.6) score += 10;

    // RSS contribution
    if (health.rssRatio > 0.85) score += 25;
    else if (health.rssRatio > 0.7) score += 15;

    return Math.min(100, score);
  }
}

export const riskScoringEngine = RiskScoringEngine;


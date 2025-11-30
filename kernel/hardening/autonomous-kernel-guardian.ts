/**
 * 🛡️ Autonomous Kernel Guardian v1.0
 * 
 * Master orchestrator for all Hardening subsystems:
 * - Integrity monitoring
 * - Threat detection
 * - Risk scoring
 * - Sovereign mode enforcement
 * - Self-healing triggers
 * 
 * @version 1.0.0
 */

import { IntegrityGuardian } from "./integrity-guardian";
import { ThreatMatrix } from "./threat-matrix";
import { RiskScoringEngine } from "./risk-scoring-engine";
import { SovereignMode } from "./sovereign-mode";
import { PredictiveHealth } from "./predictive-health";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface GuardianStatus {
  active: boolean;
  riskLevel: string;
  sovereignMode: boolean;
  integrityValid: boolean;
  lastCheck: number;
  blockedThreats: number;
}

export interface ExecutionGuardResult {
  allowed: boolean;
  reason?: string;
  threats?: string[];
}

// ═══════════════════════════════════════════════════════════
// Autonomous Kernel Guardian
// ═══════════════════════════════════════════════════════════

export class AutonomousKernelGuardian {
  private static blockedThreats = 0;
  private static lastCheck = 0;
  private static monitorInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize guardian with kernel file baseline
   */
  static initialize(kernelFiles: string[]): void {
    IntegrityGuardian.recordBaseline(kernelFiles);
    this.lastCheck = Date.now();

    eventBus.publish({
      type: "kernel.guardian.initialized",
      files: kernelFiles.length,
      timestamp: new Date().toISOString(),
    } as any);
  }

  /**
   * Start continuous monitoring
   */
  static startMonitoring(intervalMs: number = 30000): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
    }

    this.monitorInterval = setInterval(() => {
      this.runHealthCheck();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  static stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  /**
   * Run comprehensive health check
   */
  static runHealthCheck(): GuardianStatus {
    // Check integrity
    const integrity = IntegrityGuardian.verify();
    
    // Get risk score
    const risk = RiskScoringEngine.score();

    // Record health snapshot
    PredictiveHealth.record();

    this.lastCheck = Date.now();

    // Auto-escalate if critical
    if (risk.level === "CRITICAL" && !SovereignMode.isActive()) {
      SovereignMode.enable("AutonomousKernelGuardian", {
        lockdownLevel: "partial",
      });

      eventBus.publish({
        type: "kernel.guardian.auto-lockdown",
        reason: "Critical risk level detected",
        riskScore: risk.score,
        timestamp: new Date().toISOString(),
      } as any);
    }

    return this.getStatus();
  }

  /**
   * Guard code execution
   */
  static protectExecution(code: string, context: string = "unknown"): ExecutionGuardResult {
    // Check sovereign mode
    if (SovereignMode.isActive() && !SovereignMode.isAllowed("execute")) {
      this.blockedThreats++;
      return {
        allowed: false,
        reason: "Execution blocked: Sovereign mode active",
      };
    }

    // Analyze threats
    const analysis = ThreatMatrix.analyze(code);

    if (!analysis.safe) {
      this.blockedThreats++;

      eventBus.publish({
        type: "kernel.guardian.threat-blocked",
        context,
        threats: analysis.threats.map(t => t.pattern.name),
        riskScore: analysis.riskScore,
        timestamp: new Date().toISOString(),
      } as any);

      return {
        allowed: false,
        reason: analysis.recommendation,
        threats: analysis.threats.map(t => t.pattern.name),
      };
    }

    return { allowed: true };
  }

  /**
   * Enforce sovereignty for operation
   */
  static enforceSovereignty(operation: string): void {
    SovereignMode.guard(operation);
  }

  /**
   * Get current risk level
   */
  static reportRisk(): string {
    return RiskScoringEngine.getLevel();
  }

  /**
   * Get guardian status
   */
  static getStatus(): GuardianStatus {
    const integrity = IntegrityGuardian.verify();
    const risk = RiskScoringEngine.score();

    return {
      active: this.monitorInterval !== null,
      riskLevel: risk.level,
      sovereignMode: SovereignMode.isActive(),
      integrityValid: integrity.valid,
      lastCheck: this.lastCheck,
      blockedThreats: this.blockedThreats,
    };
  }

  /**
   * Get comprehensive diagnostics
   */
  static getDiagnostics(): Record<string, any> {
    const health = PredictiveHealth.getSnapshot();
    const risk = RiskScoringEngine.score();
    const integrity = IntegrityGuardian.verify();
    const prediction = PredictiveHealth.predictDegradation();

    return {
      guardian: this.getStatus(),
      health,
      risk,
      integrity: {
        valid: integrity.valid,
        violations: integrity.violations.length,
        totalFiles: integrity.totalFiles,
      },
      prediction,
      sovereign: SovereignMode.getState(),
    };
  }
}

export const autonomousKernelGuardian = AutonomousKernelGuardian;


/**
 * 🛡️ Predictive DriftShield™ v1.0
 * 
 * AI-powered drift prevention system:
 * - Continuous state monitoring
 * - Predictive drift detection
 * - Cascade failure prevention
 * - Auto-fix generation
 * - Zero-downtime remediation
 * 
 * @version 1.0.0
 */

import { MerkleDAG, merkleDAG, type DriftDiff, type StateSnapshot } from "./merkle-dag";
import { CascadePredictor, cascadePredictor, type CascadeReport } from "./cascade-predictor";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface DriftAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  type: "schema_drift" | "permission_drift" | "workflow_drift" | "config_drift";
  entity: string;
  description: string;
  detectedAt: number;
  cascade?: CascadeReport;
  suggestedFix?: DriftFix;
  autoFixed?: boolean;
}

export interface DriftFix {
  id: string;
  type: "add_default" | "backfill" | "update_workflow" | "add_validation" | "rollback";
  description: string;
  confidence: number;
  changes: Array<{
    path: string;
    action: "set" | "delete" | "modify";
    value?: any;
  }>;
  estimatedImpact: string;
  requiresApproval: boolean;
}

export interface AIAnalysis {
  summary: string;
  rootCause: string;
  impactAssessment: string;
  recommendations: string[];
  confidence: number;
}

export interface ShieldConfig {
  autoFixThreshold: number; // Confidence threshold for auto-fix (0-1)
  monitorIntervalMs: number;
  maxAlertsPerMinute: number;
  enableAutoFix: boolean;
  notifyOnCritical: boolean;
}

// ═══════════════════════════════════════════════════════════
// Predictive DriftShield
// ═══════════════════════════════════════════════════════════

export class PredictiveDriftShield {
  private config: ShieldConfig = {
    autoFixThreshold: 0.9,
    monitorIntervalMs: 30000,
    maxAlertsPerMinute: 10,
    enableAutoFix: true,
    notifyOnCritical: true,
  };

  private previousState: StateSnapshot | null = null;
  private alerts: DriftAlert[] = [];
  private alertsThisMinute = 0;
  private lastAlertReset = Date.now();
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<ShieldConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // ─────────────────────────────────────────────────────────
  // Monitoring
  // ─────────────────────────────────────────────────────────

  /**
   * Start continuous monitoring
   */
  startMonitoring(): void {
    if (this.monitorInterval) return;

    this.monitorInterval = setInterval(
      () => this.monitorContinuous(),
      this.config.monitorIntervalMs
    );

    // Initial snapshot
    this.previousState = merkleDAG.snapshot();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  /**
   * Continuous monitoring cycle
   */
  async monitorContinuous(): Promise<void> {
    // Rate limiting
    if (Date.now() - this.lastAlertReset > 60000) {
      this.alertsThisMinute = 0;
      this.lastAlertReset = Date.now();
    }

    if (this.alertsThisMinute >= this.config.maxAlertsPerMinute) {
      return;
    }

    // 1. Build current state
    const currentState = merkleDAG.snapshot();

    // 2. Compare with previous state
    const drift = merkleDAG.detectDrift(this.previousState || undefined);

    if (drift.modified.length === 0 && drift.added.length === 0 && drift.removed.length === 0) {
      this.previousState = currentState;
      return;
    }

    // 3. Analyze each change
    for (const change of drift.modified) {
      await this.analyzeChange(change);
    }

    for (const added of drift.added) {
      await this.analyzeAddition(added);
    }

    for (const removed of drift.removed) {
      await this.analyzeRemoval(removed);
    }

    this.previousState = currentState;
  }

  // ─────────────────────────────────────────────────────────
  // Analysis
  // ─────────────────────────────────────────────────────────

  /**
   * Analyze a modified path
   */
  private async analyzeChange(change: DriftDiff["modified"][0]): Promise<void> {
    // Predict cascade
    const cascade = cascadePredictor.predictCascade(
      change.path,
      this.inferChangeType(change.changeType)
    );

    // Generate AI analysis
    const analysis = await this.generateAIAnalysis(change, cascade);

    // Determine severity
    const severity = this.determineSeverity(cascade, analysis);

    // Generate fix if needed
    const fix = severity !== "info" 
      ? await this.generateFix(change, cascade, analysis)
      : undefined;

    // Create alert
    const alert: DriftAlert = {
      id: `drift-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      severity,
      type: change.changeType === "schema" ? "schema_drift" : 
            change.changeType === "permission" ? "permission_drift" :
            change.changeType === "workflow" ? "workflow_drift" : "config_drift",
      entity: change.path,
      description: analysis.summary,
      detectedAt: Date.now(),
      cascade,
      suggestedFix: fix,
    };

    // Auto-fix if enabled and confident
    if (this.config.enableAutoFix && fix && fix.confidence >= this.config.autoFixThreshold && !fix.requiresApproval) {
      await this.applyFix(fix);
      alert.autoFixed = true;
    }

    this.addAlert(alert);

    // Emit event
    await eventBus.publish({
      type: "drift.detected",
      alert,
      timestamp: new Date().toISOString(),
    } as any);
  }

  /**
   * Analyze an addition
   */
  private async analyzeAddition(path: string): Promise<void> {
    const alert: DriftAlert = {
      id: `drift-add-${Date.now()}`,
      severity: "info",
      type: "schema_drift",
      entity: path,
      description: `New entity added: ${path}`,
      detectedAt: Date.now(),
    };

    this.addAlert(alert);
  }

  /**
   * Analyze a removal
   */
  private async analyzeRemoval(path: string): Promise<void> {
    const cascade = cascadePredictor.predictCascade(path, "delete_entity");

    const severity = cascade.criticalImpacts.length > 0 ? "critical" : 
                     cascade.warnings.length > 0 ? "warning" : "info";

    const alert: DriftAlert = {
      id: `drift-del-${Date.now()}`,
      severity,
      type: "schema_drift",
      entity: path,
      description: `Entity removed: ${path}. ${cascade.totalAffected} dependents affected.`,
      detectedAt: Date.now(),
      cascade,
    };

    this.addAlert(alert);

    if (severity === "critical" && this.config.notifyOnCritical) {
      await this.notifyAdmin(alert);
    }
  }

  // ─────────────────────────────────────────────────────────
  // AI Analysis (Simulated - integrate with Ollama)
  // ─────────────────────────────────────────────────────────

  /**
   * Generate AI analysis of drift
   */
  private async generateAIAnalysis(
    change: DriftDiff["modified"][0],
    cascade: CascadeReport
  ): Promise<AIAnalysis> {
    // In production, this would call Ollama/DeepSeek
    // For now, generate rule-based analysis

    const hasBreakingChanges = cascade.criticalImpacts.length > 0;
    const affectedWorkflows = cascade.criticalImpacts.filter(i => i.type === "workflow").length;

    return {
      summary: hasBreakingChanges
        ? `Critical drift detected in ${change.path}. ${cascade.totalAffected} entities affected, ${affectedWorkflows} workflows may break.`
        : `Minor drift detected in ${change.path}. ${cascade.totalAffected} entities may need review.`,
      rootCause: `Change in ${change.changeType} at ${change.path}`,
      impactAssessment: cascade.estimatedImpact.revenue 
        ? `Potential revenue impact: ${cascade.estimatedImpact.revenue}`
        : "No significant revenue impact expected",
      recommendations: this.generateRecommendations(change, cascade),
      confidence: hasBreakingChanges ? 0.95 : 0.85,
    };
  }

  private generateRecommendations(
    change: DriftDiff["modified"][0],
    cascade: CascadeReport
  ): string[] {
    const recs: string[] = [];

    if (cascade.criticalImpacts.length > 0) {
      recs.push("Review all breaking changes before deployment");
      recs.push("Consider adding backward compatibility layer");
    }

    if (change.changeType === "schema") {
      recs.push("Add default value for new fields");
      recs.push("Update dependent workflows to handle schema change");
    }

    if (cascade.warnings.length > 0) {
      recs.push("Notify affected teams about the change");
    }

    return recs;
  }

  // ─────────────────────────────────────────────────────────
  // Fix Generation
  // ─────────────────────────────────────────────────────────

  /**
   * Generate fix for drift
   */
  private async generateFix(
    change: DriftDiff["modified"][0],
    cascade: CascadeReport,
    analysis: AIAnalysis
  ): Promise<DriftFix> {
    const changes: DriftFix["changes"] = [];
    let fixType: DriftFix["type"] = "add_default";
    let description = "";
    let confidence = 0.7;

    if (change.changeType === "schema") {
      // Schema change - add defaults or backfill
      fixType = "add_default";
      description = `Add default value for changed field in ${change.path}`;
      changes.push({
        path: change.path,
        action: "modify",
        value: { default: null, nullable: true },
      });
      confidence = 0.85;
    }

    if (cascade.criticalImpacts.some(i => i.type === "workflow")) {
      // Workflow breaks - update workflow
      fixType = "update_workflow";
      description = `Update workflows to handle ${change.path} change`;
      for (const impact of cascade.criticalImpacts.filter(i => i.type === "workflow")) {
        changes.push({
          path: impact.entity,
          action: "modify",
          value: { handleNullable: true },
        });
      }
      confidence = 0.75;
    }

    return {
      id: `fix-${Date.now()}`,
      type: fixType,
      description,
      confidence,
      changes,
      estimatedImpact: `Affects ${changes.length} entities`,
      requiresApproval: confidence < this.config.autoFixThreshold || cascade.riskScore > 50,
    };
  }

  /**
   * Apply a fix
   */
  async applyFix(fix: DriftFix): Promise<boolean> {
    try {
      for (const change of fix.changes) {
        if (change.action === "set" || change.action === "modify") {
          merkleDAG.set(change.path, change.value);
        } else if (change.action === "delete") {
          merkleDAG.delete(change.path);
        }
      }

      await eventBus.publish({
        type: "drift.fixed",
        fixId: fix.id,
        fixType: fix.type,
        changes: fix.changes.length,
        timestamp: new Date().toISOString(),
      } as any);

      return true;
    } catch (error) {
      console.error("Failed to apply fix:", error);
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Notifications
  // ─────────────────────────────────────────────────────────

  private async notifyAdmin(alert: DriftAlert): Promise<void> {
    await eventBus.publish({
      type: "drift.critical",
      alert,
      timestamp: new Date().toISOString(),
    } as any);
  }

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  private inferChangeType(
    changeType: string
  ): "add_field" | "remove_field" | "modify_field" | "delete_entity" | "modify_schema" {
    switch (changeType) {
      case "schema": return "modify_schema";
      case "permission": return "modify_field";
      case "workflow": return "modify_field";
      default: return "modify_field";
    }
  }

  private determineSeverity(
    cascade: CascadeReport,
    analysis: AIAnalysis
  ): DriftAlert["severity"] {
    if (cascade.criticalImpacts.length > 0 || cascade.riskScore >= 70) {
      return "critical";
    }
    if (cascade.warnings.length > 0 || cascade.riskScore >= 30) {
      return "warning";
    }
    return "info";
  }

  private addAlert(alert: DriftAlert): void {
    this.alerts.push(alert);
    this.alertsThisMinute++;

    // Keep last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000);
    }
  }

  // ─────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────

  /**
   * Get recent alerts
   */
  getAlerts(limit = 100): DriftAlert[] {
    return this.alerts.slice(-limit);
  }

  /**
   * Get alerts by severity
   */
  getAlertsBySeverity(severity: DriftAlert["severity"]): DriftAlert[] {
    return this.alerts.filter(a => a.severity === severity);
  }

  /**
   * Manual drift check
   */
  async checkDrift(): Promise<DriftDiff> {
    return merkleDAG.detectDrift(this.previousState || undefined);
  }

  /**
   * Propose fix for entity
   */
  async proposeFix(entityPath: string): Promise<DriftFix | null> {
    const cascade = cascadePredictor.predictCascade(entityPath, "modify_schema");
    const analysis = await this.generateAIAnalysis(
      { path: entityPath, oldHash: "", newHash: "", changeType: "schema" },
      cascade
    );
    return this.generateFix(
      { path: entityPath, oldHash: "", newHash: "", changeType: "schema" },
      cascade,
      analysis
    );
  }
}

export const predictiveDriftShield = new PredictiveDriftShield();


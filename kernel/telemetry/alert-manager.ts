/**
 * 🚨 Alert Manager v1.0
 * 
 * Intelligent alerting system:
 * - Threshold-based alerts
 * - Anomaly alerts
 * - Alert deduplication
 * - Notification routing
 * 
 * @version 1.0.0
 */

import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type AlertSeverity = "info" | "warning" | "error" | "critical";
export type AlertStatus = "firing" | "resolved" | "acknowledged";

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: (metrics: any) => boolean;
  severity: AlertSeverity;
  cooldownMs: number;
  labels: Record<string, string>;
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  message: string;
  labels: Record<string, string>;
  firedAt: number;
  resolvedAt?: number;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
  value?: number;
  threshold?: number;
}

// ═══════════════════════════════════════════════════════════
// Alert Manager
// ═══════════════════════════════════════════════════════════

export class AlertManager {
  private static rules = new Map<string, AlertRule>();
  private static alerts = new Map<string, Alert>();
  private static alertHistory: Alert[] = [];
  private static lastFired = new Map<string, number>();
  private static readonly MAX_HISTORY = 500;

  /**
   * Register an alert rule
   */
  static registerRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove a rule
   */
  static removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
  }

  /**
   * Evaluate all rules
   */
  static evaluate(metrics: any): Alert[] {
    const newAlerts: Alert[] = [];

    for (const [ruleId, rule] of this.rules) {
      const lastFiredTime = this.lastFired.get(ruleId) || 0;
      const cooldownPassed = Date.now() - lastFiredTime > rule.cooldownMs;

      try {
        const shouldFire = rule.condition(metrics);

        if (shouldFire && cooldownPassed) {
          const alert = this.fireAlert(rule, metrics);
          newAlerts.push(alert);
        } else if (!shouldFire && this.alerts.has(ruleId)) {
          this.resolveAlert(ruleId);
        }
      } catch (error) {
        // Rule evaluation failed, skip
        // Import logger dynamically to avoid circular dependency
        const { baseLogger } = await import("../observability/logger");
        baseLogger.warn({ ruleId, error }, "Alert rule %s evaluation failed", ruleId);
      }
    }

    return newAlerts;
  }

  /**
   * Fire an alert
   */
  private static fireAlert(rule: AlertRule, metrics: any): Alert {
    const alertId = `${rule.id}_${Date.now()}`;

    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      status: "firing",
      message: rule.description,
      labels: { ...rule.labels },
      firedAt: Date.now(),
    };

    this.alerts.set(rule.id, alert);
    this.lastFired.set(rule.id, Date.now());

    // Emit event
    eventBus.publish({
      type: "alert.fired",
      alert,
      timestamp: new Date().toISOString(),
    } as any);

    return alert;
  }

  /**
   * Resolve an alert
   */
  static resolveAlert(ruleId: string): void {
    const alert = this.alerts.get(ruleId);
    if (!alert) return;

    alert.status = "resolved";
    alert.resolvedAt = Date.now();

    // Move to history
    this.alertHistory.push(alert);
    this.alerts.delete(ruleId);

    if (this.alertHistory.length > this.MAX_HISTORY) {
      this.alertHistory = this.alertHistory.slice(-this.MAX_HISTORY);
    }

    eventBus.publish({
      type: "alert.resolved",
      alert,
      timestamp: new Date().toISOString(),
    } as any);
  }

  /**
   * Acknowledge an alert
   */
  static acknowledgeAlert(ruleId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(ruleId);
    if (!alert) return false;

    alert.status = "acknowledged";
    alert.acknowledgedAt = Date.now();
    alert.acknowledgedBy = acknowledgedBy;

    eventBus.publish({
      type: "alert.acknowledged",
      alert,
      acknowledgedBy,
      timestamp: new Date().toISOString(),
    } as any);

    return true;
  }

  /**
   * Get active alerts
   */
  static getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Get alerts by severity
   */
  static getAlertsBySeverity(severity: AlertSeverity): Alert[] {
    return Array.from(this.alerts.values()).filter(a => a.severity === severity);
  }

  /**
   * Get alert history
   */
  static getHistory(limit?: number): Alert[] {
    return limit ? this.alertHistory.slice(-limit) : [...this.alertHistory];
  }

  /**
   * Get alert count by severity
   */
  static getAlertCounts(): Record<AlertSeverity, number> {
    const counts: Record<AlertSeverity, number> = {
      info: 0,
      warning: 0,
      error: 0,
      critical: 0,
    };

    for (const alert of this.alerts.values()) {
      counts[alert.severity]++;
    }

    return counts;
  }

  /**
   * Clear all alerts
   */
  static clear(): void {
    this.alerts.clear();
    this.lastFired.clear();
  }

  /**
   * Register default rules
   */
  static registerDefaultRules(): void {
    this.registerRule({
      id: "high_error_rate",
      name: "High Error Rate",
      description: "Error rate exceeds 10%",
      condition: (m) => m.errorRate > 0.1,
      severity: "error",
      cooldownMs: 300000,
      labels: { category: "reliability" },
    });

    this.registerRule({
      id: "high_latency",
      name: "High Latency",
      description: "Average latency exceeds 1000ms",
      condition: (m) => m.avgLatencyMs > 1000,
      severity: "warning",
      cooldownMs: 300000,
      labels: { category: "performance" },
    });

    this.registerRule({
      id: "high_memory",
      name: "High Memory Usage",
      description: "Memory usage exceeds 80%",
      condition: (m) => m.memoryPercent > 80,
      severity: "warning",
      cooldownMs: 300000,
      labels: { category: "resources" },
    });

    this.registerRule({
      id: "critical_memory",
      name: "Critical Memory Usage",
      description: "Memory usage exceeds 95%",
      condition: (m) => m.memoryPercent > 95,
      severity: "critical",
      cooldownMs: 60000,
      labels: { category: "resources" },
    });

    this.registerRule({
      id: "zone_overload",
      name: "Zone Overload",
      description: "Zone has too many concurrent executions",
      condition: (m) => m.zoneExecutions > m.zoneLimit * 0.9,
      severity: "warning",
      cooldownMs: 120000,
      labels: { category: "isolation" },
    });
  }
}

export const alertManager = AlertManager;


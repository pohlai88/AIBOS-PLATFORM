/**
 * 🔐 Autonomous Ledger Guardian™ v1.0
 * 
 * AI-powered fraud detection and compliance:
 * - Anomaly detection in audit logs
 * - Pattern-based fraud identification
 * - Automatic blocking of suspicious activity
 * - Auto-remediation with rollback
 * - Natural language explainability
 * 
 * @version 1.0.0
 */

import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface AuditEntry {
  id: string;
  timestamp: number;
  tenantId: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, any>;
  metadata?: Record<string, any>;
  hash?: string;
  previousHash?: string;
}

export interface AnomalyResult {
  detected: boolean;
  score: number;
  type: "fraud" | "error" | "policy_violation" | "unusual_pattern";
  indicators: AnomalyIndicator[];
  recommendation: "block" | "review" | "monitor" | "allow";
  explanation: string;
}

export interface AnomalyIndicator {
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  evidence: any;
}

export interface FraudReport {
  userId: string;
  suspicious: boolean;
  confidence: number;
  indicators: AnomalyIndicator[];
  recommendation: string;
  riskScore: number;
  timeline: Array<{
    timestamp: number;
    action: string;
    suspicious: boolean;
  }>;
}

export interface RemediationAction {
  id: string;
  type: "block_engine" | "reverse_entries" | "create_patch" | "alert_security" | "flag_review";
  target: string;
  description: string;
  applied: boolean;
  appliedAt?: number;
  result?: string;
}

export interface GuardianConfig {
  enableAutoBlock: boolean;
  enableAutoReverse: boolean;
  anomalyThreshold: number;
  monitorIntervalMs: number;
  maxEntriesPerCheck: number;
}

// ═══════════════════════════════════════════════════════════
// Pattern Definitions
// ═══════════════════════════════════════════════════════════

const FRAUD_PATTERNS = {
  // Off-hours activity
  OFF_HOURS: {
    check: (entry: AuditEntry) => {
      const hour = new Date(entry.timestamp).getHours();
      return hour < 6 || hour > 22;
    },
    severity: "medium" as const,
    description: "Activity outside normal business hours",
  },

  // Privilege escalation
  PRIVILEGE_ESCALATION: {
    check: (entry: AuditEntry) => {
      return entry.action.includes("role.assign") || 
             entry.action.includes("permission.grant") ||
             entry.action.includes("admin");
    },
    severity: "high" as const,
    description: "Potential privilege escalation attempt",
  },

  // Mass data access
  MASS_DATA_ACCESS: {
    check: (entries: AuditEntry[]) => {
      const recentReads = entries.filter(e => 
        e.action.includes("read") || e.action.includes("list") || e.action.includes("export")
      );
      return recentReads.length > 50;
    },
    severity: "high" as const,
    description: "Unusual volume of data access",
  },

  // Approval bypassing
  APPROVAL_BYPASS: {
    check: (entry: AuditEntry) => {
      return entry.action.includes("approve") && 
             entry.metadata?.bypassedWorkflow === true;
    },
    severity: "critical" as const,
    description: "Workflow approval was bypassed",
  },

  // Rapid successive changes
  RAPID_CHANGES: {
    check: (entries: AuditEntry[]) => {
      if (entries.length < 2) return false;
      const sorted = entries.sort((a, b) => a.timestamp - b.timestamp);
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i].timestamp - sorted[i-1].timestamp < 1000) {
          return true; // Less than 1 second between actions
        }
      }
      return false;
    },
    severity: "medium" as const,
    description: "Suspiciously rapid successive changes",
  },

  // Same user approving own request
  SELF_APPROVAL: {
    check: (entry: AuditEntry) => {
      return entry.action.includes("approve") && 
             entry.metadata?.requesterId === entry.userId;
    },
    severity: "critical" as const,
    description: "User approved their own request",
  },

  // Financial anomaly
  FINANCIAL_ANOMALY: {
    check: (entry: AuditEntry) => {
      const amount = entry.changes?.amount || entry.metadata?.amount;
      return amount && (amount > 100000 || amount < 0);
    },
    severity: "high" as const,
    description: "Unusual financial amount detected",
  },
};

// ═══════════════════════════════════════════════════════════
// Autonomous Guardian
// ═══════════════════════════════════════════════════════════

export class AutonomousLedgerGuardian {
  private config: GuardianConfig = {
    enableAutoBlock: true,
    enableAutoReverse: false, // Requires approval by default
    anomalyThreshold: 0.7,
    monitorIntervalMs: 60000,
    maxEntriesPerCheck: 100,
  };

  private recentEntries: AuditEntry[] = [];
  private blockedEngines = new Set<string>();
  private flaggedUsers = new Set<string>();
  private remediations: RemediationAction[] = [];
  private monitorInterval: NodeJS.Timeout | null = null;

  constructor(config?: Partial<GuardianConfig>) {
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
      () => this.monitorLedger(),
      this.config.monitorIntervalMs
    );
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
   * Monitor ledger for anomalies
   */
  async monitorLedger(): Promise<void> {
    // Analyze recent entries
    const anomalies = await this.analyzeEntries(this.recentEntries);

    if (anomalies.detected) {
      await this.handleAnomaly(anomalies);
    }
  }

  /**
   * Ingest new audit entry
   */
  async ingestEntry(entry: AuditEntry): Promise<AnomalyResult> {
    this.recentEntries.push(entry);

    // Keep only recent entries
    if (this.recentEntries.length > this.config.maxEntriesPerCheck) {
      this.recentEntries = this.recentEntries.slice(-this.config.maxEntriesPerCheck);
    }

    // Real-time analysis
    return this.analyzeEntry(entry);
  }

  // ─────────────────────────────────────────────────────────
  // Analysis
  // ─────────────────────────────────────────────────────────

  /**
   * Analyze single entry
   */
  async analyzeEntry(entry: AuditEntry): Promise<AnomalyResult> {
    const indicators: AnomalyIndicator[] = [];
    let score = 0;

    // Check single-entry patterns
    for (const [name, pattern] of Object.entries(FRAUD_PATTERNS)) {
      if ('check' in pattern && typeof pattern.check === 'function') {
        try {
          const result = pattern.check(entry);
          if (result) {
            indicators.push({
              type: name,
              severity: pattern.severity,
              description: pattern.description,
              evidence: { entry: entry.id, action: entry.action },
            });
            score += this.severityScore(pattern.severity);
          }
        } catch {
          // Pattern requires multiple entries
        }
      }
    }

    // Check user history
    const userEntries = this.recentEntries.filter(e => e.userId === entry.userId);
    if (userEntries.length > 20) {
      indicators.push({
        type: "HIGH_ACTIVITY",
        severity: "medium",
        description: "Unusually high activity from user",
        evidence: { count: userEntries.length, userId: entry.userId },
      });
      score += 20;
    }

    // Check if user is already flagged
    if (this.flaggedUsers.has(entry.userId)) {
      score += 30;
    }

    const normalizedScore = Math.min(score / 100, 1);

    return {
      detected: normalizedScore >= this.config.anomalyThreshold,
      score: normalizedScore,
      type: this.classifyAnomaly(indicators),
      indicators,
      recommendation: this.getRecommendation(normalizedScore, indicators),
      explanation: this.generateExplanation(entry, indicators),
    };
  }

  /**
   * Analyze multiple entries
   */
  async analyzeEntries(entries: AuditEntry[]): Promise<AnomalyResult> {
    const indicators: AnomalyIndicator[] = [];
    let score = 0;

    // Check multi-entry patterns
    if (FRAUD_PATTERNS.MASS_DATA_ACCESS.check(entries)) {
      indicators.push({
        type: "MASS_DATA_ACCESS",
        severity: "high",
        description: FRAUD_PATTERNS.MASS_DATA_ACCESS.description,
        evidence: { count: entries.length },
      });
      score += 40;
    }

    if (FRAUD_PATTERNS.RAPID_CHANGES.check(entries)) {
      indicators.push({
        type: "RAPID_CHANGES",
        severity: "medium",
        description: FRAUD_PATTERNS.RAPID_CHANGES.description,
        evidence: { count: entries.length },
      });
      score += 20;
    }

    // Check per-user anomalies
    const userGroups = this.groupByUser(entries);
    for (const [userId, userEntries] of userGroups) {
      if (userEntries.length > 30) {
        indicators.push({
          type: "USER_BURST",
          severity: "high",
          description: `User ${userId} made ${userEntries.length} actions in monitoring window`,
          evidence: { userId, count: userEntries.length },
        });
        score += 30;
      }
    }

    const normalizedScore = Math.min(score / 100, 1);

    return {
      detected: normalizedScore >= this.config.anomalyThreshold,
      score: normalizedScore,
      type: this.classifyAnomaly(indicators),
      indicators,
      recommendation: this.getRecommendation(normalizedScore, indicators),
      explanation: this.generateBatchExplanation(entries, indicators),
    };
  }

  /**
   * Detect fraud for specific user
   */
  async detectFraud(userId: string, timeRangeMs = 86400000): Promise<FraudReport> {
    const cutoff = Date.now() - timeRangeMs;
    const userEntries = this.recentEntries.filter(
      e => e.userId === userId && e.timestamp > cutoff
    );

    const indicators: AnomalyIndicator[] = [];
    let riskScore = 0;

    // Analyze patterns
    for (const entry of userEntries) {
      const result = await this.analyzeEntry(entry);
      if (result.detected) {
        indicators.push(...result.indicators);
        riskScore += result.score * 20;
      }
    }

    // Build timeline
    const timeline = userEntries.map(entry => ({
      timestamp: entry.timestamp,
      action: entry.action,
      suspicious: indicators.some(i => i.evidence?.entry === entry.id),
    }));

    const suspicious = riskScore > 50;

    return {
      userId,
      suspicious,
      confidence: Math.min(riskScore / 100, 0.99),
      indicators,
      recommendation: suspicious 
        ? "Investigate user activity and consider temporary access restriction"
        : "No immediate action required",
      riskScore: Math.min(riskScore, 100),
      timeline,
    };
  }

  // ─────────────────────────────────────────────────────────
  // Remediation
  // ─────────────────────────────────────────────────────────

  /**
   * Handle detected anomaly
   */
  private async handleAnomaly(anomaly: AnomalyResult): Promise<void> {
    // Emit alert
    await eventBus.publish({
      type: "guardian.anomaly",
      anomaly,
      timestamp: new Date().toISOString(),
    } as any);

    // Take action based on recommendation
    switch (anomaly.recommendation) {
      case "block":
        if (this.config.enableAutoBlock) {
          await this.blockSuspiciousSource(anomaly);
        }
        break;
      case "review":
        await this.flagForReview(anomaly);
        break;
      case "monitor":
        // Continue monitoring, no action
        break;
    }
  }

  /**
   * Block suspicious engine/user
   */
  async blockEngine(engineId: string, reason: string): Promise<RemediationAction> {
    this.blockedEngines.add(engineId);

    const action: RemediationAction = {
      id: `block-${Date.now()}`,
      type: "block_engine",
      target: engineId,
      description: `Blocked engine: ${reason}`,
      applied: true,
      appliedAt: Date.now(),
    };

    this.remediations.push(action);

    await eventBus.publish({
      type: "guardian.engine_blocked",
      engineId,
      reason,
      timestamp: new Date().toISOString(),
    } as any);

    return action;
  }

  /**
   * Reverse suspicious entries
   */
  async reverseEntries(entryIds: string[], reason: string): Promise<RemediationAction> {
    const action: RemediationAction = {
      id: `reverse-${Date.now()}`,
      type: "reverse_entries",
      target: entryIds.join(","),
      description: `Reversed ${entryIds.length} entries: ${reason}`,
      applied: this.config.enableAutoReverse,
      appliedAt: this.config.enableAutoReverse ? Date.now() : undefined,
    };

    this.remediations.push(action);

    if (this.config.enableAutoReverse) {
      await eventBus.publish({
        type: "guardian.entries_reversed",
        entryIds,
        reason,
        timestamp: new Date().toISOString(),
      } as any);
    }

    return action;
  }

  /**
   * Flag user for review
   */
  flagUser(userId: string): void {
    this.flaggedUsers.add(userId);
  }

  /**
   * Unblock engine
   */
  unblockEngine(engineId: string): boolean {
    return this.blockedEngines.delete(engineId);
  }

  /**
   * Check if engine is blocked
   */
  isEngineBlocked(engineId: string): boolean {
    return this.blockedEngines.has(engineId);
  }

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  private severityScore(severity: AnomalyIndicator["severity"]): number {
    switch (severity) {
      case "critical": return 40;
      case "high": return 25;
      case "medium": return 15;
      case "low": return 5;
    }
  }

  private classifyAnomaly(indicators: AnomalyIndicator[]): AnomalyResult["type"] {
    if (indicators.some(i => i.type.includes("APPROVAL") || i.type.includes("PRIVILEGE"))) {
      return "fraud";
    }
    if (indicators.some(i => i.type.includes("FINANCIAL"))) {
      return "fraud";
    }
    if (indicators.some(i => i.severity === "critical")) {
      return "policy_violation";
    }
    return "unusual_pattern";
  }

  private getRecommendation(
    score: number,
    indicators: AnomalyIndicator[]
  ): AnomalyResult["recommendation"] {
    if (score >= 0.9 || indicators.some(i => i.severity === "critical")) {
      return "block";
    }
    if (score >= 0.7) {
      return "review";
    }
    if (score >= 0.5) {
      return "monitor";
    }
    return "allow";
  }

  private generateExplanation(entry: AuditEntry, indicators: AnomalyIndicator[]): string {
    if (indicators.length === 0) {
      return `Action "${entry.action}" by user ${entry.userId} appears normal.`;
    }

    const issues = indicators.map(i => i.description).join("; ");
    return `Suspicious activity detected: ${issues}. User ${entry.userId} performed "${entry.action}" on ${entry.entity}.`;
  }

  private generateBatchExplanation(entries: AuditEntry[], indicators: AnomalyIndicator[]): string {
    if (indicators.length === 0) {
      return `Analyzed ${entries.length} entries. No anomalies detected.`;
    }

    const issues = indicators.map(i => i.description).join("; ");
    return `Analyzed ${entries.length} entries. Detected: ${issues}.`;
  }

  private groupByUser(entries: AuditEntry[]): Map<string, AuditEntry[]> {
    const groups = new Map<string, AuditEntry[]>();
    for (const entry of entries) {
      const list = groups.get(entry.userId) || [];
      list.push(entry);
      groups.set(entry.userId, list);
    }
    return groups;
  }

  private async blockSuspiciousSource(anomaly: AnomalyResult): Promise<void> {
    // Find source from indicators
    for (const indicator of anomaly.indicators) {
      if (indicator.evidence?.engineId) {
        await this.blockEngine(indicator.evidence.engineId, anomaly.explanation);
      }
      if (indicator.evidence?.userId) {
        this.flagUser(indicator.evidence.userId);
      }
    }
  }

  private async flagForReview(anomaly: AnomalyResult): Promise<void> {
    const action: RemediationAction = {
      id: `review-${Date.now()}`,
      type: "flag_review",
      target: "anomaly",
      description: anomaly.explanation,
      applied: true,
      appliedAt: Date.now(),
    };

    this.remediations.push(action);

    await eventBus.publish({
      type: "guardian.flagged_for_review",
      anomaly,
      timestamp: new Date().toISOString(),
    } as any);
  }

  // ─────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────

  getRemediations(): RemediationAction[] {
    return this.remediations;
  }

  getBlockedEngines(): string[] {
    return Array.from(this.blockedEngines);
  }

  getFlaggedUsers(): string[] {
    return Array.from(this.flaggedUsers);
  }

  clearRecentEntries(): void {
    this.recentEntries = [];
  }
}

export const autonomousGuardian = new AutonomousLedgerGuardian();


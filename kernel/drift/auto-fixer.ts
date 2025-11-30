/**
 * 🔧 Auto-Fixer Engine v1.0
 * 
 * Autonomous remediation for drift:
 * - Generate fixes from AI analysis
 * - Apply safe fixes automatically
 * - Queue risky fixes for approval
 * - Rollback on failure
 * - Zero-downtime migrations
 * 
 * @version 1.0.0
 */

import { merkleDAG } from "./merkle-dag";
import { cascadePredictor, type CascadeReport } from "./cascade-predictor";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface FixPlan {
  id: string;
  name: string;
  description: string;
  confidence: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  steps: FixStep[];
  rollbackSteps: FixStep[];
  estimatedDuration: string;
  requiresApproval: boolean;
  affectedEntities: string[];
}

export interface FixStep {
  id: string;
  order: number;
  type: "schema_change" | "data_migration" | "workflow_update" | "permission_change" | "config_update";
  target: string;
  action: "add" | "modify" | "delete" | "backfill";
  payload: any;
  description: string;
  reversible: boolean;
}

export interface FixResult {
  planId: string;
  success: boolean;
  stepsCompleted: number;
  stepsTotal: number;
  duration: number;
  error?: string;
  rollbackApplied?: boolean;
}

export interface PendingFix {
  plan: FixPlan;
  requestedAt: number;
  requestedBy: string;
  status: "pending" | "approved" | "rejected" | "applied";
  approvedBy?: string;
  approvedAt?: number;
}

// ═══════════════════════════════════════════════════════════
// Fix Templates
// ═══════════════════════════════════════════════════════════

const FIX_TEMPLATES = {
  ADD_DEFAULT_VALUE: (entity: string, field: string, defaultValue: any): FixStep[] => [
    {
      id: `add-default-${Date.now()}`,
      order: 1,
      type: "schema_change",
      target: entity,
      action: "modify",
      payload: { field, default: defaultValue, nullable: true },
      description: `Add default value '${defaultValue}' to ${entity}.${field}`,
      reversible: true,
    },
  ],

  BACKFILL_FIELD: (entity: string, field: string, value: any): FixStep[] => [
    {
      id: `backfill-${Date.now()}`,
      order: 1,
      type: "data_migration",
      target: entity,
      action: "backfill",
      payload: { field, value, where: { [field]: null } },
      description: `Backfill ${entity}.${field} with '${value}' where null`,
      reversible: false,
    },
  ],

  UPDATE_WORKFLOW_NULL_HANDLING: (workflow: string, field: string): FixStep[] => [
    {
      id: `workflow-null-${Date.now()}`,
      order: 1,
      type: "workflow_update",
      target: workflow,
      action: "modify",
      payload: { nullableFields: [field], coalesceDefault: true },
      description: `Update ${workflow} to handle null ${field}`,
      reversible: true,
    },
  ],

  ADD_VALIDATION: (entity: string, field: string, validation: string): FixStep[] => [
    {
      id: `validation-${Date.now()}`,
      order: 1,
      type: "schema_change",
      target: entity,
      action: "modify",
      payload: { field, validation },
      description: `Add ${validation} validation to ${entity}.${field}`,
      reversible: true,
    },
  ],

  EXPAND_CONTRACT_MIGRATION: (entity: string, changes: any): FixStep[] => [
    {
      id: `expand-${Date.now()}`,
      order: 1,
      type: "schema_change",
      target: entity,
      action: "add",
      payload: { ...changes, phase: "expand" },
      description: `Expand: Add new schema structure to ${entity}`,
      reversible: true,
    },
    {
      id: `migrate-${Date.now()}`,
      order: 2,
      type: "data_migration",
      target: entity,
      action: "backfill",
      payload: { ...changes, phase: "migrate" },
      description: `Migrate: Copy data to new structure`,
      reversible: false,
    },
    {
      id: `contract-${Date.now()}`,
      order: 3,
      type: "schema_change",
      target: entity,
      action: "delete",
      payload: { ...changes, phase: "contract" },
      description: `Contract: Remove old schema structure`,
      reversible: false,
    },
  ],
};

// ═══════════════════════════════════════════════════════════
// Auto-Fixer Engine
// ═══════════════════════════════════════════════════════════

export class AutoFixerEngine {
  private pendingFixes: PendingFix[] = [];
  private appliedFixes: FixResult[] = [];
  private autoApproveThreshold = 0.9;

  // ─────────────────────────────────────────────────────────
  // Plan Generation
  // ─────────────────────────────────────────────────────────

  /**
   * Generate fix plan for drift
   */
  generatePlan(
    entityPath: string,
    changeType: string,
    cascade: CascadeReport
  ): FixPlan {
    const steps: FixStep[] = [];
    const rollbackSteps: FixStep[] = [];
    const affectedEntities: string[] = [entityPath];

    // Determine fix strategy based on change type
    switch (changeType) {
      case "add_field":
        // Usually safe - just add default
        steps.push(...FIX_TEMPLATES.ADD_DEFAULT_VALUE(entityPath, "newField", null));
        break;

      case "remove_field":
        // Need to update workflows first
        for (const impact of cascade.criticalImpacts) {
          if (impact.type === "workflow") {
            steps.push(...FIX_TEMPLATES.UPDATE_WORKFLOW_NULL_HANDLING(impact.entity, "removedField"));
            affectedEntities.push(impact.entity);
          }
        }
        break;

      case "modify_schema":
        // Use expand-contract pattern for safety
        steps.push(...FIX_TEMPLATES.EXPAND_CONTRACT_MIGRATION(entityPath, { modified: true }));
        break;

      case "delete_entity":
        // High risk - need approval
        // Generate migration plan to archive data first
        steps.push({
          id: `archive-${Date.now()}`,
          order: 1,
          type: "data_migration",
          target: entityPath,
          action: "backfill",
          payload: { archive: true, destination: `${entityPath}_archive` },
          description: `Archive ${entityPath} data before deletion`,
          reversible: true,
        });
        break;
    }

    // Generate rollback steps (reverse order)
    for (const step of [...steps].reverse()) {
      if (step.reversible) {
        rollbackSteps.push({
          ...step,
          id: `rollback-${step.id}`,
          action: step.action === "add" ? "delete" : step.action === "delete" ? "add" : "modify",
          description: `Rollback: ${step.description}`,
        });
      }
    }

    const riskLevel = this.calculateRiskLevel(cascade, steps);
    const confidence = this.calculateConfidence(changeType, cascade);

    return {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: `Fix ${changeType} in ${entityPath}`,
      description: this.generatePlanDescription(entityPath, changeType, cascade),
      confidence,
      riskLevel,
      steps,
      rollbackSteps,
      estimatedDuration: this.estimateDuration(steps),
      requiresApproval: riskLevel === "high" || riskLevel === "critical" || confidence < this.autoApproveThreshold,
      affectedEntities,
    };
  }

  /**
   * Generate plan for specific fix type
   */
  generateSpecificPlan(
    type: keyof typeof FIX_TEMPLATES,
    ...args: any[]
  ): FixPlan {
    const template = FIX_TEMPLATES[type];
    const steps = (template as any)(...args);

    return {
      id: `plan-${type}-${Date.now()}`,
      name: `Apply ${type}`,
      description: `Apply fix template: ${type}`,
      confidence: 0.85,
      riskLevel: "low",
      steps,
      rollbackSteps: [],
      estimatedDuration: "< 1 min",
      requiresApproval: false,
      affectedEntities: [args[0]],
    };
  }

  // ─────────────────────────────────────────────────────────
  // Plan Execution
  // ─────────────────────────────────────────────────────────

  /**
   * Apply fix plan
   */
  async applyPlan(plan: FixPlan): Promise<FixResult> {
    const startTime = Date.now();
    let stepsCompleted = 0;

    try {
      for (const step of plan.steps.sort((a, b) => a.order - b.order)) {
        await this.executeStep(step);
        stepsCompleted++;

        // Emit progress
        await eventBus.publish({
          type: "fixer.step_completed",
          planId: plan.id,
          stepId: step.id,
          progress: stepsCompleted / plan.steps.length,
          timestamp: new Date().toISOString(),
        } as any);
      }

      const result: FixResult = {
        planId: plan.id,
        success: true,
        stepsCompleted,
        stepsTotal: plan.steps.length,
        duration: Date.now() - startTime,
      };

      this.appliedFixes.push(result);

      await eventBus.publish({
        type: "fixer.plan_completed",
        result,
        timestamp: new Date().toISOString(),
      } as any);

      return result;
    } catch (error: any) {
      // Attempt rollback
      const rollbackSuccess = await this.rollback(plan, stepsCompleted);

      const result: FixResult = {
        planId: plan.id,
        success: false,
        stepsCompleted,
        stepsTotal: plan.steps.length,
        duration: Date.now() - startTime,
        error: error.message,
        rollbackApplied: rollbackSuccess,
      };

      this.appliedFixes.push(result);

      await eventBus.publish({
        type: "fixer.plan_failed",
        result,
        timestamp: new Date().toISOString(),
      } as any);

      return result;
    }
  }

  /**
   * Execute single step
   */
  private async executeStep(step: FixStep): Promise<void> {
    switch (step.type) {
      case "schema_change":
        await this.applySchemaChange(step);
        break;
      case "data_migration":
        await this.applyDataMigration(step);
        break;
      case "workflow_update":
        await this.applyWorkflowUpdate(step);
        break;
      case "permission_change":
        await this.applyPermissionChange(step);
        break;
      case "config_update":
        await this.applyConfigUpdate(step);
        break;
    }
  }

  private async applySchemaChange(step: FixStep): Promise<void> {
    merkleDAG.set(`metadata/${step.target}`, {
      ...merkleDAG.get(`metadata/${step.target}`),
      ...step.payload,
      updatedAt: Date.now(),
    });
  }

  private async applyDataMigration(step: FixStep): Promise<void> {
    // In production, this would execute actual DB migration
    // For now, record the migration intent
    merkleDAG.set(`migrations/${step.id}`, {
      target: step.target,
      payload: step.payload,
      appliedAt: Date.now(),
    });
  }

  private async applyWorkflowUpdate(step: FixStep): Promise<void> {
    merkleDAG.set(`workflows/${step.target}`, {
      ...merkleDAG.get(`workflows/${step.target}`),
      ...step.payload,
      updatedAt: Date.now(),
    });
  }

  private async applyPermissionChange(step: FixStep): Promise<void> {
    merkleDAG.set(`permissions/${step.target}`, {
      ...merkleDAG.get(`permissions/${step.target}`),
      ...step.payload,
      updatedAt: Date.now(),
    });
  }

  private async applyConfigUpdate(step: FixStep): Promise<void> {
    merkleDAG.set(`config/${step.target}`, {
      ...merkleDAG.get(`config/${step.target}`),
      ...step.payload,
      updatedAt: Date.now(),
    });
  }

  /**
   * Rollback applied steps
   */
  private async rollback(plan: FixPlan, stepsCompleted: number): Promise<boolean> {
    try {
      const rollbackSteps = plan.rollbackSteps.slice(0, stepsCompleted).reverse();
      
      for (const step of rollbackSteps) {
        await this.executeStep(step);
      }

      return true;
    } catch {
      return false;
    }
  }

  // ─────────────────────────────────────────────────────────
  // Approval Queue
  // ─────────────────────────────────────────────────────────

  /**
   * Queue plan for approval
   */
  queueForApproval(plan: FixPlan, requestedBy: string): PendingFix {
    const pending: PendingFix = {
      plan,
      requestedAt: Date.now(),
      requestedBy,
      status: "pending",
    };

    this.pendingFixes.push(pending);
    return pending;
  }

  /**
   * Approve pending fix
   */
  async approveFix(planId: string, approvedBy: string): Promise<FixResult | null> {
    const pending = this.pendingFixes.find(p => p.plan.id === planId);
    if (!pending || pending.status !== "pending") {
      return null;
    }

    pending.status = "approved";
    pending.approvedBy = approvedBy;
    pending.approvedAt = Date.now();

    const result = await this.applyPlan(pending.plan);
    pending.status = result.success ? "applied" : "pending";

    return result;
  }

  /**
   * Reject pending fix
   */
  rejectFix(planId: string, rejectedBy: string): boolean {
    const pending = this.pendingFixes.find(p => p.plan.id === planId);
    if (!pending || pending.status !== "pending") {
      return false;
    }

    pending.status = "rejected";
    return true;
  }

  /**
   * Get pending fixes
   */
  getPendingFixes(): PendingFix[] {
    return this.pendingFixes.filter(p => p.status === "pending");
  }

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  private calculateRiskLevel(cascade: CascadeReport, steps: FixStep[]): FixPlan["riskLevel"] {
    if (cascade.criticalImpacts.length > 0) return "critical";
    if (cascade.riskScore > 70) return "high";
    if (steps.some(s => !s.reversible)) return "medium";
    return "low";
  }

  private calculateConfidence(changeType: string, cascade: CascadeReport): number {
    let confidence = 0.8;

    // Lower confidence for complex changes
    if (changeType === "delete_entity") confidence -= 0.3;
    if (changeType === "modify_schema") confidence -= 0.1;

    // Lower confidence for high cascade risk
    if (cascade.riskScore > 50) confidence -= 0.2;
    if (cascade.criticalImpacts.length > 0) confidence -= 0.1;

    return Math.max(0.3, Math.min(0.99, confidence));
  }

  private generatePlanDescription(entity: string, changeType: string, cascade: CascadeReport): string {
    const impacts = cascade.totalAffected > 0 
      ? `Affects ${cascade.totalAffected} dependent entities.`
      : "No dependencies affected.";

    return `Fix ${changeType} in ${entity}. ${impacts}`;
  }

  private estimateDuration(steps: FixStep[]): string {
    const migrationSteps = steps.filter(s => s.type === "data_migration").length;
    
    if (migrationSteps > 0) {
      return `${migrationSteps * 5}-${migrationSteps * 15} min (depends on data volume)`;
    }
    
    return `< ${steps.length} min`;
  }

  // ─────────────────────────────────────────────────────────
  // Public API
  // ─────────────────────────────────────────────────────────

  getAppliedFixes(): FixResult[] {
    return this.appliedFixes;
  }

  getFixHistory(limit = 50): FixResult[] {
    return this.appliedFixes.slice(-limit);
  }
}

export const autoFixerEngine = new AutoFixerEngine();


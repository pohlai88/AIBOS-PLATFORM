/**
 * 🌊 Cascade Predictor v1.0
 * 
 * Predicts cascading failures from drift:
 * - Dependency graph analysis
 * - Impact simulation
 * - Failure chain prediction
 * - Risk scoring
 * 
 * @version 1.0.0
 */

import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface DependencyNode {
  id: string;
  type: "entity" | "workflow" | "engine" | "permission" | "schema";
  name: string;
  dependencies: string[];
  dependents: string[];
  criticality: "low" | "medium" | "high" | "critical";
}

export interface CascadeImpact {
  entity: string;
  type: DependencyNode["type"];
  impactType: "breaks" | "degrades" | "warns";
  reason: string;
  affectedUsers?: number;
  affectedWorkflows?: string[];
  estimatedDowntime?: string;
}

export interface CascadeReport {
  sourceChange: {
    entity: string;
    changeType: string;
    description: string;
  };
  totalAffected: number;
  criticalImpacts: CascadeImpact[];
  warnings: CascadeImpact[];
  safeChanges: string[];
  riskScore: number;
  recommendation: "proceed" | "review" | "block";
  estimatedImpact: {
    users: number;
    workflows: number;
    revenue?: string;
  };
}

// ═══════════════════════════════════════════════════════════
// Cascade Predictor
// ═══════════════════════════════════════════════════════════

export class CascadePredictor {
  private dependencyGraph = new Map<string, DependencyNode>();

  // ─────────────────────────────────────────────────────────
  // Graph Building
  // ─────────────────────────────────────────────────────────

  /**
   * Register a dependency node
   */
  registerNode(node: DependencyNode): void {
    this.dependencyGraph.set(node.id, node);
    
    // Update reverse dependencies
    for (const depId of node.dependencies) {
      const dep = this.dependencyGraph.get(depId);
      if (dep && !dep.dependents.includes(node.id)) {
        dep.dependents.push(node.id);
      }
    }
  }

  /**
   * Add dependency between nodes
   */
  addDependency(fromId: string, toId: string): void {
    const from = this.dependencyGraph.get(fromId);
    const to = this.dependencyGraph.get(toId);
    
    if (from && to) {
      if (!from.dependencies.includes(toId)) {
        from.dependencies.push(toId);
      }
      if (!to.dependents.includes(fromId)) {
        to.dependents.push(fromId);
      }
    }
  }

  /**
   * Load dependencies from metadata registry
   */
  async loadFromMetadata(metadata: {
    entities?: Array<{ name: string; references?: string[] }>;
    workflows?: Array<{ name: string; entities?: string[] }>;
    engines?: Array<{ name: string; metadata?: string[] }>;
  }): Promise<void> {
    // Register entities
    if (metadata.entities) {
      for (const entity of metadata.entities) {
        this.registerNode({
          id: `entity:${entity.name}`,
          type: "entity",
          name: entity.name,
          dependencies: (entity.references || []).map(r => `entity:${r}`),
          dependents: [],
          criticality: this.inferCriticality(entity.name),
        });
      }
    }

    // Register workflows
    if (metadata.workflows) {
      for (const workflow of metadata.workflows) {
        this.registerNode({
          id: `workflow:${workflow.name}`,
          type: "workflow",
          name: workflow.name,
          dependencies: (workflow.entities || []).map(e => `entity:${e}`),
          dependents: [],
          criticality: "high",
        });
      }
    }

    // Register engines
    if (metadata.engines) {
      for (const engine of metadata.engines) {
        this.registerNode({
          id: `engine:${engine.name}`,
          type: "engine",
          name: engine.name,
          dependencies: (engine.metadata || []).map(m => `entity:${m}`),
          dependents: [],
          criticality: "critical",
        });
      }
    }
  }

  // ─────────────────────────────────────────────────────────
  // Impact Prediction
  // ─────────────────────────────────────────────────────────

  /**
   * Predict cascade from a change
   */
  predictCascade(
    entityId: string,
    changeType: "add_field" | "remove_field" | "modify_field" | "delete_entity" | "modify_schema"
  ): CascadeReport {
    const node = this.dependencyGraph.get(entityId);
    
    if (!node) {
      return this.emptyReport(entityId, changeType);
    }

    const affected = this.findAllDependents(entityId);
    const impacts: CascadeImpact[] = [];
    const warnings: CascadeImpact[] = [];
    const safeChanges: string[] = [];

    for (const depId of affected) {
      const depNode = this.dependencyGraph.get(depId);
      if (!depNode) continue;

      const impact = this.simulateImpact(node, depNode, changeType);
      
      if (impact.impactType === "breaks") {
        impacts.push(impact);
      } else if (impact.impactType === "degrades") {
        warnings.push(impact);
      } else {
        safeChanges.push(depId);
      }
    }

    const riskScore = this.calculateRiskScore(impacts, warnings, affected.length);

    return {
      sourceChange: {
        entity: entityId,
        changeType,
        description: this.describeChange(changeType),
      },
      totalAffected: affected.length,
      criticalImpacts: impacts,
      warnings,
      safeChanges,
      riskScore,
      recommendation: this.getRecommendation(riskScore, impacts.length),
      estimatedImpact: {
        users: this.estimateAffectedUsers(impacts),
        workflows: impacts.filter(i => i.type === "workflow").length,
        revenue: this.estimateRevenueImpact(impacts),
      },
    };
  }

  /**
   * Find all dependents (transitive)
   */
  private findAllDependents(entityId: string, visited = new Set<string>()): string[] {
    if (visited.has(entityId)) return [];
    visited.add(entityId);

    const node = this.dependencyGraph.get(entityId);
    if (!node) return [];

    const result: string[] = [];
    for (const depId of node.dependents) {
      result.push(depId);
      result.push(...this.findAllDependents(depId, visited));
    }

    return result;
  }

  /**
   * Simulate impact on a dependent
   */
  private simulateImpact(
    source: DependencyNode,
    dependent: DependencyNode,
    changeType: string
  ): CascadeImpact {
    // Critical: Entity deletion always breaks dependents
    if (changeType === "delete_entity") {
      return {
        entity: dependent.id,
        type: dependent.type,
        impactType: "breaks",
        reason: `${dependent.name} depends on ${source.name} which is being deleted`,
        affectedWorkflows: dependent.type === "workflow" ? [dependent.name] : undefined,
      };
    }

    // Field removal may break dependents
    if (changeType === "remove_field") {
      if (dependent.type === "workflow" || dependent.type === "engine") {
        return {
          entity: dependent.id,
          type: dependent.type,
          impactType: "breaks",
          reason: `${dependent.name} may reference removed field`,
          affectedWorkflows: [dependent.name],
        };
      }
      return {
        entity: dependent.id,
        type: dependent.type,
        impactType: "degrades",
        reason: `${dependent.name} may need to handle missing field`,
      };
    }

    // Schema modification may cause issues
    if (changeType === "modify_schema") {
      if (dependent.criticality === "critical") {
        return {
          entity: dependent.id,
          type: dependent.type,
          impactType: "degrades",
          reason: `${dependent.name} needs validation after schema change`,
        };
      }
    }

    // Field addition is usually safe
    if (changeType === "add_field") {
      return {
        entity: dependent.id,
        type: dependent.type,
        impactType: "warns",
        reason: `${dependent.name} may want to use new field`,
      };
    }

    return {
      entity: dependent.id,
      type: dependent.type,
      impactType: "warns",
      reason: `${dependent.name} should be reviewed`,
    };
  }

  // ─────────────────────────────────────────────────────────
  // Risk Scoring
  // ─────────────────────────────────────────────────────────

  private calculateRiskScore(
    breaks: CascadeImpact[],
    warnings: CascadeImpact[],
    totalAffected: number
  ): number {
    let score = 0;

    // Breaking changes are severe
    score += breaks.length * 25;

    // Workflows breaking is critical
    score += breaks.filter(b => b.type === "workflow").length * 15;

    // Engines breaking is critical
    score += breaks.filter(b => b.type === "engine").length * 20;

    // Warnings add minor risk
    score += warnings.length * 5;

    // Scale by affected count
    if (totalAffected > 10) score += 10;
    if (totalAffected > 50) score += 20;

    return Math.min(100, score);
  }

  private getRecommendation(
    riskScore: number,
    breakingCount: number
  ): "proceed" | "review" | "block" {
    if (breakingCount > 0 || riskScore >= 70) return "block";
    if (riskScore >= 30) return "review";
    return "proceed";
  }

  private estimateAffectedUsers(impacts: CascadeImpact[]): number {
    // Rough estimate based on impact types
    let users = 0;
    for (const impact of impacts) {
      if (impact.type === "workflow") users += 100;
      if (impact.type === "engine") users += 500;
      if (impact.type === "entity") users += 50;
    }
    return users;
  }

  private estimateRevenueImpact(impacts: CascadeImpact[]): string | undefined {
    const workflowBreaks = impacts.filter(i => i.type === "workflow" && i.impactType === "breaks").length;
    if (workflowBreaks === 0) return undefined;
    
    // Rough estimate: $1000/workflow/day
    const daily = workflowBreaks * 1000;
    return `~$${daily.toLocaleString()}/day`;
  }

  // ─────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────

  private inferCriticality(name: string): DependencyNode["criticality"] {
    const criticalPatterns = /customer|order|payment|invoice|user|account/i;
    const highPatterns = /product|inventory|employee|vendor/i;
    
    if (criticalPatterns.test(name)) return "critical";
    if (highPatterns.test(name)) return "high";
    return "medium";
  }

  private describeChange(changeType: string): string {
    const descriptions: Record<string, string> = {
      add_field: "Adding new field",
      remove_field: "Removing existing field",
      modify_field: "Modifying field type or constraints",
      delete_entity: "Deleting entire entity",
      modify_schema: "Modifying schema structure",
    };
    return descriptions[changeType] || changeType;
  }

  private emptyReport(entityId: string, changeType: string): CascadeReport {
    return {
      sourceChange: {
        entity: entityId,
        changeType,
        description: this.describeChange(changeType),
      },
      totalAffected: 0,
      criticalImpacts: [],
      warnings: [],
      safeChanges: [],
      riskScore: 0,
      recommendation: "proceed",
      estimatedImpact: { users: 0, workflows: 0 },
    };
  }

  // ─────────────────────────────────────────────────────────
  // Getters
  // ─────────────────────────────────────────────────────────

  get nodeCount(): number {
    return this.dependencyGraph.size;
  }

  getNode(id: string): DependencyNode | undefined {
    return this.dependencyGraph.get(id);
  }

  getAllNodes(): DependencyNode[] {
    return Array.from(this.dependencyGraph.values());
  }
}

export const cascadePredictor = new CascadePredictor();


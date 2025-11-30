/**
 * Impact Analysis Service
 *
 * GRCD v4.1.0 Compliant: Impact analysis for metadata changes
 * Phase 2.3: Impact Analysis Service
 * 
 * Leverages patterns from kernel/drift/cascade-predictor.ts
 * Uses lineage service for graph traversal
 */

import { lineageService } from "../lineage";
import type {
  ImpactReport,
  AffectedAsset,
  ImpactType,
  ChangeType,
  ImpactAnalysisOptions,
} from "./types";
import { ZImpactReport, ZAffectedAsset } from "./types";
import { baseLogger } from "../../observability/logger";

const logger = baseLogger.child({ module: "metadata:impact-analysis" });

/**
 * Impact Analysis Service
 * 
 * Analyzes the impact of metadata changes by traversing the lineage graph
 * and identifying affected assets.
 */
export class ImpactAnalysisService {
  /**
   * Analyze impact of a metadata change.
   * 
   * @param tenantId - Tenant ID (null for global)
   * @param urn - URN of the entity being changed
   * @param changeType - Type of change
   * @param options - Analysis options
   * @returns Impact report with affected assets and recommendations
   */
  async analyzeImpact(
    tenantId: string | null,
    urn: string,
    changeType: ChangeType,
    options: ImpactAnalysisOptions = {},
  ): Promise<ImpactReport> {
    const {
      maxDepth = 10,
      includeUpstream = false,
      includeDownstream = true,
      filterByTier,
      filterByType,
    } = options;

    logger.info(
      { tenantId, urn, changeType, options },
      "Analyzing impact of metadata change"
    );

    // Get lineage graph
    const direction = includeUpstream && includeDownstream
      ? "both"
      : includeUpstream
      ? "upstream"
      : "downstream";

    const graph = await lineageService.getLineageGraph(tenantId, urn, {
      direction,
      depth: maxDepth,
      nodeTypes: filterByType,
    });

    // Analyze impacts
    const affectedAssets = await this.analyzeAffectedAssets(
      tenantId,
      urn,
      changeType,
      graph.nodes,
      graph.edges,
      filterByTier,
    );

    // Categorize impacts
    const criticalImpacts = affectedAssets.filter((a) => a.impactType === "breaks");
    const warnings = affectedAssets.filter((a) => a.impactType === "degrades");
    const safeChanges = affectedAssets.filter((a) => a.impactType === "safe" || a.impactType === "warns");

    // Calculate risk score
    const riskScore = this.calculateRiskScore(criticalImpacts, warnings, affectedAssets.length);

    // Calculate blast radius
    const blastRadius = this.calculateBlastRadius(graph.nodes, graph.edges, urn);

    // Generate recommendation
    const recommendation = this.getRecommendation(riskScore, criticalImpacts.length);

    // Estimate impact
    const estimatedImpact = this.estimateImpact(criticalImpacts, warnings);

    const report: ImpactReport = {
      sourceChange: {
        urn,
        entityType: this.inferEntityType(urn),
        changeType,
        description: this.describeChange(changeType),
      },
      totalAffected: affectedAssets.length,
      criticalImpacts,
      warnings,
      safeChanges,
      riskScore,
      recommendation,
      estimatedImpact,
      blastRadius,
      createdAt: new Date(),
    };

    logger.info(
      {
        urn,
        changeType,
        totalAffected: affectedAssets.length,
        riskScore,
        recommendation,
      },
      "Impact analysis complete"
    );

    return ZImpactReport.parse(report);
  }

  /**
   * Analyze affected assets from lineage graph.
   */
  private async analyzeAffectedAssets(
    tenantId: string | null,
    sourceUrn: string,
    changeType: ChangeType,
    nodes: Array<{ urn: string; type: string; metadata?: Record<string, any> }>,
    edges: Array<{ sourceUrn: string; targetUrn: string; edgeType: string }>,
    filterByTier?: Array<"tier_1" | "tier_2" | "tier_3" | "tier_4" | "tier_5">,
  ): Promise<AffectedAsset[]> {
    const affected: AffectedAsset[] = [];
    const visited = new Set<string>();
    const distances = new Map<string, number>();

    // Calculate distances from source
    this.calculateDistances(sourceUrn, nodes, edges, distances, 0);

    // Analyze each node
    for (const node of nodes) {
      if (node.urn === sourceUrn) continue; // Skip source node
      if (visited.has(node.urn)) continue;
      visited.add(node.urn);

      // Filter by tier if specified
      if (filterByTier && node.metadata?.governanceTier) {
        if (!filterByTier.includes(node.metadata.governanceTier)) {
          continue;
        }
      }

      const distance = distances.get(node.urn) || 0;
      const impactType = this.simulateImpact(node, changeType, distance);
      const reason = this.generateReason(node, changeType, distance);

      affected.push(
        ZAffectedAsset.parse({
          urn: node.urn,
          type: node.type as any,
          impactType,
          reason,
          distance,
          governanceTier: node.metadata?.governanceTier,
          metadata: node.metadata || {},
        }),
      );
    }

    return affected;
  }

  /**
   * Calculate distances from source node using BFS.
   */
  private calculateDistances(
    sourceUrn: string,
    nodes: Array<{ urn: string }>,
    edges: Array<{ sourceUrn: string; targetUrn: string }>,
    distances: Map<string, number>,
    startDistance: number,
  ): void {
    const queue: Array<{ urn: string; distance: number }> = [{ urn: sourceUrn, distance: startDistance }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.urn)) continue;
      visited.add(current.urn);
      distances.set(current.urn, current.distance);

      // Find downstream edges
      const downstreamEdges = edges.filter((e) => e.sourceUrn === current.urn);
      for (const edge of downstreamEdges) {
        if (!visited.has(edge.targetUrn)) {
          queue.push({ urn: edge.targetUrn, distance: current.distance + 1 });
        }
      }
    }
  }

  /**
   * Simulate impact on a dependent asset.
   */
  private simulateImpact(
    node: { urn: string; type: string; metadata?: Record<string, any> },
    changeType: ChangeType,
    distance: number,
  ): ImpactType {
    // Entity deletion always breaks dependents
    if (changeType === "entity_delete") {
      return "breaks";
    }

    // Field deletion may break dependents
    if (changeType === "field_delete") {
      if (node.type === "kpi" || node.type === "report") {
        return "breaks";
      }
      if (node.type === "transformation") {
        return "degrades";
      }
      return "warns";
    }

    // Tier changes to Tier 1/2 are critical
    if (changeType === "tier_change") {
      const tier = node.metadata?.governanceTier;
      if (tier === "tier_1" || tier === "tier_2") {
        return "degrades";
      }
      return "warns";
    }

    // SOT changes affect Tier 1 assets
    if (changeType === "sot_change") {
      const tier = node.metadata?.governanceTier;
      if (tier === "tier_1") {
        return "degrades";
      }
      return "warns";
    }

    // Schema changes may cause issues
    if (changeType === "schema_change") {
      if (node.type === "kpi" || node.type === "report") {
        return "degrades";
      }
      return "warns";
    }

    // Field updates are usually safe
    if (changeType === "field_update") {
      if (distance === 0) {
        return "safe";
      }
      return "warns";
    }

    // KPI changes affect reports
    if (changeType === "kpi_change") {
      if (node.type === "report") {
        return "degrades";
      }
      return "warns";
    }

    return "warns";
  }

  /**
   * Generate reason for impact.
   */
  private generateReason(
    node: { urn: string; type: string },
    changeType: ChangeType,
    distance: number,
  ): string {
    const changeDesc = this.describeChange(changeType);
    const nodeType = node.type;

    if (distance === 0) {
      return `${nodeType} directly depends on changed entity`;
    }

    return `${nodeType} depends on changed entity (${distance} level${distance > 1 ? "s" : ""} away)`;
  }

  /**
   * Calculate risk score.
   */
  private calculateRiskScore(
    breaks: AffectedAsset[],
    warnings: AffectedAsset[],
    totalAffected: number,
  ): number {
    let score = 0;

    // Breaking changes are severe
    score += breaks.length * 25;

    // Tier 1/2 assets breaking is critical
    score += breaks.filter((b) => b.governanceTier === "tier_1").length * 20;
    score += breaks.filter((b) => b.governanceTier === "tier_2").length * 15;

    // KPIs and reports breaking is critical
    score += breaks.filter((b) => b.type === "kpi").length * 15;
    score += breaks.filter((b) => b.type === "report").length * 10;

    // Warnings add minor risk
    score += warnings.length * 5;

    // Scale by affected count
    if (totalAffected > 10) score += 10;
    if (totalAffected > 50) score += 20;
    if (totalAffected > 100) score += 30;

    return Math.min(100, score);
  }

  /**
   * Calculate blast radius.
   */
  private calculateBlastRadius(
    nodes: Array<{ urn: string }>,
    edges: Array<{ sourceUrn: string; targetUrn: string }>,
    sourceUrn: string,
  ): { direct: number; indirect: number; maxDepth: number } {
    const direct = edges.filter((e) => e.sourceUrn === sourceUrn).length;
    const indirect = nodes.length - direct - 1; // -1 for source node
    const maxDepth = this.calculateMaxDepth(sourceUrn, edges);

    return { direct, indirect, maxDepth };
  }

  /**
   * Calculate maximum depth from source.
   */
  private calculateMaxDepth(
    sourceUrn: string,
    edges: Array<{ sourceUrn: string; targetUrn: string }>,
  ): number {
    const distances = new Map<string, number>();
    this.calculateDistances(sourceUrn, [], edges, distances, 0);
    return Math.max(...Array.from(distances.values()), 0);
  }

  /**
   * Get recommendation based on risk score.
   */
  private getRecommendation(
    riskScore: number,
    breakingCount: number,
  ): "proceed" | "review" | "block" {
    if (breakingCount > 0 || riskScore >= 70) return "block";
    if (riskScore >= 30) return "review";
    return "proceed";
  }

  /**
   * Estimate impact on users and workflows.
   */
  private estimateImpact(
    breaks: AffectedAsset[],
    warnings: AffectedAsset[],
  ): { users: number; workflows: number; revenue?: string } {
    let users = 0;
    let workflows = 0;

    for (const impact of breaks) {
      if (impact.type === "kpi" || impact.type === "report") {
        users += 100;
      }
      if (impact.type === "transformation") {
        workflows += 1;
      }
    }

    for (const impact of warnings) {
      if (impact.type === "kpi" || impact.type === "report") {
        users += 50;
      }
    }

    const revenue =
      workflows > 0
        ? `~$${(workflows * 1000).toLocaleString()}/day`
        : undefined;

    return { users, workflows, revenue };
  }

  /**
   * Get affected assets for a given URN.
   */
  async getAffectedAssets(
    tenantId: string | null,
    urn: string,
    options: ImpactAnalysisOptions = {},
  ): Promise<AffectedAsset[]> {
    const report = await this.analyzeImpact(
      tenantId,
      urn,
      "field_update", // Default change type
      options,
    );

    return [...report.criticalImpacts, ...report.warnings, ...report.safeChanges];
  }

  // ─────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────

  private inferEntityType(urn: string): string {
    if (urn.includes(":field:")) return "field_dictionary";
    if (urn.includes(":business_term:")) return "business_term";
    if (urn.includes(":data_contract:")) return "data_contract";
    if (urn.includes(":kpi:")) return "kpi";
    if (urn.includes(":report:")) return "report";
    return "unknown";
  }

  private describeChange(changeType: ChangeType): string {
    const descriptions: Record<ChangeType, string> = {
      field_update: "Updating field definition",
      field_delete: "Deleting field",
      sot_change: "Changing Source of Truth pack",
      kpi_change: "Changing KPI definition",
      tier_change: "Changing governance tier",
      entity_delete: "Deleting entity",
      schema_change: "Modifying schema structure",
    };
    return descriptions[changeType] || changeType;
  }
}

export const impactAnalysisService = new ImpactAnalysisService();


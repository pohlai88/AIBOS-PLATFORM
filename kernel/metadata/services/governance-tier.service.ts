/**
 * Governance Tier Service
 * 
 * GRCD v4.1.0 Compliant: Tier-based metadata governance
 * 
 * Manages governance tier requirements, validation, and HITL integration.
 * Leverages patterns from kernel/sandbox/resource-governor.ts
 */

import type { GovernanceTier } from "../catalog/types";
import { HITLApprovalEngine } from "../../governance/hitl/approval-engine";
import { lineageService } from "../lineage";
import { impactAnalysisService } from "../impact";
import { profilingService } from "../profiling"; // Phase 3.1: Profiling service
import type { ChangeType } from "../impact/types";
import { baseLogger } from "../../observability/logger";

const logger = baseLogger.child({ module: "metadata:governance-tier" });

/**
 * Tier requirements per GRCD v4.1.0
 */
export interface TierRequirements {
  /** Requires lineage coverage */
  requiresLineage: boolean;
  /** Requires data profiling */
  requiresProfiling: boolean;
  /** Requires HITL approval for changes */
  requiresHITL: boolean;
  /** Requires standard pack association */
  requiresStandardPack: boolean;
  /** Requires owner/steward assignment */
  requiresOwnership: boolean;
  /** Minimum approval count for changes */
  minApprovals: number;
  /** Approval timeout in hours */
  approvalTimeoutHours: number;
}

/**
 * Tier requirements configuration
 */
const TIER_REQUIREMENTS: Record<GovernanceTier, TierRequirements> = {
  tier_1: {
    requiresLineage: true,        // Mandatory for Tier 1
    requiresProfiling: true,      // Mandatory for Tier 1
    requiresHITL: true,           // Mandatory for Tier 1
    requiresStandardPack: true,    // Mandatory for Tier 1
    requiresOwnership: true,       // Mandatory for Tier 1
    minApprovals: 2,              // Dual approval for Tier 1
    approvalTimeoutHours: 24,      // 24-hour timeout
  },
  tier_2: {
    requiresLineage: false,        // Optional for Tier 2
    requiresProfiling: true,       // Mandatory for Tier 2
    requiresHITL: true,            // Mandatory for Tier 2
    requiresStandardPack: false,   // Optional for Tier 2
    requiresOwnership: true,       // Mandatory for Tier 2
    minApprovals: 1,              // Single approval for Tier 2
    approvalTimeoutHours: 48,      // 48-hour timeout
  },
  tier_3: {
    requiresLineage: false,
    requiresProfiling: false,
    requiresHITL: false,           // No HITL for Tier 3
    requiresStandardPack: false,
    requiresOwnership: false,       // Optional for Tier 3
    minApprovals: 0,
    approvalTimeoutHours: 0,
  },
  tier_4: {
    requiresLineage: false,
    requiresProfiling: false,
    requiresHITL: false,
    requiresStandardPack: false,
    requiresOwnership: false,
    minApprovals: 0,
    approvalTimeoutHours: 0,
  },
  tier_5: {
    requiresLineage: false,
    requiresProfiling: false,
    requiresHITL: false,
    requiresStandardPack: false,
    requiresOwnership: false,
    minApprovals: 0,
    approvalTimeoutHours: 0,
  },
};

/**
 * Governance Tier Service
 */
export class GovernanceTierService {
  private hitlEngine: HITLApprovalEngine;

  constructor() {
    this.hitlEngine = new HITLApprovalEngine();
    logger.info("GovernanceTierService initialized");
  }

  /**
   * Get tier requirements
   */
  getTierRequirements(tier: GovernanceTier): TierRequirements {
    return TIER_REQUIREMENTS[tier];
  }

  /**
   * Validate if entity meets tier requirements
   * Phase 2.2: Integrated with lineage service for lineage coverage checks
   */
  async validateTierCompliance(
    tier: GovernanceTier,
    entity: {
      hasLineage?: boolean;
      hasProfiling?: boolean;
      hasStandardPack?: boolean;
      hasOwner?: boolean;
      hasSteward?: boolean;
      urn?: string;  // Phase 2.2: URN for lineage coverage check
      tenantId?: string | null;  // Phase 2.2: Tenant ID for lineage check
      fieldId?: string;  // Phase 3.1: Field ID for profiling check
    }
  ): Promise<{ compliant: boolean; violations: string[] }> {
    const requirements = this.getTierRequirements(tier);
    const violations: string[] = [];

    // Phase 2.2: Check lineage coverage using lineage service
    if (requirements.requiresLineage) {
      if (entity.urn && entity.tenantId !== undefined) {
        // Use lineage service to check actual lineage coverage
        const hasLineageCoverage = await lineageService.hasLineageCoverage(
          entity.tenantId,
          entity.urn
        );
        if (!hasLineageCoverage) {
          violations.push("Missing lineage coverage (required for Tier 1). Add upstream lineage edges.");
        }
      } else if (!entity.hasLineage) {
        // Fallback to boolean flag if URN not provided
        violations.push("Missing lineage coverage (required for Tier 1)");
      }
    }

    // Phase 3.1: Check profiling using profiling service
    if (requirements.requiresProfiling) {
      if (entity.urn && entity.tenantId !== undefined && entity.fieldId) {
        // Use profiling service to check actual profiling status
        const hasProfilingData = await profilingService.hasProfiling(
          entity.tenantId,
          entity.fieldId
        );
        if (!hasProfilingData) {
          violations.push("Missing data profiling (required for Tier 1/2). Run profiling job.");
        }
      } else if (!entity.hasProfiling) {
        // Fallback to boolean flag if fieldId not provided
        violations.push("Missing data profiling (required for Tier 1/2)");
      }
    }

    if (requirements.requiresStandardPack && !entity.hasStandardPack) {
      violations.push("Missing standard pack association (required for Tier 1)");
    }

    if (requirements.requiresOwnership) {
      if (!entity.hasOwner && !entity.hasSteward) {
        violations.push("Missing owner or steward (required for Tier 1/2)");
      } else if (!entity.hasOwner) {
        violations.push("Missing owner (required for Tier 1/2)");
      } else if (!entity.hasSteward) {
        violations.push("Missing steward (required for Tier 1/2)");
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
    };
  }

  /**
   * Check if change requires HITL approval
   */
  requiresHITLApproval(
    tier: GovernanceTier,
    changeType: "create" | "update" | "delete" | "tier_change"
  ): boolean {
    const requirements = this.getTierRequirements(tier);

    // Tier changes always require HITL
    if (changeType === "tier_change") {
      return true;
    }

    // Tier 1/2 changes require HITL
    if (requirements.requiresHITL) {
      return true;
    }

    return false;
  }

  /**
   * Request HITL approval for metadata change
   * Phase 2.3: Integrated with impact analysis service
   */
  async requestChangeApproval(
    tier: GovernanceTier,
    changeType: "create" | "update" | "delete" | "tier_change",
    options: {
      tenantId: string;
      requester: string;
      entityType: string;
      entityId: string;
      entityKey: string;
      description: string;
      affectedResources?: string[];
      justification?: string;
      urn?: string;  // Phase 2.3: URN for impact analysis
    }
  ): Promise<string> {
    const requirements = this.getTierRequirements(tier);

    if (!this.requiresHITLApproval(tier, changeType)) {
      logger.info(
        { tier, changeType, entityKey: options.entityKey },
        "Change does not require HITL approval"
      );
      return `auto-approved-${Date.now()}`;
    }

    // Phase 2.3: Get impact analysis if URN provided
    let impactReport = null;
    let estimatedImpact = `Tier ${tier} metadata change`;

    if (options.urn) {
      try {
        const changeTypeMap: Record<string, ChangeType> = {
          create: "field_update",
          update: "field_update",
          delete: "field_delete",
          tier_change: "tier_change",
        };

        impactReport = await impactAnalysisService.analyzeImpact(
          options.tenantId === "global" ? null : options.tenantId,
          options.urn,
          changeTypeMap[changeType] || "field_update",
          { maxDepth: 10 },
        );

        // Update estimated impact with actual analysis
        estimatedImpact = `Tier ${tier} metadata change. ` +
          `Risk Score: ${impactReport.riskScore}/100. ` +
          `Affected: ${impactReport.totalAffected} assets. ` +
          `Recommendation: ${impactReport.recommendation.toUpperCase()}`;

        // Add critical impacts to affected resources
        if (impactReport.criticalImpacts.length > 0) {
          const criticalUrns = impactReport.criticalImpacts
            .slice(0, 10) // Limit to first 10
            .map((impact) => impact.urn);
          options.affectedResources = [
            ...(options.affectedResources || []),
            ...criticalUrns,
          ];
        }

        logger.info(
          {
            urn: options.urn,
            changeType,
            riskScore: impactReport.riskScore,
            totalAffected: impactReport.totalAffected,
            recommendation: impactReport.recommendation,
          },
          "Impact analysis completed for HITL approval"
        );
      } catch (error) {
        logger.warn(
          { urn: options.urn, error },
          "Failed to get impact analysis, proceeding without it"
        );
      }
    }

    const riskLevel = tier === "tier_1" ? "HIGH" : "MEDIUM";

    // Phase 2.3: Adjust risk level based on impact analysis
    let finalRiskLevel = riskLevel;
    if (impactReport) {
      if (impactReport.riskScore >= 70 || impactReport.recommendation === "block") {
        finalRiskLevel = "HIGH";
      } else if (impactReport.riskScore >= 30 || impactReport.recommendation === "review") {
        finalRiskLevel = "MEDIUM";
      }
    }

    const requestId = await this.hitlEngine.requestApproval({
      actionType: `metadata.${changeType}`,
      requester: options.requester,
      tenantId: options.tenantId,
      description: options.description,
      affectedResources: options.affectedResources || [
        `${options.entityType}:${options.entityKey}`,
      ],
      estimatedImpact,
      justification: options.justification,
      overrideRiskLevel: finalRiskLevel as any,
      context: impactReport
        ? {
            impactReport: {
              riskScore: impactReport.riskScore,
              totalAffected: impactReport.totalAffected,
              criticalImpacts: impactReport.criticalImpacts.length,
              recommendation: impactReport.recommendation,
            },
          }
        : undefined,
    });

    logger.info(
      { requestId, tier, changeType, entityKey: options.entityKey, riskLevel: finalRiskLevel },
      "HITL approval requested for metadata change"
    );

    return requestId;
  }

  /**
   * Check if approval is granted
   */
  async checkApprovalStatus(requestId: string): Promise<{
    approved: boolean;
    status: string;
    approvers?: string[];
  }> {
    const request = this.hitlEngine.getRequest(requestId);

    if (!request) {
      return { approved: false, status: "not_found" };
    }

    return {
      approved: request.status === "approved",
      status: request.status,
      approvers: request.assignedApprovers,
    };
  }

  /**
   * Validate tier upgrade/downgrade
   */
  async validateTierChange(
    fromTier: GovernanceTier,
    toTier: GovernanceTier,
    entity: {
      hasLineage?: boolean;
      hasProfiling?: boolean;
      hasStandardPack?: boolean;
      hasOwner?: boolean;
    }
  ): Promise<{ allowed: boolean; reason?: string }> {
    // Downgrade is always allowed (less strict requirements)
    if (this.compareTiers(fromTier, toTier) > 0) {
      return { allowed: true };
    }

    // Upgrade requires meeting new tier requirements
    const newRequirements = this.getTierRequirements(toTier);
    const compliance = await this.validateTierCompliance(toTier, entity);

    if (!compliance.compliant) {
      return {
        allowed: false,
        reason: `Cannot upgrade to ${toTier}: ${compliance.violations.join(", ")}`,
      };
    }

    return { allowed: true };
  }

  /**
   * Compare two tiers (returns positive if tier1 > tier2)
   */
  private compareTiers(tier1: GovernanceTier, tier2: GovernanceTier): number {
    const order: GovernanceTier[] = ["tier_1", "tier_2", "tier_3", "tier_4", "tier_5"];
    return order.indexOf(tier1) - order.indexOf(tier2);
  }
}

// Singleton instance
export const governanceTierService = new GovernanceTierService();


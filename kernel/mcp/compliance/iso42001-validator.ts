/**
 * ISO 42001 Compliance Validator
 * 
 * GRCD Compliance: C-7 (MCP Manifest Compliance)
 * Standard: ISO 42001 (AI Management Systems)
 * 
 * Validates MCP manifests against ISO 42001 requirements.
 */

import type { MCPManifest } from "../../types";
import {
  ISO42001Requirements,
  ComplianceResult,
  ComplianceViolation,
  ComplianceWarning,
  AIGovernanceChecks,
  RiskManagementChecks,
  TransparencyChecks,
  HumanOversightChecks,
} from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("iso42001-validator");

export class ISO42001Validator {
  /**
   * Validate MCP manifest against ISO 42001 requirements
   * 
   * @param manifest - MCP manifest to validate
   * @returns Compliance result
   */
  validateManifest(manifest: MCPManifest): ComplianceResult {
    const startTime = Date.now();
    
    // Perform all compliance checks
    const aiGovernance = this.validateAIGovernance(manifest);
    const riskManagement = this.validateRiskManagement(manifest);
    const transparency = this.validateTransparency(manifest);
    const humanOversight = this.validateHumanOversight(manifest);
    
    // Collect violations and warnings
    const violations: ComplianceViolation[] = [];
    const warnings: ComplianceWarning[] = [];
    
    // Check AI Governance
    if (!aiGovernance.purposeDefined) {
      violations.push({
        id: "ai-gov-001",
        category: "ai_governance",
        description: "AI system purpose is not clearly defined",
        requirement: "ISO 42001:2023 4.2.1",
        severity: "high",
        remediation: "Add clear purpose statement to manifest description",
      });
    }
    
    if (!aiGovernance.boundariesDocumented) {
      violations.push({
        id: "ai-gov-002",
        category: "ai_governance",
        description: "AI system boundaries are not documented",
        requirement: "ISO 42001:2023 4.2.2",
        severity: "medium",
        remediation: "Document system boundaries and limitations",
      });
    }
    
    if (!aiGovernance.limitationsDisclosed) {
      warnings.push({
        id: "ai-gov-warn-001",
        category: "ai_governance",
        description: "AI system limitations are not explicitly disclosed",
        recommendation: "Add limitations section to manifest",
      });
    }
    
    // Check Risk Management
    if (!riskManagement.riskAssessment) {
      violations.push({
        id: "risk-001",
        category: "risk_management",
        description: "Risk assessment not performed",
        requirement: "ISO 42001:2023 6.1.2",
        severity: "high",
        remediation: "Perform and document risk assessment",
      });
    }
    
    if (!riskManagement.riskClassified) {
      violations.push({
        id: "risk-002",
        category: "risk_management",
        description: "Risk level not classified",
        requirement: "ISO 42001:2023 6.1.3",
        severity: "high",
        remediation: "Classify risk level (low/medium/high/critical)",
      });
    }
    
    // Check Transparency
    if (!transparency.aiIdentifiable) {
      violations.push({
        id: "trans-001",
        category: "transparency",
        description: "AI system is not clearly identifiable as AI",
        requirement: "ISO 42001:2023 7.3.1",
        severity: "medium",
        remediation: "Ensure manifest clearly identifies this as an AI system",
      });
    }
    
    if (!transparency.explainability) {
      warnings.push({
        id: "trans-warn-001",
        category: "transparency",
        description: "Decision-making process may not be explainable",
        recommendation: "Document how AI decisions are made",
      });
    }
    
    // Check Human Oversight
    if (!humanOversight.oversightMechanism) {
      violations.push({
        id: "oversight-001",
        category: "human_oversight",
        description: "Human oversight mechanism not defined",
        requirement: "ISO 42001:2023 7.4.1",
        severity: "critical",
        remediation: "Implement human-in-the-loop approval workflow",
      });
    }
    
    if (!humanOversight.hitlForCritical) {
      violations.push({
        id: "oversight-002",
        category: "human_oversight",
        description: "Human-in-the-loop not required for critical decisions",
        requirement: "ISO 42001:2023 7.4.2",
        severity: "critical",
        remediation: "Require human approval for high-risk/critical actions",
      });
    }
    
    // Calculate compliance score
    const totalChecks = 20; // Total number of checks
    const passedChecks = 
      Object.values(aiGovernance).filter(Boolean).length +
      Object.values(riskManagement).filter(Boolean).length +
      Object.values(transparency).filter(Boolean).length +
      Object.values(humanOversight).filter(Boolean).length;
    
    const score = Math.round((passedChecks / totalChecks) * 100);
    const compliant = violations.filter((v) => v.severity === "critical" || v.severity === "high").length === 0;
    
    const result: ComplianceResult = {
      compliant,
      score,
      violations,
      warnings,
      checks: {
        aiGovernance,
        riskManagement,
        transparency,
        humanOversight,
      },
      validatedAt: Date.now(),
    };
    
    const duration = Date.now() - startTime;
    logger.info("ISO 42001 compliance validation complete", {
      manifestId: manifest.id,
      manifestName: manifest.name,
      compliant,
      score,
      violationsCount: violations.length,
      warningsCount: warnings.length,
      durationMs: duration,
    });
    
    return result;
  }

  /**
   * Validate AI Governance requirements
   */
  private validateAIGovernance(manifest: MCPManifest): AIGovernanceChecks {
    return {
      purposeDefined: !!manifest.description && manifest.description.length > 20,
      boundariesDocumented: !!manifest.capabilities,
      limitationsDisclosed: !!manifest.description && manifest.description.toLowerCase().includes("limit"),
      trainingDataDocumented: false, // Not applicable for MCP manifests
      biasMitigation: false, // Not applicable for MCP manifests
    };
  }

  /**
   * Validate Risk Management requirements
   */
  private validateRiskManagement(manifest: MCPManifest): RiskManagementChecks {
    // Check if manifest has risk metadata
    const hasRiskMetadata = !!(manifest as any).metadata?.risk;
    
    return {
      riskAssessment: hasRiskMetadata,
      riskClassified: hasRiskMetadata && !!(manifest as any).metadata?.risk?.level,
      mitigationMeasures: hasRiskMetadata && !!(manifest as any).metadata?.risk?.mitigation,
      incidentResponsePlan: false, // Not in manifest scope
      continuousMonitoring: false, // Not in manifest scope
    };
  }

  /**
   * Validate Transparency requirements
   */
  private validateTransparency(manifest: MCPManifest): TransparencyChecks {
    const description = manifest.description?.toLowerCase() || "";
    
    return {
      aiIdentifiable: description.includes("ai") || description.includes("artificial intelligence"),
      explainability: !!manifest.description && manifest.description.length > 50,
      userInformed: true, // Assumed if manifest is public
      dataSourcesDisclosed: false, // Not applicable for MCP manifests
      algorithmTransparency: !!manifest.description,
    };
  }

  /**
   * Validate Human Oversight requirements
   */
  private validateHumanOversight(manifest: MCPManifest): HumanOversightChecks {
    // Check if manifest indicates HITL support
    const hasHitlMetadata = !!(manifest as any).metadata?.hitl;
    const description = manifest.description?.toLowerCase() || "";
    
    return {
      oversightMechanism: hasHitlMetadata || description.includes("human") || description.includes("approval"),
      humanOverride: hasHitlMetadata || description.includes("override"),
      approvalWorkflow: hasHitlMetadata || description.includes("approval"),
      hitlForCritical: hasHitlMetadata,
      escalationPath: hasHitlMetadata,
    };
  }

  /**
   * Validate AI Governance specifically
   */
  validateAIGovernance(manifest: MCPManifest): ComplianceResult {
    const checks = this.validateAIGovernance(manifest);
    const violations: ComplianceViolation[] = [];
    
    if (!checks.purposeDefined) {
      violations.push({
        id: "ai-gov-001",
        category: "ai_governance",
        description: "AI system purpose is not clearly defined",
        requirement: "ISO 42001:2023 4.2.1",
        severity: "high",
      });
    }
    
    return {
      compliant: violations.length === 0,
      score: Object.values(checks).filter(Boolean).length * 20, // 5 checks * 20 points
      violations,
      warnings: [],
      checks: {
        aiGovernance: checks,
        riskManagement: {} as RiskManagementChecks,
        transparency: {} as TransparencyChecks,
        humanOversight: {} as HumanOversightChecks,
      },
      validatedAt: Date.now(),
    };
  }

  /**
   * Validate Risk Management specifically
   */
  validateRiskManagement(manifest: MCPManifest): ComplianceResult {
    const checks = this.validateRiskManagement(manifest);
    const violations: ComplianceViolation[] = [];
    
    if (!checks.riskAssessment) {
      violations.push({
        id: "risk-001",
        category: "risk_management",
        description: "Risk assessment not performed",
        requirement: "ISO 42001:2023 6.1.2",
        severity: "high",
      });
    }
    
    return {
      compliant: violations.length === 0,
      score: Object.values(checks).filter(Boolean).length * 20,
      violations,
      warnings: [],
      checks: {
        aiGovernance: {} as AIGovernanceChecks,
        riskManagement: checks,
        transparency: {} as TransparencyChecks,
        humanOversight: {} as HumanOversightChecks,
      },
      validatedAt: Date.now(),
    };
  }

  /**
   * Validate Transparency specifically
   */
  validateTransparency(manifest: MCPManifest): ComplianceResult {
    const checks = this.validateTransparency(manifest);
    const violations: ComplianceViolation[] = [];
    
    if (!checks.aiIdentifiable) {
      violations.push({
        id: "trans-001",
        category: "transparency",
        description: "AI system is not clearly identifiable as AI",
        requirement: "ISO 42001:2023 7.3.1",
        severity: "medium",
      });
    }
    
    return {
      compliant: violations.length === 0,
      score: Object.values(checks).filter(Boolean).length * 20,
      violations,
      warnings: [],
      checks: {
        aiGovernance: {} as AIGovernanceChecks,
        riskManagement: {} as RiskManagementChecks,
        transparency: checks,
        humanOversight: {} as HumanOversightChecks,
      },
      validatedAt: Date.now(),
    };
  }

  /**
   * Validate Human Oversight specifically
   */
  validateHumanOversight(manifest: MCPManifest): ComplianceResult {
    const checks = this.validateHumanOversight(manifest);
    const violations: ComplianceViolation[] = [];
    
    if (!checks.oversightMechanism) {
      violations.push({
        id: "oversight-001",
        category: "human_oversight",
        description: "Human oversight mechanism not defined",
        requirement: "ISO 42001:2023 7.4.1",
        severity: "critical",
      });
    }
    
    return {
      compliant: violations.length === 0,
      score: Object.values(checks).filter(Boolean).length * 20,
      violations,
      warnings: [],
      checks: {
        aiGovernance: {} as AIGovernanceChecks,
        riskManagement: {} as RiskManagementChecks,
        transparency: {} as TransparencyChecks,
        humanOversight: checks,
      },
      validatedAt: Date.now(),
    };
  }
}

// Singleton instance
export const iso42001Validator = new ISO42001Validator();


/**
 * EU AI Act Compliance Validator
 * 
 * GRCD Compliance: C-7 (MCP Manifest Compliance)
 * Standard: EU AI Act (Regulation 2021/0106)
 * 
 * Validates MCP manifests against EU AI Act requirements.
 */

import type { MCPManifest } from "../../types";
import {
  AIRiskCategory,
  EUAIActComplianceResult,
  ComplianceViolation,
} from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("euai-act-validator");

/**
 * Prohibited AI practices under EU AI Act
 */
const PROHIBITED_PRACTICES = [
  "social_scoring",
  "real_time_biometric_identification",
  "emotion_recognition_workplace",
  "predictive_policing",
  "exploitation_vulnerability",
];

export class EUAIActValidator {
  /**
   * Classify AI risk category according to EU AI Act
   * 
   * @param manifest - MCP manifest
   * @returns AI risk category
   */
  classifyRisk(manifest: MCPManifest): AIRiskCategory {
    // Check for prohibited practices first
    const description = (manifest.description || "").toLowerCase();
    const name = (manifest.name || "").toLowerCase();
    
    for (const practice of PROHIBITED_PRACTICES) {
      if (description.includes(practice) || name.includes(practice)) {
        return AIRiskCategory.UNACCEPTABLE;
      }
    }
    
    // Check for high-risk indicators
    const highRiskIndicators = [
      "biometric",
      "critical_infrastructure",
      "education",
      "employment",
      "access_to_essential_services",
      "law_enforcement",
      "migration",
      "justice",
    ];
    
    for (const indicator of highRiskIndicators) {
      if (description.includes(indicator) || name.includes(indicator)) {
        return AIRiskCategory.HIGH;
      }
    }
    
    // Check for limited risk (transparency requirements)
    const limitedRiskIndicators = [
      "chatbot",
      "deepfake",
      "emotion_recognition",
      "biometric_categorization",
    ];
    
    for (const indicator of limitedRiskIndicators) {
      if (description.includes(indicator) || name.includes(indicator)) {
        return AIRiskCategory.LIMITED;
      }
    }
    
    // Default to minimal risk
    return AIRiskCategory.MINIMAL;
  }

  /**
   * Validate high-risk requirements
   * 
   * @param manifest - MCP manifest
   * @returns Compliance result
   */
  validateHighRiskRequirements(manifest: MCPManifest): EUAIActComplianceResult {
    const riskCategory = this.classifyRisk(manifest);
    
    if (riskCategory !== AIRiskCategory.HIGH) {
      return {
        riskCategory,
        compliant: true,
        requiredMeasures: [],
        violations: [],
        prohibitedPractices: [],
      };
    }
    
    // High-risk systems require:
    // 1. Risk management system
    // 2. Data governance
    // 3. Technical documentation
    // 4. Record keeping
    // 5. Transparency and user information
    // 6. Human oversight
    // 7. Accuracy, robustness, and cybersecurity
    
    const violations: ComplianceViolation[] = [];
    const requiredMeasures: string[] = [];
    
    // Check for risk management
    const hasRiskManagement = !!(manifest as any).metadata?.riskManagement;
    if (!hasRiskManagement) {
      violations.push({
        id: "euai-high-001",
        category: "risk_management",
        description: "Risk management system not documented",
        requirement: "EU AI Act Article 9",
        severity: "high",
        remediation: "Implement and document risk management system",
      });
    } else {
      requiredMeasures.push("Risk management system");
    }
    
    // Check for data governance
    const hasDataGovernance = !!(manifest as any).metadata?.dataGovernance;
    if (!hasDataGovernance) {
      violations.push({
        id: "euai-high-002",
        category: "ai_governance",
        description: "Data governance measures not documented",
        requirement: "EU AI Act Article 10",
        severity: "high",
        remediation: "Implement data governance measures",
      });
    } else {
      requiredMeasures.push("Data governance");
    }
    
    // Check for human oversight
    const hasHumanOversight = !!(manifest as any).metadata?.hitl;
    if (!hasHumanOversight) {
      violations.push({
        id: "euai-high-003",
        category: "human_oversight",
        description: "Human oversight mechanism not implemented",
        requirement: "EU AI Act Article 14",
        severity: "critical",
        remediation: "Implement human-in-the-loop oversight",
      });
    } else {
      requiredMeasures.push("Human oversight");
    }
    
    return {
      riskCategory,
      compliant: violations.length === 0,
      requiredMeasures,
      violations,
      prohibitedPractices: [],
    };
  }

  /**
   * Check for prohibited practices
   * 
   * @param manifest - MCP manifest
   * @returns Compliance result
   */
  checkProhibitedPractices(manifest: MCPManifest): EUAIActComplianceResult {
    const riskCategory = this.classifyRisk(manifest);
    const description = (manifest.description || "").toLowerCase();
    const name = (manifest.name || "").toLowerCase();
    
    const prohibitedPractices: string[] = [];
    
    for (const practice of PROHIBITED_PRACTICES) {
      if (description.includes(practice) || name.includes(practice)) {
        prohibitedPractices.push(practice);
      }
    }
    
    const violations: ComplianceViolation[] = prohibitedPractices.map((practice) => ({
      id: `euai-prohibited-${practice}`,
      category: "ai_governance",
      description: `Prohibited AI practice detected: ${practice}`,
      requirement: "EU AI Act Article 5",
      severity: "critical",
      remediation: "Remove prohibited practice or obtain exemption",
    }));
    
    return {
      riskCategory,
      compliant: prohibitedPractices.length === 0,
      requiredMeasures: [],
      violations,
      prohibitedPractices,
    };
  }
}

// Singleton instance
export const euaiActValidator = new EUAIActValidator();


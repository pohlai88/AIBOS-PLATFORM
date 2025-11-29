/**
 * ISO 42001 Compliance Types
 * 
 * GRCD Compliance: C-7 (MCP Manifest Compliance)
 * Standard: ISO 42001 (AI Management Systems), EU AI Act
 * 
 * Defines compliance validation types for AI governance.
 */

export interface ISO42001Requirements {
  /** AI governance requirements */
  aiGovernance: AIGovernanceChecks;
  
  /** Risk management requirements */
  riskManagement: RiskManagementChecks;
  
  /** Transparency requirements */
  transparency: TransparencyChecks;
  
  /** Human oversight requirements */
  humanOversight: HumanOversightChecks;
}

export interface AIGovernanceChecks {
  /** AI system purpose is clearly defined */
  purposeDefined: boolean;
  
  /** AI system boundaries are documented */
  boundariesDocumented: boolean;
  
  /** AI system limitations are disclosed */
  limitationsDisclosed: boolean;
  
  /** AI system training data is documented */
  trainingDataDocumented: boolean;
  
  /** AI system bias mitigation measures */
  biasMitigation: boolean;
}

export interface RiskManagementChecks {
  /** Risk assessment performed */
  riskAssessment: boolean;
  
  /** Risk level classified */
  riskClassified: boolean;
  
  /** Risk mitigation measures documented */
  mitigationMeasures: boolean;
  
  /** Incident response plan exists */
  incidentResponsePlan: boolean;
  
  /** Continuous monitoring in place */
  continuousMonitoring: boolean;
}

export interface TransparencyChecks {
  /** AI system is identifiable as AI */
  aiIdentifiable: boolean;
  
  /** Decision-making process is explainable */
  explainability: boolean;
  
  /** User informed about AI usage */
  userInformed: boolean;
  
  /** Data sources disclosed */
  dataSourcesDisclosed: boolean;
  
  /** Algorithm transparency */
  algorithmTransparency: boolean;
}

export interface HumanOversightChecks {
  /** Human oversight mechanism exists */
  oversightMechanism: boolean;
  
  /** Human can override AI decisions */
  humanOverride: boolean;
  
  /** Approval workflow for high-risk actions */
  approvalWorkflow: boolean;
  
  /** Human-in-the-loop for critical decisions */
  hitlForCritical: boolean;
  
  /** Escalation path defined */
  escalationPath: boolean;
}

export interface ComplianceResult {
  /** Overall compliance status */
  compliant: boolean;
  
  /** Compliance score (0-100) */
  score: number;
  
  /** Compliance violations */
  violations: ComplianceViolation[];
  
  /** Compliance warnings */
  warnings: ComplianceWarning[];
  
  /** Detailed check results */
  checks: {
    aiGovernance: AIGovernanceChecks;
    riskManagement: RiskManagementChecks;
    transparency: TransparencyChecks;
    humanOversight: HumanOversightChecks;
  };
  
  /** Validation timestamp */
  validatedAt: number;
}

export interface ComplianceViolation {
  /** Violation ID */
  id: string;
  
  /** Violation category */
  category: "ai_governance" | "risk_management" | "transparency" | "human_oversight";
  
  /** Violation description */
  description: string;
  
  /** Requirement reference (e.g., "ISO 42001:2023 4.2.1") */
  requirement: string;
  
  /** Severity */
  severity: "critical" | "high" | "medium" | "low";
  
  /** Remediation guidance */
  remediation?: string;
}

export interface ComplianceWarning {
  /** Warning ID */
  id: string;
  
  /** Warning category */
  category: "ai_governance" | "risk_management" | "transparency" | "human_oversight";
  
  /** Warning description */
  description: string;
  
  /** Recommendation */
  recommendation: string;
}

/**
 * EU AI Act Risk Categories
 */
export enum AIRiskCategory {
  /** Unacceptable risk - prohibited */
  UNACCEPTABLE = "unacceptable",
  
  /** High risk - strict requirements */
  HIGH = "high",
  
  /** Limited risk - transparency requirements */
  LIMITED = "limited",
  
  /** Minimal risk - minimal requirements */
  MINIMAL = "minimal",
}

export interface EUAIActComplianceResult {
  /** AI risk category */
  riskCategory: AIRiskCategory;
  
  /** Compliant with EU AI Act */
  compliant: boolean;
  
  /** Required compliance measures */
  requiredMeasures: string[];
  
  /** Violations */
  violations: ComplianceViolation[];
  
  /** Prohibited practices detected */
  prohibitedPractices: string[];
}


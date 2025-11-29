/**
 * Human-in-the-Loop (HITL) Module
 * 
 * GRCD Compliance: C-8 (Human-in-the-Loop for critical AI decisions)
 * Standard: EU AI Act, ISO 42001
 * 
 * Enables human oversight and approval for high-risk AI actions.
 */

// Types
export * from "./types";

// Core Components
export { RiskClassifier, riskClassifier } from "./risk-classifier";
export { ApprovalQueue, approvalQueue, type QueueFilter } from "./approval-queue";
export { HITLApprovalEngine, hitlApprovalEngine, type RequestApprovalOptions } from "./approval-engine";

// Audit
export { HITLAuditLogger, hitlAudit } from "./hitl-audit";


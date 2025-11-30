/**
 * Data Quality Types
 * 
 * GRCD v4.1.0 Compliant: Data quality checks for metadata fields
 * Phase 3.2: Data Quality Checks Service
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Quality Rule Types
// ─────────────────────────────────────────────────────────────

export const QualityRuleTypeEnum = z.enum([
  "not_null",           // NOT NULL constraint
  "unique",             // Uniqueness check
  "min_value",          // Minimum value threshold
  "max_value",          // Maximum value threshold
  "min_length",         // Minimum string length
  "max_length",         // Maximum string length
  "pattern",            // Pattern matching (regex)
  "enum",               // Enum values
  "referential_integrity", // Foreign key integrity
  "custom_sql",         // Custom SQL assertion
]);

export type QualityRuleType = z.infer<typeof QualityRuleTypeEnum>;

// ─────────────────────────────────────────────────────────────
// Quality Rule
// ─────────────────────────────────────────────────────────────

export const ZQualityRule = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  fieldId: z.string().uuid(),  // Reference to field_dictionary.id
  fieldUrn: z.string().min(1),
  ruleType: QualityRuleTypeEnum,
  ruleName: z.string().min(1),
  description: z.string().nullable(),
  
  // Rule configuration (varies by rule type)
  config: z.record(z.any()),  // JSONB: rule-specific configuration
  
  // Thresholds and constraints
  threshold: z.number().nullable(),  // For min/max rules
  pattern: z.string().nullable(),    // For pattern rules
  enumValues: z.array(z.string()).nullable(),  // For enum rules
  customSql: z.string().nullable(),  // For custom SQL rules
  
  // Severity
  severity: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  
  // Status
  isActive: z.boolean().default(true),
  
  // Metadata
  createdBy: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type QualityRule = z.infer<typeof ZQualityRule>;

export const ZCreateQualityRule = ZQualityRule.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateQualityRule = z.infer<typeof ZCreateQualityRule>;

// ─────────────────────────────────────────────────────────────
// Quality Check Result
// ─────────────────────────────────────────────────────────────

export const QualityCheckStatusEnum = z.enum([
  "passed",     // Check passed
  "failed",     // Check failed
  "warning",    // Check passed with warnings
  "error",      // Check execution error
]);

export type QualityCheckStatus = z.infer<typeof QualityCheckStatusEnum>;

export const ZQualityCheckResult = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  ruleId: z.string().uuid(),
  fieldId: z.string().uuid(),
  fieldUrn: z.string().min(1),
  status: QualityCheckStatusEnum,
  
  // Results
  passed: z.boolean(),
  failedCount: z.number().int().min(0).nullable(),  // Number of rows that failed
  totalCount: z.number().int().min(0).nullable(),   // Total rows checked
  passRate: z.number().min(0).max(100).nullable(),  // Pass rate percentage
  
  // Details
  message: z.string().nullable(),
  details: z.record(z.any()).nullable(),  // JSONB: rule-specific details
  
  // Execution metadata
  executedAt: z.date(),
  executedBy: z.string().nullable(),
  executionDurationMs: z.number().int().min(0),
  
  createdAt: z.date(),
});

export type QualityCheckResult = z.infer<typeof ZQualityCheckResult>;

export const ZCreateQualityCheckResult = ZQualityCheckResult.omit({
  id: true,
  createdAt: true,
});

export type CreateQualityCheckResult = z.infer<typeof ZCreateQualityCheckResult>;

// ─────────────────────────────────────────────────────────────
// Quality Violation
// ─────────────────────────────────────────────────────────────

export const ZQualityViolation = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  ruleId: z.string().uuid(),
  checkResultId: z.string().uuid(),
  fieldId: z.string().uuid(),
  fieldUrn: z.string().min(1),
  
  // Violation details
  violationType: QualityRuleTypeEnum,
  severity: z.enum(["critical", "high", "medium", "low"]),
  message: z.string().min(1),
  details: z.record(z.any()).nullable(),  // JSONB: violation-specific details
  
  // Violation data
  sampleValues: z.array(z.any()).nullable(),  // Sample values that violated the rule
  rowCount: z.number().int().min(0),  // Number of rows with this violation
  
  // Status
  isResolved: z.boolean().default(false),
  resolvedAt: z.date().nullable(),
  resolvedBy: z.string().nullable(),
  resolutionNotes: z.string().nullable(),
  
  // Metadata
  detectedAt: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type QualityViolation = z.infer<typeof ZQualityViolation>;

export const ZCreateQualityViolation = ZQualityViolation.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateQualityViolation = z.infer<typeof ZCreateQualityViolation>;

// ─────────────────────────────────────────────────────────────
// Quality Report
// ─────────────────────────────────────────────────────────────

export interface QualityReport {
  fieldId: string;
  fieldUrn: string;
  totalRules: number;
  activeRules: number;
  checksRun: number;
  checksPassed: number;
  checksFailed: number;
  checksWarning: number;
  overallPassRate: number;  // 0-100
  criticalViolations: number;
  highViolations: number;
  mediumViolations: number;
  lowViolations: number;
  lastCheckAt: Date | null;
  qualityScore: number;  // 0-100 (calculated from pass rate and violations)
  recommendations: string[];
}

// ─────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────

export type { QualityRule, CreateQualityRule, QualityCheckResult, CreateQualityCheckResult, QualityViolation, CreateQualityViolation };


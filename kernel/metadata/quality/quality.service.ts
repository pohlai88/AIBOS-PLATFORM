/**
 * Quality Service
 *
 * GRCD v4.1.0 Compliant: Data quality checks for metadata fields
 * Phase 3.2: Data Quality Checks Service
 *
 * Leverages patterns from apps/web/DATA_WAREHOUSE_PRD.md Great Expectations
 */

import { qualityRepository } from "./quality.repository";
import { fieldDictionaryRepository } from "../catalog/field-dictionary.repository";
import type {
  QualityRule,
  CreateQualityRule,
  QualityCheckResult,
  QualityViolation,
  QualityReport,
} from "./types";
import { ZQualityRule } from "./types";
import { getDB } from "../../storage/db";
import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";

const logger = baseLogger.child({ module: "metadata:quality-service" });

/**
 * Quality Service
 *
 * Provides data quality checking capabilities for metadata fields.
 */
export class QualityService {
  /**
   * Define a quality rule.
   */
  async defineRule(input: CreateQualityRule): Promise<QualityRule> {
    return await qualityRepository.createRule(input);
  }

  /**
   * Get quality rules for a field.
   */
  async getRulesByField(
    tenantId: string | null,
    fieldId: string,
    activeOnly: boolean = true
  ): Promise<QualityRule[]> {
    return await qualityRepository.getRulesByField(tenantId, fieldId, activeOnly);
  }

  /**
   * Run quality checks for a field.
   *
   * Executes all active quality rules for the field and returns a quality report.
   */
  async runQualityChecks(
    tenantId: string | null,
    fieldId: string,
    tableName?: string,
    columnName?: string
  ): Promise<QualityReport> {
    const startTime = Date.now();

    try {
      // Get field metadata
      const field = await fieldDictionaryRepository.findById(fieldId);
      if (!field) {
        throw new KernelError(`Field not found: ${fieldId}`, "FIELD_NOT_FOUND");
      }

      // Use provided table/column or infer from field metadata
      const finalTableName = tableName || (field as any).metadata?.tableName || field.canonicalKey.split("_")[0];
      const finalColumnName = columnName || (field as any).metadata?.columnName || field.canonicalKey;

      if (!finalTableName || !finalColumnName) {
        throw new KernelError(
          `Cannot determine table/column for field ${fieldId}. Provide tableName and columnName.`,
          "QUALITY_CHECK_CONFIG_ERROR"
        );
      }

      logger.info(
        { fieldId, tableName: finalTableName, columnName: finalColumnName },
        "Running quality checks"
      );

      // Get active rules for the field
      const rules = await qualityRepository.getRulesByField(tenantId, fieldId, true);

      if (rules.length === 0) {
        logger.warn({ fieldId }, "No active quality rules found for field");
        return {
          fieldId,
          fieldUrn: field.entityUrn || `urn:metadata:field:${field.canonicalKey}`,
          totalRules: 0,
          activeRules: 0,
          checksRun: 0,
          checksPassed: 0,
          checksFailed: 0,
          checksWarning: 0,
          overallPassRate: 100,
          criticalViolations: 0,
          highViolations: 0,
          mediumViolations: 0,
          lowViolations: 0,
          lastCheckAt: null,
          qualityScore: 100,
          recommendations: ["No quality rules defined. Consider adding rules to ensure data quality."],
        };
      }

      // Run checks for each rule
      const checkResults: QualityCheckResult[] = [];
      const violations: QualityViolation[] = [];

      for (const rule of rules) {
        try {
          const result = await this.runRuleCheck(
            tenantId,
            rule,
            finalTableName,
            finalColumnName,
            field.dataType
          );

          checkResults.push(result);

          // Create violations if check failed
          if (!result.passed && result.status === "failed") {
            const violation = await qualityRepository.createViolation({
              tenantId,
              ruleId: rule.id,
              checkResultId: result.id,
              fieldId,
              fieldUrn: field.entityUrn || `urn:metadata:field:${field.canonicalKey}`,
              violationType: rule.ruleType,
              severity: rule.severity,
              message: result.message || `Quality check failed: ${rule.ruleName}`,
              details: result.details || {},
              sampleValues: (result.details as any)?.sampleValues || null,
              rowCount: result.failedCount || 0,
              isResolved: false,
              resolvedAt: null,
              resolvedBy: null,
              resolutionNotes: null,
              detectedAt: new Date(),
            });

            violations.push(violation);
          }
        } catch (error) {
          logger.error({ error, ruleId: rule.id }, "Failed to run quality check for rule");
          // Continue with next rule
        }
      }

      // Calculate quality report
      const checksPassed = checkResults.filter((r) => r.passed).length;
      const checksFailed = checkResults.filter((r) => !r.passed && r.status === "failed").length;
      const checksWarning = checkResults.filter((r) => r.status === "warning").length;
      const totalChecks = checkResults.length;

      const overallPassRate =
        totalChecks > 0
          ? (checksPassed / totalChecks) * 100
          : 100;

      // Count violations by severity
      const criticalViolations = violations.filter((v) => v.severity === "critical").length;
      const highViolations = violations.filter((v) => v.severity === "high").length;
      const mediumViolations = violations.filter((v) => v.severity === "medium").length;
      const lowViolations = violations.filter((v) => v.severity === "low").length;

      // Calculate quality score (0-100)
      // Base score from pass rate, penalized by violations
      let qualityScore = overallPassRate;
      qualityScore -= criticalViolations * 20;  // -20 per critical violation
      qualityScore -= highViolations * 10;       // -10 per high violation
      qualityScore -= mediumViolations * 5;      // -5 per medium violation
      qualityScore -= lowViolations * 1;         // -1 per low violation
      qualityScore = Math.max(0, Math.min(100, qualityScore));  // Clamp to 0-100

      // Generate recommendations
      const recommendations: string[] = [];
      if (criticalViolations > 0) {
        recommendations.push(`Critical: ${criticalViolations} critical violations detected. Immediate action required.`);
      }
      if (highViolations > 0) {
        recommendations.push(`High: ${highViolations} high-severity violations detected. Review and fix soon.`);
      }
      if (overallPassRate < 80) {
        recommendations.push(`Low pass rate: ${overallPassRate.toFixed(1)}%. Review quality rules and data.`);
      }
      if (recommendations.length === 0) {
        recommendations.push("All quality checks passed. Data quality is good.");
      }

      const duration = Date.now() - startTime;
      logger.info(
        { fieldId, duration, checksRun: totalChecks, checksPassed, qualityScore },
        "Quality checks completed"
      );

      return {
        fieldId,
        fieldUrn: field.entityUrn || `urn:metadata:field:${field.canonicalKey}`,
        totalRules: rules.length,
        activeRules: rules.length,
        checksRun: totalChecks,
        checksPassed,
        checksFailed,
        checksWarning,
        overallPassRate,
        criticalViolations,
        highViolations,
        mediumViolations,
        lowViolations,
        lastCheckAt: new Date(),
        qualityScore,
        recommendations,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error({ error, fieldId, duration }, "Quality checks failed");
      throw new KernelError("Quality checks failed", "QUALITY_CHECKS_FAILED", error);
    }
  }

  /**
   * Run a single quality rule check.
   */
  private async runRuleCheck(
    tenantId: string | null,
    rule: QualityRule,
    tableName: string,
    columnName: string,
    dataType: string
  ): Promise<QualityCheckResult> {
    const startTime = Date.now();
    const db = getDB().getClient();

    try {
      let passed = false;
      let failedCount: number | null = null;
      let totalCount: number | null = null;
      let passRate: number | null = null;
      let message: string | null = null;
      let details: Record<string, any> = {};
      let status: "passed" | "failed" | "warning" | "error" = "passed";

      switch (rule.ruleType) {
        case "not_null":
          ({ passed, failedCount, totalCount, passRate, message } = await this.checkNotNull(
            db,
            tableName,
            columnName
          ));
          break;

        case "unique":
          ({ passed, failedCount, totalCount, passRate, message } = await this.checkUnique(
            db,
            tableName,
            columnName
          ));
          break;

        case "min_value":
          if (rule.threshold === null) {
            throw new KernelError("min_value rule requires threshold", "QUALITY_RULE_CONFIG_ERROR");
          }
          ({ passed, failedCount, totalCount, passRate, message } = await this.checkMinValue(
            db,
            tableName,
            columnName,
            rule.threshold
          ));
          break;

        case "max_value":
          if (rule.threshold === null) {
            throw new KernelError("max_value rule requires threshold", "QUALITY_RULE_CONFIG_ERROR");
          }
          ({ passed, failedCount, totalCount, passRate, message } = await this.checkMaxValue(
            db,
            tableName,
            columnName,
            rule.threshold
          ));
          break;

        case "min_length":
          if (rule.threshold === null) {
            throw new KernelError("min_length rule requires threshold", "QUALITY_RULE_CONFIG_ERROR");
          }
          ({ passed, failedCount, totalCount, passRate, message } = await this.checkMinLength(
            db,
            tableName,
            columnName,
            rule.threshold
          ));
          break;

        case "max_length":
          if (rule.threshold === null) {
            throw new KernelError("max_length rule requires threshold", "QUALITY_RULE_CONFIG_ERROR");
          }
          ({ passed, failedCount, totalCount, passRate, message } = await this.checkMaxLength(
            db,
            tableName,
            columnName,
            rule.threshold
          ));
          break;

        case "pattern":
          if (!rule.pattern) {
            throw new KernelError("pattern rule requires pattern", "QUALITY_RULE_CONFIG_ERROR");
          }
          ({ passed, failedCount, totalCount, passRate, message, details } = await this.checkPattern(
            db,
            tableName,
            columnName,
            rule.pattern
          ));
          break;

        case "enum":
          if (!rule.enumValues || rule.enumValues.length === 0) {
            throw new KernelError("enum rule requires enumValues", "QUALITY_RULE_CONFIG_ERROR");
          }
          ({ passed, failedCount, totalCount, passRate, message, details } = await this.checkEnum(
            db,
            tableName,
            columnName,
            rule.enumValues
          ));
          break;

        case "custom_sql":
          if (!rule.customSql) {
            throw new KernelError("custom_sql rule requires customSql", "QUALITY_RULE_CONFIG_ERROR");
          }
          ({ passed, failedCount, totalCount, passRate, message, details } = await this.checkCustomSql(
            db,
            rule.customSql
          ));
          break;

        default:
          throw new KernelError(`Unsupported rule type: ${rule.ruleType}`, "QUALITY_RULE_TYPE_ERROR");
      }

      status = passed ? "passed" : "failed";

      const executionDurationMs = Date.now() - startTime;

      // Save check result
      const result = await qualityRepository.saveCheckResult({
        tenantId,
        ruleId: rule.id,
        fieldId: rule.fieldId,
        fieldUrn: rule.fieldUrn,
        status,
        passed,
        failedCount,
        totalCount,
        passRate,
        message,
        details,
        executedAt: new Date(),
        executedBy: null,
        executionDurationMs,
      });

      return result;
    } catch (error) {
      const executionDurationMs = Date.now() - startTime;
      logger.error({ error, ruleId: rule.id }, "Quality rule check failed");

      // Save error result
      const result = await qualityRepository.saveCheckResult({
        tenantId,
        ruleId: rule.id,
        fieldId: rule.fieldId,
        fieldUrn: rule.fieldUrn,
        status: "error",
        passed: false,
        failedCount: null,
        totalCount: null,
        passRate: null,
        message: error instanceof Error ? error.message : String(error),
        details: {},
        executedAt: new Date(),
        executedBy: null,
        executionDurationMs,
      });

      return result;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Individual Check Methods
  // ─────────────────────────────────────────────────────────────

  private async checkNotNull(
    db: any,
    tableName: string,
    columnName: string
  ): Promise<{ passed: boolean; failedCount: number | null; totalCount: number | null; passRate: number | null; message: string | null }> {
    const res = await db.query(`
      SELECT
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE ${columnName} IS NULL)::BIGINT as null_count
      FROM ${tableName}
    `);

    const totalCount = Number(res.rows[0].total_count);
    const nullCount = Number(res.rows[0].null_count);
    const failedCount = nullCount;
    const passRate = totalCount > 0 ? ((totalCount - nullCount) / totalCount) * 100 : 100;
    const passed = nullCount === 0;

    return {
      passed,
      failedCount,
      totalCount,
      passRate,
      message: passed
        ? "All values are not null"
        : `${nullCount} null values found out of ${totalCount} total rows`,
    };
  }

  private async checkUnique(
    db: any,
    tableName: string,
    columnName: string
  ): Promise<{ passed: boolean; failedCount: number | null; totalCount: number | null; passRate: number | null; message: string | null }> {
    const res = await db.query(`
      SELECT
        COUNT(*)::BIGINT as total_count,
        COUNT(DISTINCT ${columnName})::BIGINT as distinct_count
      FROM ${tableName}
      WHERE ${columnName} IS NOT NULL
    `);

    const totalCount = Number(res.rows[0].total_count);
    const distinctCount = Number(res.rows[0].distinct_count);
    const failedCount = totalCount - distinctCount;
    const passRate = totalCount > 0 ? (distinctCount / totalCount) * 100 : 100;
    const passed = totalCount === distinctCount;

    return {
      passed,
      failedCount,
      totalCount,
      passRate,
      message: passed
        ? "All values are unique"
        : `${failedCount} duplicate values found (${distinctCount} unique out of ${totalCount} total)`,
    };
  }

  private async checkMinValue(
    db: any,
    tableName: string,
    columnName: string,
    threshold: number
  ): Promise<{ passed: boolean; failedCount: number | null; totalCount: number | null; passRate: number | null; message: string | null }> {
    const res = await db.query(`
      SELECT
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE ${columnName} < $1)::BIGINT as failed_count
      FROM ${tableName}
      WHERE ${columnName} IS NOT NULL
    `, [threshold]);

    const totalCount = Number(res.rows[0].total_count);
    const failedCount = Number(res.rows[0].failed_count);
    const passRate = totalCount > 0 ? ((totalCount - failedCount) / totalCount) * 100 : 100;
    const passed = failedCount === 0;

    return {
      passed,
      failedCount,
      totalCount,
      passRate,
      message: passed
        ? `All values are >= ${threshold}`
        : `${failedCount} values are below minimum threshold ${threshold}`,
    };
  }

  private async checkMaxValue(
    db: any,
    tableName: string,
    columnName: string,
    threshold: number
  ): Promise<{ passed: boolean; failedCount: number | null; totalCount: number | null; passRate: number | null; message: string | null }> {
    const res = await db.query(`
      SELECT
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE ${columnName} > $1)::BIGINT as failed_count
      FROM ${tableName}
      WHERE ${columnName} IS NOT NULL
    `, [threshold]);

    const totalCount = Number(res.rows[0].total_count);
    const failedCount = Number(res.rows[0].failed_count);
    const passRate = totalCount > 0 ? ((totalCount - failedCount) / totalCount) * 100 : 100;
    const passed = failedCount === 0;

    return {
      passed,
      failedCount,
      totalCount,
      passRate,
      message: passed
        ? `All values are <= ${threshold}`
        : `${failedCount} values are above maximum threshold ${threshold}`,
    };
  }

  private async checkMinLength(
    db: any,
    tableName: string,
    columnName: string,
    threshold: number
  ): Promise<{ passed: boolean; failedCount: number | null; totalCount: number | null; passRate: number | null; message: string | null }> {
    const res = await db.query(`
      SELECT
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE LENGTH(${columnName}) < $1)::BIGINT as failed_count
      FROM ${tableName}
      WHERE ${columnName} IS NOT NULL
    `, [threshold]);

    const totalCount = Number(res.rows[0].total_count);
    const failedCount = Number(res.rows[0].failed_count);
    const passRate = totalCount > 0 ? ((totalCount - failedCount) / totalCount) * 100 : 100;
    const passed = failedCount === 0;

    return {
      passed,
      failedCount,
      totalCount,
      passRate,
      message: passed
        ? `All values have length >= ${threshold}`
        : `${failedCount} values have length below minimum ${threshold}`,
    };
  }

  private async checkMaxLength(
    db: any,
    tableName: string,
    columnName: string,
    threshold: number
  ): Promise<{ passed: boolean; failedCount: number | null; totalCount: number | null; passRate: number | null; message: string | null }> {
    const res = await db.query(`
      SELECT
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE LENGTH(${columnName}) > $1)::BIGINT as failed_count
      FROM ${tableName}
      WHERE ${columnName} IS NOT NULL
    `, [threshold]);

    const totalCount = Number(res.rows[0].total_count);
    const failedCount = Number(res.rows[0].failed_count);
    const passRate = totalCount > 0 ? ((totalCount - failedCount) / totalCount) * 100 : 100;
    const passed = failedCount === 0;

    return {
      passed,
      failedCount,
      totalCount,
      passRate,
      message: passed
        ? `All values have length <= ${threshold}`
        : `${failedCount} values have length above maximum ${threshold}`,
    };
  }

  private async checkPattern(
    db: any,
    tableName: string,
    columnName: string,
    pattern: string
  ): Promise<{ passed: boolean; failedCount: number | null; totalCount: number | null; passRate: number | null; message: string | null; details: Record<string, any> }> {
    // Escape pattern for PostgreSQL regex
    const escapedPattern = pattern.replace(/\\/g, "\\\\");

    const res = await db.query(`
      SELECT
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE ${columnName} !~ $1)::BIGINT as failed_count,
        array_agg(DISTINCT ${columnName}) FILTER (WHERE ${columnName} !~ $1 AND ${columnName} IS NOT NULL) as sample_values
      FROM ${tableName}
      WHERE ${columnName} IS NOT NULL
    `, [escapedPattern]);

    const totalCount = Number(res.rows[0].total_count);
    const failedCount = Number(res.rows[0].failed_count);
    const passRate = totalCount > 0 ? ((totalCount - failedCount) / totalCount) * 100 : 100;
    const passed = failedCount === 0;
    const sampleValues = res.rows[0].sample_values || [];

    return {
      passed,
      failedCount,
      totalCount,
      passRate,
      message: passed
        ? `All values match pattern: ${pattern}`
        : `${failedCount} values do not match pattern: ${pattern}`,
      details: {
        pattern,
        sampleValues: sampleValues.slice(0, 10),  // Limit to 10 samples
      },
    };
  }

  private async checkEnum(
    db: any,
    tableName: string,
    columnName: string,
    enumValues: string[]
  ): Promise<{ passed: boolean; failedCount: number | null; totalCount: number | null; passRate: number | null; message: string | null; details: Record<string, any> }> {
    const placeholders = enumValues.map((_, i) => `$${i + 1}`).join(", ");

    const res = await db.query(`
      SELECT
        COUNT(*)::BIGINT as total_count,
        COUNT(*) FILTER (WHERE ${columnName} NOT IN (${placeholders}))::BIGINT as failed_count,
        array_agg(DISTINCT ${columnName}) FILTER (WHERE ${columnName} NOT IN (${placeholders}) AND ${columnName} IS NOT NULL) as sample_values
      FROM ${tableName}
      WHERE ${columnName} IS NOT NULL
    `, enumValues);

    const totalCount = Number(res.rows[0].total_count);
    const failedCount = Number(res.rows[0].failed_count);
    const passRate = totalCount > 0 ? ((totalCount - failedCount) / totalCount) * 100 : 100;
    const passed = failedCount === 0;
    const sampleValues = res.rows[0].sample_values || [];

    return {
      passed,
      failedCount,
      totalCount,
      passRate,
      message: passed
        ? `All values are in allowed enum: [${enumValues.join(", ")}]`
        : `${failedCount} values are not in allowed enum: [${enumValues.join(", ")}]`,
      details: {
        enumValues,
        sampleValues: sampleValues.slice(0, 10),  // Limit to 10 samples
      },
    };
  }

  private async checkCustomSql(
    db: any,
    customSql: string
  ): Promise<{ passed: boolean; failedCount: number | null; totalCount: number | null; passRate: number | null; message: string | null; details: Record<string, any> }> {
    // Custom SQL should return a result with columns: passed (boolean), failed_count (bigint), total_count (bigint), message (text)
    // Or it can be a simple query that returns rows - if any rows are returned, the check fails
    try {
      const res = await db.query(customSql);

      // If query returns no rows, check passed
      if (res.rowCount === 0) {
        return {
          passed: true,
          failedCount: 0,
          totalCount: 0,
          passRate: 100,
          message: "Custom SQL check passed (no violations found)",
          details: {},
        };
      }

      // If query returns rows, check failed
      return {
        passed: false,
        failedCount: res.rowCount,
        totalCount: res.rowCount,
        passRate: 0,
        message: `Custom SQL check failed: ${res.rowCount} violation(s) found`,
        details: {
          violations: res.rows.slice(0, 10),  // Limit to 10 samples
        },
      };
    } catch (error) {
      throw new KernelError(
        `Custom SQL check execution failed: ${error instanceof Error ? error.message : String(error)}`,
        "QUALITY_CUSTOM_SQL_ERROR",
        error
      );
    }
  }

  /**
   * Get unresolved violations for a field.
   */
  async getUnresolvedViolations(
    tenantId: string | null,
    fieldId: string
  ): Promise<QualityViolation[]> {
    return await qualityRepository.getUnresolvedViolations(tenantId, fieldId);
  }

  /**
   * Resolve a violation.
   */
  async resolveViolation(
    violationId: string,
    resolvedBy: string,
    resolutionNotes?: string
  ): Promise<QualityViolation | null> {
    return await qualityRepository.resolveViolation(violationId, resolvedBy, resolutionNotes);
  }
}

export const qualityService = new QualityService();


/**
 * Quality Repository
 *
 * GRCD v4.1.0 Compliant: Data quality repository
 * Phase 3.2: Data Quality Checks Service
 */

import { getDB } from "../../storage/db";
import type {
  QualityRule,
  CreateQualityRule,
  QualityCheckResult,
  CreateQualityCheckResult,
  QualityViolation,
  CreateQualityViolation,
} from "./types";
import {
  ZQualityRule,
  ZCreateQualityRule,
  ZQualityCheckResult,
  ZCreateQualityCheckResult,
  ZQualityViolation,
  ZCreateQualityViolation,
} from "./types";
import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";

const logger = baseLogger.child({ module: "quality-repository" });

export class QualityRepository {
  /**
   * Create a quality rule.
   */
  async createRule(input: CreateQualityRule): Promise<QualityRule> {
    const validated = ZCreateQualityRule.parse(input);
    const db = getDB().getClient();

    try {
      const res = await db.query<QualityRule>(
        `
        INSERT INTO mdm_quality_rules (
          tenant_id, field_id, field_urn, rule_type, rule_name, description,
          config, threshold, pattern, enum_values, custom_sql, severity, is_active, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING
          id,
          tenant_id AS "tenantId",
          field_id AS "fieldId",
          field_urn AS "fieldUrn",
          rule_type AS "ruleType",
          rule_name AS "ruleName",
          description,
          config,
          threshold,
          pattern,
          enum_values AS "enumValues",
          custom_sql AS "customSql",
          severity,
          is_active AS "isActive",
          created_by AS "createdBy",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [
          validated.tenantId,
          validated.fieldId,
          validated.fieldUrn,
          validated.ruleType,
          validated.ruleName,
          validated.description,
          JSON.stringify(validated.config),
          validated.threshold,
          validated.pattern,
          validated.enumValues ? JSON.stringify(validated.enumValues) : null,
          validated.customSql,
          validated.severity,
          validated.isActive,
          validated.createdBy,
        ],
      );

      return ZQualityRule.parse({
        ...res.rows[0],
        config: res.rows[0].config || {},
        enumValues: res.rows[0].enumValues || null,
        createdAt: new Date(res.rows[0].createdAt),
        updatedAt: new Date(res.rows[0].updatedAt),
      });
    } catch (error) {
      logger.error({ error, input }, "Failed to create quality rule");
      throw new KernelError("Failed to create quality rule", "QUALITY_RULE_CREATE_FAILED", error);
    }
  }

  /**
   * Get quality rules for a field.
   */
  async getRulesByField(
    tenantId: string | null,
    fieldId: string,
    activeOnly: boolean = false
  ): Promise<QualityRule[]> {
    const db = getDB().getClient();

    const activeClause = activeOnly ? "AND is_active = TRUE" : "";

    const res = await db.query<QualityRule>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        rule_type AS "ruleType",
        rule_name AS "ruleName",
        description,
        config,
        threshold,
        pattern,
        enum_values AS "enumValues",
        custom_sql AS "customSql",
        severity,
        is_active AS "isActive",
        created_by AS "createdBy",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_quality_rules
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND field_id = $2 ${activeClause}
      ORDER BY severity DESC, rule_name ASC
      `,
      [tenantId, fieldId],
    );

    return res.rows.map((row) => ZQualityRule.parse({
      ...row,
      config: row.config || {},
      enumValues: row.enumValues || null,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  /**
   * Get a quality rule by ID.
   */
  async getRuleById(ruleId: string): Promise<QualityRule | null> {
    const db = getDB().getClient();

    const res = await db.query<QualityRule>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        rule_type AS "ruleType",
        rule_name AS "ruleName",
        description,
        config,
        threshold,
        pattern,
        enum_values AS "enumValues",
        custom_sql AS "customSql",
        severity,
        is_active AS "isActive",
        created_by AS "createdBy",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_quality_rules
      WHERE id = $1
      `,
      [ruleId],
    );

    if (res.rowCount === 0) return null;

    return ZQualityRule.parse({
      ...res.rows[0],
      config: res.rows[0].config || {},
      enumValues: res.rows[0].enumValues || null,
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Update a quality rule.
   */
  async updateRule(
    ruleId: string,
    updates: Partial<Omit<CreateQualityRule, "tenantId" | "fieldId" | "fieldUrn">>
  ): Promise<QualityRule | null> {
    const db = getDB().getClient();

    const setClauses: string[] = [];
    const params: any[] = [ruleId];

    if (updates.ruleName !== undefined) {
      setClauses.push(`rule_name = $${params.length + 1}`);
      params.push(updates.ruleName);
    }

    if (updates.description !== undefined) {
      setClauses.push(`description = $${params.length + 1}`);
      params.push(updates.description);
    }

    if (updates.config !== undefined) {
      setClauses.push(`config = $${params.length + 1}`);
      params.push(JSON.stringify(updates.config));
    }

    if (updates.threshold !== undefined) {
      setClauses.push(`threshold = $${params.length + 1}`);
      params.push(updates.threshold);
    }

    if (updates.pattern !== undefined) {
      setClauses.push(`pattern = $${params.length + 1}`);
      params.push(updates.pattern);
    }

    if (updates.enumValues !== undefined) {
      setClauses.push(`enum_values = $${params.length + 1}`);
      params.push(updates.enumValues ? JSON.stringify(updates.enumValues) : null);
    }

    if (updates.customSql !== undefined) {
      setClauses.push(`custom_sql = $${params.length + 1}`);
      params.push(updates.customSql);
    }

    if (updates.severity !== undefined) {
      setClauses.push(`severity = $${params.length + 1}`);
      params.push(updates.severity);
    }

    if (updates.isActive !== undefined) {
      setClauses.push(`is_active = $${params.length + 1}`);
      params.push(updates.isActive);
    }

    if (setClauses.length === 0) {
      return await this.getRuleById(ruleId);
    }

    setClauses.push(`updated_at = NOW()`);

    const res = await db.query<QualityRule>(
      `
      UPDATE mdm_quality_rules
      SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        rule_type AS "ruleType",
        rule_name AS "ruleName",
        description,
        config,
        threshold,
        pattern,
        enum_values AS "enumValues",
        custom_sql AS "customSql",
        severity,
        is_active AS "isActive",
        created_by AS "createdBy",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      params,
    );

    if (res.rowCount === 0) return null;

    return ZQualityRule.parse({
      ...res.rows[0],
      config: res.rows[0].config || {},
      enumValues: res.rows[0].enumValues || null,
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Delete a quality rule.
   */
  async deleteRule(ruleId: string): Promise<boolean> {
    const db = getDB().getClient();

    const res = await db.query(
      `DELETE FROM mdm_quality_rules WHERE id = $1`,
      [ruleId],
    );

    return (res.rowCount ?? 0) > 0;
  }

  // ─────────────────────────────────────────────────────────────
  // Quality Check Results
  // ─────────────────────────────────────────────────────────────

  /**
   * Save quality check result.
   */
  async saveCheckResult(input: CreateQualityCheckResult): Promise<QualityCheckResult> {
    const validated = ZCreateQualityCheckResult.parse(input);
    const db = getDB().getClient();

    try {
      const res = await db.query<QualityCheckResult>(
        `
        INSERT INTO mdm_quality_check_results (
          tenant_id, rule_id, field_id, field_urn, status, passed,
          failed_count, total_count, pass_rate, message, details,
          executed_at, executed_by, execution_duration_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING
          id,
          tenant_id AS "tenantId",
          rule_id AS "ruleId",
          field_id AS "fieldId",
          field_urn AS "fieldUrn",
          status,
          passed,
          failed_count AS "failedCount",
          total_count AS "totalCount",
          pass_rate AS "passRate",
          message,
          details,
          executed_at AS "executedAt",
          executed_by AS "executedBy",
          execution_duration_ms AS "executionDurationMs",
          created_at AS "createdAt"
        `,
        [
          validated.tenantId,
          validated.ruleId,
          validated.fieldId,
          validated.fieldUrn,
          validated.status,
          validated.passed,
          validated.failedCount,
          validated.totalCount,
          validated.passRate,
          validated.message,
          JSON.stringify(validated.details || {}),
          validated.executedAt,
          validated.executedBy,
          validated.executionDurationMs,
        ],
      );

      return ZQualityCheckResult.parse({
        ...res.rows[0],
        details: res.rows[0].details || {},
        executedAt: new Date(res.rows[0].executedAt),
        createdAt: new Date(res.rows[0].createdAt),
      });
    } catch (error) {
      logger.error({ error, input }, "Failed to save quality check result");
      throw new KernelError("Failed to save quality check result", "QUALITY_CHECK_RESULT_SAVE_FAILED", error);
    }
  }

  /**
   * Get latest check results for a field.
   */
  async getLatestCheckResults(
    tenantId: string | null,
    fieldId: string,
    limit: number = 10
  ): Promise<QualityCheckResult[]> {
    const db = getDB().getClient();

    const res = await db.query<QualityCheckResult>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        rule_id AS "ruleId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        status,
        passed,
        failed_count AS "failedCount",
        total_count AS "totalCount",
        pass_rate AS "passRate",
        message,
        details,
        executed_at AS "executedAt",
        executed_by AS "executedBy",
        execution_duration_ms AS "executionDurationMs",
        created_at AS "createdAt"
      FROM mdm_quality_check_results
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND field_id = $2
      ORDER BY executed_at DESC
      LIMIT $3
      `,
      [tenantId, fieldId, limit],
    );

    return res.rows.map((row) => ZQualityCheckResult.parse({
      ...row,
      details: row.details || {},
      executedAt: new Date(row.executedAt),
      createdAt: new Date(row.createdAt),
    }));
  }

  // ─────────────────────────────────────────────────────────────
  // Quality Violations
  // ─────────────────────────────────────────────────────────────

  /**
   * Create a quality violation.
   */
  async createViolation(input: CreateQualityViolation): Promise<QualityViolation> {
    const validated = ZCreateQualityViolation.parse(input);
    const db = getDB().getClient();

    try {
      const res = await db.query<QualityViolation>(
        `
        INSERT INTO mdm_quality_violations (
          tenant_id, rule_id, check_result_id, field_id, field_urn,
          violation_type, severity, message, details, sample_values, row_count,
          is_resolved, resolved_at, resolved_by, resolution_notes, detected_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING
          id,
          tenant_id AS "tenantId",
          rule_id AS "ruleId",
          check_result_id AS "checkResultId",
          field_id AS "fieldId",
          field_urn AS "fieldUrn",
          violation_type AS "violationType",
          severity,
          message,
          details,
          sample_values AS "sampleValues",
          row_count AS "rowCount",
          is_resolved AS "isResolved",
          resolved_at AS "resolvedAt",
          resolved_by AS "resolvedBy",
          resolution_notes AS "resolutionNotes",
          detected_at AS "detectedAt",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
        `,
        [
          validated.tenantId,
          validated.ruleId,
          validated.checkResultId,
          validated.fieldId,
          validated.fieldUrn,
          validated.violationType,
          validated.severity,
          validated.message,
          JSON.stringify(validated.details || {}),
          validated.sampleValues ? JSON.stringify(validated.sampleValues) : null,
          validated.rowCount,
          validated.isResolved,
          validated.resolvedAt,
          validated.resolvedBy,
          validated.resolutionNotes,
          validated.detectedAt,
        ],
      );

      return ZQualityViolation.parse({
        ...res.rows[0],
        details: res.rows[0].details || {},
        sampleValues: res.rows[0].sampleValues || null,
        resolvedAt: res.rows[0].resolvedAt ? new Date(res.rows[0].resolvedAt) : null,
        detectedAt: new Date(res.rows[0].detectedAt),
        createdAt: new Date(res.rows[0].createdAt),
        updatedAt: new Date(res.rows[0].updatedAt),
      });
    } catch (error) {
      logger.error({ error, input }, "Failed to create quality violation");
      throw new KernelError("Failed to create quality violation", "QUALITY_VIOLATION_CREATE_FAILED", error);
    }
  }

  /**
   * Get unresolved violations for a field.
   */
  async getUnresolvedViolations(
    tenantId: string | null,
    fieldId: string
  ): Promise<QualityViolation[]> {
    const db = getDB().getClient();

    const res = await db.query<QualityViolation>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        rule_id AS "ruleId",
        check_result_id AS "checkResultId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        violation_type AS "violationType",
        severity,
        message,
        details,
        sample_values AS "sampleValues",
        row_count AS "rowCount",
        is_resolved AS "isResolved",
        resolved_at AS "resolvedAt",
        resolved_by AS "resolvedBy",
        resolution_notes AS "resolutionNotes",
        detected_at AS "detectedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_quality_violations
      WHERE tenant_id IS NOT DISTINCT FROM $1 AND field_id = $2 AND is_resolved = FALSE
      ORDER BY severity DESC, detected_at DESC
      `,
      [tenantId, fieldId],
    );

    return res.rows.map((row) => ZQualityViolation.parse({
      ...row,
      details: row.details || {},
      sampleValues: row.sampleValues || null,
      resolvedAt: row.resolvedAt ? new Date(row.resolvedAt) : null,
      detectedAt: new Date(row.detectedAt),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    }));
  }

  /**
   * Resolve a violation.
   */
  async resolveViolation(
    violationId: string,
    resolvedBy: string,
    resolutionNotes?: string
  ): Promise<QualityViolation | null> {
    const db = getDB().getClient();

    const res = await db.query<QualityViolation>(
      `
      UPDATE mdm_quality_violations
      SET
        is_resolved = TRUE,
        resolved_at = NOW(),
        resolved_by = $2,
        resolution_notes = $3,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        rule_id AS "ruleId",
        check_result_id AS "checkResultId",
        field_id AS "fieldId",
        field_urn AS "fieldUrn",
        violation_type AS "violationType",
        severity,
        message,
        details,
        sample_values AS "sampleValues",
        row_count AS "rowCount",
        is_resolved AS "isResolved",
        resolved_at AS "resolvedAt",
        resolved_by AS "resolvedBy",
        resolution_notes AS "resolutionNotes",
        detected_at AS "detectedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [violationId, resolvedBy, resolutionNotes || null],
    );

    if (res.rowCount === 0) return null;

    return ZQualityViolation.parse({
      ...res.rows[0],
      details: res.rows[0].details || {},
      sampleValues: res.rows[0].sampleValues || null,
      resolvedAt: res.rows[0].resolvedAt ? new Date(res.rows[0].resolvedAt) : null,
      detectedAt: new Date(res.rows[0].detectedAt),
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }
}

export const qualityRepository = new QualityRepository();


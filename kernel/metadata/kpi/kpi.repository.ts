/**
 * Composite KPI Repository
 *
 * GRCD v4.1.0 Compliant: Composite KPI Modeling (MS-F-18)
 * Option 2: Composite KPI Modeling
 *
 * CRUD operations for composite KPIs.
 */

import { getDB } from "../../storage/db";
import type {
  CompositeKPI,
  CreateCompositeKPI,
  UpdateCompositeKPI,
} from "./types";
import { ZCompositeKPI, ZCreateCompositeKPI } from "./types";
import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";

const logger = baseLogger.child({ module: "metadata:kpi-repository" });

/**
 * Composite KPI Repository
 */
export class CompositeKpiRepository {
  /**
   * Find KPI by ID
   */
  async findById(
    tenantId: string | null,
    id: string
  ): Promise<CompositeKPI | null> {
    try {
      const db = getDB().getClient();
      const result = await db.query(
        `
        SELECT
          id,
          tenant_id,
          canonical_key,
          name,
          description,
          numerator_field_id,
          numerator_expression,
          numerator_standard_pack_id,
          numerator_description,
          denominator_field_id,
          denominator_expression,
          denominator_standard_pack_id,
          denominator_description,
          governance_tier,
          owner,
          steward,
          entity_urn,
          domain,
          tags,
          is_active,
          is_deprecated,
          created_at,
          updated_at
        FROM mdm_composite_kpi
        WHERE id = $1 AND (tenant_id IS NOT DISTINCT FROM $2)
        `,
        [id, tenantId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToKPI(result.rows[0]);
    } catch (error) {
      logger.error({ error, tenantId, id }, "Failed to find KPI by ID");
      throw new KernelError("Failed to find KPI", "KPI_FIND_FAILED", error);
    }
  }

  /**
   * Find KPI by canonical key
   */
  async findByCanonicalKey(
    tenantId: string | null,
    canonicalKey: string
  ): Promise<CompositeKPI | null> {
    try {
      const db = getDB().getClient();
      const result = await db.query(
        `
        SELECT
          id,
          tenant_id,
          canonical_key,
          name,
          description,
          numerator_field_id,
          numerator_expression,
          numerator_standard_pack_id,
          numerator_description,
          denominator_field_id,
          denominator_expression,
          denominator_standard_pack_id,
          denominator_description,
          governance_tier,
          owner,
          steward,
          entity_urn,
          domain,
          tags,
          is_active,
          is_deprecated,
          created_at,
          updated_at
        FROM mdm_composite_kpi
        WHERE canonical_key = $1 AND (tenant_id IS NOT DISTINCT FROM $2)
        `,
        [canonicalKey, tenantId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToKPI(result.rows[0]);
    } catch (error) {
      logger.error(
        { error, tenantId, canonicalKey },
        "Failed to find KPI by canonical key"
      );
      throw new KernelError("Failed to find KPI", "KPI_FIND_FAILED", error);
    }
  }

  /**
   * List KPIs by tenant
   */
  async listByTenant(
    tenantId: string | null,
    filters?: {
      governanceTier?: string;
      domain?: string;
      isActive?: boolean;
      isDeprecated?: boolean;
    }
  ): Promise<CompositeKPI[]> {
    try {
      const db = getDB().getClient();
      const conditions: string[] = ["tenant_id IS NOT DISTINCT FROM $1"];
      const params: any[] = [tenantId];
      let paramIndex = 2;

      if (filters?.governanceTier) {
        conditions.push(`governance_tier = $${paramIndex}`);
        params.push(filters.governanceTier);
        paramIndex++;
      }

      if (filters?.domain) {
        conditions.push(`domain = $${paramIndex}`);
        params.push(filters.domain);
        paramIndex++;
      }

      if (filters?.isActive !== undefined) {
        conditions.push(`is_active = $${paramIndex}`);
        params.push(filters.isActive);
        paramIndex++;
      }

      if (filters?.isDeprecated !== undefined) {
        conditions.push(`is_deprecated = $${paramIndex}`);
        params.push(filters.isDeprecated);
        paramIndex++;
      }

      const result = await db.query(
        `
        SELECT
          id,
          tenant_id,
          canonical_key,
          name,
          description,
          numerator_field_id,
          numerator_expression,
          numerator_standard_pack_id,
          numerator_description,
          denominator_field_id,
          denominator_expression,
          denominator_standard_pack_id,
          denominator_description,
          governance_tier,
          owner,
          steward,
          entity_urn,
          domain,
          tags,
          is_active,
          is_deprecated,
          created_at,
          updated_at
        FROM mdm_composite_kpi
        WHERE ${conditions.join(" AND ")}
        ORDER BY name ASC
        `,
        params
      );

      return result.rows.map((row) => this.mapRowToKPI(row));
    } catch (error) {
      logger.error({ error, tenantId, filters }, "Failed to list KPIs");
      throw new KernelError("Failed to list KPIs", "KPI_LIST_FAILED", error);
    }
  }

  /**
   * Create KPI
   */
  async create(data: CreateCompositeKPI & { tenantId: string | null }): Promise<CompositeKPI> {
    try {
      const validated = ZCreateCompositeKPI.parse(data);
      const db = getDB().getClient();

      // Generate entity URN if not provided
      const entityUrn =
        data.entityUrn || `urn:metadata:kpi:${data.canonicalKey}`;

      const result = await db.query(
        `
        INSERT INTO mdm_composite_kpi (
          tenant_id,
          canonical_key,
          name,
          description,
          numerator_field_id,
          numerator_expression,
          numerator_standard_pack_id,
          numerator_description,
          denominator_field_id,
          denominator_expression,
          denominator_standard_pack_id,
          denominator_description,
          governance_tier,
          owner,
          steward,
          entity_urn,
          domain,
          tags,
          is_active,
          is_deprecated
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20
        )
        RETURNING
          id,
          tenant_id as "tenantId",
          canonical_key as "canonicalKey",
          name,
          description,
          numerator_field_id as "numerator.fieldId",
          numerator_expression as "numerator.expression",
          numerator_standard_pack_id as "numerator.standardPackId",
          numerator_description as "numerator.description",
          denominator_field_id as "denominator.fieldId",
          denominator_expression as "denominator.expression",
          denominator_standard_pack_id as "denominator.standardPackId",
          denominator_description as "denominator.description",
          governance_tier as "governanceTier",
          owner,
          steward,
          entity_urn as "entityUrn",
          domain,
          tags,
          is_active as "isActive",
          is_deprecated as "isDeprecated",
          created_at as "createdAt",
          updated_at as "updatedAt"
        `,
        [
          data.tenantId,
          validated.canonicalKey,
          validated.name,
          validated.description || null,
          validated.numerator.fieldId,
          validated.numerator.expression || null,
          validated.numerator.standardPackId,
          validated.numerator.description || null,
          validated.denominator.fieldId,
          validated.denominator.expression || null,
          validated.denominator.standardPackId,
          validated.denominator.description || null,
          validated.governanceTier,
          validated.owner || null,
          validated.steward || null,
          entityUrn,
          validated.domain || null,
          validated.tags || [],
          validated.isActive !== undefined ? validated.isActive : true,
          validated.isDeprecated !== undefined ? validated.isDeprecated : false,
        ]
      );

      return this.mapRowToKPI(result.rows[0]);
    } catch (error: any) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new KernelError(
          `KPI with canonical key '${data.canonicalKey}' already exists`,
          "KPI_DUPLICATE_KEY",
          error
        );
      }
      logger.error({ error, data }, "Failed to create KPI");
      throw new KernelError("Failed to create KPI", "KPI_CREATE_FAILED", error);
    }
  }

  /**
   * Update KPI
   */
  async update(
    tenantId: string | null,
    id: string,
    data: Partial<CreateCompositeKPI>
  ): Promise<CompositeKPI> {
    try {
      const db = getDB().getClient();
      const updates: string[] = [];
      const params: any[] = [];
      let paramIndex = 1;

      if (data.name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        params.push(data.name);
        paramIndex++;
      }

      if (data.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        params.push(data.description);
        paramIndex++;
      }

      if (data.numerator !== undefined) {
        updates.push(`numerator_field_id = $${paramIndex}`);
        params.push(data.numerator.fieldId);
        paramIndex++;

        updates.push(`numerator_expression = $${paramIndex}`);
        params.push(data.numerator.expression || null);
        paramIndex++;

        updates.push(`numerator_standard_pack_id = $${paramIndex}`);
        params.push(data.numerator.standardPackId);
        paramIndex++;

        updates.push(`numerator_description = $${paramIndex}`);
        params.push(data.numerator.description || null);
        paramIndex++;
      }

      if (data.denominator !== undefined) {
        updates.push(`denominator_field_id = $${paramIndex}`);
        params.push(data.denominator.fieldId);
        paramIndex++;

        updates.push(`denominator_expression = $${paramIndex}`);
        params.push(data.denominator.expression || null);
        paramIndex++;

        updates.push(`denominator_standard_pack_id = $${paramIndex}`);
        params.push(data.denominator.standardPackId);
        paramIndex++;

        updates.push(`denominator_description = $${paramIndex}`);
        params.push(data.denominator.description || null);
        paramIndex++;
      }

      if (data.governanceTier !== undefined) {
        updates.push(`governance_tier = $${paramIndex}`);
        params.push(data.governanceTier);
        paramIndex++;
      }

      if (data.owner !== undefined) {
        updates.push(`owner = $${paramIndex}`);
        params.push(data.owner);
        paramIndex++;
      }

      if (data.steward !== undefined) {
        updates.push(`steward = $${paramIndex}`);
        params.push(data.steward);
        paramIndex++;
      }

      if (data.domain !== undefined) {
        updates.push(`domain = $${paramIndex}`);
        params.push(data.domain);
        paramIndex++;
      }

      if (data.tags !== undefined) {
        updates.push(`tags = $${paramIndex}`);
        params.push(data.tags);
        paramIndex++;
      }

      if (data.isActive !== undefined) {
        updates.push(`is_active = $${paramIndex}`);
        params.push(data.isActive);
        paramIndex++;
      }

      if (data.isDeprecated !== undefined) {
        updates.push(`is_deprecated = $${paramIndex}`);
        params.push(data.isDeprecated);
        paramIndex++;
      }

      if (updates.length === 0) {
        // No updates, return existing
        const existing = await this.findById(tenantId, id);
        if (!existing) {
          throw new KernelError("KPI not found", "KPI_NOT_FOUND");
        }
        return existing;
      }

      updates.push(`updated_at = NOW()`);
      params.push(id, tenantId);

      const result = await db.query(
        `
        UPDATE mdm_composite_kpi
        SET ${updates.join(", ")}
        WHERE id = $${paramIndex} AND (tenant_id IS NOT DISTINCT FROM $${paramIndex + 1})
        RETURNING
          id,
          tenant_id,
          canonical_key,
          name,
          description,
          numerator_field_id,
          numerator_expression,
          numerator_standard_pack_id,
          numerator_description,
          denominator_field_id,
          denominator_expression,
          denominator_standard_pack_id,
          denominator_description,
          governance_tier,
          owner,
          steward,
          entity_urn,
          domain,
          tags,
          is_active,
          is_deprecated,
          created_at,
          updated_at
        `,
        params
      );

      if (result.rows.length === 0) {
        throw new KernelError("KPI not found", "KPI_NOT_FOUND");
      }

      return this.mapRowToKPI(result.rows[0]);
    } catch (error) {
      if (error instanceof KernelError) {
        throw error;
      }
      logger.error({ error, tenantId, id, data }, "Failed to update KPI");
      throw new KernelError("Failed to update KPI", "KPI_UPDATE_FAILED", error);
    }
  }

  /**
   * Delete KPI
   */
  async delete(tenantId: string | null, id: string): Promise<void> {
    try {
      const db = getDB().getClient();
      const result = await db.query(
        `
        DELETE FROM mdm_composite_kpi
        WHERE id = $1 AND (tenant_id IS NOT DISTINCT FROM $2)
        `,
        [id, tenantId]
      );

      if (result.rowCount === 0) {
        throw new KernelError("KPI not found", "KPI_NOT_FOUND");
      }
    } catch (error) {
      if (error instanceof KernelError) {
        throw error;
      }
      logger.error({ error, tenantId, id }, "Failed to delete KPI");
      throw new KernelError("Failed to delete KPI", "KPI_DELETE_FAILED", error);
    }
  }

  /**
   * Map database row to KPI object
   */
  private mapRowToKPI(row: any): CompositeKPI {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      canonicalKey: row.canonical_key,
      name: row.name,
      description: row.description,
      numerator: {
        fieldId: row.numerator_field_id,
        expression: row.numerator_expression,
        standardPackId: row.numerator_standard_pack_id,
        description: row.numerator_description,
      },
      denominator: {
        fieldId: row.denominator_field_id,
        expression: row.denominator_expression,
        standardPackId: row.denominator_standard_pack_id,
        description: row.denominator_description,
      },
      governanceTier: row.governance_tier,
      owner: row.owner,
      steward: row.steward,
      entityUrn: row.entity_urn,
      domain: row.domain,
      tags: row.tags || [],
      isActive: row.is_active,
      isDeprecated: row.is_deprecated,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}

export const compositeKpiRepository = new CompositeKpiRepository();


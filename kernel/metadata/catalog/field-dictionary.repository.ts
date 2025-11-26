/**
 * Field Dictionary Repository
 *
 * CRUD operations for Field Dictionary entries.
 */

import { getDB } from "../../storage/db";
import { createCanonicalSlugFromLabel, getNameVariants } from "../../naming";
import type { FieldDictionaryEntry, CreateFieldDictionaryEntry } from "./types";
import { ZFieldDictionaryEntry, ZCreateFieldDictionaryEntry } from "./types";

export class FieldDictionaryRepository {
  /**
   * Create a new field dictionary entry.
   */
  async create(input: CreateFieldDictionaryEntry): Promise<FieldDictionaryEntry> {
    const validated = ZCreateFieldDictionaryEntry.parse(input);
    const db = getDB().getClient();

    const slug = validated.slug || createCanonicalSlugFromLabel(validated.label);

    const res = await db.query<FieldDictionaryEntry>(
      `
      INSERT INTO kernel_field_dictionary (
        tenant_id, slug, label, description, data_type, format, unit,
        business_term_id, data_contract_id, constraints, examples, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING
        id,
        tenant_id AS "tenantId",
        slug,
        label,
        description,
        data_type AS "dataType",
        format,
        unit,
        business_term_id AS "businessTermId",
        data_contract_id AS "dataContractId",
        constraints,
        examples,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        validated.tenantId,
        slug,
        validated.label,
        validated.description,
        validated.dataType,
        validated.format,
        validated.unit,
        validated.businessTermId,
        validated.dataContractId,
        validated.constraints ? JSON.stringify(validated.constraints) : null,
        JSON.stringify(validated.examples),
        validated.status,
      ],
    );

    return ZFieldDictionaryEntry.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Find by ID.
   */
  async findById(id: string): Promise<FieldDictionaryEntry | null> {
    const db = getDB().getClient();

    const res = await db.query<FieldDictionaryEntry>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        slug,
        label,
        description,
        data_type AS "dataType",
        format,
        unit,
        business_term_id AS "businessTermId",
        data_contract_id AS "dataContractId",
        constraints,
        examples,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_field_dictionary
      WHERE id = $1
      `,
      [id],
    );

    if (res.rowCount === 0) return null;

    return ZFieldDictionaryEntry.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Find by slug (tenant-scoped).
   */
  async findBySlug(
    tenantId: string | null,
    slug: string,
  ): Promise<FieldDictionaryEntry | null> {
    const db = getDB().getClient();

    const res = await db.query<FieldDictionaryEntry>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        slug,
        label,
        description,
        data_type AS "dataType",
        format,
        unit,
        business_term_id AS "businessTermId",
        data_contract_id AS "dataContractId",
        constraints,
        examples,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_field_dictionary
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND slug = $2
      `,
      [tenantId, slug],
    );

    if (res.rowCount === 0) return null;

    return ZFieldDictionaryEntry.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * List all field dictionary entries for a tenant.
   */
  async listByTenant(
    tenantId: string | null,
    options?: {
      status?: string;
      dataType?: string;
      businessTermId?: string;
      dataContractId?: string;
      limit?: number;
      offset?: number;
    },
  ): Promise<FieldDictionaryEntry[]> {
    const db = getDB().getClient();
    const {
      status,
      dataType,
      businessTermId,
      dataContractId,
      limit = 100,
      offset = 0,
    } = options ?? {};

    let query = `
      SELECT
        id,
        tenant_id AS "tenantId",
        slug,
        label,
        description,
        data_type AS "dataType",
        format,
        unit,
        business_term_id AS "businessTermId",
        data_contract_id AS "dataContractId",
        constraints,
        examples,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_field_dictionary
      WHERE tenant_id IS NOT DISTINCT FROM $1
    `;
    const params: any[] = [tenantId];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (dataType) {
      params.push(dataType);
      query += ` AND data_type = $${params.length}`;
    }

    if (businessTermId) {
      params.push(businessTermId);
      query += ` AND business_term_id = $${params.length}`;
    }

    if (dataContractId) {
      params.push(dataContractId);
      query += ` AND data_contract_id = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY label ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await db.query<FieldDictionaryEntry>(query, params);

    return res.rows.map((row) =>
      ZFieldDictionaryEntry.parse({
        ...row,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      }),
    );
  }

  /**
   * Update a field dictionary entry.
   */
  async update(
    id: string,
    updates: Partial<Omit<CreateFieldDictionaryEntry, "tenantId">>,
  ): Promise<FieldDictionaryEntry | null> {
    const db = getDB().getClient();

    const setClauses: string[] = [];
    const params: any[] = [id];

    if (updates.slug !== undefined) {
      params.push(updates.slug);
      setClauses.push(`slug = $${params.length}`);
    }
    if (updates.label !== undefined) {
      params.push(updates.label);
      setClauses.push(`label = $${params.length}`);
    }
    if (updates.description !== undefined) {
      params.push(updates.description);
      setClauses.push(`description = $${params.length}`);
    }
    if (updates.dataType !== undefined) {
      params.push(updates.dataType);
      setClauses.push(`data_type = $${params.length}`);
    }
    if (updates.format !== undefined) {
      params.push(updates.format);
      setClauses.push(`format = $${params.length}`);
    }
    if (updates.unit !== undefined) {
      params.push(updates.unit);
      setClauses.push(`unit = $${params.length}`);
    }
    if (updates.businessTermId !== undefined) {
      params.push(updates.businessTermId);
      setClauses.push(`business_term_id = $${params.length}`);
    }
    if (updates.dataContractId !== undefined) {
      params.push(updates.dataContractId);
      setClauses.push(`data_contract_id = $${params.length}`);
    }
    if (updates.constraints !== undefined) {
      params.push(updates.constraints ? JSON.stringify(updates.constraints) : null);
      setClauses.push(`constraints = $${params.length}`);
    }
    if (updates.examples !== undefined) {
      params.push(JSON.stringify(updates.examples));
      setClauses.push(`examples = $${params.length}`);
    }
    if (updates.status !== undefined) {
      params.push(updates.status);
      setClauses.push(`status = $${params.length}`);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push("updated_at = NOW()");

    const res = await db.query<FieldDictionaryEntry>(
      `
      UPDATE kernel_field_dictionary
      SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        slug,
        label,
        description,
        data_type AS "dataType",
        format,
        unit,
        business_term_id AS "businessTermId",
        data_contract_id AS "dataContractId",
        constraints,
        examples,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      params,
    );

    if (res.rowCount === 0) return null;

    return ZFieldDictionaryEntry.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Delete a field dictionary entry.
   */
  async delete(id: string): Promise<boolean> {
    const db = getDB().getClient();

    const res = await db.query(
      `DELETE FROM kernel_field_dictionary WHERE id = $1`,
      [id],
    );

    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Get name variants for a field by slug.
   */
  getNameVariants(slug: string) {
    return getNameVariants(slug);
  }
}

export const fieldDictionaryRepository = new FieldDictionaryRepository();


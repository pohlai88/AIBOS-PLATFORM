/**
 * Standard Pack Repository
 *
 * CRUD operations for Source of Truth (SoT) Standard Packs.
 * GRCD v4.1.0 Compliant: IFRS/MFRS/HL7/etc. standard packs
 */

import { getDB } from "../../storage/db";
import type { StandardPack, CreateStandardPack } from "./types";
import { ZStandardPack, ZCreateStandardPack } from "./types";

export class StandardPackRepository {
  /**
   * Create a new standard pack.
   */
  async create(input: CreateStandardPack): Promise<StandardPack> {
    const validated = ZCreateStandardPack.parse(input);
    const db = getDB().getClient();

    const res = await db.query<StandardPack>(
      `
      INSERT INTO mdm_standard_pack (
        tenant_id, name, version, standard_type, is_deprecated, definition, description
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        tenant_id AS "tenantId",
        name,
        version,
        standard_type AS "standardType",
        is_deprecated AS "isDeprecated",
        definition,
        description,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        validated.tenantId,
        validated.name,
        validated.version,
        validated.standardType,
        validated.isDeprecated,
        JSON.stringify(validated.definition),
        validated.description,
      ],
    );

    return ZStandardPack.parse({
      ...res.rows[0],
      definition: typeof res.rows[0].definition === 'string' 
        ? JSON.parse(res.rows[0].definition) 
        : res.rows[0].definition,
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Find by ID.
   */
  async findById(id: string): Promise<StandardPack | null> {
    const db = getDB().getClient();

    const res = await db.query<StandardPack>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        name,
        version,
        standard_type AS "standardType",
        is_deprecated AS "isDeprecated",
        definition,
        description,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_standard_pack
      WHERE id = $1
      `,
      [id],
    );

    if (res.rowCount === 0) return null;

    return ZStandardPack.parse({
      ...res.rows[0],
      definition: typeof res.rows[0].definition === 'string' 
        ? JSON.parse(res.rows[0].definition) 
        : res.rows[0].definition,
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Find by name and version (tenant-scoped).
   */
  async findByNameAndVersion(
    tenantId: string | null,
    name: string,
    version: string,
  ): Promise<StandardPack | null> {
    const db = getDB().getClient();

    const res = await db.query<StandardPack>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        name,
        version,
        standard_type AS "standardType",
        is_deprecated AS "isDeprecated",
        definition,
        description,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_standard_pack
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND name = $2
        AND version = $3
      `,
      [tenantId, name, version],
    );

    if (res.rowCount === 0) return null;

    return ZStandardPack.parse({
      ...res.rows[0],
      definition: typeof res.rows[0].definition === 'string' 
        ? JSON.parse(res.rows[0].definition) 
        : res.rows[0].definition,
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * List all standard packs for a tenant.
   */
  async listByTenant(
    tenantId: string | null,
    options?: { standardType?: string; isDeprecated?: boolean; limit?: number; offset?: number },
  ): Promise<StandardPack[]> {
    const db = getDB().getClient();
    const { standardType, isDeprecated, limit = 100, offset = 0 } = options ?? {};

    let query = `
      SELECT
        id,
        tenant_id AS "tenantId",
        name,
        version,
        standard_type AS "standardType",
        is_deprecated AS "isDeprecated",
        definition,
        description,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_standard_pack
      WHERE tenant_id IS NOT DISTINCT FROM $1
    `;
    const params: any[] = [tenantId];

    if (standardType) {
      params.push(standardType);
      query += ` AND standard_type = $${params.length}`;
    }

    if (isDeprecated !== undefined) {
      params.push(isDeprecated);
      query += ` AND is_deprecated = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY name ASC, version DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await db.query<StandardPack>(query, params);

    return res.rows.map((row) =>
      ZStandardPack.parse({
        ...row,
        definition: typeof row.definition === 'string' 
          ? JSON.parse(row.definition) 
          : row.definition,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      }),
    );
  }

  /**
   * List all packs by standard type.
   */
  async listByStandardType(
    standardType: string,
    tenantId: string | null = null,
  ): Promise<StandardPack[]> {
    const db = getDB().getClient();

    const res = await db.query<StandardPack>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        name,
        version,
        standard_type AS "standardType",
        is_deprecated AS "isDeprecated",
        definition,
        description,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM mdm_standard_pack
      WHERE standard_type = $1
        AND (tenant_id IS NOT DISTINCT FROM $2 OR tenant_id IS NULL)
        AND is_deprecated = FALSE
      ORDER BY name ASC, version DESC
      `,
      [standardType, tenantId],
    );

    return res.rows.map((row) =>
      ZStandardPack.parse({
        ...row,
        definition: typeof row.definition === 'string' 
          ? JSON.parse(row.definition) 
          : row.definition,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      }),
    );
  }

  /**
   * Update a standard pack.
   */
  async update(
    id: string,
    updates: Partial<Omit<CreateStandardPack, "tenantId">>,
  ): Promise<StandardPack | null> {
    const db = getDB().getClient();

    const setClauses: string[] = [];
    const params: any[] = [id];

    if (updates.name !== undefined) {
      params.push(updates.name);
      setClauses.push(`name = $${params.length}`);
    }
    if (updates.version !== undefined) {
      params.push(updates.version);
      setClauses.push(`version = $${params.length}`);
    }
    if (updates.standardType !== undefined) {
      params.push(updates.standardType);
      setClauses.push(`standard_type = $${params.length}`);
    }
    if (updates.isDeprecated !== undefined) {
      params.push(updates.isDeprecated);
      setClauses.push(`is_deprecated = $${params.length}`);
    }
    if (updates.definition !== undefined) {
      params.push(JSON.stringify(updates.definition));
      setClauses.push(`definition = $${params.length}`);
    }
    if (updates.description !== undefined) {
      params.push(updates.description);
      setClauses.push(`description = $${params.length}`);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push("updated_at = NOW()");

    const res = await db.query<StandardPack>(
      `
      UPDATE mdm_standard_pack
      SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        name,
        version,
        standard_type AS "standardType",
        is_deprecated AS "isDeprecated",
        definition,
        description,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      params,
    );

    if (res.rowCount === 0) return null;

    return ZStandardPack.parse({
      ...res.rows[0],
      definition: typeof res.rows[0].definition === 'string' 
        ? JSON.parse(res.rows[0].definition) 
        : res.rows[0].definition,
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Delete a standard pack.
   */
  async delete(id: string): Promise<boolean> {
    const db = getDB().getClient();

    const res = await db.query(
      `DELETE FROM mdm_standard_pack WHERE id = $1`,
      [id],
    );

    return (res.rowCount ?? 0) > 0;
  }
}

export const standardPackRepository = new StandardPackRepository();


/**
 * Data Contract Repository
 *
 * CRUD operations for Data Contracts.
 */

import { getDB } from "../../storage/db";
import { createCanonicalSlugFromLabel, getNameVariants } from "../../naming";
import type { DataContract, CreateDataContract } from "./types";
import { ZDataContract, ZCreateDataContract } from "./types";

export class DataContractRepository {
  /**
   * Create a new data contract.
   */
  async create(input: CreateDataContract): Promise<DataContract> {
    const validated = ZCreateDataContract.parse(input);
    const db = getDB().getClient();

    const slug = validated.slug || createCanonicalSlugFromLabel(validated.name);

    const res = await db.query<DataContract>(
      `
      INSERT INTO kernel_data_contracts (
        tenant_id, slug, name, description, version, owner, source_system,
        classification, sensitivity, status, schema
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING
        id,
        tenant_id AS "tenantId",
        slug,
        name,
        description,
        version,
        owner,
        source_system AS "sourceSystem",
        classification,
        sensitivity,
        status,
        schema,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        validated.tenantId,
        slug,
        validated.name,
        validated.description,
        validated.version,
        validated.owner,
        validated.sourceSystem,
        validated.classification,
        validated.sensitivity,
        validated.status,
        validated.schema ? JSON.stringify(validated.schema) : null,
      ],
    );

    return ZDataContract.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Find by ID.
   */
  async findById(id: string): Promise<DataContract | null> {
    const db = getDB().getClient();

    const res = await db.query<DataContract>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        slug,
        name,
        description,
        version,
        owner,
        source_system AS "sourceSystem",
        classification,
        sensitivity,
        status,
        schema,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_data_contracts
      WHERE id = $1
      `,
      [id],
    );

    if (res.rowCount === 0) return null;

    return ZDataContract.parse({
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
  ): Promise<DataContract | null> {
    const db = getDB().getClient();

    const res = await db.query<DataContract>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        slug,
        name,
        description,
        version,
        owner,
        source_system AS "sourceSystem",
        classification,
        sensitivity,
        status,
        schema,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_data_contracts
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND slug = $2
      `,
      [tenantId, slug],
    );

    if (res.rowCount === 0) return null;

    return ZDataContract.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * List all data contracts for a tenant.
   */
  async listByTenant(
    tenantId: string | null,
    options?: { status?: string; sourceSystem?: string; limit?: number; offset?: number },
  ): Promise<DataContract[]> {
    const db = getDB().getClient();
    const { status, sourceSystem, limit = 100, offset = 0 } = options ?? {};

    let query = `
      SELECT
        id,
        tenant_id AS "tenantId",
        slug,
        name,
        description,
        version,
        owner,
        source_system AS "sourceSystem",
        classification,
        sensitivity,
        status,
        schema,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_data_contracts
      WHERE tenant_id IS NOT DISTINCT FROM $1
    `;
    const params: any[] = [tenantId];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (sourceSystem) {
      params.push(sourceSystem);
      query += ` AND source_system = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY name ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await db.query<DataContract>(query, params);

    return res.rows.map((row) =>
      ZDataContract.parse({
        ...row,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      }),
    );
  }

  /**
   * Update a data contract.
   */
  async update(
    id: string,
    updates: Partial<Omit<CreateDataContract, "tenantId">>,
  ): Promise<DataContract | null> {
    const db = getDB().getClient();

    const setClauses: string[] = [];
    const params: any[] = [id];

    if (updates.slug !== undefined) {
      params.push(updates.slug);
      setClauses.push(`slug = $${params.length}`);
    }
    if (updates.name !== undefined) {
      params.push(updates.name);
      setClauses.push(`name = $${params.length}`);
    }
    if (updates.description !== undefined) {
      params.push(updates.description);
      setClauses.push(`description = $${params.length}`);
    }
    if (updates.version !== undefined) {
      params.push(updates.version);
      setClauses.push(`version = $${params.length}`);
    }
    if (updates.owner !== undefined) {
      params.push(updates.owner);
      setClauses.push(`owner = $${params.length}`);
    }
    if (updates.sourceSystem !== undefined) {
      params.push(updates.sourceSystem);
      setClauses.push(`source_system = $${params.length}`);
    }
    if (updates.status !== undefined) {
      params.push(updates.status);
      setClauses.push(`status = $${params.length}`);
    }
    if (updates.classification !== undefined) {
      params.push(updates.classification);
      setClauses.push(`classification = $${params.length}`);
    }
    if (updates.sensitivity !== undefined) {
      params.push(updates.sensitivity);
      setClauses.push(`sensitivity = $${params.length}`);
    }
    if (updates.schema !== undefined) {
      params.push(updates.schema ? JSON.stringify(updates.schema) : null);
      setClauses.push(`schema = $${params.length}`);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push("updated_at = NOW()");

    const res = await db.query<DataContract>(
      `
      UPDATE kernel_data_contracts
      SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        slug,
        name,
        description,
        version,
        owner,
        source_system AS "sourceSystem",
        classification,
        sensitivity,
        status,
        schema,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      params,
    );

    if (res.rowCount === 0) return null;

    return ZDataContract.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Delete a data contract.
   */
  async delete(id: string): Promise<boolean> {
    const db = getDB().getClient();

    const res = await db.query(
      `DELETE FROM kernel_data_contracts WHERE id = $1`,
      [id],
    );

    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Get name variants for a data contract by slug.
   */
  getNameVariants(slug: string) {
    return getNameVariants(slug);
  }
}

export const dataContractRepository = new DataContractRepository();


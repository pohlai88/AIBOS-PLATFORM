/**
 * Business Term Repository
 *
 * CRUD operations for Business Terms.
 */

import { getDB } from "../../storage/db";
import { createCanonicalSlugFromLabel, getNameVariants } from "../../naming";
import type { BusinessTerm, CreateBusinessTerm } from "./types";
import { ZBusinessTerm, ZCreateBusinessTerm } from "./types";

export class BusinessTermRepository {
  /**
   * Create a new business term.
   * Automatically generates canonical slug from label if not provided.
   */
  async create(input: CreateBusinessTerm): Promise<BusinessTerm> {
    const validated = ZCreateBusinessTerm.parse(input);
    const db = getDB().getClient();

    // Generate slug from label if not provided or empty
    const slug = validated.slug || createCanonicalSlugFromLabel(validated.label);

    const res = await db.query<BusinessTerm>(
      `
      INSERT INTO kernel_business_terms (
        tenant_id, slug, label, description, domain, synonyms, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        id,
        tenant_id AS "tenantId",
        slug,
        label,
        description,
        domain,
        synonyms,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        validated.tenantId,
        slug,
        validated.label,
        validated.description,
        validated.domain,
        JSON.stringify(validated.synonyms),
        validated.status,
      ],
    );

    return ZBusinessTerm.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Find by ID.
   */
  async findById(id: string): Promise<BusinessTerm | null> {
    const db = getDB().getClient();

    const res = await db.query<BusinessTerm>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        slug,
        label,
        description,
        domain,
        synonyms,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_business_terms
      WHERE id = $1
      `,
      [id],
    );

    if (res.rowCount === 0) return null;

    return ZBusinessTerm.parse({
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
  ): Promise<BusinessTerm | null> {
    const db = getDB().getClient();

    const res = await db.query<BusinessTerm>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        slug,
        label,
        description,
        domain,
        synonyms,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_business_terms
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND slug = $2
      `,
      [tenantId, slug],
    );

    if (res.rowCount === 0) return null;

    return ZBusinessTerm.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * List all business terms for a tenant.
   */
  async listByTenant(
    tenantId: string | null,
    options?: { status?: string; domain?: string; limit?: number; offset?: number },
  ): Promise<BusinessTerm[]> {
    const db = getDB().getClient();
    const { status, domain, limit = 100, offset = 0 } = options ?? {};

    let query = `
      SELECT
        id,
        tenant_id AS "tenantId",
        slug,
        label,
        description,
        domain,
        synonyms,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_business_terms
      WHERE tenant_id IS NOT DISTINCT FROM $1
    `;
    const params: any[] = [tenantId];

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    if (domain) {
      params.push(domain);
      query += ` AND domain = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY label ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await db.query<BusinessTerm>(query, params);

    return res.rows.map((row) =>
      ZBusinessTerm.parse({
        ...row,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      }),
    );
  }

  /**
   * Update a business term.
   */
  async update(
    id: string,
    updates: Partial<Omit<CreateBusinessTerm, "tenantId">>,
  ): Promise<BusinessTerm | null> {
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
    if (updates.domain !== undefined) {
      params.push(updates.domain);
      setClauses.push(`domain = $${params.length}`);
    }
    if (updates.synonyms !== undefined) {
      params.push(JSON.stringify(updates.synonyms));
      setClauses.push(`synonyms = $${params.length}`);
    }
    if (updates.status !== undefined) {
      params.push(updates.status);
      setClauses.push(`status = $${params.length}`);
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    setClauses.push("updated_at = NOW()");

    const res = await db.query<BusinessTerm>(
      `
      UPDATE kernel_business_terms
      SET ${setClauses.join(", ")}
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        slug,
        label,
        description,
        domain,
        synonyms,
        status,
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      params,
    );

    if (res.rowCount === 0) return null;

    return ZBusinessTerm.parse({
      ...res.rows[0],
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Delete a business term.
   */
  async delete(id: string): Promise<boolean> {
    const db = getDB().getClient();

    const res = await db.query(
      `DELETE FROM kernel_business_terms WHERE id = $1`,
      [id],
    );

    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Get name variants for a business term by slug.
   */
  getNameVariants(slug: string) {
    return getNameVariants(slug);
  }
}

export const businessTermRepository = new BusinessTermRepository();


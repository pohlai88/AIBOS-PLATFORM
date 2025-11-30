/**
 * Field Alias Repository
 *
 * CRUD operations for Field Aliases + implements FieldAliasLookup interface.
 * GRCD v4.1.0 Compliant: Uses canonical_key
 */

import { getDB } from "../../storage/db";
import { normalizeRawName } from "../../naming";
import type { FieldAliasLookup } from "../../naming/types";
import type { FieldAlias, CreateFieldAlias } from "./types";
import { ZFieldAlias, ZCreateFieldAlias } from "./types";

export class FieldAliasRepository implements FieldAliasLookup {
  /**
   * Create a new field alias.
   * Automatically normalizes the alias for lookup.
   */
  async create(input: CreateFieldAlias): Promise<FieldAlias> {
    const validated = ZCreateFieldAlias.parse(input);
    const db = getDB().getClient();

    // Auto-normalize if not provided
    const aliasNormalized =
      validated.aliasNormalized || normalizeRawName(validated.aliasRaw);

    const res = await db.query<FieldAlias>(
      `
      INSERT INTO kernel_field_aliases (
        tenant_id, alias_raw, alias_normalized, canonical_key,
        source, confidence, approved_by, approved_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING
        id,
        tenant_id AS "tenantId",
        alias_raw AS "aliasRaw",
        alias_normalized AS "aliasNormalized",
        canonical_key AS "canonicalKey",
        source,
        confidence,
        approved_by AS "approvedBy",
        approved_at AS "approvedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [
        validated.tenantId,
        validated.aliasRaw,
        aliasNormalized,
        validated.canonicalKey,
        validated.source,
        validated.confidence,
        validated.approvedBy,
        validated.approvedAt,
      ],
    );

    return ZFieldAlias.parse({
      ...res.rows[0],
      approvedAt: res.rows[0].approvedAt ? new Date(res.rows[0].approvedAt) : null,
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Find by ID.
   */
  async findById(id: string): Promise<FieldAlias | null> {
    const db = getDB().getClient();

    const res = await db.query<FieldAlias>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        alias_raw AS "aliasRaw",
        alias_normalized AS "aliasNormalized",
        canonical_key AS "canonicalKey",
        source,
        confidence,
        approved_by AS "approvedBy",
        approved_at AS "approvedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_field_aliases
      WHERE id = $1
      `,
      [id],
    );

    if (res.rowCount === 0) return null;

    return ZFieldAlias.parse({
      ...res.rows[0],
      approvedAt: res.rows[0].approvedAt ? new Date(res.rows[0].approvedAt) : null,
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * FieldAliasLookup interface implementation.
   * Find canonical_key by normalized alias.
   */
  async findCanonicalKeyByAlias(
    tenantId: string | null,
    aliasNormalized: string,
  ): Promise<string | null> {
    const db = getDB().getClient();

    const res = await db.query<{ canonicalKey: string }>(
      `
      SELECT canonical_key AS "canonicalKey"
      FROM kernel_field_aliases
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND alias_normalized = $2
      LIMIT 1
      `,
      [tenantId, aliasNormalized],
    );

    if (res.rowCount === 0) return null;
    return res.rows[0].canonicalKey;
  }

  /**
   * Legacy method for backward compatibility (deprecated).
   * @deprecated Use findCanonicalKeyByAlias instead
   */
  async findCanonicalSlugByAlias(
    tenantId: string | null,
    aliasNormalized: string,
  ): Promise<string | null> {
    return this.findCanonicalKeyByAlias(tenantId, aliasNormalized);
  }

  /**
   * Find all aliases for a canonical_key.
   */
  async findByCanonicalKey(
    tenantId: string | null,
    canonicalKey: string,
  ): Promise<FieldAlias[]> {
    const db = getDB().getClient();

    const res = await db.query<FieldAlias>(
      `
      SELECT
        id,
        tenant_id AS "tenantId",
        alias_raw AS "aliasRaw",
        alias_normalized AS "aliasNormalized",
        canonical_key AS "canonicalKey",
        source,
        confidence,
        approved_by AS "approvedBy",
        approved_at AS "approvedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_field_aliases
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND canonical_key = $2
      ORDER BY alias_raw ASC
      `,
      [tenantId, canonicalKey],
    );

    return res.rows.map((row) =>
      ZFieldAlias.parse({
        ...row,
        approvedAt: row.approvedAt ? new Date(row.approvedAt) : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      }),
    );
  }

  /**
   * Legacy method for backward compatibility (deprecated).
   * @deprecated Use findByCanonicalKey instead
   */
  async findByCanonicalSlug(
    tenantId: string | null,
    canonicalSlug: string,
  ): Promise<FieldAlias[]> {
    return this.findByCanonicalKey(tenantId, canonicalSlug);
  }

  /**
   * List all aliases for a tenant.
   */
  async listByTenant(
    tenantId: string | null,
    options?: { source?: string; limit?: number; offset?: number },
  ): Promise<FieldAlias[]> {
    const db = getDB().getClient();
    const { source, limit = 100, offset = 0 } = options ?? {};

    let query = `
      SELECT
        id,
        tenant_id AS "tenantId",
        alias_raw AS "aliasRaw",
        alias_normalized AS "aliasNormalized",
        canonical_key AS "canonicalKey",
        source,
        confidence,
        approved_by AS "approvedBy",
        approved_at AS "approvedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM kernel_field_aliases
      WHERE tenant_id IS NOT DISTINCT FROM $1
    `;
    const params: any[] = [tenantId];

    if (source) {
      params.push(source);
      query += ` AND source = $${params.length}`;
    }

    params.push(limit, offset);
    query += ` ORDER BY alias_raw ASC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const res = await db.query<FieldAlias>(query, params);

    return res.rows.map((row) =>
      ZFieldAlias.parse({
        ...row,
        approvedAt: row.approvedAt ? new Date(row.approvedAt) : null,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      }),
    );
  }

  /**
   * Approve an AI-suggested alias.
   */
  async approve(id: string, approvedBy: string): Promise<FieldAlias | null> {
    const db = getDB().getClient();

    const res = await db.query<FieldAlias>(
      `
      UPDATE kernel_field_aliases
      SET
        source = 'ai_approved',
        approved_by = $2,
        approved_at = NOW(),
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        tenant_id AS "tenantId",
        alias_raw AS "aliasRaw",
        alias_normalized AS "aliasNormalized",
        canonical_key AS "canonicalKey",
        source,
        confidence,
        approved_by AS "approvedBy",
        approved_at AS "approvedAt",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      `,
      [id, approvedBy],
    );

    if (res.rowCount === 0) return null;

    return ZFieldAlias.parse({
      ...res.rows[0],
      approvedAt: res.rows[0].approvedAt ? new Date(res.rows[0].approvedAt) : null,
      createdAt: new Date(res.rows[0].createdAt),
      updatedAt: new Date(res.rows[0].updatedAt),
    });
  }

  /**
   * Delete an alias.
   */
  async delete(id: string): Promise<boolean> {
    const db = getDB().getClient();

    const res = await db.query(
      `DELETE FROM kernel_field_aliases WHERE id = $1`,
      [id],
    );

    return (res.rowCount ?? 0) > 0;
  }

  /**
   * Bulk create aliases (for imports).
   */
  async bulkCreate(
    tenantId: string | null,
    aliases: Array<{ aliasRaw: string; canonicalKey: string; source?: string }>,
  ): Promise<number> {
    if (aliases.length === 0) return 0;

    const db = getDB().getClient();

    const values: any[] = [];
    const placeholders: string[] = [];

    aliases.forEach((alias, i) => {
      const base = i * 5;
      placeholders.push(
        `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5})`,
      );
      values.push(
        tenantId,
        alias.aliasRaw,
        normalizeRawName(alias.aliasRaw),
        alias.canonicalKey,
        alias.source ?? "import",
      );
    });

    const res = await db.query(
      `
      INSERT INTO kernel_field_aliases (
        tenant_id, alias_raw, alias_normalized, canonical_key, source
      ) VALUES ${placeholders.join(", ")}
      ON CONFLICT (tenant_id, alias_normalized) DO NOTHING
      `,
      values,
    );

    return res.rowCount ?? 0;
  }
}

export const fieldAliasRepository = new FieldAliasRepository();

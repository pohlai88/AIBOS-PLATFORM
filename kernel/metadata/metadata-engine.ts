/**
 * Metadata Engine
 * 
 * Zod-validated metadata operations with DB persistence
 */

import { Database } from "../storage/db";
import { RedisStore } from "../storage/redis";
import { getConfig } from "../boot/kernel.config";
import {
  ZMetadataEntityRecord,
  MetadataEntityRecord,
  ZCreateMetadata,
  CreateMetadata,
} from "../contracts/schemas";

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = "kernel:metadata:";

export class MetadataEngine {
  /**
   * Get metadata by key (with Zod validation)
   */
  async getByKey(
    tenantId: string | null,
    namespace: string,
    key: string
  ): Promise<MetadataEntityRecord | null> {
    const config = getConfig();

    // Try cache first
    const cacheKey = `${CACHE_PREFIX}${tenantId}:${namespace}:${key}`;
    const cached = await RedisStore.get(cacheKey);
    if (cached) {
      try {
        return ZMetadataEntityRecord.parse(JSON.parse(cached));
      } catch {
        // Invalid cache, continue to DB
      }
    }

    if (config.storageMode !== "SUPABASE") {
      return null; // In-memory mode has no DB
    }

    const result = await Database.query<any>(
      `
      SELECT
        id,
        tenant_id as "tenantId",
        namespace,
        key,
        value,
        version,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM kernel_metadata_entities
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND namespace = $2
        AND key = $3
      ORDER BY version DESC
      LIMIT 1
      `,
      [tenantId, namespace, key]
    );

    if (result.rows.length === 0) return null;

    // Parse dates and validate with Zod
    const row = result.rows[0];
    const entity = ZMetadataEntityRecord.parse({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });

    // Cache the result
    await RedisStore.set(cacheKey, JSON.stringify(entity), CACHE_TTL);

    return entity;
  }

  /**
   * Save metadata entity (with Zod validation)
   */
  async save(input: CreateMetadata): Promise<MetadataEntityRecord> {
    // Validate input
    const parsed = ZCreateMetadata.parse(input);

    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      throw new Error("Cannot save metadata in IN_MEMORY mode");
    }

    const result = await Database.query<any>(
      `
      INSERT INTO kernel_metadata_entities
        (tenant_id, namespace, key, value, version)
      VALUES ($1, $2, $3, $4, 1)
      ON CONFLICT (tenant_id, namespace, key, version)
      DO UPDATE SET value = $4, updated_at = now()
      RETURNING
        id,
        tenant_id as "tenantId",
        namespace,
        key,
        value,
        version,
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [parsed.tenantId ?? null, parsed.namespace, parsed.key, JSON.stringify(parsed.value)]
    );

    const row = result.rows[0];
    const entity = ZMetadataEntityRecord.parse({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });

    // Invalidate cache
    const cacheKey = `${CACHE_PREFIX}${parsed.tenantId}:${parsed.namespace}:${parsed.key}`;
    await RedisStore.del(cacheKey);

    return entity;
  }

  /**
   * List metadata by namespace
   */
  async listByNamespace(
    tenantId: string | null,
    namespace: string
  ): Promise<MetadataEntityRecord[]> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return [];
    }

    const result = await Database.query<any>(
      `
      SELECT DISTINCT ON (key)
        id,
        tenant_id as "tenantId",
        namespace,
        key,
        value,
        version,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM kernel_metadata_entities
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND namespace = $2
      ORDER BY key, version DESC
      `,
      [tenantId, namespace]
    );

    return result.rows.map((row: any) =>
      ZMetadataEntityRecord.parse({
        ...row,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      })
    );
  }

  /**
   * Delete metadata
   */
  async delete(tenantId: string | null, namespace: string, key: string): Promise<void> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return;
    }

    await Database.query(
      `DELETE FROM kernel_metadata_entities
       WHERE tenant_id IS NOT DISTINCT FROM $1
         AND namespace = $2
         AND key = $3`,
      [tenantId, namespace, key]
    );

    // Invalidate cache
    const cacheKey = `${CACHE_PREFIX}${tenantId}:${namespace}:${key}`;
    await RedisStore.del(cacheKey);
  }
}

// Singleton instance
export const metadataEngine = new MetadataEngine();


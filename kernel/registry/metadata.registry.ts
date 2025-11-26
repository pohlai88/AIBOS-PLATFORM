/**
 * Metadata Registry
 * 
 * Persists metadata to kernel_metadata_entities table
 * Uses Redis for hot cache
 */

import { Database } from "../storage/db";
import { RedisStore } from "../storage/redis";
import { getConfig } from "../boot/kernel.config";

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = "kernel:metadata:";

interface MetadataEntity {
  id: string;
  tenant_id: string | null;
  namespace: string;
  key: string;
  value: any;
  version: number;
}

export const metadataRegistry = {
  // In-memory cache for boot-time models (always available)
  models: new Map<string, any>(),
  isFrozen: false,

  init() {
    this.models = new Map();
    this.isFrozen = false;
  },

  /**
   * Register model in memory (boot-time)
   */
  registerModel(modelName: string, schema: any) {
    if (this.isFrozen) {
      throw new Error(`MetadataRegistry is frozen — cannot register model: ${modelName}`);
    }
    if (this.models.has(modelName)) {
      throw new Error(`Duplicate metadata model detected: ${modelName}`);
    }
    this.models.set(modelName, schema);
  },

  /**
   * Get model from memory cache
   */
  getModel(modelName: string) {
    return this.models.get(modelName);
  },

  /**
   * List all model names
   */
  listModels() {
    return Array.from(this.models.keys());
  },

  /**
   * Freeze registry (no more registrations)
   */
  freeze() {
    this.isFrozen = true;
    return this;
  },

  // ─────────────────────────────────────────────────────────
  // Database-backed operations
  // ─────────────────────────────────────────────────────────

  /**
   * Persist metadata entity to DB
   */
  async persist(
    tenantId: string | null,
    namespace: string,
    key: string,
    value: any
  ): Promise<MetadataEntity> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      // In-memory mode: just store locally
      const entity = { id: `${namespace}:${key}`, tenant_id: tenantId, namespace, key, value, version: 1 };
      this.models.set(`${namespace}:${key}`, value);
      return entity;
    }

    const result = await Database.query<MetadataEntity>(
      `INSERT INTO kernel_metadata_entities (tenant_id, namespace, key, value)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (tenant_id, namespace, key, version) 
       DO UPDATE SET value = $4, updated_at = now()
       RETURNING *`,
      [tenantId, namespace, key, JSON.stringify(value)]
    );

    const entity = result.rows[0];

    // Invalidate cache
    await RedisStore.del(`${CACHE_PREFIX}${tenantId}:${namespace}:${key}`);

    return entity;
  },

  /**
   * Get metadata entity (with Redis cache)
   */
  async get(
    tenantId: string | null,
    namespace: string,
    key: string
  ): Promise<any | null> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return this.models.get(`${namespace}:${key}`) || null;
    }

    const cacheKey = `${CACHE_PREFIX}${tenantId}:${namespace}:${key}`;

    // Try Redis cache first
    const cached = await RedisStore.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Query DB
    const result = await Database.query<MetadataEntity>(
      `SELECT * FROM kernel_metadata_entities 
       WHERE tenant_id = $1 AND namespace = $2 AND key = $3
       ORDER BY version DESC LIMIT 1`,
      [tenantId, namespace, key]
    );

    if (result.rows.length === 0) return null;

    const value = result.rows[0].value;

    // Cache in Redis
    await RedisStore.set(cacheKey, JSON.stringify(value), CACHE_TTL);

    return value;
  },

  /**
   * List metadata by namespace
   */
  async listByNamespace(
    tenantId: string | null,
    namespace: string
  ): Promise<MetadataEntity[]> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return Array.from(this.models.entries())
        .filter(([k]) => k.startsWith(`${namespace}:`))
        .map(([k, v]) => ({
          id: k,
          tenant_id: tenantId,
          namespace,
          key: k.replace(`${namespace}:`, ""),
          value: v,
          version: 1,
        }));
    }

    const result = await Database.query<MetadataEntity>(
      `SELECT DISTINCT ON (key) * FROM kernel_metadata_entities 
       WHERE tenant_id = $1 AND namespace = $2
       ORDER BY key, version DESC`,
      [tenantId, namespace]
    );

    return result.rows;
  },
};

/**
 * Engine Registry
 * 
 * Persists engine manifests to kernel_engines table
 * Status changes update the table
 */

import { Database } from "../storage/db";
import { RedisStore } from "../storage/redis";
import { getConfig } from "../boot/kernel.config";

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = "kernel:engine:";

type EngineStatus = "installed" | "enabled" | "disabled" | "failed" | "uninstalled";

interface EngineRecord {
  id: string;
  tenant_id: string | null;
  engine_id: string;
  name: string;
  version: string;
  manifest: any;
  signature?: string;
  status: EngineStatus;
  created_at: string;
  updated_at: string;
}

export const engineRegistry = {
  // In-memory cache for boot-time engines
  engines: new Map<string, any>(),
  isFrozen: false,

  init() {
    this.engines = new Map();
    this.isFrozen = false;
  },

  /**
   * Register engine in memory (boot-time)
   */
  register(name: string, engine: any) {
    if (this.isFrozen) {
      throw new Error(`EngineRegistry is frozen — cannot register engine: ${name}`);
    }
    this.engines.set(name, engine);
  },

  /**
   * Get engine from memory
   */
  get(name: string) {
    return this.engines.get(name);
  },

  /**
   * List all engine names
   */
  list() {
    return Array.from(this.engines.keys());
  },

  /**
   * Freeze registry
   */
  freeze() {
    this.isFrozen = true;
    return this;
  },

  // ─────────────────────────────────────────────────────────
  // Database-backed operations
  // ─────────────────────────────────────────────────────────

  /**
   * Persist engine to DB
   */
  async persist(
    tenantId: string | null,
    engineId: string,
    name: string,
    version: string,
    manifest: any,
    signature?: string
  ): Promise<EngineRecord> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      const record: EngineRecord = {
        id: engineId,
        tenant_id: tenantId,
        engine_id: engineId,
        name,
        version,
        manifest,
        signature,
        status: "installed",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.engines.set(engineId, { ...manifest, _record: record });
      return record;
    }

    const result = await Database.query<EngineRecord>(
      `INSERT INTO kernel_engines (tenant_id, engine_id, name, version, manifest, signature, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'installed')
       ON CONFLICT (tenant_id, engine_id, version)
       DO UPDATE SET manifest = $5, signature = $6, updated_at = now()
       RETURNING *`,
      [tenantId, engineId, name, version, JSON.stringify(manifest), signature]
    );

    // Invalidate cache
    await RedisStore.del(`${CACHE_PREFIX}${tenantId}:${engineId}`);

    return result.rows[0];
  },

  /**
   * Get engine from DB (with cache)
   */
  async getFromDb(tenantId: string | null, engineId: string): Promise<EngineRecord | null> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      const engine = this.engines.get(engineId);
      return engine?._record || null;
    }

    const cacheKey = `${CACHE_PREFIX}${tenantId}:${engineId}`;

    // Try cache
    const cached = await RedisStore.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Query DB
    const result = await Database.query<EngineRecord>(
      `SELECT * FROM kernel_engines 
       WHERE tenant_id = $1 AND engine_id = $2
       ORDER BY version DESC LIMIT 1`,
      [tenantId, engineId]
    );

    if (result.rows.length === 0) return null;

    const record = result.rows[0];

    // Cache
    await RedisStore.set(cacheKey, JSON.stringify(record), CACHE_TTL);

    return record;
  },

  /**
   * Update engine status
   */
  async updateStatus(
    tenantId: string | null,
    engineId: string,
    status: EngineStatus
  ): Promise<void> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      const engine = this.engines.get(engineId);
      if (engine?._record) {
        engine._record.status = status;
      }
      return;
    }

    await Database.query(
      `UPDATE kernel_engines SET status = $3, updated_at = now()
       WHERE tenant_id = $1 AND engine_id = $2`,
      [tenantId, engineId, status]
    );

    // Invalidate cache
    await RedisStore.del(`${CACHE_PREFIX}${tenantId}:${engineId}`);
  },

  /**
   * List engines by tenant
   */
  async listByTenant(tenantId: string | null): Promise<EngineRecord[]> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return Array.from(this.engines.values())
        .filter((e: any) => e._record)
        .map((e: any) => e._record);
    }

    const result = await Database.query<EngineRecord>(
      `SELECT DISTINCT ON (engine_id) * FROM kernel_engines 
       WHERE tenant_id = $1 AND status != 'uninstalled'
       ORDER BY engine_id, version DESC`,
      [tenantId]
    );

    return result.rows;
  },

  /**
   * List enabled engines
   */
  async listEnabled(tenantId: string | null): Promise<EngineRecord[]> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return Array.from(this.engines.values())
        .filter((e: any) => e._record?.status === "enabled")
        .map((e: any) => e._record);
    }

    const result = await Database.query<EngineRecord>(
      `SELECT DISTINCT ON (engine_id) * FROM kernel_engines 
       WHERE tenant_id = $1 AND status = 'enabled'
       ORDER BY engine_id, version DESC`,
      [tenantId]
    );

    return result.rows;
  },
};

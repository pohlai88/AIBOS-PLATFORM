/**
 * Engine Loader
 * 
 * Zod-validated engine manifest operations with DB persistence
 * Policy-gated registration for authorized principals
 */

import { Database } from "../storage/db";
import { RedisStore } from "../storage/redis";
import { getConfig } from "../boot/kernel.config";
import {
  ZMcpEngineManifest,
  ZEngineRecord,
  EngineRecord,
  McpEngineManifest,
  EngineStatus,
  EngineStatusEnum,
  ZCreateEngine,
} from "../contracts/schemas";
import { policyEngine } from "../policy/policy-engine";
import type { PolicyContext } from "../policy/types";
import type { AuthContext } from "../auth/types";
import { createTraceLogger } from "../observability/logger";

const CACHE_TTL = 300; // 5 minutes
const CACHE_PREFIX = "kernel:engine:";

export class EngineLoader {
  /**
   * Load engine record by ID (with Zod validation)
   */
  async loadEngineRecord(
    tenantId: string | null,
    engineId: string
  ): Promise<EngineRecord | null> {
    const config = getConfig();

    // Try cache first
    const cacheKey = `${CACHE_PREFIX}${tenantId}:${engineId}`;
    const cached = await RedisStore.get(cacheKey);
    if (cached) {
      try {
        return ZEngineRecord.parse(JSON.parse(cached));
      } catch {
        // Invalid cache, continue to DB
      }
    }

    if (config.storageMode !== "SUPABASE") {
      return null;
    }

    const result = await Database.query<any>(
      `
      SELECT
        id,
        tenant_id as "tenantId",
        engine_id as "engineId",
        name,
        version,
        manifest,
        signature,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM kernel_engines
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND engine_id = $2
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [tenantId, engineId]
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];

    // Validate manifest separately
    const manifest = ZMcpEngineManifest.parse(row.manifest);

    // Validate full record
    const engine = ZEngineRecord.parse({
      ...row,
      manifest,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });

    // Cache the result
    await RedisStore.set(cacheKey, JSON.stringify(engine), CACHE_TTL);

    return engine;
  }

  /**
   * Register a new engine (with Zod validation)
   */
  async registerEngine(
    tenantId: string | null,
    manifest: McpEngineManifest,
    signature?: string
  ): Promise<EngineRecord> {
    // Validate manifest first
    const parsedManifest = ZMcpEngineManifest.parse(manifest);

    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      throw new Error("Cannot register engine in IN_MEMORY mode");
    }

    const result = await Database.query<any>(
      `
      INSERT INTO kernel_engines
        (tenant_id, engine_id, name, version, manifest, signature, status)
      VALUES ($1, $2, $3, $4, $5, $6, 'installed')
      ON CONFLICT (tenant_id, engine_id, version)
      DO UPDATE SET manifest = $5, signature = $6, updated_at = now()
      RETURNING
        id,
        tenant_id as "tenantId",
        engine_id as "engineId",
        name,
        version,
        manifest,
        signature,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        tenantId,
        parsedManifest.engineId,
        parsedManifest.name,
        parsedManifest.version,
        JSON.stringify(parsedManifest),
        signature ?? null,
      ]
    );

    const row = result.rows[0];
    const engine = ZEngineRecord.parse({
      ...row,
      manifest: parsedManifest,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });

    // Invalidate cache
    const cacheKey = `${CACHE_PREFIX}${tenantId}:${parsedManifest.engineId}`;
    await RedisStore.del(cacheKey);

    return engine;
  }

  /**
   * Update engine status
   */
  async updateStatus(
    tenantId: string | null,
    engineId: string,
    status: EngineStatus
  ): Promise<void> {
    // Validate status
    EngineStatusEnum.parse(status);

    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return;
    }

    await Database.query(
      `UPDATE kernel_engines
       SET status = $3, updated_at = now()
       WHERE tenant_id IS NOT DISTINCT FROM $1
         AND engine_id = $2`,
      [tenantId, engineId, status]
    );

    // Invalidate cache
    const cacheKey = `${CACHE_PREFIX}${tenantId}:${engineId}`;
    await RedisStore.del(cacheKey);
  }

  /**
   * List engines by tenant
   */
  async listByTenant(tenantId: string | null): Promise<EngineRecord[]> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return [];
    }

    const result = await Database.query<any>(
      `
      SELECT DISTINCT ON (engine_id)
        id,
        tenant_id as "tenantId",
        engine_id as "engineId",
        name,
        version,
        manifest,
        signature,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM kernel_engines
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND status != 'deprecated'
      ORDER BY engine_id, created_at DESC
      `,
      [tenantId]
    );

    return result.rows.map((row: any) => {
      const manifest = ZMcpEngineManifest.parse(row.manifest);
      return ZEngineRecord.parse({
        ...row,
        manifest,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      });
    });
  }

  /**
   * Register engine for an authenticated principal (policy-gated)
   */
  async registerEngineForPrincipal(
    auth: AuthContext,
    traceId: string | null,
    tenantId: string | null,
    manifest: McpEngineManifest,
    signature?: string
  ): Promise<EngineRecord> {
    const logger = createTraceLogger(traceId);

    // Build policy context
    const policyCtx: PolicyContext = {
      tenantId,
      traceId,
      auth,
    };

    // Validate manifest first
    const parsedManifest = ZMcpEngineManifest.parse(manifest);

    // Policy check
    const decision = await policyEngine.evaluateEngine(policyCtx, parsedManifest);
    if (decision.effect === "deny") {
      logger.warn(
        {
          engineId: parsedManifest.engineId,
          tenantId,
          subject: auth.principal?.subject,
          roles: auth.roles,
          scopes: auth.scopes,
          reason: decision.reason,
        },
        "[EngineLoader] Policy denied engine registration"
      );
      throw new EngineOperationDeniedError(parsedManifest.engineId, decision.reason);
    }

    // Proceed with registration
    return this.registerEngine(tenantId, parsedManifest, signature);
  }

  /**
   * List enabled engines
   */
  async listEnabled(tenantId: string | null): Promise<EngineRecord[]> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return [];
    }

    const result = await Database.query<any>(
      `
      SELECT DISTINCT ON (engine_id)
        id,
        tenant_id as "tenantId",
        engine_id as "engineId",
        name,
        version,
        manifest,
        signature,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM kernel_engines
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND status = 'enabled'
      ORDER BY engine_id, created_at DESC
      `,
      [tenantId]
    );

    return result.rows.map((row: any) => {
      const manifest = ZMcpEngineManifest.parse(row.manifest);
      return ZEngineRecord.parse({
        ...row,
        manifest,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      });
    });
  }
}

// ─────────────────────────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────────────────────────

export class EngineOperationDeniedError extends Error {
  constructor(
    public engineId: string,
    public reason: string
  ) {
    super(`EngineOperationDenied: ${reason} (engineId=${engineId})`);
    this.name = "EngineOperationDeniedError";
  }
}

// Singleton instance
export const engineLoader = new EngineLoader();


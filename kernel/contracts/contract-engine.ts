/**
 * Contract Engine
 * 
 * Zod-validated contract operations with DB persistence
 */

import { z } from "zod";
import { Database } from "../storage/db";
import { RedisStore } from "../storage/redis";
import { getConfig } from "../boot/kernel.config";
import {
  ZContractBase,
  ContractBase,
  ContractTypeEnum,
  ZCreateContract,
  CreateContract,
  ZActionContractSchema,
  ActionContract,
} from "./schemas";

const CACHE_TTL = 600; // 10 minutes
const CACHE_PREFIX = "kernel:contract:";
const ACTION_CACHE_PREFIX = "kernel:action:";

export class ContractEngine {
  /**
   * Get contract by type and name (with Zod validation)
   */
  async getContract(
    tenantId: string | null,
    contractType: z.infer<typeof ContractTypeEnum>,
    name: string,
    version?: number
  ): Promise<ContractBase | null> {
    const config = getConfig();

    // Try cache first (only for latest version)
    if (!version) {
      const cacheKey = `${CACHE_PREFIX}${tenantId}:${contractType}:${name}`;
      const cached = await RedisStore.get(cacheKey);
      if (cached) {
        try {
          return ZContractBase.parse(JSON.parse(cached));
        } catch {
          // Invalid cache, continue to DB
        }
      }
    }

    if (config.storageMode !== "SUPABASE") {
      return null;
    }

    const params = version
      ? [tenantId, contractType, name, version]
      : [tenantId, contractType, name];

    const result = await Database.query<any>(
      `
      SELECT
        id,
        tenant_id as "tenantId",
        contract_type as "contractType",
        name,
        version,
        schema,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM kernel_contracts
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND contract_type = $2
        AND name = $3
        ${version ? "AND version = $4" : ""}
        AND status = 'active'
      ORDER BY version DESC
      LIMIT 1
      `,
      params
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    const contract = ZContractBase.parse({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });

    // Cache if latest version
    if (!version) {
      const cacheKey = `${CACHE_PREFIX}${tenantId}:${contractType}:${name}`;
      await RedisStore.set(cacheKey, JSON.stringify(contract), CACHE_TTL);
    }

    return contract;
  }

  /**
   * Save contract (with Zod validation)
   */
  async saveContract(input: CreateContract): Promise<ContractBase> {
    const parsed = ZCreateContract.parse(input);

    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      throw new Error("Cannot save contract in IN_MEMORY mode");
    }

    const result = await Database.query<any>(
      `
      INSERT INTO kernel_contracts
        (tenant_id, contract_type, name, version, schema, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (tenant_id, contract_type, name, version)
      DO UPDATE SET schema = $5, status = $6, updated_at = now()
      RETURNING
        id,
        tenant_id as "tenantId",
        contract_type as "contractType",
        name,
        version,
        schema,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        parsed.tenantId ?? null,
        parsed.contractType,
        parsed.name,
        parsed.version ?? 1,
        JSON.stringify(parsed.schema),
        parsed.status ?? "active",
      ]
    );

    const row = result.rows[0];
    const contract = ZContractBase.parse({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });

    // Invalidate cache
    const cacheKey = `${CACHE_PREFIX}${parsed.tenantId}:${parsed.contractType}:${parsed.name}`;
    await RedisStore.del(cacheKey);

    return contract;
  }

  /**
   * Save an Action contract (with full Zod validation)
   */
  async saveActionContract(
    action: Omit<ActionContract, "id" | "createdAt" | "updatedAt">
  ): Promise<ActionContract> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      throw new Error("Cannot save action contract in IN_MEMORY mode");
    }

    // Validate the action contract payload
    const parsedAction = ZActionContractSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }).parse(action);

    const result = await Database.query<any>(
      `
      INSERT INTO kernel_contracts
        (tenant_id, contract_type, name, version, schema, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (tenant_id, contract_type, name, version)
      DO UPDATE SET schema = $5, status = $6, updated_at = now()
      RETURNING
        id,
        tenant_id as "tenantId",
        contract_type as "contractType",
        name,
        version,
        schema,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      `,
      [
        parsedAction.tenantId,
        ContractTypeEnum.enum.action,
        parsedAction.name,
        parsedAction.version ?? 1,
        JSON.stringify(parsedAction), // entire action contract stored as schema
        parsedAction.status ?? "active",
      ]
    );

    const row = result.rows[0];
    const base = ZContractBase.parse({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });

    // Invalidate caches
    const cacheKey = `${CACHE_PREFIX}${parsedAction.tenantId}:action:${parsedAction.name}`;
    const actionCacheKey = `${ACTION_CACHE_PREFIX}${parsedAction.tenantId}:${parsedAction.actionId}`;
    await RedisStore.del(cacheKey);
    await RedisStore.del(actionCacheKey);

    // Re-validate as ActionContract on the way out
    return ZActionContractSchema.parse({
      ...base.schema,
      id: base.id,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
    });
  }

  /**
   * Get Action contract by actionId (with Zod validation)
   */
  async getActionContract(
    tenantId: string | null,
    actionId: string,
    version?: number
  ): Promise<ActionContract | null> {
    const config = getConfig();

    // Try cache first
    if (!version) {
      const cacheKey = `${ACTION_CACHE_PREFIX}${tenantId}:${actionId}`;
      const cached = await RedisStore.get(cacheKey);
      if (cached) {
        try {
          return ZActionContractSchema.parse(JSON.parse(cached));
        } catch {
          // Invalid cache, continue to DB
        }
      }
    }

    if (config.storageMode !== "SUPABASE") {
      return null;
    }

    const params = version
      ? [tenantId, ContractTypeEnum.enum.action, actionId, version]
      : [tenantId, ContractTypeEnum.enum.action, actionId];

    const result = await Database.query<any>(
      `
      SELECT
        id,
        tenant_id as "tenantId",
        contract_type as "contractType",
        name,
        version,
        schema,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM kernel_contracts
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND contract_type = $2
        AND schema->>'actionId' = $3
        ${version ? "AND version = $4" : ""}
        AND status = 'active'
      ORDER BY version DESC
      LIMIT 1
      `,
      params
    );

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    const base = ZContractBase.parse({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });

    // Validate that schema matches ActionContract
    const actionContract = ZActionContractSchema.parse({
      ...base.schema,
      id: base.id,
      createdAt: base.createdAt,
      updatedAt: base.updatedAt,
    });

    // Cache if latest version
    if (!version) {
      const cacheKey = `${ACTION_CACHE_PREFIX}${tenantId}:${actionId}`;
      await RedisStore.set(cacheKey, JSON.stringify(actionContract), CACHE_TTL);
    }

    return actionContract;
  }

  /**
   * List all Action contracts for a tenant
   */
  async listActionContracts(tenantId: string | null): Promise<ActionContract[]> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return [];
    }

    const result = await Database.query<any>(
      `
      SELECT DISTINCT ON (schema->>'actionId')
        id,
        tenant_id as "tenantId",
        contract_type as "contractType",
        name,
        version,
        schema,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM kernel_contracts
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND contract_type = $2
        AND status = 'active'
      ORDER BY schema->>'actionId', version DESC
      `,
      [tenantId, ContractTypeEnum.enum.action]
    );

    return result.rows.map((row: any) => {
      const base = ZContractBase.parse({
        ...row,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      });
      return ZActionContractSchema.parse({
        ...base.schema,
        id: base.id,
        createdAt: base.createdAt,
        updatedAt: base.updatedAt,
      });
    });
  }

  /**
   * List contracts by type
   */
  async listByType(
    tenantId: string | null,
    contractType: z.infer<typeof ContractTypeEnum>
  ): Promise<ContractBase[]> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return [];
    }

    const result = await Database.query<any>(
      `
      SELECT DISTINCT ON (name)
        id,
        tenant_id as "tenantId",
        contract_type as "contractType",
        name,
        version,
        schema,
        status,
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM kernel_contracts
      WHERE tenant_id IS NOT DISTINCT FROM $1
        AND contract_type = $2
        AND status = 'active'
      ORDER BY name, version DESC
      `,
      [tenantId, contractType]
    );

    return result.rows.map((row: any) =>
      ZContractBase.parse({
        ...row,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      })
    );
  }

  /**
   * Deprecate a contract version
   */
  async deprecate(
    tenantId: string | null,
    contractType: z.infer<typeof ContractTypeEnum>,
    name: string,
    version: number
  ): Promise<void> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return;
    }

    await Database.query(
      `UPDATE kernel_contracts
       SET status = 'deprecated', updated_at = now()
       WHERE tenant_id IS NOT DISTINCT FROM $1
         AND contract_type = $2
         AND name = $3
         AND version = $4`,
      [tenantId, contractType, name, version]
    );

    // Invalidate cache
    const cacheKey = `${CACHE_PREFIX}${tenantId}:${contractType}:${name}`;
    await RedisStore.del(cacheKey);
  }

  /**
   * Validate an engine manifest against contract rules
   */
  validateEngine(engine: any): { ok: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!engine.manifest?.name) errors.push("Engine missing name");
    if (!engine.manifest?.version) errors.push("Engine missing version");
    if (!engine.metadata) warnings.push("Engine missing metadata");

    return {
      ok: errors.length === 0,
      errors,
      warnings,
    };
  }
}

// Singleton instance
export const contractEngine = new ContractEngine();

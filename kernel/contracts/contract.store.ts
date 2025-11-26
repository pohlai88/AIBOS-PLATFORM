/**
 * Contract Store
 * 
 * Persists contract schemas to kernel_contracts table
 */

import { Database } from "../storage/db";
import { RedisStore } from "../storage/redis";
import { getConfig } from "../boot/kernel.config";

const CACHE_TTL = 600; // 10 minutes
const CACHE_PREFIX = "kernel:contract:";

type ContractStatus = "active" | "deprecated" | "draft";

interface ContractRecord {
  id: string;
  tenant_id: string | null;
  contract_type: string;
  name: string;
  version: number;
  schema: any;
  status: ContractStatus;
  created_at: string;
  updated_at: string;
}

// In-memory store for IN_MEMORY mode
const memoryStore = new Map<string, ContractRecord>();

export const contractStore = {
  /**
   * Save contract schema
   */
  async save(
    tenantId: string | null,
    contractType: string,
    name: string,
    schema: any,
    version = 1
  ): Promise<ContractRecord> {
    const config = getConfig();

    if (config.storageMode !== "SUPABASE") {
      const key = `${tenantId}:${contractType}:${name}:${version}`;
      const record: ContractRecord = {
        id: key,
        tenant_id: tenantId,
        contract_type: contractType,
        name,
        version,
        schema,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      memoryStore.set(key, record);
      return record;
    }

    const result = await Database.query<ContractRecord>(
      `INSERT INTO kernel_contracts (tenant_id, contract_type, name, version, schema, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       ON CONFLICT (tenant_id, contract_type, name, version)
       DO UPDATE SET schema = $5, updated_at = now()
       RETURNING *`,
      [tenantId, contractType, name, version, JSON.stringify(schema)]
    );

    // Invalidate cache
    await RedisStore.del(`${CACHE_PREFIX}${tenantId}:${contractType}:${name}`);

    return result.rows[0];
  },

  /**
   * Get active contract (latest version with status='active')
   */
  async getActiveContract(
    tenantId: string | null,
    contractType: string,
    name: string
  ): Promise<ContractRecord | null> {
    const config = getConfig();

    if (config.storageMode !== "SUPABASE") {
      // Find latest active version in memory
      const matches = Array.from(memoryStore.values())
        .filter(
          (r) =>
            r.tenant_id === tenantId &&
            r.contract_type === contractType &&
            r.name === name &&
            r.status === "active"
        )
        .sort((a, b) => b.version - a.version);
      return matches[0] || null;
    }

    const cacheKey = `${CACHE_PREFIX}${tenantId}:${contractType}:${name}`;

    // Try cache
    const cached = await RedisStore.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Query DB
    const result = await Database.query<ContractRecord>(
      `SELECT * FROM kernel_contracts 
       WHERE tenant_id = $1 AND contract_type = $2 AND name = $3 AND status = 'active'
       ORDER BY version DESC LIMIT 1`,
      [tenantId, contractType, name]
    );

    if (result.rows.length === 0) return null;

    const record = result.rows[0];

    // Cache
    await RedisStore.set(cacheKey, JSON.stringify(record), CACHE_TTL);

    return record;
  },

  /**
   * Get specific version
   */
  async getVersion(
    tenantId: string | null,
    contractType: string,
    name: string,
    version: number
  ): Promise<ContractRecord | null> {
    const config = getConfig();

    if (config.storageMode !== "SUPABASE") {
      const key = `${tenantId}:${contractType}:${name}:${version}`;
      return memoryStore.get(key) || null;
    }

    const result = await Database.query<ContractRecord>(
      `SELECT * FROM kernel_contracts 
       WHERE tenant_id = $1 AND contract_type = $2 AND name = $3 AND version = $4`,
      [tenantId, contractType, name, version]
    );

    return result.rows[0] || null;
  },

  /**
   * List contracts by type
   */
  async listByType(
    tenantId: string | null,
    contractType: string
  ): Promise<ContractRecord[]> {
    const config = getConfig();

    if (config.storageMode !== "SUPABASE") {
      return Array.from(memoryStore.values()).filter(
        (r) => r.tenant_id === tenantId && r.contract_type === contractType
      );
    }

    const result = await Database.query<ContractRecord>(
      `SELECT DISTINCT ON (name) * FROM kernel_contracts 
       WHERE tenant_id = $1 AND contract_type = $2 AND status = 'active'
       ORDER BY name, version DESC`,
      [tenantId, contractType]
    );

    return result.rows;
  },

  /**
   * Deprecate a contract
   */
  async deprecate(
    tenantId: string | null,
    contractType: string,
    name: string,
    version: number
  ): Promise<void> {
    const config = getConfig();

    if (config.storageMode !== "SUPABASE") {
      const key = `${tenantId}:${contractType}:${name}:${version}`;
      const record = memoryStore.get(key);
      if (record) {
        record.status = "deprecated";
      }
      return;
    }

    await Database.query(
      `UPDATE kernel_contracts SET status = 'deprecated', updated_at = now()
       WHERE tenant_id = $1 AND contract_type = $2 AND name = $3 AND version = $4`,
      [tenantId, contractType, name, version]
    );

    // Invalidate cache
    await RedisStore.del(`${CACHE_PREFIX}${tenantId}:${contractType}:${name}`);
  },
};


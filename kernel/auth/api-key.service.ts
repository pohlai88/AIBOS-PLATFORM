/**
 * API Key Service
 * 
 * Resolves API keys to AuthContext
 */

import { createHash } from "crypto";
import { Database } from "../storage/db";
import { getConfig } from "../boot/kernel.config";
import type { AuthContext, AuthPrincipal } from "./types";

type ApiKeyRecord = {
  id: string;
  tenantId: string | null;
  subjectId: string;
  keyHash: string;
  label: string | null;
  scopes: string[];
  roles: string[];
  expiresAt: Date | null;
  revokedAt: Date | null;
};

function hashApiKey(rawKey: string): string {
  const config = getConfig();
  const h = createHash("sha256");
  h.update(config.authApiKeyHashSecret);
  h.update(":");
  h.update(rawKey);
  return h.digest("hex");
}

export class ApiKeyService {
  /**
   * Resolve an API key to an AuthContext
   */
  async resolveApiKey(rawKey: string): Promise<AuthContext | null> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      return null; // API keys require DB
    }

    const keyHash = hashApiKey(rawKey);

    const result = await Database.query<any>(
      `
      SELECT
        id,
        tenant_id as "tenantId",
        subject_id as "subjectId",
        key_hash as "keyHash",
        label,
        scopes,
        roles,
        expires_at as "expiresAt",
        revoked_at as "revokedAt"
      FROM kernel_api_keys
      WHERE key_hash = $1
      LIMIT 1
      `,
      [keyHash]
    );

    if (result.rows.length === 0) return null;

    const rec = result.rows[0] as ApiKeyRecord;

    // Check if revoked
    if (rec.revokedAt) return null;

    // Check if expired
    if (rec.expiresAt && new Date(rec.expiresAt) < new Date()) return null;

    const principal: AuthPrincipal = {
      type: rec.subjectId.startsWith("service:")
        ? "service"
        : rec.subjectId.startsWith("engine:")
          ? "engine"
          : "user",
      id: rec.subjectId.split(":")[1] ?? rec.subjectId,
      subject: rec.subjectId,
    };

    return {
      tenantId: rec.tenantId,
      principal,
      roles: rec.roles || [],
      scopes: rec.scopes || [],
      tokenType: "api-key",
    };
  }

  /**
   * Create a new API key (returns raw key - only shown once)
   */
  async createApiKey(params: {
    tenantId: string | null;
    subjectId: string;
    label?: string;
    scopes?: string[];
    roles?: string[];
    expiresAt?: Date;
  }): Promise<{ id: string; rawKey: string }> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") {
      throw new Error("API keys require SUPABASE mode");
    }

    // Generate raw key
    const rawKey = `aibos_${crypto.randomUUID().replace(/-/g, "")}`;
    const keyHash = hashApiKey(rawKey);

    const result = await Database.query<{ id: string }>(
      `
      INSERT INTO kernel_api_keys
        (tenant_id, subject_id, key_hash, label, scopes, roles, expires_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [
        params.tenantId,
        params.subjectId,
        keyHash,
        params.label ?? null,
        params.scopes ?? [],
        params.roles ?? [],
        params.expiresAt ?? null,
      ]
    );

    return {
      id: result.rows[0].id,
      rawKey, // Only returned once!
    };
  }

  /**
   * Revoke an API key
   */
  async revokeApiKey(keyId: string): Promise<void> {
    const config = getConfig();
    if (config.storageMode !== "SUPABASE") return;

    await Database.query(
      `UPDATE kernel_api_keys SET revoked_at = now() WHERE id = $1`,
      [keyId]
    );
  }
}

// Singleton instance
export const apiKeyService = new ApiKeyService();


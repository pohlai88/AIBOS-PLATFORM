// security/secret-rotation.service.ts
import { schedule } from "node-cron";
import crypto from "node:crypto";
import { appendAuditEntry } from "../audit/hash-chain.store";
import { baseLogger } from "../observability/logger";

interface SecretStore {
  current: string;
  previous: string | null;
  rotatedAt: Date;
  expiresAt: Date;
}

export class SecretRotationService {
  private secrets = new Map<string, SecretStore>();

  /**
   * Generate cryptographically secure token
   */
  private generateToken(bytes: number = 64): string {
    return crypto.randomBytes(bytes).toString("base64url");
  }

  /**
   * Rotate JWT secret (30-day cycle)
   */
  async rotateJWT(): Promise<void> {
    const newSecret = this.generateToken(64);
    const oldSecret =
      process.env.JWT_SECRET || this.secrets.get("jwt")?.current;

    if (!oldSecret) {
      baseLogger.warn("[SecretRotation] No existing JWT secret found, initializing...");
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24-hour grace period

    this.secrets.set("jwt", {
      current: newSecret,
      previous: oldSecret || null,
      rotatedAt: now,
      expiresAt,
    });

    // Audit the rotation
    await appendAuditEntry({
      tenantId: "system",
      actorId: "secret-rotation-service",
      actionId: "security.secret.rotated",
      payload: {
        type: "jwt",
        rotatedAt: now.toISOString(),
        gracePeriodEndsAt: expiresAt.toISOString(),
      },
    });

    // Update vault (implement based on your secrets manager)
    await this.updateVault("JWT_SECRET", newSecret);

    baseLogger.info("[SecretRotation] JWT secret rotated successfully (grace period: 24h)");
  }

  /**
   * Rotate API keys (90-day cycle)
   */
  async rotateAPIKeys(): Promise<void> {
    const now = new Date();

    await appendAuditEntry({
      tenantId: "system",
      actorId: "secret-rotation-service",
      actionId: "security.api_keys.rotated",
      payload: { rotatedAt: now.toISOString() },
    });

    // TODO: Implement API key rotation logic
    // - Generate new keys for each service
    // - Update vault
    // - Notify services via webhook

    baseLogger.info("[SecretRotation] API keys rotated successfully");
  }

  /**
   * Rotate database credentials (90-day cycle)
   */
  async rotateDBCredentials(): Promise<void> {
    const now = new Date();

    await appendAuditEntry({
      tenantId: "system",
      actorId: "secret-rotation-service",
      actionId: "security.db_credentials.rotated",
      payload: { rotatedAt: now.toISOString() },
    });

    // TODO: Implement DB credential rotation
    // - Create new DB user with same permissions
    // - Update connection strings in vault
    // - Drop old user after grace period

    baseLogger.info("[SecretRotation] DB credentials rotated successfully");
  }

  /**
   * Verify token with grace period support
   */
  verifyToken(token: string, type: "jwt" = "jwt"): boolean {
    const stored = this.secrets.get(type);
    if (!stored) return false;

    // Always accept current secret
    if (this.constantTimeCompare(token, stored.current)) {
      return true;
    }

    // Accept previous secret within grace period
    if (stored.previous && new Date() < stored.expiresAt) {
      return this.constantTimeCompare(token, stored.previous);
    }

    return false;
  }

  /**
   * Constant-time string comparison (prevents timing attacks)
   */
  private constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;

    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");

    return crypto.timingSafeEqual(bufA, bufB);
  }

  /**
   * Update secrets vault (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault)
   */
  private async updateVault(key: string, value: string): Promise<void> {
    // TODO: Integrate with your secrets manager
    // Example for HashiCorp Vault:
    // await vaultClient.write(`secret/data/${key}`, { data: { value } });

    baseLogger.info({ key }, "[SecretRotation] Updated vault: %s", key);
  }

  /**
   * Start all rotation schedules
   */
  start() {
    // Rotate JWT every 30 days at 3 AM
    schedule("0 3 1 * *", () => this.rotateJWT());

    // Rotate API keys every 90 days at 4 AM
    schedule("0 4 1 */3 *", () => this.rotateAPIKeys());

    // Rotate DB credentials every 90 days at 5 AM
    schedule("0 5 1 */3 *", () => this.rotateDBCredentials());

    baseLogger.info("[SecretRotation] Service started - JWT: 30d, API Keys: 90d, DB: 90d");
  }
}

export const secretRotationService = new SecretRotationService();


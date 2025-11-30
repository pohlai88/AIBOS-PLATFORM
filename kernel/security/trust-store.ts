/**
 * TrustStore - Manages trusted keys and certificates
 * 
 * Hardening v2: Centralized trust management with expiration
 */

export interface TrustedKey {
  id: string;          // key id
  publicKey: string;   // PEM or raw key
  algorithm: "RSA-SHA256" | "Ed25519" | "HMAC-SHA256";
  createdAt: string;
  expiresAt?: string;
  purposes: ("mcp-manifest" | "engine-manifest" | "api-request" | "event-signing")[];
  metadata?: Record<string, any>;
}

export class TrustStore {
  private static keys = new Map<string, TrustedKey>();

  /**
   * Add a trusted key
   */
  static addKey(key: TrustedKey): void {
    this.keys.set(key.id, key);
  }

  /**
   * Get key by ID
   */
  static getKey(id: string): TrustedKey | undefined {
    return this.keys.get(id);
  }

  /**
   * Remove a key
   */
  static removeKey(id: string): boolean {
    return this.keys.delete(id);
  }

  /**
   * List all keys
   */
  static listKeys(): TrustedKey[] {
    return Array.from(this.keys.values());
  }

  /**
   * Get valid (non-expired) keys for a specific purpose
   */
  static getValidKeysForPurpose(purpose: TrustedKey["purposes"][number]): TrustedKey[] {
    const now = Date.now();
    return Array.from(this.keys.values()).filter(k => {
      if (!k.purposes.includes(purpose)) return false;
      if (!k.expiresAt) return true;
      return new Date(k.expiresAt).getTime() > now;
    });
  }

  /**
   * Check if a key is valid (exists and not expired)
   */
  static isKeyValid(id: string): boolean {
    const key = this.keys.get(id);
    if (!key) return false;
    if (!key.expiresAt) return true;
    return new Date(key.expiresAt).getTime() > Date.now();
  }

  /**
   * Get expired keys (for cleanup)
   */
  static getExpiredKeys(): TrustedKey[] {
    const now = Date.now();
    return Array.from(this.keys.values()).filter(k => {
      if (!k.expiresAt) return false;
      return new Date(k.expiresAt).getTime() <= now;
    });
  }

  /**
   * Cleanup expired keys
   */
  static cleanupExpired(): number {
    const expired = this.getExpiredKeys();
    for (const key of expired) {
      this.keys.delete(key.id);
    }
    return expired.length;
  }

  /**
   * Clear all keys (for testing)
   */
  static clear(): void {
    this.keys.clear();
  }
}

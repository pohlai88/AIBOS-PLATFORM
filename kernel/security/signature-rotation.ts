/**
 * SignatureRotation - Manages key rotation lifecycle
 * 
 * Hardening v2: Automatic key rotation and versioning
 */

import { TrustStore, TrustedKey } from "./trust-store";

export class SignatureRotation {
  private static rotationHistory: Array<{
    oldKeyId: string;
    newKeyId: string;
    rotatedAt: string;
    reason?: string;
  }> = [];

  /**
   * Rotate a key - expire old and add new
   */
  static rotateKey(oldKeyId: string, newKey: TrustedKey, reason?: string): void {
    // Deactivate old key by setting expiresAt to now
    const old = TrustStore.getKey(oldKeyId);
    if (old) {
      old.expiresAt = new Date().toISOString();
      TrustStore.addKey(old);
    }

    // Add new key
    TrustStore.addKey(newKey);

    // Record rotation
    this.rotationHistory.push({
      oldKeyId,
      newKeyId: newKey.id,
      rotatedAt: new Date().toISOString(),
      reason
    });
  }

  /**
   * Check if a key needs rotation (approaching expiry)
   */
  static needsRotation(keyId: string, thresholdMs: number = 86400000): boolean {
    const key = TrustStore.getKey(keyId);
    if (!key) return false;
    if (!key.expiresAt) return false;
    
    const expiresAt = new Date(key.expiresAt).getTime();
    return (expiresAt - Date.now()) < thresholdMs;
  }

  /**
   * Get keys that need rotation soon
   */
  static getKeysNeedingRotation(thresholdMs: number = 86400000): TrustedKey[] {
    return TrustStore.listKeys().filter(key => {
      if (!key.expiresAt) return false;
      const expiresAt = new Date(key.expiresAt).getTime();
      const timeLeft = expiresAt - Date.now();
      return timeLeft > 0 && timeLeft < thresholdMs;
    });
  }

  /**
   * Get rotation history
   */
  static getRotationHistory(): typeof SignatureRotation.rotationHistory {
    return [...this.rotationHistory];
  }

  /**
   * Generate a new key ID
   */
  static generateKeyId(prefix: string = "key"): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Clear history (for testing)
   */
  static clearHistory(): void {
    this.rotationHistory = [];
  }
}

/**
 * 🔏 Manifest Fingerprint v1.0
 * 
 * Cryptographic hashing for manifests:
 * - SHA-256 fingerprinting
 * - Version-aware hashing
 * - Integrity validation
 * 
 * @version 1.0.0
 */

import crypto from "crypto";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface FingerprintResult {
  hash: string;
  algorithm: string;
  version: string;
  timestamp: number;
}

export interface ManifestValidation {
  valid: boolean;
  expectedHash: string;
  actualHash: string;
  mismatchFields?: string[];
}

// ═══════════════════════════════════════════════════════════
// Manifest Fingerprint
// ═══════════════════════════════════════════════════════════

export class ManifestFingerprint {
  private static readonly ALGORITHM = "sha256";
  private static readonly VERSION = "1.0";

  /**
   * Generate fingerprint for any manifest
   */
  static generate(manifest: any): FingerprintResult {
    // Normalize the manifest for consistent hashing
    const normalized = this.normalize(manifest);
    const hash = crypto
      .createHash(this.ALGORITHM)
      .update(normalized)
      .digest("hex");

    return {
      hash,
      algorithm: this.ALGORITHM,
      version: this.VERSION,
      timestamp: Date.now(),
    };
  }

  /**
   * Quick hash generation
   */
  static hash(manifest: any): string {
    return this.generate(manifest).hash;
  }

  /**
   * Validate manifest against expected hash
   */
  static validate(manifest: any, expectedHash: string): ManifestValidation {
    const actualHash = this.hash(manifest);
    return {
      valid: actualHash === expectedHash,
      expectedHash,
      actualHash,
    };
  }

  /**
   * Compare two manifests
   */
  static compare(manifest1: any, manifest2: any): boolean {
    return this.hash(manifest1) === this.hash(manifest2);
  }

  /**
   * Generate fingerprint for specific fields only
   */
  static generatePartial(manifest: any, fields: string[]): FingerprintResult {
    const partial: Record<string, any> = {};
    for (const field of fields) {
      if (manifest[field] !== undefined) {
        partial[field] = manifest[field];
      }
    }
    return this.generate(partial);
  }

  /**
   * Normalize manifest for consistent hashing
   */
  private static normalize(obj: any): string {
    // Sort keys recursively for deterministic output
    return JSON.stringify(obj, (key, value) => {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        return Object.keys(value)
          .sort()
          .reduce((sorted: Record<string, any>, k) => {
            sorted[k] = value[k];
            return sorted;
          }, {});
      }
      return value;
    });
  }
}

export const manifestFingerprint = ManifestFingerprint;


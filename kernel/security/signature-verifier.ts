/**
 * SignatureVerifier - Cryptographic signature verification
 * 
 * Hardening v2: Real RSA-SHA256 signature verification
 */

import crypto from "node:crypto";
import { TrustStore } from "./trust-store";
import { KernelError } from "../hardening/errors/kernel-error";

export class SignatureVerificationError extends KernelError {
  constructor(message: string, cause?: unknown) {
    super(message, "SIGNATURE_ERROR", cause);
  }
}

export class SignatureVerifier {
  /**
   * Verify a manifest signature against trusted keys
   */
  static verifyManifest(manifestJson: string, signature: string, keyId: string): boolean {
    const key = TrustStore.getKey(keyId);
    if (!key) {
      throw new SignatureVerificationError(`Unknown key: ${keyId}`, { keyId });
    }

    if (!TrustStore.isKeyValid(keyId)) {
      throw new SignatureVerificationError(`Key expired: ${keyId}`, { keyId });
    }

    try {
      const verifier = crypto.createVerify(key.algorithm === "Ed25519" ? "ed25519" : "RSA-SHA256");
      verifier.update(manifestJson);
      verifier.end();

      const ok = verifier.verify(key.publicKey, signature, "base64");
      if (!ok) {
        throw new SignatureVerificationError(`Invalid signature for key: ${keyId}`, { keyId });
      }
      return true;
    } catch (err: any) {
      if (err instanceof SignatureVerificationError) throw err;
      throw new SignatureVerificationError(`Verification failed: ${err.message}`, err);
    }
  }

  /**
   * Verify HMAC signature (for internal use)
   */
  static verifyHMAC(data: string, signature: string, secret: string): boolean {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64");
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, "base64"),
      Buffer.from(expected, "base64")
    );
  }

  /**
   * Compute checksum of content
   */
  static computeChecksum(content: string): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Verify content matches checksum
   */
  static verifyChecksum(content: string, expectedChecksum: string): boolean {
    const actual = this.computeChecksum(content);
    return actual === expectedChecksum;
  }

  /**
   * Verify manifest with auto key discovery (tries all valid keys for purpose)
   */
  static verifyManifestAuto(
    manifestJson: string,
    signature: string,
    purpose: "mcp-manifest" | "engine-manifest"
  ): { valid: boolean; keyId?: string } {
    const keys = TrustStore.getValidKeysForPurpose(purpose);
    
    for (const key of keys) {
      try {
        if (this.verifyManifest(manifestJson, signature, key.id)) {
          return { valid: true, keyId: key.id };
        }
      } catch {
        // Try next key
      }
    }
    
    return { valid: false };
  }
}


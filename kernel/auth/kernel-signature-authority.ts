/**
 * 🔐 Kernel Signature Authority (KSA) v1.0
 * 
 * Cryptographic signing for kernel-issued certificates:
 * - RSA-2048 key pair generation
 * - Execution certificate signing
 * - Signature verification
 * 
 * @version 1.0.0
 */

import crypto from "crypto";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface KSAKeyPair {
  publicKey: crypto.KeyObject;
  privateKey: crypto.KeyObject;
  fingerprint: string;
  createdAt: number;
}

export interface SignedPayload {
  payload: string;
  signature: string;
  algorithm: string;
  keyFingerprint: string;
  timestamp: number;
}

// ═══════════════════════════════════════════════════════════
// Kernel Signature Authority
// ═══════════════════════════════════════════════════════════

export class KernelSignatureAuthority {
  private static keyPair: KSAKeyPair | null = null;
  private static readonly ALGORITHM = "RSA-SHA256";

  /**
   * Initialize KSA with fresh key pair
   */
  static initialize(): KSAKeyPair {
    const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
      modulusLength: 2048,
    });

    const fingerprint = crypto
      .createHash("sha256")
      .update(publicKey.export({ type: "spki", format: "pem" }))
      .digest("hex")
      .slice(0, 16);

    this.keyPair = {
      publicKey,
      privateKey,
      fingerprint,
      createdAt: Date.now(),
    };

    eventBus.publish({
      type: "kernel.ksa.initialized",
      fingerprint,
      timestamp: new Date().toISOString(),
    } as any);

    return this.keyPair;
  }

  /**
   * Sign a payload
   */
  static sign(payload: string): SignedPayload {
    if (!this.keyPair) {
      this.initialize();
    }

    const sign = crypto.createSign(this.ALGORITHM);
    sign.update(payload);
    const signature = sign.sign(this.keyPair!.privateKey, "base64");

    return {
      payload,
      signature,
      algorithm: this.ALGORITHM,
      keyFingerprint: this.keyPair!.fingerprint,
      timestamp: Date.now(),
    };
  }

  /**
   * Verify a signature
   */
  static verify(signedPayload: SignedPayload, publicKey?: crypto.KeyObject): boolean {
    const key = publicKey || this.keyPair?.publicKey;
    if (!key) {
      throw new Error("No public key available for verification");
    }

    try {
      const verify = crypto.createVerify(signedPayload.algorithm || this.ALGORITHM);
      verify.update(signedPayload.payload);
      return verify.verify(key, signedPayload.signature, "base64");
    } catch {
      return false;
    }
  }

  /**
   * Get public key for external verification
   */
  static getPublicKey(): crypto.KeyObject {
    if (!this.keyPair) {
      this.initialize();
    }
    return this.keyPair!.publicKey;
  }

  /**
   * Get key fingerprint
   */
  static getFingerprint(): string {
    if (!this.keyPair) {
      this.initialize();
    }
    return this.keyPair!.fingerprint;
  }

  /**
   * Export public key as PEM
   */
  static exportPublicKeyPEM(): string {
    if (!this.keyPair) {
      this.initialize();
    }
    return this.keyPair!.publicKey.export({ type: "spki", format: "pem" }) as string;
  }

  /**
   * Check if KSA is initialized
   */
  static isInitialized(): boolean {
    return this.keyPair !== null;
  }

  /**
   * Rotate keys (for security)
   */
  static rotateKeys(): KSAKeyPair {
    const oldFingerprint = this.keyPair?.fingerprint;
    const newKeyPair = this.initialize();

    eventBus.publish({
      type: "kernel.ksa.rotated",
      oldFingerprint,
      newFingerprint: newKeyPair.fingerprint,
      timestamp: new Date().toISOString(),
    } as any);

    return newKeyPair;
  }
}

export const kernelSignatureAuthority = KernelSignatureAuthority;


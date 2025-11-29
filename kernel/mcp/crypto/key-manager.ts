/**
 * Cryptographic Key Manager
 * 
 * GRCD Compliance: F-11 (MCP Manifest Signatures)
 * Standard: ISO 42001, AI Governance
 * 
 * Manages RSA key pairs for MCP manifest signing.
 * Supports key generation, rotation, and storage.
 */

import crypto from "crypto";
import fs from "fs/promises";
import path from "path";
import {
  KeyPair,
  PublicKeyRecord,
  KeyRotationPolicy,
  DEFAULT_KEY_ROTATION_POLICY,
  KeyStorageBackend,
  SignatureAlgorithm,
} from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("mcp-key-manager");

export class KeyManager {
  private publicKeys: Map<string, PublicKeyRecord> = new Map();
  private storageBackend: KeyStorageBackend;
  private storagePath: string;
  private rotationPolicy: KeyRotationPolicy;

  constructor(
    storageBackend: KeyStorageBackend = KeyStorageBackend.FILESYSTEM,
    storagePath: string = path.join(process.cwd(), ".keys"),
    rotationPolicy: KeyRotationPolicy = DEFAULT_KEY_ROTATION_POLICY
  ) {
    this.storageBackend = storageBackend;
    this.storagePath = storagePath;
    this.rotationPolicy = rotationPolicy;
    
    logger.info(`KeyManager initialized`, {
      storageBackend,
      storagePath,
      rotationPolicy,
    });
  }

  /**
   * Generate a new RSA key pair
   * 
   * @param keyId - Optional key identifier (auto-generated if not provided)
   * @param algorithm - Signature algorithm (default: RS256)
   * @returns Generated key pair
   */
  async generateKeyPair(
    keyId?: string,
    algorithm: SignatureAlgorithm = SignatureAlgorithm.RS256
  ): Promise<KeyPair> {
    const startTime = Date.now();
    
    // Generate unique key ID if not provided
    const finalKeyId = keyId || `mcp-key-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
    
    try {
      // Generate RSA key pair (2048-bit for RS256, 256-bit for ES256)
      const keySize = algorithm === SignatureAlgorithm.RS256 ? 2048 : 256;
      const keyType = algorithm === SignatureAlgorithm.RS256 ? "rsa" : "ec";
      
      const { publicKey, privateKey } = crypto.generateKeyPairSync(keyType, {
        modulusLength: keyType === "rsa" ? keySize : undefined,
        namedCurve: keyType === "ec" ? "prime256v1" : undefined,
        publicKeyEncoding: {
          type: "spki",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs8",
          format: "pem",
        },
      });
      
      const keyPair: KeyPair = {
        publicKey,
        privateKey,
        keyId: finalKeyId,
        algorithm,
        createdAt: Date.now(),
      };
      
      // Store public key in registry
      const publicKeyRecord: PublicKeyRecord = {
        keyId: finalKeyId,
        publicKey,
        algorithm,
        owner: "system", // TODO: Get from context
        status: "active",
        createdAt: keyPair.createdAt,
      };
      
      this.publicKeys.set(finalKeyId, publicKeyRecord);
      
      const duration = Date.now() - startTime;
      logger.info(`Generated new key pair`, {
        keyId: finalKeyId,
        algorithm,
        keySize,
        durationMs: duration,
      });
      
      return keyPair;
    } catch (error) {
      logger.error(`Failed to generate key pair`, {
        keyId: finalKeyId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Key generation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load a public key by ID
   * 
   * @param keyId - Public key identifier
   * @returns PEM-encoded public key
   */
  async loadPublicKey(keyId: string): Promise<string> {
    // Check in-memory cache first
    const cached = this.publicKeys.get(keyId);
    if (cached && cached.status === "active") {
      logger.debug(`Loaded public key from cache`, { keyId });
      return cached.publicKey;
    }
    
    // Load from storage
    try {
      if (this.storageBackend === KeyStorageBackend.FILESYSTEM) {
        const keyPath = path.join(this.storagePath, `${keyId}.pub`);
        const publicKey = await fs.readFile(keyPath, "utf-8");
        
        // Cache it
        const record: PublicKeyRecord = {
          keyId,
          publicKey,
          algorithm: SignatureAlgorithm.RS256, // Default assumption
          owner: "unknown",
          status: "active",
          createdAt: Date.now(),
        };
        this.publicKeys.set(keyId, record);
        
        logger.debug(`Loaded public key from filesystem`, { keyId, keyPath });
        return publicKey;
      } else if (this.storageBackend === KeyStorageBackend.ENVIRONMENT) {
        const envKey = `MCP_PUBLIC_KEY_${keyId.toUpperCase().replace(/[^A-Z0-9]/g, "_")}`;
        const publicKey = process.env[envKey];
        
        if (!publicKey) {
          throw new Error(`Public key not found in environment: ${envKey}`);
        }
        
        logger.debug(`Loaded public key from environment`, { keyId, envKey });
        return publicKey;
      }
      
      throw new Error(`Unsupported storage backend: ${this.storageBackend}`);
    } catch (error) {
      logger.error(`Failed to load public key`, {
        keyId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Public key load failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Store a public key
   * 
   * @param keyId - Public key identifier
   * @param publicKey - PEM-encoded public key
   * @param owner - Key owner (optional)
   */
  async storePublicKey(keyId: string, publicKey: string, owner: string = "system"): Promise<void> {
    try {
      // Store in memory
      const record: PublicKeyRecord = {
        keyId,
        publicKey,
        algorithm: SignatureAlgorithm.RS256, // Default
        owner,
        status: "active",
        createdAt: Date.now(),
      };
      this.publicKeys.set(keyId, record);
      
      // Persist to storage
      if (this.storageBackend === KeyStorageBackend.FILESYSTEM) {
        // Ensure directory exists
        await fs.mkdir(this.storagePath, { recursive: true });
        
        const keyPath = path.join(this.storagePath, `${keyId}.pub`);
        await fs.writeFile(keyPath, publicKey, "utf-8");
        
        logger.info(`Stored public key to filesystem`, { keyId, keyPath, owner });
      } else if (this.storageBackend === KeyStorageBackend.MEMORY) {
        logger.info(`Stored public key in memory`, { keyId, owner });
      }
    } catch (error) {
      logger.error(`Failed to store public key`, {
        keyId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Public key storage failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Rotate keys (mark old as inactive, generate new)
   * 
   * @param oldKeyId - Old key identifier to rotate
   * @returns New key pair
   */
  async rotateKeys(oldKeyId: string): Promise<KeyPair> {
    logger.info(`Rotating keys`, { oldKeyId });
    
    try {
      // 1. Mark old key as rotated (but keep it during grace period)
      const oldKey = this.publicKeys.get(oldKeyId);
      if (oldKey) {
        oldKey.status = "rotated";
        oldKey.inactivatedAt = Date.now();
        this.publicKeys.set(oldKeyId, oldKey);
        
        logger.info(`Marked old key as rotated`, { oldKeyId, gracePeriodMs: this.rotationPolicy.gracePeriod });
      }
      
      // 2. Generate new key pair
      const newKeyPair = await this.generateKeyPair();
      
      // 3. Store new public key
      await this.storePublicKey(newKeyPair.keyId, newKeyPair.publicKey);
      
      logger.info(`Key rotation complete`, {
        oldKeyId,
        newKeyId: newKeyPair.keyId,
      });
      
      return newKeyPair;
    } catch (error) {
      logger.error(`Key rotation failed`, {
        oldKeyId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw new Error(`Key rotation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if a key needs rotation
   * 
   * @param keyId - Key identifier
   * @returns Whether key needs rotation
   */
  needsRotation(keyId: string): boolean {
    const key = this.publicKeys.get(keyId);
    if (!key) {
      return false; // Key not found, cannot rotate
    }
    
    const keyAge = Date.now() - key.createdAt;
    const needsRotation = keyAge > this.rotationPolicy.maxKeyAge;
    
    if (needsRotation) {
      logger.warn(`Key requires rotation`, {
        keyId,
        keyAgeDays: Math.floor(keyAge / (24 * 60 * 60 * 1000)),
        maxAgeDays: Math.floor(this.rotationPolicy.maxKeyAge / (24 * 60 * 60 * 1000)),
      });
    }
    
    return needsRotation;
  }

  /**
   * Revoke a key (mark as revoked, no longer usable)
   * 
   * @param keyId - Key identifier
   * @param reason - Revocation reason
   */
  async revokeKey(keyId: string, reason: string): Promise<void> {
    const key = this.publicKeys.get(keyId);
    if (!key) {
      throw new Error(`Key not found: ${keyId}`);
    }
    
    key.status = "revoked";
    key.inactivatedAt = Date.now();
    this.publicKeys.set(keyId, key);
    
    logger.warn(`Key revoked`, { keyId, reason });
  }

  /**
   * List all active public keys
   * 
   * @returns Array of active public key records
   */
  listActiveKeys(): PublicKeyRecord[] {
    return Array.from(this.publicKeys.values()).filter((key) => key.status === "active");
  }

  /**
   * Get key status
   * 
   * @param keyId - Key identifier
   * @returns Public key record (if exists)
   */
  getKeyStatus(keyId: string): PublicKeyRecord | null {
    return this.publicKeys.get(keyId) || null;
  }
}

// Singleton instance
export const keyManager = new KeyManager();


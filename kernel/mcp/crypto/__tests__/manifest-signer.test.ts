/**
 * MCP Manifest Signer Tests
 * 
 * GRCD Compliance: F-11 (MCP Manifest Signatures)
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import { ManifestSigner } from "../manifest-signer";
import { KeyManager } from "../key-manager";
import type { MCPManifest } from "../../types";
import { KeyStorageBackend } from "../types";

describe("ManifestSigner", () => {
  let signer: ManifestSigner;
  let keyManager: KeyManager;
  let publicKey: string;
  let privateKey: string;
  let publicKeyId: string;

  const mockManifest: MCPManifest = {
    id: "test-manifest-001",
    name: "Test MCP Server",
    version: "1.0.0",
    protocolVersion: "2024-11-05",
    description: "Test MCP server for signature testing",
    capabilities: {
      tools: true,
      resources: true,
      prompts: false,
    },
  };

  beforeAll(async () => {
    signer = new ManifestSigner();
    keyManager = new KeyManager(KeyStorageBackend.MEMORY);
    
    // Generate test key pair
    const keyPair = await keyManager.generateKeyPair("test-key-001");
    publicKey = keyPair.publicKey;
    privateKey = keyPair.privateKey;
    publicKeyId = keyPair.keyId;
  });

  describe("getManifestHash", () => {
    it("should generate consistent SHA-256 hash for same manifest", () => {
      const hash1 = signer.getManifestHash(mockManifest);
      const hash2 = signer.getManifestHash(mockManifest);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA-256 is 64 hex characters
    });

    it("should generate different hashes for different manifests", () => {
      const manifest2 = { ...mockManifest, name: "Different Name" };
      
      const hash1 = signer.getManifestHash(mockManifest);
      const hash2 = signer.getManifestHash(manifest2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("signManifest", () => {
    it("should successfully sign a manifest", async () => {
      const signature = await signer.signManifest(
        mockManifest,
        privateKey,
        publicKeyId,
        "test@example.com",
        "testing"
      );
      
      expect(signature).toBeDefined();
      expect(signature.signature).toBeTruthy();
      expect(signature.algorithm).toBe("RS256");
      expect(signature.publicKeyId).toBe(publicKeyId);
      expect(signature.manifestHash).toBeTruthy();
      expect(signature.metadata.signedBy).toBe("test@example.com");
      expect(signature.metadata.environment).toBe("testing");
    });

    it("should generate different signatures for different manifests", async () => {
      const manifest2 = { ...mockManifest, name: "Different Manifest" };
      
      const sig1 = await signer.signManifest(mockManifest, privateKey, publicKeyId, "test@example.com");
      const sig2 = await signer.signManifest(manifest2, privateKey, publicKeyId, "test@example.com");
      
      expect(sig1.signature).not.toBe(sig2.signature);
      expect(sig1.manifestHash).not.toBe(sig2.manifestHash);
    });
  });

  describe("verifyManifest", () => {
    it("should successfully verify a valid signature", async () => {
      const signature = await signer.signManifest(
        mockManifest,
        privateKey,
        publicKeyId,
        "test@example.com"
      );
      
      const result = await signer.verifyManifest(mockManifest, signature, publicKey);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.publicKeyId).toBe(publicKeyId);
      expect(result.signedBy).toBe("test@example.com");
    });

    it("should fail verification if manifest is modified", async () => {
      const signature = await signer.signManifest(
        mockManifest,
        privateKey,
        publicKeyId,
        "test@example.com"
      );
      
      // Modify manifest
      const modifiedManifest = { ...mockManifest, name: "Modified Name" };
      
      const result = await signer.verifyManifest(modifiedManifest, signature, publicKey);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain("hash mismatch");
    });

    it("should fail verification with wrong public key", async () => {
      const signature = await signer.signManifest(
        mockManifest,
        privateKey,
        publicKeyId,
        "test@example.com"
      );
      
      // Generate different key pair
      const wrongKeyPair = await keyManager.generateKeyPair("wrong-key");
      
      const result = await signer.verifyManifest(mockManifest, signature, wrongKeyPair.publicKey);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should warn if signature is old (>90 days)", async () => {
      const signature = await signer.signManifest(
        mockManifest,
        privateKey,
        publicKeyId,
        "test@example.com"
      );
      
      // Simulate old signature (91 days ago)
      signature.timestamp = Date.now() - (91 * 24 * 60 * 60 * 1000);
      
      const result = await signer.verifyManifest(mockManifest, signature, publicKey);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain("91 days old");
    });
  });

  describe("signAndAttach", () => {
    it("should sign manifest and attach signature", async () => {
      const manifestWithSignature = await signer.signAndAttach(
        mockManifest,
        privateKey,
        publicKeyId,
        "test@example.com"
      );
      
      expect(manifestWithSignature.signature).toBeDefined();
      expect(manifestWithSignature.id).toBe(mockManifest.id);
      expect(manifestWithSignature.name).toBe(mockManifest.name);
    });
  });

  describe("verifyEmbedded", () => {
    it("should verify embedded signature", async () => {
      const manifestWithSignature = await signer.signAndAttach(
        mockManifest,
        privateKey,
        publicKeyId,
        "test@example.com"
      );
      
      const result = await signer.verifyEmbedded(manifestWithSignature, publicKey);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});


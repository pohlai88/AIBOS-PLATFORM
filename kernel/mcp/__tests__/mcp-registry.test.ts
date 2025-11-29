/**
 * MCP Registry Tests
 * 
 * Tests for GRCD-KERNEL F-2: Manifest registration and management
 */

import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { MCPRegistry } from "../registry/mcp-registry";
import type { MCPManifest } from "../types";

// Mock audit and event emitters
jest.mock("../audit/mcp-audit");
jest.mock("../events/mcp-events");
jest.mock("../telemetry/mcp-metrics");

describe("MCPRegistry", () => {
  let registry: MCPRegistry;

  beforeEach(() => {
    registry = MCPRegistry.getInstance();
    registry.clear(); // Reset registry before each test
  });

  afterEach(() => {
    registry.clear();
  });

  describe("register()", () => {
    it("should register a valid manifest", async () => {
      const manifest: MCPManifest = {
        name: "test-server",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
        description: "Test server",
      };

      const result = await registry.register(manifest);

      expect(result.success).toBe(true);
      expect(result.manifestHash).toBeDefined();
      expect(result.manifestHash?.length).toBeGreaterThan(0);
    });

    it("should reject invalid manifest", async () => {
      const invalidManifest = {
        name: "test-server",
        // missing required fields
      };

      const result = await registry.register(invalidManifest);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should generate consistent hash for same manifest", async () => {
      const manifest: MCPManifest = {
        name: "test-server",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
      };

      const result1 = await registry.register(manifest);
      registry.clear();
      const result2 = await registry.register(manifest);

      expect(result1.manifestHash).toBe(result2.manifestHash);
    });

    it("should deprecate old version when new version is registered", async () => {
      const manifestV1: MCPManifest = {
        name: "test-server",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
      };

      const manifestV2: MCPManifest = {
        ...manifestV1,
        version: "2.0.0",
      };

      await registry.register(manifestV1);
      await registry.register(manifestV2);

      const current = registry.getByName("test-server");
      expect(current?.manifest.version).toBe("2.0.0");
      expect(current?.status).toBe("active");
    });
  });

  describe("getByName()", () => {
    it("should return registered manifest", async () => {
      const manifest: MCPManifest = {
        name: "test-server",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
      };

      await registry.register(manifest);
      const entry = registry.getByName("test-server");

      expect(entry).toBeDefined();
      expect(entry?.manifest.name).toBe("test-server");
    });

    it("should return null for non-existent manifest", () => {
      const entry = registry.getByName("non-existent");
      expect(entry).toBeNull();
    });
  });

  describe("listActive()", () => {
    it("should list only active manifests", async () => {
      const manifest1: MCPManifest = {
        name: "server1",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
      };

      const manifest2: MCPManifest = {
        name: "server2",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
      };

      await registry.register(manifest1);
      await registry.register(manifest2);
      await registry.disable("server1");

      const active = registry.listActive();

      expect(active).toHaveLength(1);
      expect(active[0].manifest.name).toBe("server2");
    });

    it("should return empty array when no manifests registered", () => {
      const active = registry.listActive();
      expect(active).toHaveLength(0);
    });
  });

  describe("disable()", () => {
    it("should disable existing manifest", async () => {
      const manifest: MCPManifest = {
        name: "test-server",
        version: "1.0.0",
        protocol: "mcp",
        protocolVersion: "2025-03-26",
      };

      await registry.register(manifest);
      const result = await registry.disable("test-server");

      expect(result).toBe(true);

      const entry = registry.getByName("test-server");
      expect(entry?.status).toBe("disabled");
    });

    it("should return false for non-existent manifest", async () => {
      const result = await registry.disable("non-existent");
      expect(result).toBe(false);
    });
  });
});


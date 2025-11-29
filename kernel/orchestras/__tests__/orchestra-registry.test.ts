/**
 * Orchestra Registry Unit Tests
 * 
 * GRCD-KERNEL v4.0.0 Testing: Orchestra manifest registration and validation
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { orchestraRegistry, OrchestraRegistry } from "../registry/orchestra-registry";
import { OrchestrationDomain } from "../types";
import type { OrchestraManifest } from "../types";

describe("OrchestraRegistry", () => {
  let registry: OrchestraRegistry;

  beforeEach(() => {
    registry = OrchestraRegistry.getInstance();
    registry.clear();
  });

  describe("register()", () => {
    it("should register a valid orchestra manifest", async () => {
      const manifest: OrchestraManifest = {
        name: "Test Database Orchestra",
        version: "1.0.0",
        domain: OrchestrationDomain.DATABASE,
        description: "Test database orchestra",
        agents: [
          {
            name: "test-agent",
            role: "Testing",
            description: "Test agent",
            capabilities: ["test"],
          },
        ],
        tools: [
          {
            name: "test-tool",
            description: "Test tool",
            inputSchema: { type: "object" },
          },
        ],
        policies: [],
      };

      const result = await registry.register(manifest);

      expect(result.success).toBe(true);
      expect(result.manifestHash).toBeDefined();
      expect(result.manifestHash?.length).toBe(64); // SHA256 hash
    });

    it("should reject invalid manifest (missing required fields)", async () => {
      const invalidManifest = {
        name: "Invalid",
        // missing version, domain, etc.
      };

      const result = await registry.register(invalidManifest);

      expect(result.success).toBe(false);
      expect(result.error).toContain("validation failed");
    });

    it("should reject manifest with invalid domain", async () => {
      const invalidManifest = {
        name: "Test",
        version: "1.0.0",
        domain: "invalid-domain", // Not in OrchestrationDomain enum
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
      };

      const result = await registry.register(invalidManifest);

      expect(result.success).toBe(false);
    });

    it("should allow updating existing orchestra", async () => {
      const manifest: OrchestraManifest = {
        name: "Test",
        version: "1.0.0",
        domain: OrchestrationDomain.DATABASE,
        description: "Original",
        agents: [],
        tools: [],
        policies: [],
      };

      await registry.register(manifest);

      const updatedManifest = {
        ...manifest,
        version: "1.1.0",
        description: "Updated",
      };

      const result = await registry.register(updatedManifest);

      expect(result.success).toBe(true);
    });
  });

  describe("getByDomain()", () => {
    it("should retrieve registered orchestra by domain", async () => {
      const manifest: OrchestraManifest = {
        name: "Test",
        version: "1.0.0",
        domain: OrchestrationDomain.UX_UI,
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
      };

      await registry.register(manifest);

      const retrieved = registry.getByDomain(OrchestrationDomain.UX_UI);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.manifest.name).toBe("Test");
      expect(retrieved?.status).toBe("active");
    });

    it("should return null for non-existent domain", () => {
      const retrieved = registry.getByDomain(OrchestrationDomain.FINANCE);

      expect(retrieved).toBeNull();
    });
  });

  describe("listActive()", () => {
    it("should list all active orchestras", async () => {
      const manifest1: OrchestraManifest = {
        name: "DB Orchestra",
        version: "1.0.0",
        domain: OrchestrationDomain.DATABASE,
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
      };

      const manifest2: OrchestraManifest = {
        name: "UI Orchestra",
        version: "1.0.0",
        domain: OrchestrationDomain.UX_UI,
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
      };

      await registry.register(manifest1);
      await registry.register(manifest2);

      const active = registry.listActive();

      expect(active).toHaveLength(2);
      expect(active.every((entry) => entry.status === "active")).toBe(true);
    });

    it("should not include disabled orchestras", async () => {
      const manifest: OrchestraManifest = {
        name: "Test",
        version: "1.0.0",
        domain: OrchestrationDomain.DATABASE,
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
      };

      await registry.register(manifest);
      await registry.disable(OrchestrationDomain.DATABASE, "Test disable");

      const active = registry.listActive();

      expect(active).toHaveLength(0);
    });
  });

  describe("disable()", () => {
    it("should disable orchestra", async () => {
      const manifest: OrchestraManifest = {
        name: "Test",
        version: "1.0.0",
        domain: OrchestrationDomain.DATABASE,
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
      };

      await registry.register(manifest);

      const result = await registry.disable(OrchestrationDomain.DATABASE, "Test reason");

      expect(result).toBe(true);
      expect(registry.isActive(OrchestrationDomain.DATABASE)).toBe(false);
    });

    it("should return false for non-existent orchestra", async () => {
      const result = await registry.disable(OrchestrationDomain.FINANCE);

      expect(result).toBe(false);
    });
  });

  describe("isActive()", () => {
    it("should return true for active orchestra", async () => {
      const manifest: OrchestraManifest = {
        name: "Test",
        version: "1.0.0",
        domain: OrchestrationDomain.DATABASE,
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
      };

      await registry.register(manifest);

      expect(registry.isActive(OrchestrationDomain.DATABASE)).toBe(true);
    });

    it("should return false for disabled orchestra", async () => {
      const manifest: OrchestraManifest = {
        name: "Test",
        version: "1.0.0",
        domain: OrchestrationDomain.DATABASE,
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
      };

      await registry.register(manifest);
      await registry.disable(OrchestrationDomain.DATABASE);

      expect(registry.isActive(OrchestrationDomain.DATABASE)).toBe(false);
    });

    it("should return false for non-existent orchestra", () => {
      expect(registry.isActive(OrchestrationDomain.FINANCE)).toBe(false);
    });
  });

  describe("validateDependencies()", () => {
    it("should return true when all dependencies are active", async () => {
      const dbManifest: OrchestraManifest = {
        name: "DB",
        version: "1.0.0",
        domain: OrchestrationDomain.DATABASE,
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
      };

      const bffManifest: OrchestraManifest = {
        name: "BFF",
        version: "1.0.0",
        domain: OrchestrationDomain.BFF_API,
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
        dependencies: [OrchestrationDomain.DATABASE],
      };

      await registry.register(dbManifest);
      await registry.register(bffManifest);

      expect(registry.validateDependencies(OrchestrationDomain.BFF_API)).toBe(true);
    });

    it("should return false when dependency is missing", async () => {
      const manifest: OrchestraManifest = {
        name: "BFF",
        version: "1.0.0",
        domain: OrchestrationDomain.BFF_API,
        description: "Test",
        agents: [],
        tools: [],
        policies: [],
        dependencies: [OrchestrationDomain.DATABASE],
      };

      await registry.register(manifest);

      expect(registry.validateDependencies(OrchestrationDomain.BFF_API)).toBe(false);
    });
  });
});


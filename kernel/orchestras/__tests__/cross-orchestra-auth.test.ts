/**
 * Cross-Orchestra Authorization Unit Tests
 * 
 * GRCD-KERNEL v4.0.0 F-17: Cross-orchestra authorization testing
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { crossOrchestraAuth, CrossOrchestraAuth } from "../coordinator/cross-orchestra";
import { orchestraRegistry } from "../registry/orchestra-registry";
import { OrchestrationDomain } from "../types";
import type { CrossOrchestraAuthRequest, OrchestraManifest } from "../types";

describe("CrossOrchestraAuth", () => {
  let auth: CrossOrchestraAuth;

  beforeEach(async () => {
    auth = CrossOrchestraAuth.getInstance();
    orchestraRegistry.clear();

    // Register test orchestras
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
    };

    const uxManifest: OrchestraManifest = {
      name: "UX",
      version: "1.0.0",
      domain: OrchestrationDomain.UX_UI,
      description: "Test",
      agents: [],
      tools: [],
      policies: [],
    };

    await orchestraRegistry.register(dbManifest);
    await orchestraRegistry.register(bffManifest);
    await orchestraRegistry.register(uxManifest);
  });

  describe("authorize()", () => {
    it("should allow BFF_API to call DATABASE", async () => {
      const request: CrossOrchestraAuthRequest = {
        sourceDomain: OrchestrationDomain.BFF_API,
        targetDomain: OrchestrationDomain.DATABASE,
        action: "query",
        context: {},
      };

      const result = await auth.authorize(request);

      expect(result.allowed).toBe(true);
    });

    it("should deny DATABASE calling BFF_API (reverse not allowed)", async () => {
      const request: CrossOrchestraAuthRequest = {
        sourceDomain: OrchestrationDomain.DATABASE,
        targetDomain: OrchestrationDomain.BFF_API,
        action: "query",
        context: {},
      };

      const result = await auth.authorize(request);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("not authorized");
    });

    it("should deny when source orchestra is not active", async () => {
      await orchestraRegistry.disable(OrchestrationDomain.BFF_API);

      const request: CrossOrchestraAuthRequest = {
        sourceDomain: OrchestrationDomain.BFF_API,
        targetDomain: OrchestrationDomain.DATABASE,
        action: "query",
        context: {},
      };

      const result = await auth.authorize(request);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("not active");
    });

    it("should deny when target orchestra is not active", async () => {
      await orchestraRegistry.disable(OrchestrationDomain.DATABASE);

      const request: CrossOrchestraAuthRequest = {
        sourceDomain: OrchestrationDomain.BFF_API,
        targetDomain: OrchestrationDomain.DATABASE,
        action: "query",
        context: {},
      };

      const result = await auth.authorize(request);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("not active");
    });

    it("should allow UX_UI to call BFF_API", async () => {
      const request: CrossOrchestraAuthRequest = {
        sourceDomain: OrchestrationDomain.UX_UI,
        targetDomain: OrchestrationDomain.BFF_API,
        action: "fetch_data",
        context: {},
      };

      const result = await auth.authorize(request);

      expect(result.allowed).toBe(true);
    });

    it("should allow with admin role", async () => {
      const request: CrossOrchestraAuthRequest = {
        sourceDomain: OrchestrationDomain.DATABASE,
        targetDomain: OrchestrationDomain.BFF_API,
        action: "query",
        context: {
          roles: ["admin"],
        },
      };

      // Note: Admin role bypasses restrictions in context permissions,
      // but cross-orchestra rules still apply
      const result = await auth.authorize(request);

      // This will still be denied because DATABASE → BFF_API is not in rules
      expect(result.allowed).toBe(false);
    });

    it("should check required permissions", async () => {
      const request: CrossOrchestraAuthRequest = {
        sourceDomain: OrchestrationDomain.BFF_API,
        targetDomain: OrchestrationDomain.DATABASE,
        action: "query",
        context: {
          permissions: ["orchestra.db.query"],
        },
      };

      const result = await auth.authorize(request);

      expect(result.allowed).toBe(true);
    });

    it("should deny when missing required permissions", async () => {
      const request: CrossOrchestraAuthRequest = {
        sourceDomain: OrchestrationDomain.BFF_API,
        targetDomain: OrchestrationDomain.DATABASE,
        action: "query",
        context: {
          permissions: ["orchestra.db.read"], // Wrong permission
        },
      };

      const result = await auth.authorize(request);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("Missing required permission");
      expect(result.requiredPermissions).toContain("orchestra.db.query");
    });
  });

  describe("canBeCalled()", () => {
    it("should return true for valid caller", () => {
      const result = auth.canBeCalled(
        OrchestrationDomain.DATABASE,
        OrchestrationDomain.BFF_API
      );

      expect(result).toBe(true);
    });

    it("should return false for invalid caller", () => {
      const result = auth.canBeCalled(
        OrchestrationDomain.BFF_API,
        OrchestrationDomain.DATABASE
      );

      expect(result).toBe(false);
    });
  });

  describe("getAllowedTargets()", () => {
    it("should return allowed target domains for BFF_API", () => {
      const targets = auth.getAllowedTargets(OrchestrationDomain.BFF_API);

      expect(targets).toContain(OrchestrationDomain.DATABASE);
      expect(targets).toContain(OrchestrationDomain.BACKEND_INFRA);
      expect(targets).toContain(OrchestrationDomain.UX_UI);
    });

    it("should return empty array for DATABASE (leaf node)", () => {
      const targets = auth.getAllowedTargets(OrchestrationDomain.DATABASE);

      expect(targets).toHaveLength(0);
    });
  });

  describe("getAllowedCallers()", () => {
    it("should return allowed callers for DATABASE", () => {
      const callers = auth.getAllowedCallers(OrchestrationDomain.DATABASE);

      expect(callers).toContain(OrchestrationDomain.BFF_API);
      expect(callers).toContain(OrchestrationDomain.BACKEND_INFRA);
      expect(callers).toContain(OrchestrationDomain.COMPLIANCE);
    });

    it("should return empty array for COMPLIANCE (cannot be called)", () => {
      const callers = auth.getAllowedCallers(OrchestrationDomain.COMPLIANCE);

      expect(callers).toHaveLength(0);
    });
  });
});


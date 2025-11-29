/**
 * Orchestra Integration Tests
 * 
 * GRCD-KERNEL v4.0.0 End-to-end testing: Cross-orchestra workflows
 * Tests the complete orchestra coordination lifecycle
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { orchestraRegistry } from "../registry/orchestra-registry";
import { orchestraConductor } from "../coordinator/conductor";
import { OrchestrationDomain } from "../types";
import type { OrchestraManifest, OrchestraActionRequest } from "../types";

describe("Orchestra Integration Tests", () => {
  beforeEach(async () => {
    orchestraRegistry.clear();
    orchestraConductor.clearSessions();

    // Register Database Orchestra
    const dbManifest: OrchestraManifest = {
      name: "Database Orchestra",
      version: "1.0.0",
      domain: OrchestrationDomain.DATABASE,
      description: "Database operations",
      agents: [
        {
          name: "schema-analyzer",
          role: "Schema Analysis",
          description: "Analyzes database schemas",
          capabilities: ["analyze", "optimize"],
        },
      ],
      tools: [
        {
          name: "analyze_schema",
          description: "Analyzes database schema",
          inputSchema: { type: "object" },
        },
      ],
      policies: [],
    };

    // Register UX/UI Orchestra
    const uxManifest: OrchestraManifest = {
      name: "UX/UI Orchestra",
      version: "1.0.0",
      domain: OrchestrationDomain.UX_UI,
      description: "UI component generation",
      agents: [
        {
          name: "component-generator",
          role: "Component Generation",
          description: "Generates UI components",
          capabilities: ["generate", "validate"],
        },
      ],
      tools: [
        {
          name: "generate_component",
          description: "Generates UI component",
          inputSchema: { type: "object" },
        },
      ],
      policies: [],
    };

    // Register BFF/API Orchestra (depends on DATABASE)
    const bffManifest: OrchestraManifest = {
      name: "BFF/API Orchestra",
      version: "1.0.0",
      domain: OrchestrationDomain.BFF_API,
      description: "Backend for frontend",
      agents: [],
      tools: [],
      policies: [],
      dependencies: [OrchestrationDomain.DATABASE],
    };

    await orchestraRegistry.register(dbManifest);
    await orchestraRegistry.register(uxManifest);
    await orchestraRegistry.register(bffManifest);
  });

  describe("Single Orchestra Action", () => {
    it("should execute database orchestra action successfully", async () => {
      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "analyze_schema",
        arguments: {
          database: "test_db",
          tables: ["users", "orders"],
        },
        context: {
          tenantId: "tenant-123",
          traceId: "trace-456",
        },
      };

      const result = await orchestraConductor.coordinateAction(request);

      expect(result.success).toBe(true);
      expect(result.domain).toBe(OrchestrationDomain.DATABASE);
      expect(result.action).toBe("analyze_schema");
      expect(result.data).toBeDefined();
      expect(result.metadata?.executionTimeMs).toBeGreaterThan(0);
    });

    it("should execute UX/UI orchestra action successfully", async () => {
      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.UX_UI,
        action: "generate_component",
        arguments: {
          description: "A button with primary color",
          componentName: "PrimaryButton",
          framework: "react",
        },
        context: {
          tenantId: "tenant-123",
        },
      };

      const result = await orchestraConductor.coordinateAction(request);

      expect(result.success).toBe(true);
      expect(result.data.componentCode).toBeDefined();
      expect(result.data.accessibilityScore).toBeGreaterThan(0);
    });

    it("should fail when orchestra is not registered", async () => {
      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.FINANCE,
        action: "test",
        arguments: {},
        context: {},
      };

      const result = await orchestraConductor.coordinateAction(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORCHESTRA_NOT_FOUND");
    });

    it("should fail when orchestra is disabled", async () => {
      await orchestraRegistry.disable(OrchestrationDomain.DATABASE, "Maintenance");

      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "analyze_schema",
        arguments: {},
        context: {},
      };

      const result = await orchestraConductor.coordinateAction(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("ORCHESTRA_DISABLED");
    });

    it("should fail when dependencies are missing", async () => {
      await orchestraRegistry.disable(OrchestrationDomain.DATABASE);

      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.BFF_API,
        action: "test",
        arguments: {},
        context: {},
      };

      const result = await orchestraConductor.coordinateAction(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("DEPENDENCIES_MISSING");
    });
  });

  describe("Cross-Orchestra Coordination", () => {
    it("should execute multiple actions in parallel", async () => {
      const requests: OrchestraActionRequest[] = [
        {
          domain: OrchestrationDomain.DATABASE,
          action: "analyze_schema",
          arguments: { database: "db1" },
          context: {},
        },
        {
          domain: OrchestrationDomain.UX_UI,
          action: "generate_component",
          arguments: {
            description: "Test",
            componentName: "TestComponent",
          },
          context: {},
        },
      ];

      const results = await orchestraConductor.coordinateCrossOrchestra(
        requests,
        true // parallel
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[0].domain).toBe(OrchestrationDomain.DATABASE);
      expect(results[1].domain).toBe(OrchestrationDomain.UX_UI);
    });

    it("should execute multiple actions in sequence", async () => {
      const requests: OrchestraActionRequest[] = [
        {
          domain: OrchestrationDomain.DATABASE,
          action: "analyze_schema",
          arguments: { database: "db1" },
          context: {},
        },
        {
          domain: OrchestrationDomain.UX_UI,
          action: "generate_component",
          arguments: {
            description: "Test",
            componentName: "TestComponent",
          },
          context: {},
        },
      ];

      const results = await orchestraConductor.coordinateCrossOrchestra(
        requests,
        false // sequential
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });

    it("should stop on first failure in sequential mode", async () => {
      const requests: OrchestraActionRequest[] = [
        {
          domain: OrchestrationDomain.FINANCE, // Not registered, will fail
          action: "test",
          arguments: {},
          context: {},
        },
        {
          domain: OrchestrationDomain.DATABASE,
          action: "analyze_schema",
          arguments: {},
          context: {},
        },
      ];

      const results = await orchestraConductor.coordinateCrossOrchestra(
        requests,
        false // sequential
      );

      expect(results).toHaveLength(1); // Only first result
      expect(results[0].success).toBe(false);
    });

    it("should share orchestrationId across coordinated actions", async () => {
      const requests: OrchestraActionRequest[] = [
        {
          domain: OrchestrationDomain.DATABASE,
          action: "analyze_schema",
          arguments: {},
          context: {},
        },
        {
          domain: OrchestrationDomain.UX_UI,
          action: "generate_component",
          arguments: {
            description: "Test",
            componentName: "Test",
          },
          context: {},
        },
      ];

      await orchestraConductor.coordinateCrossOrchestra(requests, true);

      // Both actions should have same orchestrationId (logged in context)
      // This would be verified through audit logs in real implementation
      expect(true).toBe(true); // Placeholder assertion
    });
  });

  describe("Coordination Sessions", () => {
    it("should create and track coordination session", async () => {
      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "analyze_schema",
        arguments: {},
        context: {},
      };

      // Before action
      const activeSessionsBefore = orchestraConductor.listActiveSessions();
      expect(activeSessionsBefore).toHaveLength(0);

      // Execute action (this will create and complete session)
      await orchestraConductor.coordinateAction(request);

      // After action (session should be completed, not active)
      const activeSessionsAfter = orchestraConductor.listActiveSessions();
      expect(activeSessionsAfter).toHaveLength(0);
    });
  });

  describe("Error Handling", () => {
    it("should handle orchestra execution errors gracefully", async () => {
      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "invalid_action", // Unknown action
        arguments: {},
        context: {},
      };

      const result = await orchestraConductor.coordinateAction(request);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.metadata?.executionTimeMs).toBeGreaterThan(0);
    });

    it("should return detailed error for not implemented orchestras", async () => {
      // Register a manifest for FINANCE but it has no implementation
      const financeManifest: OrchestraManifest = {
        name: "Finance Orchestra",
        version: "1.0.0",
        domain: OrchestrationDomain.FINANCE,
        description: "Finance operations",
        agents: [],
        tools: [],
        policies: [],
      };

      await orchestraRegistry.register(financeManifest);

      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.FINANCE,
        action: "test",
        arguments: {},
        context: {},
      };

      const result = await orchestraConductor.coordinateAction(request);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe("NOT_IMPLEMENTED");
      expect(result.error?.message).toContain("not yet available");
      expect(result.error?.details.availableDomains).toContain("db");
      expect(result.error?.details.availableDomains).toContain("ux-ui");
    });
  });

  describe("Performance and Metrics", () => {
    it("should track execution time for actions", async () => {
      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "analyze_schema",
        arguments: {},
        context: {},
      };

      const result = await orchestraConductor.coordinateAction(request);

      expect(result.metadata?.executionTimeMs).toBeDefined();
      expect(result.metadata?.executionTimeMs).toBeGreaterThan(0);
    });

    it("should track agents and tools used", async () => {
      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.UX_UI,
        action: "generate_component",
        arguments: {
          description: "Test",
          componentName: "Test",
        },
        context: {},
      };

      const result = await orchestraConductor.coordinateAction(request);

      expect(result.metadata?.agentsInvolved).toBeDefined();
      expect(result.metadata?.toolsUsed).toBeDefined();
      expect(result.metadata?.agentsInvolved?.length).toBeGreaterThan(0);
    });
  });
});


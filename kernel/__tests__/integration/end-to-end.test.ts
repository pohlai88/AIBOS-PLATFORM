/**
 * End-to-End Integration Tests
 * 
 * GRCD-KERNEL v4.0.0: Complete Platform Integration Tests
 * Tests the full flow: Policy → Orchestra → MCP
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import { policyRegistry } from "../../policy/registry/policy-registry";
import { policyEngine } from "../../policy/engine/policy-engine";
import { orchestraConductor } from "../../orchestras/coordinator/conductor";
import { mcpRegistry } from "../../mcp/registry/mcp-registry";
import type { PolicyManifest, PolicyContext } from "../../policy/types";
import type { OrchestraActionRequest } from "../../orchestras/types";
import { OrchestrationDomain } from "../../orchestras/types";
import { PolicyType, PolicyPrecedence, PolicyEffect } from "../../policy/types";

describe("End-to-End Integration Tests", () => {
  describe("Complete Governance Flow", () => {
    it("should enforce policy before executing orchestra action", async () => {
      // 1. Register a restrictive policy
      const policy: PolicyManifest = {
        id: "test-restrict-db-delete",
        name: "Restrict Database Deletion",
        version: "1.0.0",
        type: PolicyType.INTERNAL,
        description: "Prevent database deletion without confirmation",
        scope: {
          domain: "db",
          action: "delete_table",
        },
        rules: [
          {
            condition: "context.confirmed !== true",
            effect: PolicyEffect.DENY,
            details: "Database deletion requires confirmation",
          },
        ],
        precedence: PolicyPrecedence.INTERNAL,
        enabled: true,
      };

      await policyRegistry.registerPolicy(policy);

      // 2. Attempt orchestra action WITHOUT confirmation (should be denied)
      const deniedRequest: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "delete_table",
        arguments: { table: "users" },
        context: {
          tenantId: "test-tenant",
          userId: "test-user",
          confirmed: false,
        },
      };

      const deniedResult = await orchestraConductor.coordinateAction(deniedRequest);

      expect(deniedResult.success).toBe(false);
      expect(deniedResult.error?.code).toContain("POLICY");

      // 3. Attempt orchestra action WITH confirmation (should succeed)
      const allowedRequest: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "analyze_schema",
        arguments: { database: "test_db" },
        context: {
          tenantId: "test-tenant",
          userId: "test-user",
          confirmed: true,
        },
      };

      const allowedResult = await orchestraConductor.coordinateAction(allowedRequest);

      expect(allowedResult.success).toBe(true);
      expect(allowedResult.data).toBeDefined();

      // Cleanup
      await policyRegistry.deregisterPolicy(policy.id);
    });

    it("should handle cross-orchestra workflows with policy enforcement", async () => {
      // Scenario: UX/UI orchestra triggers DB orchestra (both governed by policies)
      
      // 1. Register policy for UX/UI actions
      const uxPolicy: PolicyManifest = {
        id: "test-ux-require-design-tokens",
        name: "Require Design Tokens",
        version: "1.0.0",
        type: PolicyType.INTERNAL,
        description: "UI components must use design tokens",
        scope: { domain: "ux-ui" },
        rules: [
          {
            condition: "arguments.useDesignTokens === true",
            effect: PolicyEffect.ALLOW,
          },
          {
            condition: "true",
            effect: PolicyEffect.DENY,
            details: "Design tokens required",
          },
        ],
        precedence: PolicyPrecedence.INTERNAL,
        enabled: true,
      };

      await policyRegistry.registerPolicy(uxPolicy);

      // 2. Execute UX/UI action (should succeed with design tokens)
      const uxRequest: OrchestraActionRequest = {
        domain: OrchestrationDomain.UX_UI,
        action: "generate_component",
        arguments: {
          componentName: "Button",
          useDesignTokens: true,
        },
        context: {
          tenantId: "test-tenant",
        },
      };

      const uxResult = await orchestraConductor.coordinateAction(uxRequest);

      expect(uxResult.success).toBe(true);

      // 3. Execute DB action (governed separately)
      const dbRequest: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "analyze_schema",
        arguments: { database: "app_db" },
        context: {
          tenantId: "test-tenant",
        },
      };

      const dbResult = await orchestraConductor.coordinateAction(dbRequest);

      expect(dbResult.success).toBe(true);

      // Cleanup
      await policyRegistry.deregisterPolicy(uxPolicy.id);
    });
  });

  describe("Policy Precedence in Real Scenarios", () => {
    it("should prioritize LEGAL over INTERNAL policies", async () => {
      // Register conflicting policies
      const legalPolicy: PolicyManifest = {
        id: "test-legal-gdpr",
        name: "GDPR Data Protection",
        version: "1.0.0",
        type: PolicyType.LEGAL,
        description: "Legal requirement",
        scope: { resource: "user_data", action: "export" },
        rules: [
          {
            condition: "context.userConsent === true",
            effect: PolicyEffect.ALLOW,
          },
          {
            condition: "true",
            effect: PolicyEffect.DENY,
            details: "GDPR requires consent",
          },
        ],
        precedence: PolicyPrecedence.LEGAL,
        enabled: true,
      };

      const internalPolicy: PolicyManifest = {
        id: "test-internal-allow-all",
        name: "Internal Allow All",
        version: "1.0.0",
        type: PolicyType.INTERNAL,
        description: "Internal policy",
        scope: { resource: "user_data", action: "export" },
        rules: [
          {
            condition: "true",
            effect: PolicyEffect.ALLOW,
            details: "Allow all internally",
          },
        ],
        precedence: PolicyPrecedence.INTERNAL,
        enabled: true,
      };

      await policyRegistry.registerPolicy(legalPolicy);
      await policyRegistry.registerPolicy(internalPolicy);

      // Evaluate context WITHOUT consent (LEGAL should DENY, INTERNAL would ALLOW)
      const context: PolicyContext = {
        tenantId: "test-tenant",
        resource: {
          type: "data",
          id: "user_data",
        },
        action: "export",
        metadata: {
          userConsent: false,
        },
      };

      const decision = await policyEngine.enforce(context);

      // LEGAL (DENY) should win over INTERNAL (ALLOW)
      expect(decision.finalEffect).toBe(PolicyEffect.DENY);
      expect(decision.decidingPolicies.some(p => p.policyId === legalPolicy.id)).toBe(true);

      // Cleanup
      await policyRegistry.deregisterPolicy(legalPolicy.id);
      await policyRegistry.deregisterPolicy(internalPolicy.id);
    });
  });

  describe("All 8 Orchestras Integration", () => {
    const testOrchestras = [
      { domain: OrchestrationDomain.DATABASE, action: "analyze_schema", args: { database: "test" } },
      { domain: OrchestrationDomain.UX_UI, action: "generate_component", args: { componentName: "Button" } },
      { domain: OrchestrationDomain.BFF_API, action: "create_endpoint", args: { path: "/api/test", method: "GET" } },
      { domain: OrchestrationDomain.BACKEND_INFRA, action: "health_check", args: { service: "api" } },
      { domain: OrchestrationDomain.COMPLIANCE, action: "check_compliance", args: { frameworks: ["GDPR"] } },
      { domain: OrchestrationDomain.OBSERVABILITY, action: "query_metrics", args: { metric: "cpu" } },
      { domain: OrchestrationDomain.FINANCE, action: "calculate_costs", args: { service: "api" } },
      { domain: OrchestrationDomain.DEVEX, action: "run_linter", args: { path: "src/" } },
    ];

    it.each(testOrchestras)("should execute $domain orchestra successfully", async ({ domain, action, args }) => {
      const request: OrchestraActionRequest = {
        domain,
        action,
        arguments: args,
        context: {
          tenantId: "test-tenant",
          userId: "test-user",
        },
      };

      const result = await orchestraConductor.coordinateAction(request);

      expect(result.success).toBe(true);
      expect(result.domain).toBe(domain);
      expect(result.action).toBe(action);
      expect(result.metadata?.executionTimeMs).toBeGreaterThan(0);
    });
  });

  describe("Performance Benchmarks", () => {
    it("should evaluate policies in <100ms (NF-11)", async () => {
      const context: PolicyContext = {
        tenantId: "test-tenant",
        resource: { type: "test", id: "test-resource" },
        action: "test-action",
      };

      const startTime = Date.now();
      await policyEngine.enforce(context);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(100);
    });

    it("should coordinate orchestra actions in <200ms (NF-11)", async () => {
      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "analyze_schema",
        arguments: { database: "test" },
        context: { tenantId: "test-tenant" },
      };

      const startTime = Date.now();
      const result = await orchestraConductor.coordinateAction(request);
      const duration = Date.now() - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(200);
    });
  });
});


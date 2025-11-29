/**
 * Policy Integration Tests
 * 
 * GRCD-KERNEL v4.0.0: End-to-end policy integration with orchestras
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { policyRegistry } from "../registry/policy-registry";
import { policyEngine } from "../engine/policy-engine";
import { orchestraPolicyEnforcer } from "../integration/orchestra-policy-enforcer";
import { PolicyPrecedence, PolicyStatus, PolicyEnforcementMode } from "../types";
import { OrchestrationDomain } from "../../orchestras/types";
import type { PolicyManifest } from "../types";
import type { OrchestraActionRequest } from "../../orchestras/types";

describe("Policy Integration Tests", () => {
  beforeEach(() => {
    policyRegistry.clear();
  });

  describe("Orchestra Policy Enforcement", () => {
    it("should enforce policies on orchestra actions", async () => {
      // Register a policy that denies database delete operations
      const policy: PolicyManifest = {
        id: "db-delete-protection",
        name: "Database Delete Protection",
        version: "1.0.0",
        description: "Prevent accidental database deletes",
        precedence: PolicyPrecedence.LEGAL,
        status: PolicyStatus.ACTIVE,
        enforcementMode: PolicyEnforcementMode.ENFORCE,
        scope: {
          orchestras: ["db"],
          actions: ["delete", "truncate"],
        },
        rules: [
          {
            id: "rule-1",
            description: "Deny delete without confirmation",
            conditions: [
              {
                field: "action",
                operator: "eq",
                value: "delete",
              },
              {
                field: "context.confirmed",
                operator: "ne",
                value: true,
              },
            ],
            effect: "deny",
          },
        ],
      };

      await policyRegistry.register(policy);

      // Create orchestra action request
      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "delete",
        arguments: { table: "users" },
        context: {
          confirmed: false,
        },
      };

      const result = await orchestraPolicyEnforcer.enforceBeforeAction(request);

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("delete");
    });

    it("should allow actions when policy permits", async () => {
      const policy: PolicyManifest = {
        id: "allow-reads",
        name: "Allow Read Operations",
        version: "1.0.0",
        description: "Allow read operations",
        precedence: PolicyPrecedence.INTERNAL,
        status: PolicyStatus.ACTIVE,
        enforcementMode: PolicyEnforcementMode.ENFORCE,
        scope: {
          orchestras: ["db"],
        },
        rules: [
          {
            id: "rule-1",
            description: "Allow reads",
            conditions: [
              {
                field: "action",
                operator: "eq",
                value: "read",
              },
            ],
            effect: "allow",
          },
        ],
      };

      await policyRegistry.register(policy);

      const request: OrchestraActionRequest = {
        domain: OrchestrationDomain.DATABASE,
        action: "read",
        arguments: {},
        context: {},
      };

      const result = await orchestraPolicyEnforcer.enforceBeforeAction(request);

      expect(result.allowed).toBe(true);
    });
  });

  describe("Multi-Policy Scenarios", () => {
    it("should enforce Legal policy over Internal policy", async () => {
      // Internal policy: Allow all
      const internalPolicy: PolicyManifest = {
        id: "internal-allow-all",
        name: "Internal Allow All",
        version: "1.0.0",
        description: "Internal policy",
        precedence: PolicyPrecedence.INTERNAL,
        status: PolicyStatus.ACTIVE,
        enforcementMode: PolicyEnforcementMode.ENFORCE,
        scope: {},
        rules: [
          {
            id: "rule-1",
            description: "Allow everything",
            conditions: [
              {
                field: "action",
                operator: "eq",
                value: "test-action",
              },
            ],
            effect: "allow",
          },
        ],
      };

      // Legal policy: Deny specific action
      const legalPolicy: PolicyManifest = {
        id: "legal-deny",
        name: "Legal Deny",
        version: "1.0.0",
        description: "Legal policy",
        precedence: PolicyPrecedence.LEGAL,
        status: PolicyStatus.ACTIVE,
        enforcementMode: PolicyEnforcementMode.ENFORCE,
        scope: {},
        rules: [
          {
            id: "rule-1",
            description: "Deny test action",
            conditions: [
              {
                field: "action",
                operator: "eq",
                value: "test-action",
              },
            ],
            effect: "deny",
          },
        ],
      };

      await policyRegistry.register(internalPolicy);
      await policyRegistry.register(legalPolicy);

      const result = await policyEngine.evaluate({
        action: "test-action",
        context: {},
      });

      expect(result.allowed).toBe(false);
      expect(result.winningPolicy?.precedence).toBe(PolicyPrecedence.LEGAL);
      expect(result.evaluatedPolicies).toHaveLength(2);
    });
  });
});


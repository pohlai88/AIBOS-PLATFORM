/**
 * Policy Module - Public API
 * 
 * GRCD-KERNEL v4.0.0 C-6: Policy Precedence (Legal > Industry > Internal)
 */

// Types
export * from "./types";

// Schemas
export * from "./schemas/policy-manifest.schema";

// Registry
export { PolicyRegistry, policyRegistry } from "./registry/policy-registry";

// Engine
export { PolicyEngine, policyEngine } from "./engine/policy-engine";
export { PolicyPrecedenceResolver, policyPrecedenceResolver } from "./engine/precedence-resolver";

// Integration
export { OrchestraPolicyEnforcer, orchestraPolicyEnforcer } from "./integration/orchestra-policy-enforcer";

// Audit, Events, Telemetry
export { PolicyAuditLogger, policyAuditLogger } from "./audit/policy-audit";
export { PolicyEventEmitter, policyEventEmitter } from "./events/policy-events";
export * from "./telemetry/policy-metrics";


/**
 * AI Agents Module
 * 
 * AI-BOS Kernel v6.0.0 Phase 5: AI Agent Integration
 * Export all agent-related components
 */

// Types
export * from "./types";

// Registry
export { AgentRegistry, agentRegistry } from "./registry/agent-registry";

// Connector
export { AgentOrchestraConnector, agentOrchestraConnector } from "./connector/orchestra-connector";

// Policy
export { AgentPolicyEnforcer, agentPolicyEnforcer } from "./policy/agent-policy-enforcer";

// Example Agents
export { dataAgent } from "./examples/data-agent";
export { complianceAgent } from "./examples/compliance-agent";
export { costAgent } from "./examples/cost-agent";


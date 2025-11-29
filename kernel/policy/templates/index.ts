/**
 * Policy Templates Module
 * 
 * GRCD-KERNEL v4.0.0 Section 5.6: Policy Templates & Inheritance
 * Export all template-related components
 */

export * from "./types";
export { PolicyTemplateRegistry, policyTemplateRegistry } from "./template-registry";
export { InheritanceResolver, inheritanceResolver } from "./inheritance-resolver";
export { builtinTemplates } from "./builtin-templates";


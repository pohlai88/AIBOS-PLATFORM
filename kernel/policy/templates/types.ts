/**
 * Policy Template Types
 * 
 * GRCD-KERNEL v4.0.0 Section 5.6: Policy Templates & Inheritance
 * Defines reusable policy templates with inheritance support
 */

import type { PolicyManifest, PolicyType, PolicyScope, PolicyRule, PolicyPrecedence } from "../types";

/**
 * Policy Template
 * Base definition that can be inherited and extended
 */
export interface PolicyTemplate {
  id: string;
  name: string;
  type: PolicyType;
  description?: string;
  baseScope?: Partial<PolicyScope>;
  baseRules?: PolicyRule[];
  precedence: PolicyPrecedence;
  metadata?: {
    category?: string;
    tags?: string[];
    version?: string;
    author?: string;
  };
}

/**
 * Policy Inheritance Definition
 * Defines how a policy inherits from a template
 */
export interface PolicyInheritance {
  templateId: string;
  overrides?: {
    scope?: Partial<PolicyScope>;
    rules?: PolicyRule[];
    enabled?: boolean;
  };
  extensions?: {
    additionalRules?: PolicyRule[];
    metadata?: Record<string, unknown>;
  };
}

/**
 * Resolved Policy from Template
 * The final policy after template inheritance is applied
 */
export interface ResolvedPolicy extends PolicyManifest {
  inheritedFrom?: string;
  overriddenProperties?: string[];
  extendedProperties?: string[];
}

/**
 * Template Registry Entry
 */
export interface TemplateRegistryEntry {
  template: PolicyTemplate;
  registeredAt: Date;
  usageCount: number;
  derivedPolicies: string[]; // Policy IDs that inherit from this template
}


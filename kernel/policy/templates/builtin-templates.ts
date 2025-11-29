/**
 * Built-in Policy Templates
 * 
 * GRCD-KERNEL v4.0.0 Section 5.6: Standard Policy Templates
 * Pre-configured templates for common compliance scenarios
 */

import type { PolicyTemplate } from "./types";
import { PolicyType, PolicyPrecedence, PolicyEffect } from "../types";

/**
 * GDPR Data Protection Template
 */
export const gdprTemplate: PolicyTemplate = {
  id: "template-gdpr-data-protection",
  name: "GDPR Data Protection Template",
  type: PolicyType.LEGAL,
  description: "Base template for GDPR compliance policies",
  precedence: PolicyPrecedence.LEGAL,
  baseScope: {
    resource: "data.personal_identifiable_information",
    action: "process",
  },
  baseRules: [
    {
      condition: "context.user.consent === false && resource.data.contains_pii === true",
      effect: PolicyEffect.DENY,
      details: "Processing PII without explicit consent is prohibited by GDPR",
    },
    {
      condition: "context.user.country === 'EU' && resource.data.contains_pii === true",
      effect: PolicyEffect.ALLOW,
      details: "Processing PII for EU users with consent is allowed",
    },
  ],
  metadata: {
    category: "data-protection",
    tags: ["gdpr", "privacy", "legal"],
    version: "1.0.0",
    author: "AI-BOS Platform",
  },
};

/**
 * SOC 2 Access Control Template
 */
export const soc2Template: PolicyTemplate = {
  id: "template-soc2-access-control",
  name: "SOC 2 Access Control Template",
  type: PolicyType.INDUSTRY,
  description: "Base template for SOC 2 compliance policies",
  precedence: PolicyPrecedence.INDUSTRY,
  baseScope: {
    action: "access",
  },
  baseRules: [
    {
      condition: "context.roles.includes('admin') || context.roles.includes('security_auditor')",
      effect: PolicyEffect.ALLOW,
      details: "Admin and security auditor roles have access",
    },
    {
      condition: "true",
      effect: PolicyEffect.DENY,
      details: "All other users are denied access by default",
    },
  ],
  metadata: {
    category: "access-control",
    tags: ["soc2", "security", "industry"],
    version: "1.0.0",
    author: "AI-BOS Platform",
  },
};

/**
 * Rate Limiting Template
 */
export const rateLimitTemplate: PolicyTemplate = {
  id: "template-rate-limiting",
  name: "Rate Limiting Template",
  type: PolicyType.INTERNAL,
  description: "Base template for rate limiting policies",
  precedence: PolicyPrecedence.INTERNAL,
  baseScope: {
    action: "call",
  },
  baseRules: [
    {
      condition: "context.metadata.requestCountPerMinute > 100",
      effect: PolicyEffect.DENY,
      details: "Rate limit exceeded (100 requests/minute)",
    },
    {
      condition: "context.metadata.requestCountPerMinute > 80",
      effect: PolicyEffect.ADVISE,
      details: "Approaching rate limit",
    },
  ],
  metadata: {
    category: "rate-limiting",
    tags: ["rate-limit", "performance", "internal"],
    version: "1.0.0",
    author: "AI-BOS Platform",
  },
};

/**
 * Environment-Based Access Template
 */
export const environmentAccessTemplate: PolicyTemplate = {
  id: "template-environment-access",
  name: "Environment-Based Access Template",
  type: PolicyType.INTERNAL,
  description: "Base template for environment-specific access policies",
  precedence: PolicyPrecedence.INTERNAL,
  baseScope: {},
  baseRules: [
    {
      condition: "context.metadata.environment === 'production' && !context.roles.includes('production-access')",
      effect: PolicyEffect.DENY,
      details: "Production access requires 'production-access' role",
    },
  ],
  metadata: {
    category: "access-control",
    tags: ["environment", "access", "internal"],
    version: "1.0.0",
    author: "AI-BOS Platform",
  },
};

/**
 * Cost Control Template
 */
export const costControlTemplate: PolicyTemplate = {
  id: "template-cost-control",
  name: "Cost Control Template",
  type: PolicyType.INTERNAL,
  description: "Base template for cost management policies",
  precedence: PolicyPrecedence.INTERNAL,
  baseScope: {
    domain: "finance",
  },
  baseRules: [
    {
      condition: "resource.data.estimatedCost > context.metadata.budgetLimit",
      effect: PolicyEffect.DENY,
      details: "Operation exceeds budget limit",
    },
    {
      condition: "resource.data.estimatedCost > (context.metadata.budgetLimit * 0.8)",
      effect: PolicyEffect.ADVISE,
      details: "Operation approaching budget limit (80%)",
    },
  ],
  metadata: {
    category: "cost-control",
    tags: ["finance", "budget", "internal"],
    version: "1.0.0",
    author: "AI-BOS Platform",
  },
};

/**
 * All built-in templates
 */
export const builtinTemplates: PolicyTemplate[] = [
  gdprTemplate,
  soc2Template,
  rateLimitTemplate,
  environmentAccessTemplate,
  costControlTemplate,
];


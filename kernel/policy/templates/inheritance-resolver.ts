/**
 * Policy Inheritance Resolver
 * 
 * GRCD-KERNEL v4.0.0 Section 5.6: Policy Inheritance Logic
 * Resolves policies from templates with inheritance and overrides
 */

import type { PolicyManifest, PolicyScope, PolicyRule } from "../types";
import type { PolicyTemplate, PolicyInheritance, ResolvedPolicy } from "./types";
import { policyTemplateRegistry } from "./template-registry";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("policy-inheritance-resolver");

export class InheritanceResolver {
  private static instance: InheritanceResolver;

  private constructor() {}

  public static getInstance(): InheritanceResolver {
    if (!InheritanceResolver.instance) {
      InheritanceResolver.instance = new InheritanceResolver();
    }
    return InheritanceResolver.instance;
  }

  /**
   * Resolve a policy from a template with inheritance
   */
  public resolveFromTemplate(
    policyId: string,
    policyName: string,
    version: string,
    inheritance: PolicyInheritance
  ): ResolvedPolicy {
    const template = policyTemplateRegistry.getTemplate(inheritance.templateId);

    if (!template) {
      throw new Error(`Template '${inheritance.templateId}' not found`);
    }

    logger.debug({ policyId, templateId: inheritance.templateId }, "Resolving policy from template");

    // Track this derivation
    policyTemplateRegistry.trackDerivation(inheritance.templateId, policyId);

    // Merge scope (template base + overrides)
    const scope = this.mergeScope(template.baseScope || {}, inheritance.overrides?.scope || {});

    // Merge rules (template base + overrides + extensions)
    const rules = this.mergeRules(
      template.baseRules || [],
      inheritance.overrides?.rules || [],
      inheritance.extensions?.additionalRules || []
    );

    // Build resolved policy
    const resolved: ResolvedPolicy = {
      id: policyId,
      name: policyName,
      version,
      type: template.type,
      description: template.description || `Derived from template: ${template.name}`,
      scope,
      rules,
      precedence: template.precedence,
      enabled: inheritance.overrides?.enabled ?? true,
      metadata: {
        ...template.metadata,
        ...inheritance.extensions?.metadata,
        templateId: template.id,
      },
      inheritedFrom: template.id,
      overriddenProperties: this.getOverriddenProperties(inheritance),
      extendedProperties: this.getExtendedProperties(inheritance),
    };

    logger.info({ policyId, templateId: template.id, rulesCount: rules.length }, "Policy resolved from template");

    return resolved;
  }

  /**
   * Merge scopes (base + override)
   */
  private mergeScope(base: Partial<PolicyScope>, override: Partial<PolicyScope>): PolicyScope {
    return {
      resource: override.resource ?? base.resource,
      action: override.action ?? base.action,
      domain: override.domain ?? base.domain,
      tenantId: override.tenantId ?? base.tenantId,
      userId: override.userId ?? base.userId,
      roles: override.roles ?? base.roles,
      groups: override.groups ?? base.groups,
    };
  }

  /**
   * Merge rules (base + overrides + extensions)
   * Overrides replace base rules, extensions add new rules
   */
  private mergeRules(
    baseRules: PolicyRule[],
    overrideRules: PolicyRule[],
    extensionRules: PolicyRule[]
  ): PolicyRule[] {
    // If overrides provided, use those; otherwise use base
    const effectiveRules = overrideRules.length > 0 ? overrideRules : baseRules;
    
    // Add extension rules
    return [...effectiveRules, ...extensionRules];
  }

  /**
   * Get list of overridden properties
   */
  private getOverriddenProperties(inheritance: PolicyInheritance): string[] {
    const overridden: string[] = [];
    if (inheritance.overrides?.scope) overridden.push("scope");
    if (inheritance.overrides?.rules) overridden.push("rules");
    if (inheritance.overrides?.enabled !== undefined) overridden.push("enabled");
    return overridden;
  }

  /**
   * Get list of extended properties
   */
  private getExtendedProperties(inheritance: PolicyInheritance): string[] {
    const extended: string[] = [];
    if (inheritance.extensions?.additionalRules) extended.push("additionalRules");
    if (inheritance.extensions?.metadata) extended.push("metadata");
    return extended;
  }

  /**
   * Validate policy template before resolution
   */
  public validateTemplate(template: PolicyTemplate): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!template.id || template.id.trim() === "") {
      errors.push("Template ID is required");
    }

    if (!template.name || template.name.trim() === "") {
      errors.push("Template name is required");
    }

    if (!template.type) {
      errors.push("Template type is required");
    }

    if (!template.precedence) {
      errors.push("Template precedence is required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const inheritanceResolver = InheritanceResolver.getInstance();


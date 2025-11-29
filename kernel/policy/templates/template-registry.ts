/**
 * Policy Template Registry
 * 
 * GRCD-KERNEL v4.0.0 Section 5.6: Policy Template Management
 * Manages reusable policy templates
 */

import type { PolicyTemplate, TemplateRegistryEntry } from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("policy-template-registry");

export class PolicyTemplateRegistry {
  private static instance: PolicyTemplateRegistry;
  private templates: Map<string, TemplateRegistryEntry> = new Map();

  private constructor() {}

  public static getInstance(): PolicyTemplateRegistry {
    if (!PolicyTemplateRegistry.instance) {
      PolicyTemplateRegistry.instance = new PolicyTemplateRegistry();
    }
    return PolicyTemplateRegistry.instance;
  }

  /**
   * Register a new policy template
   */
  public registerTemplate(template: PolicyTemplate): void {
    if (this.templates.has(template.id)) {
      logger.warn({ templateId: template.id }, "Template already exists, updating");
    }

    const entry: TemplateRegistryEntry = {
      template,
      registeredAt: new Date(),
      usageCount: 0,
      derivedPolicies: [],
    };

    this.templates.set(template.id, entry);
    logger.info({ templateId: template.id, name: template.name }, "Template registered");
  }

  /**
   * Get template by ID
   */
  public getTemplate(id: string): PolicyTemplate | null {
    const entry = this.templates.get(id);
    return entry ? entry.template : null;
  }

  /**
   * List all templates
   */
  public listTemplates(): PolicyTemplate[] {
    return Array.from(this.templates.values()).map(entry => entry.template);
  }

  /**
   * Track policy derivation from template
   */
  public trackDerivation(templateId: string, policyId: string): void {
    const entry = this.templates.get(templateId);
    if (entry) {
      entry.usageCount++;
      if (!entry.derivedPolicies.includes(policyId)) {
        entry.derivedPolicies.push(policyId);
      }
      logger.debug({ templateId, policyId, usageCount: entry.usageCount }, "Tracked policy derivation");
    }
  }

  /**
   * Get template usage statistics
   */
  public getTemplateStats(templateId: string): { usageCount: number; derivedPolicies: string[] } | null {
    const entry = this.templates.get(templateId);
    return entry ? { usageCount: entry.usageCount, derivedPolicies: entry.derivedPolicies } : null;
  }

  /**
   * Remove template (only if no policies derive from it)
   */
  public removeTemplate(templateId: string): boolean {
    const entry = this.templates.get(templateId);
    if (!entry) {
      return false;
    }

    if (entry.derivedPolicies.length > 0) {
      logger.error({ templateId, derivedCount: entry.derivedPolicies.length }, "Cannot remove template with derived policies");
      return false;
    }

    this.templates.delete(templateId);
    logger.info({ templateId }, "Template removed");
    return true;
  }
}

export const policyTemplateRegistry = PolicyTemplateRegistry.getInstance();


/**
 * Orchestra Implementation Registry
 * 
 * GRCD-KERNEL v4.0.0 Section 6.3: Domain Orchestra Implementations
 * Maps orchestration domains to their concrete implementations
 */

import type { OrchestrationDomain, OrchestraActionRequest, OrchestraActionResult } from "../types";
import { databaseOrchestra } from "./database-orchestra";
import { uxUiOrchestra } from "./ux-ui-orchestra";
import { bffApiOrchestra } from "./bff-api-orchestra";
import { backendInfraOrchestra } from "./backend-infra-orchestra";
import { complianceOrchestra } from "./compliance-orchestra";
import { observabilityOrchestra } from "./observability-orchestra";
import { financeOrchestra } from "./finance-orchestra";
import { devexOrchestra } from "./devex-orchestra";
import { baseLogger as logger } from "../../observability/logger";

/**
 * Orchestra Implementation Interface
 */
export interface OrchestraImplementation {
  execute(request: OrchestraActionRequest): Promise<OrchestraActionResult>;
}

/**
 * Orchestra Implementation Registry
 * 
 * Maps each orchestration domain to its concrete implementation.
 * Implementations that are not yet built return a "not implemented" result.
 */
export class OrchestraImplementationRegistry {
  private static instance: OrchestraImplementationRegistry;
  private implementations: Map<OrchestrationDomain, OrchestraImplementation> = new Map();

  private constructor() {
    this.registerImplementations();
  }

  public static getInstance(): OrchestraImplementationRegistry {
    if (!OrchestraImplementationRegistry.instance) {
      OrchestraImplementationRegistry.instance = new OrchestraImplementationRegistry();
    }
    return OrchestraImplementationRegistry.instance;
  }

  /**
   * Register all available orchestra implementations
   */
  private registerImplementations(): void {
    // All 8 orchestras now implemented! ✅
    this.implementations.set("db", databaseOrchestra);
    this.implementations.set("ux-ui", uxUiOrchestra);
    this.implementations.set("bff-api", bffApiOrchestra);
    this.implementations.set("backend-infra", backendInfraOrchestra);
    this.implementations.set("compliance", complianceOrchestra);
    this.implementations.set("observability", observabilityOrchestra);
    this.implementations.set("finance", financeOrchestra);
    this.implementations.set("devex", devexOrchestra);

    logger.info(
      { implementedCount: this.implementations.size, domains: Array.from(this.implementations.keys()) },
      "[OrchestraImplementationRegistry] ✅ All 8 orchestra implementations registered!"
    );
  }

  /**
   * Get implementation for a domain
   */
  public getImplementation(domain: OrchestrationDomain): OrchestraImplementation | null {
    return this.implementations.get(domain) || null;
  }

  /**
   * Check if implementation exists for domain
   */
  public hasImplementation(domain: OrchestrationDomain): boolean {
    return this.implementations.has(domain);
  }

  /**
   * Execute action on domain implementation
   */
  public async executeAction(request: OrchestraActionRequest): Promise<OrchestraActionResult> {
    const implementation = this.getImplementation(request.domain);

    if (!implementation) {
      return this.buildNotImplementedResult(request);
    }

    return implementation.execute(request);
  }

  /**
   * Build "not implemented" result
   */
  private buildNotImplementedResult(request: OrchestraActionRequest): OrchestraActionResult {
    logger.warn({
      domain: request.domain,
      action: request.action,
    }, "[OrchestraImplementationRegistry] Domain implementation not yet available");

    return {
      success: false,
      domain: request.domain,
      action: request.action,
      error: {
        code: "NOT_IMPLEMENTED",
        message: `Orchestra implementation for domain '${request.domain}' is not yet available. Please implement it in kernel/orchestras/implementations/`,
        details: {
          domain: request.domain,
          action: request.action,
          availableDomains: Array.from(this.implementations.keys()),
        },
      },
      metadata: {
        executionTimeMs: 0,
      },
    };
  }

  /**
   * List all implemented domains
   */
  public getImplementedDomains(): OrchestrationDomain[] {
    return Array.from(this.implementations.keys());
  }
}

/**
 * Export singleton instance
 */
export const orchestraImplementationRegistry = OrchestraImplementationRegistry.getInstance();


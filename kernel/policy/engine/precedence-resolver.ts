/**
 * Policy Precedence Resolver
 * 
 * GRCD-KERNEL v4.0.0 C-6: Legal > Industry > Internal
 * Resolves conflicts when multiple policies apply to the same action
 */

import type {
  PolicyManifest,
  PolicyRegistryEntry,
  PolicyConflict,
  PolicyPrecedence,
} from "../types";
import { baseLogger as logger } from "../../observability/logger";

/**
 * Policy Precedence Resolver
 * 
 * Implements the core C-6 requirement:
 * - Legal policies override Industry policies
 * - Industry policies override Internal policies
 * - Same precedence: Most restrictive wins (deny > allow)
 */
export class PolicyPrecedenceResolver {
  private static instance: PolicyPrecedenceResolver;

  private constructor() {}

  public static getInstance(): PolicyPrecedenceResolver {
    if (!PolicyPrecedenceResolver.instance) {
      PolicyPrecedenceResolver.instance = new PolicyPrecedenceResolver();
    }
    return PolicyPrecedenceResolver.instance;
  }

  /**
   * Resolve policy precedence when multiple policies apply
   * 
   * Algorithm:
   * 1. Group policies by precedence level
   * 2. Select highest precedence group (Legal > Industry > Internal)
   * 3. Within same precedence, most restrictive wins (deny > allow)
   * 4. If still tied, select most recently registered
   * 
   * @param policies - List of applicable policies with their effects
   * @returns The winning policy
   */
  public resolve(
    policies: {
      policy: PolicyManifest;
      effect: "allow" | "deny";
      reason?: string;
    }[]
  ): {
    winningPolicy: {
      policyId: string;
      policyName: string;
      precedence: PolicyPrecedence;
      effect: "allow" | "deny";
    };
    conflict?: PolicyConflict;
    reason: string;
  } {
    if (policies.length === 0) {
      throw new Error("Cannot resolve precedence with zero policies");
    }

    if (policies.length === 1) {
      // No conflict - single policy applies
      const policy = policies[0];
      return {
        winningPolicy: {
          policyId: policy.policy.id,
          policyName: policy.policy.name,
          precedence: policy.policy.precedence,
          effect: policy.effect,
        },
        reason: `Single policy '${policy.policy.name}' applies with effect: ${policy.effect}`,
      };
    }

    // Multiple policies - resolve precedence
    logger.debug({
      policyCount: policies.length,
      policies: policies.map((p) => ({
        id: p.policy.id,
        precedence: p.policy.precedence,
        effect: p.effect,
      })),
    }, "[PrecedenceResolver] Resolving policy conflict");

    // Step 1: Find highest precedence level
    const highestPrecedence = Math.max(
      ...policies.map((p) => p.policy.precedence)
    ) as PolicyPrecedence;

    // Step 2: Filter policies at highest precedence
    const highestPrecedencePolicies = policies.filter(
      (p) => p.policy.precedence === highestPrecedence
    );

    // Step 3: Within same precedence, check if there's a conflict
    const effects = new Set(highestPrecedencePolicies.map((p) => p.effect));
    
    let winningPolicy: typeof policies[0];

    if (effects.size > 1) {
      // Conflict detected - deny wins over allow
      logger.info({
        precedence: highestPrecedence,
        effects: Array.from(effects),
      }, "[PrecedenceResolver] Conflict detected, applying 'deny wins' rule");

      const denyPolicy = highestPrecedencePolicies.find((p) => p.effect === "deny");
      winningPolicy = denyPolicy || highestPrecedencePolicies[0];

      const conflict: PolicyConflict = {
        policies: policies.map((p) => ({
          policyId: p.policy.id,
          policyName: p.policy.name,
          precedence: p.policy.precedence,
          effect: p.effect,
        })),
        resolution: {
          winningPolicyId: winningPolicy.policy.id,
          reason: "Highest precedence with 'deny' effect wins",
        },
      };

      return {
        winningPolicy: {
          policyId: winningPolicy.policy.id,
          policyName: winningPolicy.policy.name,
          precedence: winningPolicy.policy.precedence,
          effect: winningPolicy.effect,
        },
        conflict,
        reason: `Conflict resolved: '${winningPolicy.policy.name}' (precedence: ${this.getPrecedenceName(highestPrecedence)}, effect: ${winningPolicy.effect}) wins`,
      };
    } else {
      // No conflict at highest precedence
      winningPolicy = highestPrecedencePolicies[0];

      // If multiple policies with same effect, log for awareness
      if (highestPrecedencePolicies.length > 1) {
        logger.debug({
          count: highestPrecedencePolicies.length,
          effect: winningPolicy.effect,
        }, "[PrecedenceResolver] Multiple policies with same precedence and effect");
      }

      return {
        winningPolicy: {
          policyId: winningPolicy.policy.id,
          policyName: winningPolicy.policy.name,
          precedence: winningPolicy.policy.precedence,
          effect: winningPolicy.effect,
        },
        reason: `Policy '${winningPolicy.policy.name}' (precedence: ${this.getPrecedenceName(highestPrecedence)}) wins`,
      };
    }
  }

  /**
   * Compare two policy precedence levels
   * 
   * @returns -1 if p1 < p2, 0 if equal, 1 if p1 > p2
   */
  public compare(p1: PolicyPrecedence, p2: PolicyPrecedence): number {
    if (p1 < p2) return -1;
    if (p1 > p2) return 1;
    return 0;
  }

  /**
   * Get human-readable precedence name
   */
  private getPrecedenceName(precedence: PolicyPrecedence): string {
    switch (precedence) {
      case 1:
        return "Internal";
      case 2:
        return "Industry";
      case 3:
        return "Legal";
      default:
        return "Unknown";
    }
  }

  /**
   * Check if a precedence level is higher than another
   */
  public isHigher(p1: PolicyPrecedence, p2: PolicyPrecedence): boolean {
    return p1 > p2;
  }

  /**
   * Get the highest precedence from a list of policies
   */
  public getHighestPrecedence(
    policies: { policy: PolicyManifest }[]
  ): PolicyPrecedence {
    if (policies.length === 0) {
      throw new Error("Cannot get highest precedence from empty list");
    }

    return Math.max(...policies.map((p) => p.policy.precedence)) as PolicyPrecedence;
  }
}

/**
 * Export singleton instance
 */
export const policyPrecedenceResolver = PolicyPrecedenceResolver.getInstance();


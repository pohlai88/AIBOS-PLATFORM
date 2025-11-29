/**
 * Policy Update Orchestrator
 * 
 * AI-BOS Kernel v6.0.0 Phase 5.4: Update Coordination
 * Coordinates policy updates across nodes with rollout strategies
 */

import type { PolicyManifest } from "../../policy/types";
import type { PolicyUpdateRollout, RolloutStrategy, PolicyChangeEvent } from "./types";
import { policyChangeStream } from "./policy-change-stream";
import { distributedPolicyCache } from "../policy/cache";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("policy-update-orchestrator");

/**
 * Policy Update Orchestrator
 * Coordinates zero-downtime policy updates
 */
export class PolicyUpdateOrchestrator {
  private static instance: PolicyUpdateOrchestrator;
  private activeRollouts: Map<string, PolicyUpdateRollout> = new Map();

  private constructor() {
    logger.info("Policy Update Orchestrator initialized");
  }

  public static getInstance(): PolicyUpdateOrchestrator {
    if (!PolicyUpdateOrchestrator.instance) {
      PolicyUpdateOrchestrator.instance = new PolicyUpdateOrchestrator();
    }
    return PolicyUpdateOrchestrator.instance;
  }

  /**
   * Update policy with zero downtime
   */
  public async updatePolicy(
    policy: PolicyManifest,
    strategy: RolloutStrategy = "immediate" as RolloutStrategy
  ): Promise<void> {
    logger.info({ policyId: policy.id, strategy }, "Starting policy update");

    const rollout: PolicyUpdateRollout = {
      policyId: policy.id,
      strategy,
      progress: {
        total: 1,  // Would be node count in distributed setup
        updated: 0,
        failed: 0,
      },
      status: "in_progress",
    };

    this.activeRollouts.set(policy.id, rollout);

    try {
      // 1. Invalidate cache first
      await distributedPolicyCache.invalidateAll();
      logger.debug({ policyId: policy.id }, "Cache invalidated");

      // 2. Publish policy update event
      const event: PolicyChangeEvent = {
        type: "updated",
        policyId: policy.id,
        policy,
        newVersion: policy.version,
        timestamp: new Date(),
        sourceNodeId: "local",
      };

      await policyChangeStream.publish(event);
      logger.debug({ policyId: policy.id }, "Policy update event published");

      // 3. Update rollout progress
      rollout.progress.updated = 1;
      rollout.status = "completed";

      logger.info({ policyId: policy.id }, "Policy update completed");
    } catch (error) {
      rollout.progress.failed = 1;
      rollout.status = "failed";
      
      logger.error({ error, policyId: policy.id }, "Policy update failed");
      throw error;
    }
  }

  /**
   * Delete policy
   */
  public async deletePolicy(policyId: string): Promise<void> {
    logger.info({ policyId }, "Starting policy deletion");

    // 1. Invalidate cache
    await distributedPolicyCache.invalidateAll();

    // 2. Publish deletion event
    const event: PolicyChangeEvent = {
      type: "deleted",
      policyId,
      timestamp: new Date(),
      sourceNodeId: "local",
    };

    await policyChangeStream.publish(event);

    logger.info({ policyId }, "Policy deletion completed");
  }

  /**
   * Enable policy
   */
  public async enablePolicy(policyId: string): Promise<void> {
    logger.info({ policyId }, "Enabling policy");

    // Invalidate cache
    await distributedPolicyCache.invalidateAll();

    // Publish enable event
    const event: PolicyChangeEvent = {
      type: "enabled",
      policyId,
      timestamp: new Date(),
      sourceNodeId: "local",
    };

    await policyChangeStream.publish(event);
  }

  /**
   * Disable policy
   */
  public async disablePolicy(policyId: string): Promise<void> {
    logger.info({ policyId }, "Disabling policy");

    // Invalidate cache
    await distributedPolicyCache.invalidateAll();

    // Publish disable event
    const event: PolicyChangeEvent = {
      type: "disabled",
      policyId,
      timestamp: new Date(),
      sourceNodeId: "local",
    };

    await policyChangeStream.publish(event);
  }

  /**
   * Get active rollouts
   */
  public getActiveRollouts(): PolicyUpdateRollout[] {
    return Array.from(this.activeRollouts.values());
  }

  /**
   * Get rollout status
   */
  public getRolloutStatus(policyId: string): PolicyUpdateRollout | null {
    return this.activeRollouts.get(policyId) || null;
  }
}

export const policyUpdateOrchestrator = PolicyUpdateOrchestrator.getInstance();


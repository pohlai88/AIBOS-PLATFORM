/**
 * Distributed Policy Load Balancer
 * 
 * AI-BOS Kernel v6.0.0 Phase 5.2: Load Balancing
 * Routes policy evaluations to healthy nodes
 */

import type { PolicyNode } from "./types";
import { LoadBalancerStrategy, PolicyNodeStatus } from "./types";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("distributed-policy-load-balancer");

/**
 * Distributed Policy Load Balancer
 * 
 * Strategies:
 * - Round Robin (default)
 * - Least Connections
 * - Weighted
 * - Random
 */
export class DistributedPolicyLoadBalancer {
  private static instance: DistributedPolicyLoadBalancer;
  private nodes: Map<string, PolicyNode> = new Map();
  private strategy: LoadBalancerStrategy = LoadBalancerStrategy.ROUND_ROBIN;
  private currentIndex = 0;

  private constructor() {
    logger.info("Distributed Policy Load Balancer initialized");
  }

  public static getInstance(): DistributedPolicyLoadBalancer {
    if (!DistributedPolicyLoadBalancer.instance) {
      DistributedPolicyLoadBalancer.instance = new DistributedPolicyLoadBalancer();
    }
    return DistributedPolicyLoadBalancer.instance;
  }

  /**
   * Register a policy node
   */
  public registerNode(node: PolicyNode): void {
    this.nodes.set(node.id, node);
    logger.info({ nodeId: node.id, status: node.status }, "Node registered");
  }

  /**
   * Unregister a policy node
   */
  public unregisterNode(nodeId: string): void {
    this.nodes.delete(nodeId);
    logger.info({ nodeId }, "Node unregistered");
  }

  /**
   * Get healthy nodes (leader or followers)
   */
  public getHealthyNodes(): PolicyNode[] {
    return Array.from(this.nodes.values()).filter(
      node => node.status === PolicyNodeStatus.LEADER || node.status === PolicyNodeStatus.FOLLOWER
    );
  }

  /**
   * Get next node using configured strategy
   */
  public getNextNode(): PolicyNode | null {
    const healthyNodes = this.getHealthyNodes();
    
    if (healthyNodes.length === 0) {
      logger.warn("No healthy nodes available");
      return null;
    }

    switch (this.strategy) {
      case LoadBalancerStrategy.ROUND_ROBIN:
        return this.roundRobin(healthyNodes);
      
      case LoadBalancerStrategy.RANDOM:
        return this.random(healthyNodes);
      
      case LoadBalancerStrategy.LEAST_CONNECTIONS:
        return this.leastConnections(healthyNodes);
      
      default:
        return this.roundRobin(healthyNodes);
    }
  }

  /**
   * Set load balancing strategy
   */
  public setStrategy(strategy: LoadBalancerStrategy): void {
    this.strategy = strategy;
    logger.info({ strategy }, "Load balancing strategy updated");
  }

  /**
   * Get node count
   */
  public getNodeCount(): { total: number; healthy: number } {
    return {
      total: this.nodes.size,
      healthy: this.getHealthyNodes().length,
    };
  }

  /**
   * Round robin strategy
   */
  private roundRobin(nodes: PolicyNode[]): PolicyNode {
    const node = nodes[this.currentIndex % nodes.length];
    this.currentIndex = (this.currentIndex + 1) % nodes.length;
    return node;
  }

  /**
   * Random strategy
   */
  private random(nodes: PolicyNode[]): PolicyNode {
    const index = Math.floor(Math.random() * nodes.length);
    return nodes[index];
  }

  /**
   * Least connections strategy (based on evaluations/sec)
   */
  private leastConnections(nodes: PolicyNode[]): PolicyNode {
    return nodes.reduce((min, node) =>
      node.evaluationsPerSecond < min.evaluationsPerSecond ? node : min
    );
  }
}

export const distributedPolicyLoadBalancer = DistributedPolicyLoadBalancer.getInstance();


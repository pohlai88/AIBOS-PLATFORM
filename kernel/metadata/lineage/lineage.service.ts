/**
 * Lineage Service
 *
 * GRCD v4.1.0 Compliant: Lineage graph traversal and analysis
 * Phase 2.2: Data lineage system for Tier 1/2 assets
 * 
 * Leverages patterns from kernel/drift/cascade-predictor.ts
 */

import { lineageRepository } from "./lineage.repository";
import type {
  LineageNode,
  LineageEdge,
  LineageGraph,
  LineageTraversalOptions,
  LineagePath,
  LineageNodeType,
  LineageEdgeType,
} from "./types";
import { baseLogger } from "../../observability/logger";

const logger = baseLogger.child({ module: "metadata:lineage-service" });

/**
 * Lineage Service
 * 
 * Provides lineage graph traversal and analysis capabilities.
 */
export class LineageService {
  /**
   * Get lineage graph for a given URN.
   * 
   * @param tenantId - Tenant ID (null for global)
   * @param urn - Starting URN
   * @param options - Traversal options
   * @returns Lineage graph with nodes and edges
   */
  async getLineageGraph(
    tenantId: string | null,
    urn: string,
    options: LineageTraversalOptions = { direction: "both", depth: 10 },
  ): Promise<LineageGraph> {
    const visitedNodes = new Map<string, LineageNode>();
    const visitedEdges = new Map<string, LineageEdge>();

    // Start with the root node
    const rootNode = await lineageRepository.findNodeByUrn(tenantId, urn);
    if (!rootNode) {
      logger.warn({ tenantId, urn }, "Root node not found for lineage traversal");
      return { nodes: [], edges: [] };
    }

    visitedNodes.set(rootNode.urn, rootNode);

    // Traverse based on direction
    if (options.direction === "upstream" || options.direction === "both") {
      await this.traverseUpstream(
        tenantId,
        rootNode.urn,
        visitedNodes,
        visitedEdges,
        options,
        0,
      );
    }

    if (options.direction === "downstream" || options.direction === "both") {
      await this.traverseDownstream(
        tenantId,
        rootNode.urn,
        visitedNodes,
        visitedEdges,
        options,
        0,
      );
    }

    return {
      nodes: Array.from(visitedNodes.values()),
      edges: Array.from(visitedEdges.values()),
    };
  }

  /**
   * Traverse upstream (sources) from a given URN.
   */
  private async traverseUpstream(
    tenantId: string | null,
    urn: string,
    visitedNodes: Map<string, LineageNode>,
    visitedEdges: Map<string, LineageEdge>,
    options: LineageTraversalOptions,
    currentDepth: number,
  ): Promise<void> {
    if (currentDepth >= options.depth) {
      return;
    }

    // Find edges where this URN is the target (upstream = sources)
    const edges = await lineageRepository.findEdgesByTarget(tenantId, urn);

    for (const edge of edges) {
      // Filter by edge type if specified
      if (options.edgeTypes && !options.edgeTypes.includes(edge.edgeType)) {
        continue;
      }

      // Add edge to visited set
      const edgeKey = `${edge.sourceUrn}->${edge.targetUrn}:${edge.edgeType}`;
      if (!visitedEdges.has(edgeKey)) {
        visitedEdges.set(edgeKey, edge);
      }

      // Get source node
      let sourceNode = visitedNodes.get(edge.sourceUrn);
      if (!sourceNode) {
        sourceNode = await lineageRepository.findNodeByUrn(tenantId, edge.sourceUrn);
        if (sourceNode) {
          // Filter by node type if specified
          if (options.nodeTypes && !options.nodeTypes.includes(sourceNode.type)) {
            continue;
          }
          visitedNodes.set(sourceNode.urn, sourceNode);
        }
      }

      // Recursively traverse upstream from source
      if (sourceNode) {
        await this.traverseUpstream(
          tenantId,
          sourceNode.urn,
          visitedNodes,
          visitedEdges,
          options,
          currentDepth + 1,
        );
      }
    }
  }

  /**
   * Traverse downstream (dependents) from a given URN.
   */
  private async traverseDownstream(
    tenantId: string | null,
    urn: string,
    visitedNodes: Map<string, LineageNode>,
    visitedEdges: Map<string, LineageEdge>,
    options: LineageTraversalOptions,
    currentDepth: number,
  ): Promise<void> {
    if (currentDepth >= options.depth) {
      return;
    }

    // Find edges where this URN is the source (downstream = targets)
    const edges = await lineageRepository.findEdgesBySource(tenantId, urn);

    for (const edge of edges) {
      // Filter by edge type if specified
      if (options.edgeTypes && !options.edgeTypes.includes(edge.edgeType)) {
        continue;
      }

      // Add edge to visited set
      const edgeKey = `${edge.sourceUrn}->${edge.targetUrn}:${edge.edgeType}`;
      if (!visitedEdges.has(edgeKey)) {
        visitedEdges.set(edgeKey, edge);
      }

      // Get target node
      let targetNode = visitedNodes.get(edge.targetUrn);
      if (!targetNode) {
        targetNode = await lineageRepository.findNodeByUrn(tenantId, edge.targetUrn);
        if (targetNode) {
          // Filter by node type if specified
          if (options.nodeTypes && !options.nodeTypes.includes(targetNode.type)) {
            continue;
          }
          visitedNodes.set(targetNode.urn, targetNode);
        }
      }

      // Recursively traverse downstream from target
      if (targetNode) {
        await this.traverseDownstream(
          tenantId,
          targetNode.urn,
          visitedNodes,
          visitedEdges,
          options,
          currentDepth + 1,
        );
      }
    }
  }

  /**
   * Get all upstream nodes (sources) for a given URN.
   */
  async getUpstream(
    tenantId: string | null,
    urn: string,
    depth: number = 10,
  ): Promise<LineageNode[]> {
    const graph = await this.getLineageGraph(tenantId, urn, {
      direction: "upstream",
      depth,
    });
    return graph.nodes.filter((node) => node.urn !== urn);
  }

  /**
   * Get all downstream nodes (dependents) for a given URN.
   */
  async getDownstream(
    tenantId: string | null,
    urn: string,
    depth: number = 10,
  ): Promise<LineageNode[]> {
    const graph = await this.getLineageGraph(tenantId, urn, {
      direction: "downstream",
      depth,
    });
    return graph.nodes.filter((node) => node.urn !== urn);
  }

  /**
   * Check if a node has lineage coverage (required for Tier 1).
   * 
   * @param tenantId - Tenant ID
   * @param urn - Node URN
   * @returns true if node has at least one upstream edge (source)
   */
  async hasLineageCoverage(tenantId: string | null, urn: string): Promise<boolean> {
    const upstreamEdges = await lineageRepository.findEdgesByTarget(tenantId, urn);
    return upstreamEdges.length > 0;
  }

  /**
   * Get lineage paths from source to target.
   * 
   * @param tenantId - Tenant ID
   * @param sourceUrn - Source URN
   * @param targetUrn - Target URN
   * @param maxDepth - Maximum path depth
   * @returns Array of paths from source to target
   */
  async getPaths(
    tenantId: string | null,
    sourceUrn: string,
    targetUrn: string,
    maxDepth: number = 10,
  ): Promise<LineagePath[]> {
    const paths: LineagePath[] = [];
    const visited = new Set<string>();

    await this.findPathsRecursive(
      tenantId,
      sourceUrn,
      targetUrn,
      [],
      [],
      paths,
      visited,
      maxDepth,
      0,
    );

    return paths;
  }

  /**
   * Recursive path finding (DFS).
   */
  private async findPathsRecursive(
    tenantId: string | null,
    currentUrn: string,
    targetUrn: string,
    currentNodes: LineageNode[],
    currentEdges: LineageEdge[],
    paths: LineagePath[],
    visited: Set<string>,
    maxDepth: number,
    currentDepth: number,
  ): Promise<void> {
    if (currentDepth >= maxDepth) {
      return;
    }

    if (currentUrn === targetUrn) {
      // Found a path
      paths.push({
        nodes: [...currentNodes],
        edges: [...currentEdges],
        depth: currentDepth,
      });
      return;
    }

    if (visited.has(currentUrn)) {
      return; // Cycle detected
    }

    visited.add(currentUrn);

    // Get current node
    const currentNode = await lineageRepository.findNodeByUrn(tenantId, currentUrn);
    if (!currentNode) {
      visited.delete(currentUrn);
      return;
    }

    // Get downstream edges
    const edges = await lineageRepository.findEdgesBySource(tenantId, currentUrn);

    for (const edge of edges) {
      const targetNode = await lineageRepository.findNodeByUrn(tenantId, edge.targetUrn);
      if (!targetNode) continue;

      // Add to current path
      const newNodes = [...currentNodes, currentNode];
      const newEdges = [...currentEdges, edge];

      // Recursively search
      await this.findPathsRecursive(
        tenantId,
        edge.targetUrn,
        targetUrn,
        newNodes,
        newEdges,
        paths,
        visited,
        maxDepth,
        currentDepth + 1,
      );
    }

    visited.delete(currentUrn);
  }

  /**
   * Create or update lineage node from entity.
   * 
   * Helper method to create lineage nodes from metadata entities.
   */
  async createNodeFromEntity(
    tenantId: string | null,
    entityId: string,
    entityType: "business_term" | "data_contract" | "field_dictionary",
    urn: string,
    nodeType: LineageNodeType,
    metadata: Record<string, any> = {},
  ): Promise<LineageNode> {
    // Check if node already exists
    const existing = await lineageRepository.findNodeByEntity(tenantId, entityId, entityType);
    if (existing) {
      // Update metadata if needed
      if (Object.keys(metadata).length > 0) {
        return await lineageRepository.updateNode(existing.urn, {
          ...existing.metadata,
          ...metadata,
        }) || existing;
      }
      return existing;
    }

    // Create new node
    return await lineageRepository.createNode({
      tenantId,
      urn,
      type: nodeType,
      entityId,
      entityType,
      metadata,
    });
  }

  /**
   * Add lineage edge between two entities.
   */
  async addEdge(
    tenantId: string | null,
    sourceUrn: string,
    targetUrn: string,
    edgeType: LineageEdgeType,
    transformation?: string,
    metadata: Record<string, any> = {},
  ): Promise<LineageEdge> {
    return await lineageRepository.createEdge({
      tenantId,
      sourceUrn,
      targetUrn,
      edgeType,
      transformation,
      metadata,
    });
  }
}

export const lineageService = new LineageService();


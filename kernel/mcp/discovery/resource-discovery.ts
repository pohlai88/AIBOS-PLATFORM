/**
 * MCP Resource Discovery
 * 
 * GRCD Compliance: F-12 (MCP Resource Discovery)
 * Standard: MCP Specification
 * 
 * Provides resource enumeration and discovery for MCP servers.
 */

import type { Resource } from "../types";
import { mcpResourceHandler } from "../executor/resource.handler";
import { mcpRegistry } from "../registry/mcp-registry";
import { createTraceLogger } from "../../observability/logger";

const logger = createTraceLogger("mcp-resource-discovery");

export interface ResourceFilters {
  /** Filter by resource type */
  type?: string;
  
  /** Filter by server ID */
  serverId?: string;
  
  /** Search query (searches in URI and name) */
  query?: string;
  
  /** Limit results */
  limit?: number;
}

export interface ResourceMetadata {
  /** Resource URI */
  uri: string;
  
  /** Resource name */
  name: string;
  
  /** Resource type */
  type?: string;
  
  /** Resource description */
  description?: string;
  
  /** Server ID */
  serverId: string;
  
  /** MIME type */
  mimeType?: string;
  
  /** Last modified timestamp */
  lastModified?: number;
  
  /** Resource size (bytes) */
  size?: number;
}

export class ResourceDiscovery {
  /**
   * List all resources for a server
   */
  async listResources(serverId: string): Promise<Resource[]> {
    logger.debug("Listing resources", { serverId });

    const manifest = mcpRegistry.get(serverId);
    if (!manifest) {
      logger.warn("Server not found", { serverId });
      return [];
    }

    return manifest.resources || [];
  }

  /**
   * Search resources across all servers
   */
  async searchResources(query: string, filters?: ResourceFilters): Promise<Resource[]> {
    logger.debug("Searching resources", { query, filters });

    const results: Resource[] = [];
    const searchQuery = query.toLowerCase();
    const limit = filters?.limit || 100;

    // Get all servers
    const servers = mcpRegistry.list();

    for (const manifest of servers) {
      // Filter by server ID if specified
      if (filters?.serverId && manifest.id !== filters.serverId) {
        continue;
      }

      const resources = manifest.resources || [];

      for (const resource of resources) {
        // Filter by type if specified
        if (filters?.type && resource.type !== filters.type) {
          continue;
        }

        // Search in URI and name
        const matches =
          resource.uri.toLowerCase().includes(searchQuery) ||
          resource.name?.toLowerCase().includes(searchQuery) ||
          resource.description?.toLowerCase().includes(searchQuery);

        if (matches) {
          results.push(resource);
          
          if (results.length >= limit) {
            break;
          }
        }
      }

      if (results.length >= limit) {
        break;
      }
    }

    logger.info("Resource search complete", {
      query,
      resultsCount: results.length,
      limit,
    });

    return results;
  }

  /**
   * Get resource metadata
   */
  async getResourceMetadata(uri: string): Promise<ResourceMetadata | null> {
    logger.debug("Getting resource metadata", { uri });

    // Find resource across all servers
    const servers = mcpRegistry.list();

    for (const manifest of servers) {
      const resources = manifest.resources || [];
      const resource = resources.find((r) => r.uri === uri);

      if (resource) {
        return {
          uri: resource.uri,
          name: resource.name || uri,
          type: resource.type,
          description: resource.description,
          serverId: manifest.id,
          mimeType: resource.mimeType,
        };
      }
    }

    logger.warn("Resource not found", { uri });
    return null;
  }

  /**
   * Get resources by type
   */
  async getResourcesByType(type: string): Promise<Resource[]> {
    logger.debug("Getting resources by type", { type });

    const results: Resource[] = [];
    const servers = mcpRegistry.list();

    for (const manifest of servers) {
      const resources = manifest.resources || [];
      const filtered = resources.filter((r) => r.type === type);
      results.push(...filtered);
    }

    return results;
  }

  /**
   * Get all available resource types
   */
  async getResourceTypes(): Promise<string[]> {
    const types = new Set<string>();
    const servers = mcpRegistry.list();

    for (const manifest of servers) {
      const resources = manifest.resources || [];
      resources.forEach((r) => {
        if (r.type) {
          types.add(r.type);
        }
      });
    }

    return Array.from(types).sort();
  }
}

// Singleton instance
export const resourceDiscovery = new ResourceDiscovery();


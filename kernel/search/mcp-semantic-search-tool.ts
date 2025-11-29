/**
 * MCP Semantic Search Tool
 * 
 * Integrates semantic search as an MCP tool
 */

import { semanticSearchService } from "./semantic-search.service";
import type { SemanticSearchQuery, SemanticSearchResult } from "./semantic-search.service";

/**
 * MCP Tool Schema for Semantic Search
 */
export const semanticSearchToolSchema = {
  name: "semantic_search_codebase",
  description: "Search codebase using natural language queries. Returns relevant code snippets with context.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Natural language query describing what code to find (e.g., 'function that validates user input', 'error handling for database connections')",
      },
      scope: {
        type: "array",
        items: { type: "string" },
        description: "Optional: limit search to specific directories (e.g., ['kernel/policy', 'kernel/agents'])",
      },
      maxResults: {
        type: "number",
        description: "Maximum number of results to return (default: 20)",
        default: 20,
      },
      fileTypes: {
        type: "array",
        items: { type: "string" },
        description: "Optional: filter by file types (e.g., ['ts', 'tsx', 'js'])",
      },
    },
    required: ["query"],
  },
};

/**
 * Execute semantic search via MCP tool
 */
export async function executeSemanticSearch(
  args: {
    query: string;
    scope?: string[];
    maxResults?: number;
    fileTypes?: string[];
  },
  context?: {
    tenantId?: string;
    userId?: string;
    traceId?: string;
  }
): Promise<{
  results: SemanticSearchResult[];
  query: string;
  stats: {
    totalResults: number;
    indexedFiles: number;
  };
}> {
  const searchQuery: SemanticSearchQuery = {
    query: args.query,
    scope: args.scope,
    maxResults: args.maxResults || 20,
    fileTypes: args.fileTypes,
    context,
  };

  const results = await semanticSearchService.search(searchQuery);
  const stats = semanticSearchService.getStats();

  return {
    results,
    query: args.query,
    stats: {
      totalResults: results.length,
      indexedFiles: stats.indexedFiles,
    },
  };
}


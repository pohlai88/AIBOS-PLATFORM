/**
 * Semantic Search Routes
 * 
 * REST API for semantic code search
 */

import type { Hono } from "hono";
import { z } from "zod";
import { validateJsonBody, getValidJsonBody } from "../middleware/validation";
import { semanticSearchService } from "../search";
import type { SemanticSearchQuery } from "../search";

const SearchQuerySchema = z.object({
  query: z.string().min(1),
  scope: z.array(z.string()).optional(),
  maxResults: z.number().int().min(1).max(100).optional(),
  fileTypes: z.array(z.string()).optional(),
});

/**
 * Register semantic search routes
 */
export function registerSearchRoutes(app: Hono) {
  // POST /search/semantic - Semantic code search
  app.post(
    "/search/semantic",
    validateJsonBody(SearchQuerySchema),
    async (c) => {
      const body = getValidJsonBody<z.infer<typeof SearchQuerySchema>>(c);
      const traceId = c.get("traceId") || undefined;
      const tenantId = c.get("tenantId") || undefined;
      const userId = c.get("principal")?.id || undefined;

      const searchQuery: SemanticSearchQuery = {
        query: body.query,
        scope: body.scope,
        maxResults: body.maxResults || 20,
        fileTypes: body.fileTypes,
        context: {
          tenantId,
          userId,
          traceId,
        },
      };

      const results = await semanticSearchService.search(searchQuery);
      const stats = semanticSearchService.getStats();

      return c.json({
        query: body.query,
        results: results.map((result) => ({
          filePath: result.filePath,
          fileName: result.fileName,
          fileType: result.fileType,
          snippets: result.snippets.map((snippet) => ({
            line: snippet.line,
            content: snippet.content,
            score: snippet.score,
          })),
          relevanceScore: result.relevanceScore,
          matchType: result.matchType,
          metadata: result.metadata,
        })),
        stats: {
          totalResults: results.length,
          indexedFiles: stats.indexedFiles,
          indexedLines: stats.indexedLines,
          lastIndexed: stats.lastIndexed?.toISOString(),
        },
      });
    }
  );

  // POST /search/index - Re-index codebase
  app.post(
    "/search/index",
    validateJsonBody(
      z.object({
        scope: z.array(z.string()).optional(),
      })
    ),
    async (c) => {
      const body = getValidJsonBody<z.infer<typeof z.object({ scope: z.array(z.string()).optional() })>>(c);

      await semanticSearchService.indexCodebase(body.scope);

      const stats = semanticSearchService.getStats();

      return c.json({
        success: true,
        message: "Codebase indexed successfully",
        stats: {
          indexedFiles: stats.indexedFiles,
          indexedLines: stats.indexedLines,
          lastIndexed: stats.lastIndexed?.toISOString(),
        },
      });
    }
  );

  // GET /search/stats - Get search statistics
  app.get("/search/stats", async (c) => {
    const stats = semanticSearchService.getStats();

    return c.json({
      indexedFiles: stats.indexedFiles,
      indexedLines: stats.indexedLines,
      lastIndexed: stats.lastIndexed?.toISOString(),
    });
  });
}


/**
 * Semantic Search Service
 * 
 * GRCD-KERNEL v4.0.0 - Semantic Code Search Enhancement
 * Based on GitHub MCP Server semantic search patterns
 * 
 * Provides:
 * - Natural language queries to search codebases
 * - Semantic code search (not just keyword matching)
 * - Context-aware code retrieval
 * - Integration with MCP Resource Handler
 */

import { readFile, readdir } from "fs/promises";
import { join, relative, extname, basename } from "path";
import { existsSync } from "fs";
import { baseLogger as logger } from "../observability/logger";
import { eventBus } from "../events/event-bus";
import { appendAuditEntry } from "../audit/hash-chain.store";

/**
 * Semantic Search Query
 */
export interface SemanticSearchQuery {
  /**
   * Natural language query
   */
  query: string;

  /**
   * Optional: limit to specific directories
   */
  scope?: string[];

  /**
   * Maximum number of results
   */
  maxResults?: number;

  /**
   * File type filters (e.g., ['ts', 'tsx', 'js'])
   */
  fileTypes?: string[];

  /**
   * Search context (for better relevance)
   */
  context?: {
    tenantId?: string;
    userId?: string;
    traceId?: string;
  };
}

/**
 * Search Result
 */
export interface SemanticSearchResult {
  /**
   * File path (relative to workspace root)
   */
  filePath: string;

  /**
   * File name
   */
  fileName: string;

  /**
   * File extension
   */
  fileType: string;

  /**
   * Relevant code snippets
   */
  snippets: Array<{
    /**
     * Line number
     */
    line: number;

    /**
     * Code content
     */
    content: string;

    /**
     * Relevance score (0-1)
     */
    score: number;
  }>;

  /**
   * Overall relevance score
   */
  relevanceScore: number;

  /**
   * Match type
   */
  matchType: "exact" | "semantic" | "contextual";

  /**
   * Metadata
   */
  metadata?: {
    functionName?: string;
    className?: string;
    description?: string;
  };
}

/**
 * Code Index Entry
 */
interface CodeIndexEntry {
  filePath: string;
  fileName: string;
  fileType: string;
  content: string;
  lines: string[];
  functions: Array<{
    name: string;
    line: number;
    signature: string;
  }>;
  classes: Array<{
    name: string;
    line: number;
    signature: string;
  }>;
  lastIndexed: Date;
}

/**
 * Semantic Search Service
 * 
 * Provides semantic code search capabilities
 */
export class SemanticSearchService {
  private static instance: SemanticSearchService;
  private codeIndex: Map<string, CodeIndexEntry> = new Map();
  private workspaceRoot: string;
  private indexingInProgress = false;

  private constructor(workspaceRoot: string = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
  }

  public static getInstance(workspaceRoot?: string): SemanticSearchService {
    if (!SemanticSearchService.instance) {
      SemanticSearchService.instance = new SemanticSearchService(workspaceRoot);
    }
    return SemanticSearchService.instance;
  }

  /**
   * Search codebase using natural language query
   */
  public async search(query: SemanticSearchQuery): Promise<SemanticSearchResult[]> {
    const startTime = Date.now();

    logger.info(
      {
        query: query.query,
        scope: query.scope,
        maxResults: query.maxResults,
      },
      "[SemanticSearch] Starting semantic search"
    );

    try {
      // 1. Ensure codebase is indexed
      if (this.codeIndex.size === 0) {
        await this.indexCodebase(query.scope);
      }

      // 2. Parse query into search terms
      const searchTerms = this.parseQuery(query.query);

      // 3. Search indexed files
      const results = await this.searchIndexedFiles(searchTerms, query);

      // 4. Rank results by relevance
      const rankedResults = this.rankResults(results, query);

      // 5. Limit results
      const limitedResults = rankedResults.slice(0, query.maxResults || 20);

      // 6. Audit search
      await appendAuditEntry({
        tenantId: query.context?.tenantId || "system",
        actorId: query.context?.userId || "semantic-search",
        actionId: "search.semantic.executed",
        payload: {
          query: query.query,
          resultsCount: limitedResults.length,
          durationMs: Date.now() - startTime,
        },
      });

      // 7. Emit search event
      await eventBus.publishTyped("search.semantic.completed", {
        type: "search.semantic.completed",
        tenantId: query.context?.tenantId || "system",
        payload: {
          query: query.query,
          resultsCount: limitedResults.length,
          durationMs: Date.now() - startTime,
        },
      });

      logger.info(
        {
          query: query.query,
          resultsCount: limitedResults.length,
          durationMs: Date.now() - startTime,
        },
        "[SemanticSearch] Search completed"
      );

      return limitedResults;
    } catch (error) {
      logger.error(
        {
          query: query.query,
          error: error instanceof Error ? error.message : String(error),
        },
        "[SemanticSearch] Search failed"
      );

      throw error;
    }
  }

  /**
   * Index codebase (or re-index)
   */
  public async indexCodebase(scope?: string[]): Promise<void> {
    if (this.indexingInProgress) {
      logger.warn("[SemanticSearch] Indexing already in progress");
      return;
    }

    this.indexingInProgress = true;
    logger.info({ scope }, "[SemanticSearch] Starting codebase indexing");

    try {
      const directories = scope || [this.workspaceRoot];
      const indexPromises: Promise<void>[] = [];

      for (const dir of directories) {
        const fullPath = dir.startsWith("/") || dir.match(/^[A-Z]:/) 
          ? dir 
          : join(this.workspaceRoot, dir);

        if (existsSync(fullPath)) {
          indexPromises.push(this.indexDirectory(fullPath));
        }
      }

      await Promise.all(indexPromises);

      logger.info(
        { indexedFiles: this.codeIndex.size },
        "[SemanticSearch] Codebase indexing complete"
      );
    } finally {
      this.indexingInProgress = false;
    }
  }

  /**
   * Get search statistics
   */
  public getStats(): {
    indexedFiles: number;
    indexedLines: number;
    lastIndexed?: Date;
  } {
    let totalLines = 0;
    let lastIndexed: Date | undefined;

    for (const entry of this.codeIndex.values()) {
      totalLines += entry.lines.length;
      if (!lastIndexed || entry.lastIndexed > lastIndexed) {
        lastIndexed = entry.lastIndexed;
      }
    }

    return {
      indexedFiles: this.codeIndex.size,
      indexedLines: totalLines,
      lastIndexed,
    };
  }

  /**
   * Parse natural language query into search terms
   */
  private parseQuery(query: string): {
    keywords: string[];
    intent: string;
    fileTypeHints: string[];
  } {
    const lowerQuery = query.toLowerCase();

    // Extract keywords (remove common words)
    const stopWords = new Set([
      "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
      "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
      "been", "have", "has", "had", "do", "does", "did", "will", "would",
      "should", "could", "may", "might", "must", "can", "this", "that",
      "these", "those", "i", "you", "he", "she", "it", "we", "they", "what",
      "where", "when", "why", "how", "which", "who",
    ]);

    const words = lowerQuery
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word));

    // Detect intent
    let intent = "general";
    if (lowerQuery.includes("function") || lowerQuery.includes("method")) {
      intent = "function";
    } else if (lowerQuery.includes("class") || lowerQuery.includes("interface")) {
      intent = "class";
    } else if (lowerQuery.includes("error") || lowerQuery.includes("exception")) {
      intent = "error";
    } else if (lowerQuery.includes("test") || lowerQuery.includes("spec")) {
      intent = "test";
    }

    // Extract file type hints
    const fileTypeHints: string[] = [];
    if (lowerQuery.includes("typescript") || lowerQuery.includes(".ts")) {
      fileTypeHints.push("ts", "tsx");
    }
    if (lowerQuery.includes("javascript") || lowerQuery.includes(".js")) {
      fileTypeHints.push("js", "jsx");
    }
    if (lowerQuery.includes("python") || lowerQuery.includes(".py")) {
      fileTypeHints.push("py");
    }

    return {
      keywords: words,
      intent,
      fileTypeHints,
    };
  }

  /**
   * Search indexed files
   */
  private async searchIndexedFiles(
    searchTerms: ReturnType<typeof this.parseQuery>,
    query: SemanticSearchQuery
  ): Promise<SemanticSearchResult[]> {
    const results: SemanticSearchResult[] = [];

    for (const [filePath, entry] of this.codeIndex.entries()) {
      // Filter by file type
      if (query.fileTypes && !query.fileTypes.includes(entry.fileType)) {
        continue;
      }

      // Filter by scope
      if (query.scope) {
        const inScope = query.scope.some((scope) => filePath.startsWith(scope));
        if (!inScope) {
          continue;
        }
      }

      // Search in file
      const fileResults = this.searchFile(entry, searchTerms, query);
      if (fileResults.snippets.length > 0) {
        results.push(fileResults);
      }
    }

    return results;
  }

  /**
   * Search a single file
   */
  private searchFile(
    entry: CodeIndexEntry,
    searchTerms: ReturnType<typeof this.parseQuery>,
    query: SemanticSearchQuery
  ): SemanticSearchResult {
    const snippets: Array<{
      line: number;
      content: string;
      score: number;
    }> = [];

    // Search in content
    for (let i = 0; i < entry.lines.length; i++) {
      const line = entry.lines[i];
      const lowerLine = line.toLowerCase();

      let score = 0;
      let matchType: "exact" | "semantic" | "contextual" = "contextual";

      // Exact keyword matches
      for (const keyword of searchTerms.keywords) {
        if (lowerLine.includes(keyword.toLowerCase())) {
          score += 1.0;
          matchType = "exact";
        }
      }

      // Semantic matches (partial word matches, related terms)
      for (const keyword of searchTerms.keywords) {
        const words = lowerLine.split(/\W+/);
        for (const word of words) {
          if (word.includes(keyword) || keyword.includes(word)) {
            score += 0.5;
            if (matchType === "contextual") {
              matchType = "semantic";
            }
          }
        }
      }

      // Intent-based scoring
      if (searchTerms.intent === "function" && entry.functions.some((f) => f.line === i + 1)) {
        score += 0.3;
      }
      if (searchTerms.intent === "class" && entry.classes.some((c) => c.line === i + 1)) {
        score += 0.3;
      }

      if (score > 0) {
        snippets.push({
          line: i + 1,
          content: line.trim(),
          score,
        });
      }
    }

    // Calculate overall relevance
    const relevanceScore = snippets.length > 0
      ? Math.min(1.0, snippets.reduce((sum, s) => sum + s.score, 0) / snippets.length)
      : 0;

    // Determine match type
    const overallMatchType = snippets.some((s) => s.score >= 1.0)
      ? "exact"
      : snippets.some((s) => s.score >= 0.5)
      ? "semantic"
      : "contextual";

    return {
      filePath: relative(this.workspaceRoot, entry.filePath),
      fileName: entry.fileName,
      fileType: entry.fileType,
      snippets: snippets.slice(0, 10), // Top 10 snippets per file
      relevanceScore,
      matchType: overallMatchType,
      metadata: {
        functions: entry.functions.map((f) => f.name),
        classes: entry.classes.map((c) => c.name),
      },
    };
  }

  /**
   * Rank results by relevance
   */
  private rankResults(
    results: SemanticSearchResult[],
    query: SemanticSearchQuery
  ): SemanticSearchResult[] {
    return results.sort((a, b) => {
      // Primary: relevance score
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      // Secondary: match type (exact > semantic > contextual)
      const matchTypeOrder = { exact: 3, semantic: 2, contextual: 1 };
      const typeDiff = matchTypeOrder[b.matchType] - matchTypeOrder[a.matchType];
      if (typeDiff !== 0) {
        return typeDiff;
      }

      // Tertiary: number of snippets
      return b.snippets.length - a.snippets.length;
    });
  }

  /**
   * Index a directory recursively
   */
  private async indexDirectory(dirPath: string): Promise<void> {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        // Skip node_modules, .git, etc.
        if (
          entry.name.startsWith(".") ||
          entry.name === "node_modules" ||
          entry.name === "dist" ||
          entry.name === "build"
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          await this.indexDirectory(fullPath);
        } else if (entry.isFile()) {
          await this.indexFile(fullPath);
        }
      }
    } catch (error) {
      logger.warn(
        {
          dirPath,
          error: error instanceof Error ? error.message : String(error),
        },
        "[SemanticSearch] Error indexing directory"
      );
    }
  }

  /**
   * Index a single file
   */
  private async indexFile(filePath: string): Promise<void> {
    try {
      const ext = extname(filePath).slice(1);
      const supportedExtensions = ["ts", "tsx", "js", "jsx", "py", "go", "rs", "java", "cpp", "c"];

      if (!supportedExtensions.includes(ext)) {
        return;
      }

      const content = await readFile(filePath, "utf-8");
      const lines = content.split("\n");

      // Extract functions and classes (basic regex-based extraction)
      const functions: Array<{ name: string; line: number; signature: string }> = [];
      const classes: Array<{ name: string; line: number; signature: string }> = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Extract function definitions
        const functionMatch = line.match(/(?:function|const|export\s+(?:async\s+)?function|export\s+const)\s+(\w+)/);
        if (functionMatch) {
          functions.push({
            name: functionMatch[1],
            line: i + 1,
            signature: line.trim(),
          });
        }

        // Extract class definitions
        const classMatch = line.match(/(?:class|export\s+class)\s+(\w+)/);
        if (classMatch) {
          classes.push({
            name: classMatch[1],
            line: i + 1,
            signature: line.trim(),
          });
        }
      }

      const entry: CodeIndexEntry = {
        filePath,
        fileName: basename(filePath),
        fileType: ext,
        content,
        lines,
        functions,
        classes,
        lastIndexed: new Date(),
      };

      this.codeIndex.set(filePath, entry);
    } catch (error) {
      logger.warn(
        {
          filePath,
          error: error instanceof Error ? error.message : String(error),
        },
        "[SemanticSearch] Error indexing file"
      );
    }
  }
}

/**
 * Singleton instance
 */
export const semanticSearchService = SemanticSearchService.getInstance();


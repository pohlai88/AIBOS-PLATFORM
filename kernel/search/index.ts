/**
 * Semantic Search Module
 * 
 * Exports all semantic search functionality
 */

export { SemanticSearchService, semanticSearchService } from "./semantic-search.service";
export type {
  SemanticSearchQuery,
  SemanticSearchResult,
} from "./semantic-search.service";

export {
  semanticSearchToolSchema,
  executeSemanticSearch,
} from "./mcp-semantic-search-tool";


/**
 * Metadata Search Types
 * 
 * GRCD v4.1.0 Compliant: Metadata search and discovery
 * Next Development: Metadata Search Service
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Search Filters
// ─────────────────────────────────────────────────────────────

export const ZSearchFilters = z.object({
  domain: z.string().optional(),
  governanceTier: z.enum(['tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5']).optional(),
  standardPackId: z.string().uuid().optional(),
  standardPackName: z.string().optional(),  // e.g., "IFRS_15"
  owner: z.string().optional(),
  steward: z.string().optional(),
  entityType: z.enum(['business_term', 'data_contract', 'field_dictionary', 'standard_pack']).optional(),
  hasLineage: z.boolean().optional(),
  hasProfiling: z.boolean().optional(),
  hasQualityRules: z.boolean().optional(),
  createdAfter: z.date().optional(),
  createdBefore: z.date().optional(),
  updatedAfter: z.date().optional(),
  updatedBefore: z.date().optional(),
});

export type SearchFilters = z.infer<typeof ZSearchFilters>;

// ─────────────────────────────────────────────────────────────
// Search Result Item
// ─────────────────────────────────────────────────────────────

export const ZSearchResultItem = z.object({
  id: z.string().uuid(),
  entityType: z.enum(['business_term', 'data_contract', 'field_dictionary', 'standard_pack']),
  canonicalKey: z.string().min(1),
  label: z.string().min(1),
  description: z.string().nullable(),
  domain: z.string().nullable(),
  governanceTier: z.enum(['tier_1', 'tier_2', 'tier_3', 'tier_4', 'tier_5']).nullable(),
  standardPackId: z.string().uuid().nullable(),
  standardPackName: z.string().nullable(),
  owner: z.string().nullable(),
  steward: z.string().nullable(),
  entityUrn: z.string().nullable(),
  relevanceScore: z.number().min(0).max(1),  // 0-1 relevance score
  matchedFields: z.array(z.string()).default([]),  // Which fields matched
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type SearchResultItem = z.infer<typeof ZSearchResultItem>;

// ─────────────────────────────────────────────────────────────
// Search Results
// ─────────────────────────────────────────────────────────────

export interface SearchResults {
  query: string;
  filters: SearchFilters;
  totalResults: number;
  results: SearchResultItem[];
  facets: {
    byEntityType: Record<string, number>;
    byGovernanceTier: Record<string, number>;
    byDomain: Record<string, number>;
    byStandardPack: Record<string, number>;
  };
  executionTimeMs: number;
}

// ─────────────────────────────────────────────────────────────
// Search Options
// ─────────────────────────────────────────────────────────────

export interface SearchOptions {
  limit?: number;  // Default: 50
  offset?: number;  // Default: 0
  sortBy?: 'relevance' | 'createdAt' | 'updatedAt' | 'label';
  sortOrder?: 'asc' | 'desc';
  includeInactive?: boolean;  // Include deprecated/archived items
  minRelevanceScore?: number;  // Minimum relevance score (0-1)
}

// ─────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────

export type { SearchFilters, SearchResultItem, SearchResults, SearchOptions };


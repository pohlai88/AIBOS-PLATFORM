/**
 * Metadata Search Service
 *
 * GRCD v4.1.0 Compliant: Metadata search and discovery
 * Next Development: Metadata Search Service
 *
 * Provides full-text search across all metadata entities.
 */

import { getDB } from "../../storage/db";
import type {
    SearchFilters,
    SearchResults,
    SearchResultItem,
    SearchOptions,
} from "./types";
import { ZSearchFilters } from "./types";
import { baseLogger } from "../../observability/logger";
import { KernelError } from "../../errors/kernel-error";

const logger = baseLogger.child({ module: "metadata:search-service" });

/**
 * Metadata Search Service
 *
 * Provides comprehensive search across all metadata entities.
 */
export class MetadataSearchService {
    /**
     * Search metadata across all entities.
     *
     * @param query - Search query string
     * @param filters - Search filters
     * @param options - Search options
     * @returns Search results
     */
    async search(
        tenantId: string | null,
        query: string,
        filters: SearchFilters = {},
        options: SearchOptions = {}
    ): Promise<SearchResults> {
        const startTime = Date.now();

        try {
            const validatedFilters = ZSearchFilters.parse(filters);
            const db = getDB().getClient();

            // Build search query
            const searchQuery = this.buildSearchQuery(
                tenantId,
                query,
                validatedFilters,
                options
            );

            // Execute search
            const results = await db.query(searchQuery.query, searchQuery.params);

            // Process results
            const searchResults: SearchResultItem[] = results.rows.map((row) => ({
                id: row.id,
                entityType: row.entity_type,
                canonicalKey: row.canonical_key || row.name,
                label: row.label || row.name,
                description: row.description,
                domain: row.domain,
                governanceTier: row.governance_tier,
                standardPackId: row.standard_pack_id_primary || row.standard_pack_id,
                standardPackName: row.standard_pack_name,
                owner: row.owner,
                steward: row.steward,
                entityUrn: row.entity_urn,
                relevanceScore: row.relevance_score || 0.5,
                matchedFields: row.matched_fields || [],
                createdAt: new Date(row.created_at),
                updatedAt: new Date(row.updated_at),
            }));

            // Calculate facets
            const facets = await this.calculateFacets(tenantId, validatedFilters);

            const executionTimeMs = Date.now() - startTime;

            logger.info(
                { query, totalResults: searchResults.length, executionTimeMs },
                "Search completed"
            );

            return {
                query,
                filters: validatedFilters,
                totalResults: searchResults.length,
                results: searchResults,
                facets,
                executionTimeMs,
            };
        } catch (error) {
            const executionTimeMs = Date.now() - startTime;
            logger.error({ error, query, executionTimeMs }, "Search failed");
            throw new KernelError("Search failed", "METADATA_SEARCH_FAILED", error);
        }
    }

    /**
     * Build SQL search query.
     */
    private buildSearchQuery(
        tenantId: string | null,
        query: string,
        filters: SearchFilters,
        options: SearchOptions
    ): { query: string; params: any[] } {
        const limit = options.limit || 50;
        const offset = options.offset || 0;
        const sortBy = options.sortBy || 'relevance';
        const sortOrder = options.sortOrder || 'desc';
        const minRelevance = options.minRelevanceScore || 0;

        const params: any[] = [];
        let paramIndex = 1;

        // Get search term for relevance scoring and WHERE clauses
        const searchTerm = query && query.trim().length > 0
            ? `%${query.trim().toLowerCase()}%`
            : null;

        // Handle tenant filter once (shared across all tables)
        const tenantParamIndex = tenantId !== null && tenantId !== undefined ? paramIndex++ : null;
        if (tenantParamIndex !== null) {
            params.push(tenantId);
        }

        // Handle search term parameter once (shared across all tables and relevance scores)
        const searchParamIndex = searchTerm ? paramIndex++ : null;
        if (searchParamIndex !== null) {
            params.push(searchTerm);
        }

        // Build WHERE clauses for each table
        const buildWhereClause = (tablePrefix: string = ''): string => {
            const clauses: string[] = [];

            // Tenant filter (use the shared parameter)
            if (tenantParamIndex !== null) {
                clauses.push(`${tablePrefix}tenant_id IS NOT DISTINCT FROM $${tenantParamIndex}`);
            }

            // Search query filter (full-text search) - use shared parameter
            if (searchParamIndex !== null) {

                if (tablePrefix === '' || tablePrefix.includes('business_terms')) {
                    clauses.push(`(
            LOWER(${tablePrefix}canonical_key) LIKE $${searchParamIndex}::text OR
            LOWER(${tablePrefix}label) LIKE $${searchParamIndex}::text OR
            LOWER(${tablePrefix}description) LIKE $${searchParamIndex}::text
          )`);
                } else if (tablePrefix === 'dc.' || tablePrefix.includes('data_contracts')) {
                    clauses.push(`(
            LOWER(${tablePrefix}canonical_key) LIKE $${searchParamIndex}::text OR
            LOWER(${tablePrefix}name) LIKE $${searchParamIndex}::text OR
            LOWER(${tablePrefix}description) LIKE $${searchParamIndex}::text
          )`);
                } else if (tablePrefix.includes('field_dictionary')) {
                    clauses.push(`(
            LOWER(${tablePrefix}canonical_key) LIKE $${searchParamIndex}::text OR
            LOWER(${tablePrefix}label) LIKE $${searchParamIndex}::text OR
            LOWER(${tablePrefix}description) LIKE $${searchParamIndex}::text
          )`);
                } else if (tablePrefix.includes('standard_pack')) {
                    clauses.push(`(
            LOWER(${tablePrefix}name) LIKE $${searchParamIndex}::text OR
            LOWER(${tablePrefix}description) LIKE $${searchParamIndex}::text
          )`);
                }
            }

            // Domain filter (only for business_terms)
            if (filters.domain && (tablePrefix === '' || tablePrefix === 'bt.' || tablePrefix.includes('business_terms'))) {
                clauses.push(`${tablePrefix}domain = $${paramIndex}`);
                params.push(filters.domain);
                paramIndex++;
            }

            // Governance tier filter
            if (filters.governanceTier && !tablePrefix.includes('standard_pack')) {
                clauses.push(`${tablePrefix}governance_tier = $${paramIndex}`);
                params.push(filters.governanceTier);
                paramIndex++;
            }

            // Standard pack filter
            if (filters.standardPackId && !tablePrefix.includes('standard_pack')) {
                clauses.push(`${tablePrefix}standard_pack_id_primary = $${paramIndex}`);
                params.push(filters.standardPackId);
                paramIndex++;
            }

            // Owner filter
            if (filters.owner && !tablePrefix.includes('standard_pack')) {
                clauses.push(`${tablePrefix}owner = $${paramIndex}`);
                params.push(filters.owner);
                paramIndex++;
            }

            // Steward filter
            if (filters.steward && !tablePrefix.includes('standard_pack')) {
                clauses.push(`${tablePrefix}steward = $${paramIndex}`);
                params.push(filters.steward);
                paramIndex++;
            }

            // Date filters
            if (filters.createdAfter) {
                clauses.push(`${tablePrefix}created_at >= $${paramIndex}`);
                params.push(filters.createdAfter);
                paramIndex++;
            }

            if (filters.createdBefore) {
                clauses.push(`${tablePrefix}created_at <= $${paramIndex}`);
                params.push(filters.createdBefore);
                paramIndex++;
            }

            // Entity type filter
            if (filters.entityType) {
                // This will be handled at the UNION level
            }

            return clauses.length > 0 ? clauses.join(' AND ') : '1=1';
        };

        // Build individual queries (now that searchParamIndex is set)
        const businessTermsWhere = buildWhereClause('bt.');
        const dataContractsWhere = buildWhereClause('dc.');
        const fieldDictionaryWhere = buildWhereClause('fd.');
        const standardPacksWhere = buildWhereClause('sp.');

        // Calculate relevance score for each entity type (must use only the table alias for that query)
        // Explicitly cast parameter to text to avoid PostgreSQL 17.6 type inference issues in UNION queries
        const businessTermsRelevanceScore = searchParamIndex !== null
            ? `(CASE
          WHEN LOWER(bt.canonical_key) LIKE $${searchParamIndex}::text THEN 1.0::numeric
          WHEN LOWER(bt.label) LIKE $${searchParamIndex}::text THEN 0.8::numeric
          WHEN LOWER(bt.description) LIKE $${searchParamIndex}::text THEN 0.6::numeric
          ELSE 0.4::numeric
        END)::double precision`
            : '0.5::double precision';

        const dataContractsRelevanceScore = searchParamIndex !== null
            ? `(CASE
          WHEN LOWER(dc.canonical_key) LIKE $${searchParamIndex}::text THEN 1.0::numeric
          WHEN LOWER(dc.name) LIKE $${searchParamIndex}::text THEN 0.8::numeric
          WHEN LOWER(dc.description) LIKE $${searchParamIndex}::text THEN 0.6::numeric
          ELSE 0.4::numeric
        END)::double precision`
            : '0.5::double precision';

        const fieldDictionaryRelevanceScore = searchParamIndex !== null
            ? `(CASE
          WHEN LOWER(fd.canonical_key) LIKE $${searchParamIndex}::text THEN 1.0::numeric
          WHEN LOWER(fd.label) LIKE $${searchParamIndex}::text THEN 0.8::numeric
          WHEN LOWER(fd.description) LIKE $${searchParamIndex}::text THEN 0.6::numeric
          ELSE 0.4::numeric
        END)::double precision`
            : '0.5::double precision';

        const standardPacksRelevanceScore = searchParamIndex !== null
            ? `(CASE
          WHEN LOWER(sp.name) LIKE $${searchParamIndex}::text THEN 1.0::numeric
          WHEN LOWER(sp.description) LIKE $${searchParamIndex}::text THEN 0.6::numeric
          ELSE 0.4::numeric
        END)::double precision`
            : '0.5::double precision';

        // Build UNION query
        const businessTermsQuery = `
      SELECT
        bt.id,
        'business_term'::text as entity_type,
        bt.canonical_key,
        bt.label,
        bt.description,
        bt.domain,
        bt.governance_tier,
        bt.standard_pack_id_primary as standard_pack_id,
        NULL::text as standard_pack_name,
        bt.owner,
        bt.steward,
        bt.entity_urn,
        ${businessTermsRelevanceScore} as relevance_score,
        ARRAY[]::text[] as matched_fields,
        bt.created_at,
        bt.updated_at
      FROM kernel_business_terms bt
      WHERE ${businessTermsWhere}
    `;

        const dataContractsQuery = `
      SELECT
        dc.id,
        'data_contract'::text as entity_type,
        dc.canonical_key,
        dc.name as label,
        dc.description,
        NULL::text as domain,
        dc.governance_tier,
        dc.standard_pack_id_primary as standard_pack_id,
        NULL::text as standard_pack_name,
        dc.owner,
        dc.steward,
        dc.entity_urn,
        ${dataContractsRelevanceScore} as relevance_score,
        ARRAY[]::text[] as matched_fields,
        dc.created_at,
        dc.updated_at
      FROM kernel_data_contracts dc
      WHERE ${dataContractsWhere}
    `;

        const fieldDictionaryQuery = `
      SELECT
        fd.id,
        'field_dictionary'::text as entity_type,
        fd.canonical_key,
        fd.label,
        fd.description,
        NULL::text as domain,
        fd.governance_tier,
        fd.standard_pack_id_primary as standard_pack_id,
        NULL::text as standard_pack_name,
        fd.owner,
        fd.steward,
        fd.entity_urn,
        ${fieldDictionaryRelevanceScore} as relevance_score,
        ARRAY[]::text[] as matched_fields,
        fd.created_at,
        fd.updated_at
      FROM kernel_field_dictionary fd
      WHERE ${fieldDictionaryWhere}
    `;

        const standardPacksQuery = `
      SELECT
        sp.id,
        'standard_pack'::text as entity_type,
        sp.name as canonical_key,
        sp.name as label,
        sp.description,
        NULL::text as domain,
        'tier_1'::text as governance_tier,
        NULL::uuid as standard_pack_id,
        sp.name as standard_pack_name,
        NULL::text as owner,
        NULL::text as steward,
        NULL::text as entity_urn,
        ${standardPacksRelevanceScore} as relevance_score,
        ARRAY[]::text[] as matched_fields,
        sp.created_at,
        sp.updated_at
      FROM mdm_standard_pack sp
      WHERE ${standardPacksWhere}
    `;

        // Filter by entity type if specified
        let entityTypeFilter = '';
        if (filters.entityType) {
            entityTypeFilter = `WHERE entity_type = '${filters.entityType}'`;
        }

        // Build ORDER BY clause
        let orderBy = '';
        switch (sortBy) {
            case 'relevance':
                orderBy = `ORDER BY relevance_score ${sortOrder}, label ASC`;
                break;
            case 'createdAt':
                orderBy = `ORDER BY created_at ${sortOrder}`;
                break;
            case 'updatedAt':
                orderBy = `ORDER BY updated_at ${sortOrder}`;
                break;
            case 'label':
                orderBy = `ORDER BY label ${sortOrder}`;
                break;
            default:
                orderBy = `ORDER BY relevance_score DESC, label ASC`;
        }

        // Add relevance filter if specified
        const relevanceFilter = minRelevance > 0
            ? (entityTypeFilter ? ' AND ' : 'WHERE ') + `relevance_score >= ${minRelevance}`
            : '';

        // Final query with LIMIT and OFFSET
        const finalQuery = `
      SELECT * FROM (
        ${businessTermsQuery}
        UNION ALL
        ${dataContractsQuery}
        UNION ALL
        ${fieldDictionaryQuery}
        UNION ALL
        ${standardPacksQuery}
      ) AS combined_results
      ${entityTypeFilter}${relevanceFilter}
      ${orderBy}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

        params.push(limit);
        params.push(offset);

        return {
            query: finalQuery,
            params,
        };
    }

    /**
     * Calculate search facets (aggregations).
     */
    private async calculateFacets(
        tenantId: string | null,
        filters: SearchFilters
    ): Promise<SearchResults['facets']> {
        const db = getDB().getClient();

        // This is a simplified version - in production, you'd want more sophisticated faceting
        // For now, return empty facets
        return {
            byEntityType: {},
            byGovernanceTier: {},
            byDomain: {},
            byStandardPack: {},
        };
    }

    /**
     * Lookup metadata by canonical key.
     *
     * Quick lookup for checking if a canonical key exists before creating.
     */
    async lookupByCanonicalKey(
        tenantId: string | null,
        canonicalKey: string,
        entityType?: 'business_term' | 'data_contract' | 'field_dictionary'
    ): Promise<SearchResultItem | null> {
        try {
            const results = await this.search(
                tenantId,
                canonicalKey,
                entityType ? { entityType } : {},
                { limit: 1, minRelevanceScore: 0.9 }
            );

            if (results.results.length === 0) {
                return null;
            }

            // Check for exact match
            const exactMatch = results.results.find(
                (r) => r.canonicalKey.toLowerCase() === canonicalKey.toLowerCase()
            );

            return exactMatch || null;
        } catch (error) {
            logger.error({ error, canonicalKey }, "Lookup by canonical key failed");
            throw new KernelError("Lookup failed", "METADATA_LOOKUP_FAILED", error);
        }
    }
}

export const metadataSearchService = new MetadataSearchService();


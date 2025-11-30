/**
 * Metadata Search Service Integration Tests
 * 
 * Integration tests for MetadataSearchService with real database
 * Tests search functionality, filters, pagination, and relevance scoring
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { metadataSearchService } from '../../../search/search.service';
import { seedTestData, withTestTransaction } from '../helpers/test-db';
import { createTestTenantId } from '../helpers/test-fixtures';
import { metadataService } from '../../../services/metadata.service';
import { 
  createTestBusinessTerm, 
  createTestDataContract,
  createTestFieldDictionary 
} from '../helpers/test-fixtures';
import { Database } from '../../../../storage/db';

describe('MetadataSearchService Integration', () => {
  let tenantId: string;

  beforeAll(async () => {
    Database.init();
    tenantId = createTestTenantId();
    await seedTestData(tenantId);
  });

  describe('Search Functionality', () => {
    it('should search across all entity types', async () => {
      await withTestTransaction(async (db) => {
        // Create test data
        const term = createTestBusinessTerm({
          label: 'Revenue Term',
          description: 'Total revenue',
        });
        const contract = createTestDataContract({
          name: 'Revenue Contract',
          description: 'Revenue data contract',
        });
        const field = createTestFieldDictionary({
          label: 'Revenue Field',
          description: 'Revenue field definition',
        });

        await metadataService.createBusinessTerm(tenantId, term);
        await metadataService.createDataContract(tenantId, contract);
        await metadataService.createFieldDictionary(tenantId, field);

        // Search for 'revenue'
        const results = await metadataSearchService.search(tenantId, 'revenue', {}, {});
        
        expect(results.results.length).toBeGreaterThanOrEqual(3);
        expect(results.totalResults).toBeGreaterThanOrEqual(3);
        expect(results.query).toBe('revenue');
      });
    });

    it('should apply domain filter', async () => {
      await withTestTransaction(async (db) => {
        const financeTerm = createTestBusinessTerm({
          label: 'Finance Term',
          domain: 'finance',
        });
        const hrTerm = createTestBusinessTerm({
          label: 'HR Term',
          domain: 'hr',
        });

        await metadataService.createBusinessTerm(tenantId, financeTerm);
        await metadataService.createBusinessTerm(tenantId, hrTerm);

        // Search with finance domain filter
        const results = await metadataSearchService.search(
          tenantId,
          'term',
          { domain: 'finance' },
          {}
        );

        expect(results.results.length).toBeGreaterThanOrEqual(1);
        results.results.forEach((result) => {
          if (result.entityType === 'business_term') {
            expect(result.domain).toBe('finance');
          }
        });
      });
    });

    it('should apply governance tier filter', async () => {
      await withTestTransaction(async (db) => {
        const tier1Term = createTestBusinessTerm({
          label: 'Tier 1 Term',
          governanceTier: 'tier_1',
        });
        const tier2Term = createTestBusinessTerm({
          label: 'Tier 2 Term',
          governanceTier: 'tier_2',
        });

        await metadataService.createBusinessTerm(tenantId, tier1Term);
        await metadataService.createBusinessTerm(tenantId, tier2Term);

        // Search with tier_1 filter
        const results = await metadataSearchService.search(
          tenantId,
          'term',
          { governanceTier: 'tier_1' },
          {}
        );

        expect(results.results.length).toBeGreaterThanOrEqual(1);
        results.results.forEach((result) => {
          expect(result.governanceTier).toBe('tier_1');
        });
      });
    });

    it('should apply pagination', async () => {
      await withTestTransaction(async (db) => {
        // Create multiple terms
        for (let i = 0; i < 5; i++) {
          const term = createTestBusinessTerm({
            label: `Term ${i}`,
            canonicalKey: `term_${i}`,
          });
          await metadataService.createBusinessTerm(tenantId, term);
        }

        // First page
        const page1 = await metadataSearchService.search(
          tenantId,
          'term',
          {},
          { limit: 2, offset: 0 }
        );
        expect(page1.results.length).toBeLessThanOrEqual(2);

        // Second page
        const page2 = await metadataSearchService.search(
          tenantId,
          'term',
          {},
          { limit: 2, offset: 2 }
        );
        expect(page2.results.length).toBeLessThanOrEqual(2);

        // Results should be different
        if (page1.results.length > 0 && page2.results.length > 0) {
          expect(page1.results[0].id).not.toBe(page2.results[0].id);
        }
      });
    });

    it('should calculate relevance scores', async () => {
      await withTestTransaction(async (db) => {
        const exactMatch = createTestBusinessTerm({
          label: 'Exact Match Term',
          canonicalKey: 'exact_match',
        });
        const partialMatch = createTestBusinessTerm({
          label: 'Partial Term',
          description: 'Contains exact match in description',
        });

        await metadataService.createBusinessTerm(tenantId, exactMatch);
        await metadataService.createBusinessTerm(tenantId, partialMatch);

        const results = await metadataSearchService.search(
          tenantId,
          'exact match',
          {},
          {}
        );

        expect(results.results.length).toBeGreaterThanOrEqual(2);
        // Results should be sorted by relevance (highest first)
        if (results.results.length >= 2) {
          expect(results.results[0].relevanceScore).toBeGreaterThanOrEqual(
            results.results[1].relevanceScore
          );
        }
      });
    });

    it('should handle empty search results', async () => {
      await withTestTransaction(async (db) => {
        const results = await metadataSearchService.search(
          tenantId,
          'nonexistent_query_xyz123',
          {},
          {}
        );

        expect(results.results).toHaveLength(0);
        expect(results.totalResults).toBe(0);
      });
    });
  });

  describe('Canonical Key Lookup', () => {
    it('should lookup metadata by canonical key', async () => {
      await withTestTransaction(async (db) => {
        const term = createTestBusinessTerm({
          label: 'Lookup Test',
          canonicalKey: 'lookup_test_key',
        });
        await metadataService.createBusinessTerm(tenantId, term);

        const result = await metadataSearchService.lookupByCanonicalKey(
          tenantId,
          'lookup_test_key'
        );

        expect(result).not.toBeNull();
        expect(result?.canonicalKey).toBe('lookup_test_key');
        expect(result?.entityType).toBe('business_term');
      });
    });

    it('should return null for non-existent canonical key', async () => {
      await withTestTransaction(async (db) => {
        const result = await metadataSearchService.lookupByCanonicalKey(
          tenantId,
          'non_existent_key_xyz'
        );

        expect(result).toBeNull();
      });
    });
  });

  describe('Tenant Isolation', () => {
    it('should only return results for the specified tenant', async () => {
      await withTestTransaction(async (db) => {
        const tenantId2 = createTestTenantId();
        
        const term1 = createTestBusinessTerm({
          label: 'Tenant 1 Term',
          canonicalKey: 'tenant1_term',
        });
        const term2 = createTestBusinessTerm({
          label: 'Tenant 2 Term',
          canonicalKey: 'tenant2_term',
        });

        await metadataService.createBusinessTerm(tenantId, term1);
        await metadataService.createBusinessTerm(tenantId2, term2);

        // Search in tenant 1
        const results1 = await metadataSearchService.search(tenantId, 'term', {}, {});
        const tenant1Ids = results1.results.map((r) => r.id);

        // Search in tenant 2
        const results2 = await metadataSearchService.search(tenantId2, 'term', {}, {});
        const tenant2Ids = results2.results.map((r) => r.id);

        // Results should not overlap
        const overlap = tenant1Ids.filter((id) => tenant2Ids.includes(id));
        expect(overlap).toHaveLength(0);
      });
    });
  });
});


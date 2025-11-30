/**
 * Metadata Search Service Unit Tests
 * 
 * Unit tests for MetadataSearchService - search functionality that MCP tools will use
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { metadataSearchService } from '../../../search/search.service';
import { Database } from '../../../../storage/db';
import { createTestSearchQuery, createTestTenantId } from '../helpers/test-fixtures';

// Mock database - need to mock getDB function
vi.mock('../../../../storage/db', async () => {
  const actual = await vi.importActual('../../../../storage/db');
  return {
    ...actual,
    getDB: vi.fn(() => ({
      getClient: vi.fn(),
    })),
  };
});

describe('MetadataSearchService', () => {
  const tenantId = createTestTenantId();
  let mockDbClient: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockDbClient = {
      query: vi.fn(),
    };
    const { getDB } = await import('../../../../storage/db');
    const mockGetDB = vi.mocked(getDB);
    mockGetDB.mockReturnValue({
      getClient: () => mockDbClient,
    } as any);
  });

  describe('search', () => {
    it('should return search results for valid query', async () => {
      const mockResults = {
        rows: [
          {
            entity_type: 'business_term',
            entity_id: '1',
            canonical_key: 'test_term',
            label: 'Test Term',
            description: 'A test term',
            relevance_score: 0.95,
          },
        ],
      };
      mockDbClient.query.mockResolvedValue(mockResults);

      const result = await metadataSearchService.search(tenantId, 'test', {}, {});

      expect(result.results).toHaveLength(1);
      expect(result.results[0].entityType).toBe('business_term');
      expect(result.totalResults).toBe(1);
    });

    it('should apply filters correctly', async () => {
      const filters = {
        governanceTier: 'tier_1' as const,
        domain: 'finance',
      };
      mockDbClient.query.mockResolvedValue({ rows: [] });

      await metadataSearchService.search(tenantId, 'test', filters, {});

      const queryCall = mockDbClient.query.mock.calls[0];
      const queryText = queryCall[0];
      const queryParams = queryCall[1] || [];
      
      // Check that governance tier filter is in the query
      expect(queryText).toContain('governance_tier');
      // Check that domain filter is in the query (only for business_terms)
      expect(queryText).toContain('domain');
      // Check that query was called with params (domain filter should add 'finance' to params)
      expect(queryParams).toBeInstanceOf(Array);
      expect(queryParams.length).toBeGreaterThan(0);
      // Verify that the domain filter parameter is present (it should be in the params array)
      // The exact position depends on the query structure, but it should be there
      expect(queryParams).toContain('finance');
    });

    it('should apply pagination options', async () => {
      const options = {
        limit: 10,
        offset: 20,
      };
      mockDbClient.query.mockResolvedValue({ rows: [] });

      await metadataSearchService.search(tenantId, 'test', {}, options);

      const queryCall = mockDbClient.query.mock.calls[0];
      expect(queryCall[0]).toContain('LIMIT');
      expect(queryCall[0]).toContain('OFFSET');
      expect(queryCall[1]).toContain(10);
      expect(queryCall[1]).toContain(20);
    });

    it('should handle empty search results', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });

      const result = await metadataSearchService.search(tenantId, 'nonexistent', {}, {});

      expect(result.results).toHaveLength(0);
      expect(result.totalResults).toBe(0);
    });

    it('should calculate relevance scores', async () => {
      const mockResults = {
        rows: [
          {
            entity_type: 'business_term',
            entity_id: '1',
            canonical_key: 'test_term',
            label: 'Test Term',
            description: 'A test term',
            relevance_score: 0.95,
          },
        ],
      };
      mockDbClient.query.mockResolvedValue(mockResults);

      const result = await metadataSearchService.search(tenantId, 'test', {}, {});

      expect(result.results[0].relevanceScore).toBe(0.95);
    });

    it('should handle search errors gracefully', async () => {
      const error = new Error('Database error');
      mockDbClient.query.mockRejectedValue(error);

      await expect(
        metadataSearchService.search(tenantId, 'test', {}, {})
      ).rejects.toThrow();
    });

    it('should search across multiple entity types', async () => {
      const mockResults = {
        rows: [
          {
            entity_type: 'business_term',
            entity_id: '1',
            canonical_key: 'term1',
            label: 'Term 1',
            description: 'First term',
            relevance_score: 0.9,
          },
          {
            entity_type: 'data_contract',
            entity_id: '2',
            canonical_key: 'contract1',
            label: 'Contract 1',
            description: 'First contract',
            relevance_score: 0.8,
          },
        ],
      };
      mockDbClient.query.mockResolvedValue(mockResults);

      const result = await metadataSearchService.search(tenantId, 'test', {}, {});

      expect(result.results).toHaveLength(2);
      expect(result.results[0].entityType).toBe('business_term');
      expect(result.results[1].entityType).toBe('data_contract');
    });
  });

  describe('lookupByCanonicalKey', () => {
    it('should return metadata by canonical key', async () => {
      const mockResult = {
        rows: [{
          entity_type: 'business_term',
          entity_id: '1',
          canonical_key: 'test_key',
          label: 'Test Term',
          description: 'A test term',
        }],
      };
      mockDbClient.query.mockResolvedValue(mockResult);

      const result = await metadataSearchService.lookupByCanonicalKey(tenantId, 'test_key');

      expect(result).not.toBeNull();
      expect(result?.canonicalKey).toBe('test_key');
    });

    it('should return null if canonical key not found', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });

      const result = await metadataSearchService.lookupByCanonicalKey(tenantId, 'non-existent');

      expect(result).toBeNull();
    });
  });
});


/**
 * Test Helpers and Fixtures Validation
 * 
 * Unit tests to validate test infrastructure (helpers, fixtures, setup)
 */

import { describe, it, expect } from 'vitest';
import {
  createTestTenantId,
  createTestBusinessTerm,
  createTestDataContract,
  createTestFieldDictionary,
  createTestKPI,
  createTestStandardPack,
  createTestSearchQuery,
} from '../helpers/test-fixtures';

describe('Test Helpers and Fixtures', () => {
  describe('createTestTenantId', () => {
    it('should generate a valid UUID', () => {
      const tenantId = createTestTenantId();

      expect(tenantId).toBeDefined();
      expect(typeof tenantId).toBe('string');
      // UUID format: 8-4-4-4-12 hex characters
      expect(tenantId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should generate unique IDs', () => {
      const id1 = createTestTenantId();
      const id2 = createTestTenantId();

      expect(id1).not.toBe(id2);
    });
  });

  describe('createTestBusinessTerm', () => {
    it('should create a valid business term fixture', () => {
      const term = createTestBusinessTerm();

      expect(term).toBeDefined();
      expect(term.canonicalKey).toBeDefined();
      expect(term.label).toBe('Test Business Term');
      expect(term.description).toBe('A test business term for MCP testing');
      expect(term.domain).toBe('finance');
      expect(term.governanceTier).toBe('tier_3');
    });

    it('should allow overrides', () => {
      const term = createTestBusinessTerm({
        canonicalKey: 'custom_key',
        governanceTier: 'tier_1',
        domain: 'sales',
      });

      expect(term.canonicalKey).toBe('custom_key');
      expect(term.governanceTier).toBe('tier_1');
      expect(term.domain).toBe('sales');
    });
  });

  describe('createTestDataContract', () => {
    it('should create a valid data contract fixture', () => {
      const contract = createTestDataContract();

      expect(contract).toBeDefined();
      expect(contract.canonicalKey).toBeDefined();
      expect(contract.name).toBe('Test Data Contract');
      expect(contract.description).toBe('A test data contract for MCP testing');
      expect(contract.governanceTier).toBe('tier_3');
    });

    it('should allow overrides', () => {
      const contract = createTestDataContract({
        canonicalKey: 'custom_contract',
        governanceTier: 'tier_2',
      });

      expect(contract.canonicalKey).toBe('custom_contract');
      expect(contract.governanceTier).toBe('tier_2');
    });
  });

  describe('createTestFieldDictionary', () => {
    it('should create a valid field dictionary fixture', () => {
      const field = createTestFieldDictionary();

      expect(field).toBeDefined();
      expect(field.canonicalKey).toBeDefined();
      expect(field.label).toBe('Test Field');
      expect(field.description).toBe('A test field for MCP testing');
      expect(field.governanceTier).toBe('tier_3');
    });
  });

  describe('createTestKPI', () => {
    it('should create a valid KPI fixture', () => {
      const numeratorFieldId = 'num-field-id';
      const denominatorFieldId = 'den-field-id';
      const standardPackId = 'pack-id';

      const kpi = createTestKPI(numeratorFieldId, denominatorFieldId, standardPackId);

      expect(kpi).toBeDefined();
      expect(kpi.canonicalKey).toBeDefined();
      expect(kpi.name).toBe('Test KPI');
      expect(kpi.numerator.fieldId).toBe(numeratorFieldId);
      expect(kpi.denominator.fieldId).toBe(denominatorFieldId);
      expect(kpi.governanceTier).toBe('tier_3');
    });
  });

  describe('createTestStandardPack', () => {
    it('should create a valid standard pack fixture', () => {
      const pack = createTestStandardPack();

      expect(pack).toBeDefined();
      expect(pack.name).toBeDefined();
      expect(pack.version).toBe('1.0.0');
      expect(pack.standardType).toBe('CUSTOM');
      expect(pack.description).toBe('A test standard pack');
      expect(pack.isDeprecated).toBe(false);
    });
  });

  describe('createTestSearchQuery', () => {
    it('should create a valid search query fixture', () => {
      const query = createTestSearchQuery();

      expect(query).toBeDefined();
      expect(query.query).toBe('test');
      expect(query.filters).toBeDefined();
      expect(query.filters.governanceTier).toBe('tier_3');
      expect(query.options).toBeDefined();
      expect(query.options.limit).toBe(10);
      expect(query.options.offset).toBe(0);
    });

    it('should allow overrides', () => {
      const query = createTestSearchQuery({
        query: 'revenue',
        filters: { governanceTier: 'tier_1' as const },
        options: { limit: 20, offset: 10 },
      });

      expect(query.query).toBe('revenue');
      expect(query.filters.governanceTier).toBe('tier_1');
      expect(query.options.limit).toBe(20);
      expect(query.options.offset).toBe(10);
    });
  });
});


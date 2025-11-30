/**
 * Metadata Service Integration Tests
 * 
 * Integration tests for MetadataService with real database
 * Tests CRUD operations, tenant isolation, and error handling
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { metadataService } from '../../../services/metadata.service';
import { seedTestData, withTestTransaction } from '../helpers/test-db';
import { 
  createTestTenantId, 
  createTestBusinessTerm, 
  createTestDataContract,
  createTestFieldDictionary 
} from '../helpers/test-fixtures';
import { Database } from '../../../../storage/db';

describe('MetadataService Integration', () => {
  let tenantId1: string;
  let tenantId2: string;

  beforeAll(async () => {
    Database.init();
    tenantId1 = createTestTenantId();
    tenantId2 = createTestTenantId();
    await seedTestData(tenantId1);
    await seedTestData(tenantId2);
  });

  afterAll(async () => {
    // Cleanup handled by test transactions
  });

  describe('Business Terms', () => {
    it('should create and retrieve business term', async () => {
      await withTestTransaction(async (db) => {
        const termData = createTestBusinessTerm({
          label: 'Integration Test Term',
          canonicalKey: 'integration_test_term',
        });

        const created = await metadataService.createBusinessTerm(tenantId1, termData);
        expect(created).toBeDefined();
        expect(created.id).toBeDefined();
        expect(created.label).toBe('Integration Test Term');
        expect(created.canonicalKey).toBe('integration_test_term');

        const retrieved = await metadataService.getBusinessTerm(tenantId1, created.id);
        expect(retrieved).not.toBeNull();
        expect(retrieved?.id).toBe(created.id);
        expect(retrieved?.label).toBe('Integration Test Term');
      });
    });

    it('should enforce tenant isolation', async () => {
      await withTestTransaction(async (db) => {
        const termData = createTestBusinessTerm({
          label: 'Tenant 1 Term',
          canonicalKey: 'tenant1_term',
        });

        const created = await metadataService.createBusinessTerm(tenantId1, termData);
        
        // Should not be visible to tenant 2
        const retrieved = await metadataService.getBusinessTerm(tenantId2, created.id);
        expect(retrieved).toBeNull();

        // Should be visible to tenant 1
        const retrieved2 = await metadataService.getBusinessTerm(tenantId1, created.id);
        expect(retrieved2).not.toBeNull();
      });
    });

    it('should retrieve business term by canonical key', async () => {
      await withTestTransaction(async (db) => {
        const termData = createTestBusinessTerm({
          label: 'Canonical Key Test',
          canonicalKey: 'canonical_key_test',
        });

        const created = await metadataService.createBusinessTerm(tenantId1, termData);
        
        const retrieved = await metadataService.getBusinessTermByCanonicalKey(
          tenantId1,
          'canonical_key_test'
        );
        expect(retrieved).not.toBeNull();
        expect(retrieved?.canonicalKey).toBe('canonical_key_test');
      });
    });

    it('should list business terms with filters', async () => {
      await withTestTransaction(async (db) => {
        const term1 = createTestBusinessTerm({
          label: 'Finance Term',
          domain: 'finance',
          governanceTier: 'tier_3', // Use tier_3 to avoid governance validation issues
        });
        const term2 = createTestBusinessTerm({
          label: 'HR Term',
          domain: 'hr',
          governanceTier: 'tier_3', // Use tier_3 to avoid governance validation issues
        });

        await metadataService.createBusinessTerm(tenantId1, term1);
        await metadataService.createBusinessTerm(tenantId1, term2);

        // List all
        const allTerms = await metadataService.listBusinessTerms(tenantId1);
        expect(allTerms.length).toBeGreaterThanOrEqual(2);

        // Filter by domain
        const financeTerms = await metadataService.listBusinessTerms(tenantId1, {
          domain: 'finance',
        });
        expect(financeTerms.length).toBeGreaterThanOrEqual(1);
        expect(financeTerms[0].domain).toBe('finance');

        // Filter by governance tier
        const tier3Terms = await metadataService.listBusinessTerms(tenantId1, {
          governanceTier: 'tier_3',
        });
        expect(tier3Terms.length).toBeGreaterThanOrEqual(1);
        expect(tier3Terms[0].governanceTier).toBe('tier_3');
      });
    });

    it('should update business term', async () => {
      await withTestTransaction(async (db) => {
        const termData = createTestBusinessTerm({
          label: 'Original Label',
          canonicalKey: 'update_test',
        });

        const created = await metadataService.createBusinessTerm(tenantId1, termData);
        
        const updated = await metadataService.updateBusinessTerm(
          tenantId1,
          created.id,
          { label: 'Updated Label', description: 'Updated description' }
        );
        
        expect(updated).not.toBeNull();
        expect(updated?.label).toBe('Updated Label');
        expect(updated?.description).toBe('Updated description');
      });
    });

    it('should delete business term', async () => {
      await withTestTransaction(async (db) => {
        const termData = createTestBusinessTerm({
          label: 'Delete Test',
          canonicalKey: 'delete_test',
        });

        const created = await metadataService.createBusinessTerm(tenantId1, termData);
        await metadataService.deleteBusinessTerm(tenantId1, created.id);
        
        const retrieved = await metadataService.getBusinessTerm(tenantId1, created.id);
        expect(retrieved).toBeNull();
      });
    });
  });

  describe('Data Contracts', () => {
    it('should create and retrieve data contract', async () => {
      await withTestTransaction(async (db) => {
        const contractData = createTestDataContract({
          name: 'Integration Test Contract',
          canonicalKey: 'integration_test_contract',
        });

        const created = await metadataService.createDataContract(tenantId1, contractData);
        expect(created).toBeDefined();
        expect(created.id).toBeDefined();
        expect(created.name).toBe('Integration Test Contract');

        const retrieved = await metadataService.getDataContract(tenantId1, created.id);
        expect(retrieved).not.toBeNull();
        expect(retrieved?.id).toBe(created.id);
      });
    });

    it('should enforce tenant isolation for data contracts', async () => {
      await withTestTransaction(async (db) => {
        const contractData = createTestDataContract({
          name: 'Tenant 1 Contract',
          canonicalKey: 'tenant1_contract',
        });

        const created = await metadataService.createDataContract(tenantId1, contractData);
        
        const retrieved = await metadataService.getDataContract(tenantId2, created.id);
        expect(retrieved).toBeNull();
      });
    });
  });

  describe('Field Dictionary', () => {
    it('should create and retrieve field dictionary', async () => {
      await withTestTransaction(async (db) => {
        const fieldData = createTestFieldDictionary({
          label: 'Integration Test Field',
          canonicalKey: 'integration_test_field',
        });

        const created = await metadataService.createFieldDictionary(tenantId1, fieldData);
        expect(created).toBeDefined();
        expect(created.id).toBeDefined();
        expect(created.label).toBe('Integration Test Field');

        const retrieved = await metadataService.getFieldDictionary(tenantId1, created.id);
        expect(retrieved).not.toBeNull();
        expect(retrieved?.id).toBe(created.id);
      });
    });

    it('should enforce tenant isolation for field dictionary', async () => {
      await withTestTransaction(async (db) => {
        const fieldData = createTestFieldDictionary({
          label: 'Tenant 1 Field',
          canonicalKey: 'tenant1_field',
        });

        const created = await metadataService.createFieldDictionary(tenantId1, fieldData);
        
        const retrieved = await metadataService.getFieldDictionary(tenantId2, created.id);
        expect(retrieved).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent entity gracefully', async () => {
      await withTestTransaction(async (db) => {
        const nonExistentId = createTestTenantId(); // Random UUID
        const retrieved = await metadataService.getBusinessTerm(tenantId1, nonExistentId);
        expect(retrieved).toBeNull();
      });
    });

    it('should handle invalid tenant ID', async () => {
      await withTestTransaction(async (db) => {
        const termData = createTestBusinessTerm();
        const created = await metadataService.createBusinessTerm(tenantId1, termData);
        
        // Try to access with different tenant
        const retrieved = await metadataService.getBusinessTerm(tenantId2, created.id);
        expect(retrieved).toBeNull();
      });
    });
  });
});


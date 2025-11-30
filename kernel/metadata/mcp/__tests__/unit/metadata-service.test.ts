/**
 * Metadata Service Unit Tests
 * 
 * Unit tests for MetadataService - the underlying service that MCP tools will use
 * Tests CRUD operations for business terms, data contracts, and field dictionary
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { metadataService } from '../../../services/metadata.service';
import { 
  businessTermRepository,
  dataContractRepository,
  fieldDictionaryRepository,
} from '../../../catalog';
import { createTestBusinessTerm, createTestDataContract, createTestFieldDictionary, createTestTenantId } from '../helpers/test-fixtures';

// Mock repositories
vi.mock('../../../catalog', () => ({
  businessTermRepository: {
    findById: vi.fn(),
    findByCanonicalKey: vi.fn(),
    listByTenant: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  dataContractRepository: {
    findById: vi.fn(),
    findByCanonicalKey: vi.fn(),
    listByTenant: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  fieldDictionaryRepository: {
    findById: vi.fn(),
    findByCanonicalKey: vi.fn(),
    listByTenant: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  fieldAliasRepository: {
    findById: vi.fn(),
    findByCanonicalKey: vi.fn(),
    listByTenant: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  standardPackRepository: {
    findById: vi.fn(),
    findByCanonicalKey: vi.fn(),
    listByTenant: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock governance tier service
vi.mock('../../../services/governance-tier.service', () => ({
  governanceTierService: {
    validateTierCompliance: vi.fn().mockResolvedValue({ compliant: true, violations: [] }),
  },
}));

describe('MetadataService', () => {
  const tenantId = createTestTenantId();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Business Terms', () => {
    describe('getBusinessTerm', () => {
      it('should return business term by ID', async () => {
        const mockTerm = createTestBusinessTerm({ id: 'test-id' });
        vi.mocked(businessTermRepository.findById).mockResolvedValue(mockTerm as any);

        const result = await metadataService.getBusinessTerm(tenantId, 'test-id');

        expect(result).toEqual(mockTerm);
        expect(businessTermRepository.findById).toHaveBeenCalledWith(tenantId, 'test-id');
      });

      it('should return null if business term not found', async () => {
        vi.mocked(businessTermRepository.findById).mockResolvedValue(null);

        const result = await metadataService.getBusinessTerm(tenantId, 'non-existent');

        expect(result).toBeNull();
      });

      it('should handle errors gracefully', async () => {
        const error = new Error('Database error');
        vi.mocked(businessTermRepository.findById).mockRejectedValue(error);

        await expect(
          metadataService.getBusinessTerm(tenantId, 'test-id')
        ).rejects.toThrow();
      });
    });

    describe('getBusinessTermByCanonicalKey', () => {
      it('should return business term by canonical key', async () => {
        const mockTerm = createTestBusinessTerm({ canonicalKey: 'test_key' });
        vi.mocked(businessTermRepository.findByCanonicalKey).mockResolvedValue(mockTerm as any);

        const result = await metadataService.getBusinessTermByCanonicalKey(tenantId, 'test_key');

        expect(result).toEqual(mockTerm);
        expect(businessTermRepository.findByCanonicalKey).toHaveBeenCalledWith(tenantId, 'test_key');
      });

      it('should return null if business term not found', async () => {
        vi.mocked(businessTermRepository.findByCanonicalKey).mockResolvedValue(null);

        const result = await metadataService.getBusinessTermByCanonicalKey(tenantId, 'non-existent');

        expect(result).toBeNull();
      });
    });

    describe('listBusinessTerms', () => {
      it('should return list of business terms', async () => {
        const mockTerms = [
          createTestBusinessTerm({ id: '1' }),
          createTestBusinessTerm({ id: '2' }),
        ];
        vi.mocked(businessTermRepository.listByTenant).mockResolvedValue(mockTerms as any);

        const result = await metadataService.listBusinessTerms(tenantId);

        expect(result).toEqual(mockTerms);
        expect(businessTermRepository.listByTenant).toHaveBeenCalledWith(tenantId, undefined);
      });

      it('should apply filters when provided', async () => {
        const filters = { domain: 'finance', governanceTier: 'tier_1' };
        vi.mocked(businessTermRepository.listByTenant).mockResolvedValue([]);

        await metadataService.listBusinessTerms(tenantId, filters);

        expect(businessTermRepository.listByTenant).toHaveBeenCalledWith(tenantId, filters);
      });
    });

    describe('createBusinessTerm', () => {
      it('should create business term successfully', async () => {
        const termData = createTestBusinessTerm();
        const createdTerm = { ...termData, id: 'new-id', tenantId };
        vi.mocked(businessTermRepository.create).mockResolvedValue(createdTerm as any);

        const result = await metadataService.createBusinessTerm(tenantId, termData);

        expect(result).toEqual(createdTerm);
        expect(businessTermRepository.create).toHaveBeenCalledWith({ ...termData, tenantId });
      });

      it('should validate governance tier compliance', async () => {
        const { governanceTierService } = await import('../../../services/governance-tier.service');
        const termData = createTestBusinessTerm({ governanceTier: 'tier_1' });
        vi.mocked(businessTermRepository.create).mockResolvedValue(termData as any);
        vi.mocked(governanceTierService.validateTierCompliance).mockResolvedValue({ 
          compliant: true, 
          violations: [] 
        });

        await metadataService.createBusinessTerm(tenantId, termData);

        expect(governanceTierService.validateTierCompliance).toHaveBeenCalled();
      });
    });
  });

  describe('Data Contracts', () => {
    describe('getDataContract', () => {
      it('should return data contract by ID', async () => {
        const mockContract = createTestDataContract({ id: 'test-id' });
        vi.mocked(dataContractRepository.findById).mockResolvedValue(mockContract as any);

        const result = await metadataService.getDataContract(tenantId, 'test-id');

        expect(result).toEqual(mockContract);
        expect(dataContractRepository.findById).toHaveBeenCalledWith(tenantId, 'test-id');
      });

      it('should return null if data contract not found', async () => {
        vi.mocked(dataContractRepository.findById).mockResolvedValue(null);

        const result = await metadataService.getDataContract(tenantId, 'non-existent');

        expect(result).toBeNull();
      });
    });

    describe('getDataContractByCanonicalKey', () => {
      it('should return data contract by canonical key', async () => {
        const mockContract = createTestDataContract({ canonicalKey: 'test_key' });
        vi.mocked(dataContractRepository.findByCanonicalKey).mockResolvedValue(mockContract as any);

        const result = await metadataService.getDataContractByCanonicalKey(tenantId, 'test_key');

        expect(result).toEqual(mockContract);
        expect(dataContractRepository.findByCanonicalKey).toHaveBeenCalledWith(tenantId, 'test_key');
      });
    });
  });

  describe('Field Dictionary', () => {
    describe('getFieldDictionary', () => {
      it('should return field dictionary by ID', async () => {
        const mockField = createTestFieldDictionary({ id: 'test-id' });
        vi.mocked(fieldDictionaryRepository.findById).mockResolvedValue(mockField as any);

        const result = await metadataService.getFieldDictionary(tenantId, 'test-id');

        expect(result).toEqual(mockField);
        expect(fieldDictionaryRepository.findById).toHaveBeenCalledWith(tenantId, 'test-id');
      });

      it('should return null if field dictionary not found', async () => {
        vi.mocked(fieldDictionaryRepository.findById).mockResolvedValue(null);

        const result = await metadataService.getFieldDictionary(tenantId, 'non-existent');

        expect(result).toBeNull();
      });
    });

    describe('getFieldDictionaryByCanonicalKey', () => {
      it('should return field dictionary by canonical key', async () => {
        const mockField = createTestFieldDictionary({ canonicalKey: 'test_key' });
        vi.mocked(fieldDictionaryRepository.findByCanonicalKey).mockResolvedValue(mockField as any);

        const result = await metadataService.getFieldDictionaryByCanonicalKey(tenantId, 'test_key');

        expect(result).toEqual(mockField);
        expect(fieldDictionaryRepository.findByCanonicalKey).toHaveBeenCalledWith(tenantId, 'test_key');
      });
    });
  });
});

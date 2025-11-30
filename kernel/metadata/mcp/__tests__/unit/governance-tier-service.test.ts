/**
 * Governance Tier Service Unit Tests
 * 
 * Unit tests for GovernanceTierService - validation logic that MCP tools will use
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { governanceTierService } from '../../../services/governance-tier.service';
import { Database } from '../../../../storage/db';

// Mock database
vi.mock('../../../../storage/db', () => ({
  Database: {
    init: vi.fn(),
    getClient: vi.fn(() => ({
      query: vi.fn(),
    })),
  },
}));

// Mock lineage service
vi.mock('../../../lineage', () => ({
  lineageService: {
    hasLineageCoverage: vi.fn().mockResolvedValue(true),
  },
}));

// Mock profiling service
vi.mock('../../../profiling', () => ({
  profilingService: {
    hasProfiling: vi.fn().mockResolvedValue(true),
  },
}));

// Mock quality service
vi.mock('../../../quality', () => ({
  qualityService: {
    hasQualityChecks: vi.fn().mockResolvedValue(true),
  },
}));

describe('GovernanceTierService', () => {
  let mockDbClient: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDbClient = {
      query: vi.fn(),
    };
    vi.mocked(Database.getClient).mockReturnValue(mockDbClient);
  });

  describe('validateTierCompliance', () => {
    it('should return empty violations for compliant tier 3 entity', async () => {
      const entity = {
        hasLineage: false,
        hasProfiling: false,
        hasStandardPack: false,
        hasOwner: false,
        hasSteward: false,
      };

      const result = await governanceTierService.validateTierCompliance('tier_3', entity);

      expect(result.compliant).toBe(true);
      expect(result.violations).toEqual([]);
    });

    it('should validate tier 1 requirements', async () => {
      const entity = {
        hasOwner: true,
        hasSteward: true,
        hasStandardPack: true,
        hasProfiling: true,
        hasLineage: true,
        tenantId: 'tenant-id',
        urn: 'urn:test:entity',
        fieldId: 'field-id',
      };

      const result = await governanceTierService.validateTierCompliance('tier_1', entity);

      // Tier 1 requires: owner, steward, SoT pack, profiling, quality checks, lineage
      expect(Array.isArray(result.violations)).toBe(true);
    });

    it('should detect missing owner for tier 1', async () => {
      const entity = {
        hasOwner: false, // Missing owner
        hasSteward: true,
        hasStandardPack: true,
        hasProfiling: true,
        hasLineage: true,
      };

      const result = await governanceTierService.validateTierCompliance('tier_1', entity);

      expect(result.violations.some(v => v.includes('owner') || v.includes('Owner'))).toBe(true);
    });

    it('should detect missing steward for tier 1', async () => {
      const entity = {
        hasOwner: true,
        hasSteward: false, // Missing steward
        hasStandardPack: true,
        hasProfiling: true,
        hasLineage: true,
      };

      const result = await governanceTierService.validateTierCompliance('tier_1', entity);

      expect(result.violations.some(v => v.includes('steward') || v.includes('Steward'))).toBe(true);
    });

    it('should detect missing SoT pack for tier 1', async () => {
      const entity = {
        hasOwner: true,
        hasSteward: true,
        hasStandardPack: false, // Missing SoT pack
        hasProfiling: true,
        hasLineage: true,
      };

      const result = await governanceTierService.validateTierCompliance('tier_1', entity);

      expect(result.violations.some(v => v.includes('Source of Truth') || v.includes('SoT') || v.includes('standard pack'))).toBe(true);
    });

    it('should validate tier 2 requirements', async () => {
      const entity = {
        hasOwner: true,
        hasSteward: true,
        hasProfiling: true,
        hasLineage: false,
        hasStandardPack: false,
      };

      const result = await governanceTierService.validateTierCompliance('tier_2', entity);

      // Tier 2 requires: owner, steward, profiling
      expect(Array.isArray(result.violations)).toBe(true);
    });

    it('should return empty violations for tier 4', async () => {
      const entity = {
        hasLineage: false,
        hasProfiling: false,
        hasStandardPack: false,
        hasOwner: false,
        hasSteward: false,
      };

      const result = await governanceTierService.validateTierCompliance('tier_4', entity);

      expect(result.compliant).toBe(true);
      expect(result.violations).toEqual([]);
    });

    it('should return empty violations for tier 5', async () => {
      const entity = {
        hasLineage: false,
        hasProfiling: false,
        hasStandardPack: false,
        hasOwner: false,
        hasSteward: false,
      };

      const result = await governanceTierService.validateTierCompliance('tier_5', entity);

      expect(result.compliant).toBe(true);
      expect(result.violations).toEqual([]);
    });
  });

  describe('getTierRequirements', () => {
    it('should return requirements for tier 1', () => {
      const requirements = governanceTierService.getTierRequirements('tier_1');

      expect(requirements.requiresLineage).toBe(true);
      expect(requirements.requiresProfiling).toBe(true);
      expect(requirements.requiresHITL).toBe(true);
      expect(requirements.requiresStandardPack).toBe(true);
      expect(requirements.requiresOwnership).toBe(true);
    });

    it('should return requirements for tier 2', () => {
      const requirements = governanceTierService.getTierRequirements('tier_2');

      expect(requirements.requiresLineage).toBe(false);
      expect(requirements.requiresProfiling).toBe(true);
      expect(requirements.requiresHITL).toBe(true);
      expect(requirements.requiresStandardPack).toBe(false);
      expect(requirements.requiresOwnership).toBe(true);
    });

    it('should return requirements for tier 3', () => {
      const requirements = governanceTierService.getTierRequirements('tier_3');

      expect(requirements.requiresLineage).toBe(false);
      expect(requirements.requiresProfiling).toBe(false);
      expect(requirements.requiresHITL).toBe(false);
      expect(requirements.requiresStandardPack).toBe(false);
      expect(requirements.requiresOwnership).toBe(false);
    });
  });
});


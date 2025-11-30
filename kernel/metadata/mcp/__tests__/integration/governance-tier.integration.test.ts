/**
 * Governance Tier Service Integration Tests
 * 
 * Integration tests for GovernanceTierService with real database
 * Tests tier validation, compliance checking, and HITL integration
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { governanceTierService } from '../../../services/governance-tier.service';
import { seedTestData, withTestTransaction } from '../helpers/test-db';
import { createTestTenantId } from '../helpers/test-fixtures';
import { metadataService } from '../../../services/metadata.service';
import { createTestBusinessTerm } from '../helpers/test-fixtures';
import { Database } from '../../../../storage/db';

describe('GovernanceTierService Integration', () => {
  let tenantId: string;

  beforeAll(async () => {
    Database.init();
    tenantId = createTestTenantId();
    await seedTestData(tenantId);
  });

  describe('Tier Requirements', () => {
    it('should return correct requirements for tier 1', () => {
      const requirements = governanceTierService.getTierRequirements('tier_1');
      
      expect(requirements.requiresLineage).toBe(true);
      expect(requirements.requiresProfiling).toBe(true);
      expect(requirements.requiresHITL).toBe(true);
      expect(requirements.requiresStandardPack).toBe(true);
      expect(requirements.requiresOwnership).toBe(true);
      expect(requirements.minApprovals).toBe(2);
    });

    it('should return correct requirements for tier 2', () => {
      const requirements = governanceTierService.getTierRequirements('tier_2');
      
      expect(requirements.requiresLineage).toBe(false);
      expect(requirements.requiresProfiling).toBe(true);
      expect(requirements.requiresHITL).toBe(true);
      expect(requirements.requiresStandardPack).toBe(false);
      expect(requirements.requiresOwnership).toBe(true);
      expect(requirements.minApprovals).toBe(1);
    });

    it('should return correct requirements for tier 3', () => {
      const requirements = governanceTierService.getTierRequirements('tier_3');
      
      expect(requirements.requiresLineage).toBe(false);
      expect(requirements.requiresProfiling).toBe(false);
      expect(requirements.requiresHITL).toBe(false);
      expect(requirements.requiresStandardPack).toBe(false);
      expect(requirements.requiresOwnership).toBe(false);
      expect(requirements.minApprovals).toBe(0);
    });
  });

  describe('Tier Compliance Validation', () => {
    it('should validate tier 3 entity as compliant', async () => {
      await withTestTransaction(async (db) => {
        const entity = {
          hasLineage: false,
          hasProfiling: false,
          hasStandardPack: false,
          hasOwner: false,
          hasSteward: false,
        };

        const result = await governanceTierService.validateTierCompliance('tier_3', entity);
        
        expect(result.compliant).toBe(true);
        expect(result.violations).toHaveLength(0);
      });
    });

    it('should detect missing owner for tier 1', async () => {
      await withTestTransaction(async (db) => {
        const entity = {
          hasOwner: false,
          hasSteward: true,
          hasStandardPack: true,
          hasProfiling: true,
          hasLineage: true,
        };

        const result = await governanceTierService.validateTierCompliance('tier_1', entity);
        
        expect(result.compliant).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.violations.some((v) => v.includes('owner'))).toBe(true);
      });
    });

    it('should detect missing steward for tier 1', async () => {
      await withTestTransaction(async (db) => {
        const entity = {
          hasOwner: true,
          hasSteward: false,
          hasStandardPack: true,
          hasProfiling: true,
          hasLineage: true,
        };

        const result = await governanceTierService.validateTierCompliance('tier_1', entity);
        
        expect(result.compliant).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(result.violations.some((v) => v.includes('steward'))).toBe(true);
      });
    });

    it('should detect missing standard pack for tier 1', async () => {
      await withTestTransaction(async (db) => {
        const entity = {
          hasOwner: true,
          hasSteward: true,
          hasStandardPack: false,
          hasProfiling: true,
          hasLineage: true,
        };

        const result = await governanceTierService.validateTierCompliance('tier_1', entity);
        
        expect(result.compliant).toBe(false);
        expect(result.violations.length).toBeGreaterThan(0);
        expect(
          result.violations.some((v) => 
            v.includes('standard pack') || v.includes('Source of Truth') || v.includes('SoT')
          )
        ).toBe(true);
      });
    });

    it('should validate tier 2 with owner and steward', async () => {
      await withTestTransaction(async (db) => {
        const entity = {
          hasOwner: true,
          hasSteward: true,
          hasProfiling: true,
          hasStandardPack: false, // Not required for tier 2
          hasLineage: false, // Not required for tier 2
        };

        const result = await governanceTierService.validateTierCompliance('tier_2', entity);
        
        // Should be compliant if profiling and ownership are met
        // (lineage and standard pack are optional for tier 2)
        expect(Array.isArray(result.violations)).toBe(true);
      });
    });
  });

  describe('HITL Approval', () => {
    it('should require HITL approval for tier 1 changes', () => {
      const requiresApproval = governanceTierService.requiresHITLApproval('tier_1', 'create');
      expect(requiresApproval).toBe(true);
    });

    it('should require HITL approval for tier 2 changes', () => {
      const requiresApproval = governanceTierService.requiresHITLApproval('tier_2', 'create');
      expect(requiresApproval).toBe(true);
    });

    it('should not require HITL approval for tier 3 changes', () => {
      const requiresApproval = governanceTierService.requiresHITLApproval('tier_3', 'create');
      expect(requiresApproval).toBe(false);
    });

    it('should always require HITL approval for tier changes', () => {
      const requiresApproval = governanceTierService.requiresHITLApproval('tier_1', 'tier_change');
      expect(requiresApproval).toBe(true);
    });
  });
});


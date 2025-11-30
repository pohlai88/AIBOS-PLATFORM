/**
 * Metadata E2E Workflow Tests
 * 
 * End-to-end tests for complete metadata workflows
 * Tests complete lifecycle: Create → Search → Lineage → KPI → Impact Analysis
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { metadataService } from '../../../services/metadata.service';
import { metadataSearchService } from '../../../search/search.service';
import { lineageService } from '../../../lineage';
import { compositeKpiService } from '../../../kpi';
import { impactAnalysisService } from '../../../impact';
import { seedTestData, withTestTransaction } from '../helpers/test-db';
import { 
  createTestTenantId, 
  createTestBusinessTerm, 
  createTestDataContract,
  createTestFieldDictionary 
} from '../helpers/test-fixtures';
import { Database } from '../../../../storage/db';
import { standardPackRepository } from '../../../catalog';

describe('Metadata E2E Workflows', () => {
  const tenantId: string | null = null; // Use global entities (null tenant) to avoid FK constraints

  beforeAll(async () => {
    Database.init();
    // Use null tenant (global entities) to avoid foreign key constraint issues
  });

  afterAll(async () => {
    // Cleanup handled by test transactions
  });

  describe('Complete Metadata Lifecycle', () => {
    it('should complete full metadata lifecycle: create → search → lineage → KPI', async () => {
      await withTestTransaction(async (db) => {
        // Step 1: Get a standard pack for testing
        const packs = await standardPackRepository.listByTenant(null);
        expect(packs.length).toBeGreaterThan(0);
        const testPackId = packs[0].id;

        // Step 2: Create business term
        const termData = createTestBusinessTerm({
          label: 'E2E Revenue Term',
          canonicalKey: `e2e_revenue_term_${Date.now()}`,
          domain: 'finance',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        });
        const createdTerm = await metadataService.createBusinessTerm(null, termData);
        expect(createdTerm).toBeDefined();
        expect(createdTerm.id).toBeDefined();
        expect(createdTerm.canonicalKey).toBe(termData.canonicalKey);

        // Step 3: Create data contract
        const contractData = createTestDataContract({
          name: 'E2E Revenue Contract',
          canonicalKey: `e2e_revenue_contract_${Date.now()}`,
          sourceSystem: 'E2E_TEST',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        });
        const createdContract = await metadataService.createDataContract(null, contractData);
        expect(createdContract).toBeDefined();
        expect(createdContract.id).toBeDefined();

        // Step 4: Create field dictionary entries (for KPI numerator/denominator)
        const numeratorFieldData = createTestFieldDictionary({
          label: 'E2E Revenue Field',
          canonicalKey: `e2e_revenue_field_${Date.now()}`,
          dataType: 'number',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
          businessTermId: createdTerm.id,
          dataContractId: createdContract.id,
        });
        const numeratorField = await metadataService.createFieldDictionary(null, numeratorFieldData);
        expect(numeratorField).toBeDefined();
        expect(numeratorField.id).toBeDefined();

        const denominatorFieldData = createTestFieldDictionary({
          label: 'E2E Count Field',
          canonicalKey: `e2e_count_field_${Date.now()}`,
          dataType: 'number',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        });
        const denominatorField = await metadataService.createFieldDictionary(null, denominatorFieldData);
        expect(denominatorField).toBeDefined();
        expect(denominatorField.id).toBeDefined();

        // Step 5: Search for created entities
        const searchResults = await metadataSearchService.search(
          null,
          'E2E Revenue',
          {},
          { limit: 10, offset: 0 }
        );
        expect(searchResults.results.length).toBeGreaterThan(0);
        expect(searchResults.results.some(r => r.entityType === 'business_term')).toBe(true);
        expect(searchResults.results.some(r => r.entityType === 'data_contract')).toBe(true);
        expect(searchResults.results.some(r => r.entityType === 'field_dictionary')).toBe(true);

        // Step 6: Create lineage edges
        if (createdTerm.entityUrn && numeratorField.entityUrn) {
          const lineageEdge = await lineageService.addEdge(
            null,
            createdTerm.entityUrn,
            numeratorField.entityUrn,
            'produces',
            undefined,
            { description: 'Business term produces field' }
          );
          expect(lineageEdge).toBeDefined();
          expect(lineageEdge.id).toBeDefined();
        }

        // Step 7: Create composite KPI
        const kpiData = {
          canonicalKey: `e2e_revenue_kpi_${Date.now()}`,
          name: 'E2E Revenue KPI',
          description: 'E2E test KPI',
          numerator: {
            fieldId: numeratorField.id,
            expression: 'SUM({field})',
            standardPackId: testPackId,
            description: 'Total revenue',
          },
          denominator: {
            fieldId: denominatorField.id,
            expression: 'COUNT({field})',
            standardPackId: testPackId,
            description: 'Total count',
          },
          governanceTier: 'tier_3' as const,
          owner: null,
          steward: null,
          entityUrn: `urn:metadata:kpi:e2e_revenue_kpi_${Date.now()}`,
          domain: 'finance',
          tags: [],
        };

        const createdKPI = await compositeKpiService.createKPI(null, kpiData);
        expect(createdKPI).toBeDefined();
        expect(createdKPI.id).toBeDefined();
        expect(createdKPI.canonicalKey).toBe(kpiData.canonicalKey);

        // Step 8: Validate KPI
        const validation = await compositeKpiService.validateKPI(null, createdKPI);
        expect(validation.isValid).toBe(true);
        expect(validation.violations.length).toBe(0);

        // Step 9: Get KPI lineage
        if (createdKPI.entityUrn) {
          const kpiLineage = await lineageService.getLineageGraph(null, createdKPI.entityUrn, {
            depth: 5,
            direction: 'both',
          });
          expect(kpiLineage).toBeDefined();
          expect(kpiLineage.nodes.length).toBeGreaterThan(0);
          expect(kpiLineage.edges.length).toBeGreaterThan(0);
        }

        // Step 10: Analyze impact
        if (numeratorField.entityUrn) {
          const impact = await impactAnalysisService.analyzeImpact(null, {
            entityUrn: numeratorField.entityUrn,
            changeType: 'update',
            description: 'E2E test impact analysis',
          });
          expect(impact).toBeDefined();
          expect(impact.affectedEntities.length).toBeGreaterThanOrEqual(0);
        }
      });
    });
  });

  describe('Search and Discovery Workflow', () => {
    it('should discover metadata through search and lookup', async () => {
      await withTestTransaction(async (db) => {
        // Step 1: Create test entities
        const packs = await standardPackRepository.listByTenant(null);
        const testPackId = packs[0].id;

        const term = createTestBusinessTerm({
          label: 'Discovery Test Term',
          canonicalKey: `discovery_term_${Date.now()}`,
          domain: 'finance',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        });
        const createdTerm = await metadataService.createBusinessTerm(null, term);

        // Step 2: Search by keyword
        const searchResults = await metadataSearchService.search(
          null,
          'Discovery',
          {},
          { limit: 10, offset: 0 }
        );
        expect(searchResults.results.length).toBeGreaterThan(0);
        const foundTerm = searchResults.results.find(r => r.entityId === createdTerm.id);
        expect(foundTerm).toBeDefined();

        // Step 3: Lookup by canonical key
        const lookupResult = await metadataSearchService.lookupByCanonicalKey(
          null,
          term.canonicalKey
        );
        expect(lookupResult).not.toBeNull();
        expect(lookupResult?.canonicalKey).toBe(term.canonicalKey);

        // Step 4: Search with filters
        const filteredResults = await metadataSearchService.search(
          null,
          'Discovery',
          {
            domain: 'finance',
            governanceTier: 'tier_3',
          },
          { limit: 10, offset: 0 }
        );
        expect(filteredResults.results.length).toBeGreaterThan(0);
        expect(filteredResults.results.every(r => r.domain === 'finance')).toBe(true);

        // Step 5: Test pagination
        const page1 = await metadataSearchService.search(
          null,
          '',
          {},
          { limit: 2, offset: 0 }
        );
        const page2 = await metadataSearchService.search(
          null,
          '',
          {},
          { limit: 2, offset: 2 }
        );
        expect(page1.results.length).toBeLessThanOrEqual(2);
        expect(page2.results.length).toBeLessThanOrEqual(2);
        // Results should be different (unless there are fewer than 4 total)
        if (page1.totalResults > 2) {
          expect(page1.results[0].entityId).not.toBe(page2.results[0]?.entityId);
        }
      });
    });
  });

  describe('Lineage Tracking Workflow', () => {
    it('should track complete lineage from source to KPI', async () => {
      await withTestTransaction(async (db) => {
        // Step 1: Create source entities
        const packs = await standardPackRepository.listByTenant(null);
        const testPackId = packs[0].id;

        const sourceTerm = createTestBusinessTerm({
          label: 'Lineage Source Term',
          canonicalKey: `lineage_source_${Date.now()}`,
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        });
        const createdSourceTerm = await metadataService.createBusinessTerm(null, sourceTerm);

        const intermediateField = createTestFieldDictionary({
          label: 'Lineage Intermediate Field',
          canonicalKey: `lineage_intermediate_${Date.now()}`,
          dataType: 'number',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
          businessTermId: createdSourceTerm.id,
        });
        const createdIntermediateField = await metadataService.createFieldDictionary(null, intermediateField);

        const targetField = createTestFieldDictionary({
          label: 'Lineage Target Field',
          canonicalKey: `lineage_target_${Date.now()}`,
          dataType: 'number',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        });
        const createdTargetField = await metadataService.createFieldDictionary(null, targetField);

        // Step 2: Create lineage chain: source → intermediate → target
        if (createdSourceTerm.entityUrn && createdIntermediateField.entityUrn) {
          const edge1 = await lineageService.addEdge(
            null,
            createdSourceTerm.entityUrn,
            createdIntermediateField.entityUrn,
            'produces',
            undefined,
            { description: 'Source produces intermediate' }
          );
          expect(edge1).toBeDefined();
        }

        if (createdIntermediateField.entityUrn && createdTargetField.entityUrn) {
          const edge2 = await lineageService.addEdge(
            null,
            createdIntermediateField.entityUrn,
            createdTargetField.entityUrn,
            'transforms',
            undefined,
            { description: 'Intermediate transforms to target' }
          );
          expect(edge2).toBeDefined();
        }

        // Step 3: Create KPI using target field
        const kpiData = {
          canonicalKey: `lineage_kpi_${Date.now()}`,
          name: 'Lineage Test KPI',
          description: 'KPI with lineage',
          numerator: {
            fieldId: createdTargetField.id,
            expression: 'SUM({field})',
            standardPackId: testPackId,
            description: 'Target field',
          },
          denominator: {
            fieldId: createdIntermediateField.id,
            expression: 'COUNT({field})',
            standardPackId: testPackId,
            description: 'Intermediate field',
          },
          governanceTier: 'tier_3' as const,
          owner: null,
          steward: null,
          entityUrn: `urn:metadata:kpi:lineage_kpi_${Date.now()}`,
          domain: null,
          tags: [],
        };
        const createdKPI = await compositeKpiService.createKPI(null, kpiData);

        // Step 4: Trace upstream lineage from KPI
        if (createdKPI.entityUrn) {
          const upstreamLineage = await lineageService.getLineageGraph(null, createdKPI.entityUrn, {
            depth: 10,
            direction: 'upstream',
          });
          expect(upstreamLineage).toBeDefined();
          expect(upstreamLineage.nodes.length).toBeGreaterThan(0);
        }

        // Step 5: Trace downstream lineage from source
        if (createdSourceTerm.entityUrn) {
          const downstreamLineage = await lineageService.getLineageGraph(null, createdSourceTerm.entityUrn, {
            depth: 10,
            direction: 'downstream',
          });
          expect(downstreamLineage).toBeDefined();
          expect(downstreamLineage.nodes.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('KPI Creation and Validation Workflow', () => {
    it('should create, validate, and manage KPIs end-to-end', async () => {
      await withTestTransaction(async (db) => {
        // Step 1: Get standard pack
        const packs = await standardPackRepository.listByTenant(null);
        const testPackId = packs[0].id;

        // Step 2: Create numerator and denominator fields
        const numeratorField = createTestFieldDictionary({
          label: 'KPI Test Numerator',
          canonicalKey: `kpi_numerator_${Date.now()}`,
          dataType: 'number',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        });
        const createdNumerator = await metadataService.createFieldDictionary(null, numeratorField);

        const denominatorField = createTestFieldDictionary({
          label: 'KPI Test Denominator',
          canonicalKey: `kpi_denominator_${Date.now()}`,
          dataType: 'number',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        });
        const createdDenominator = await metadataService.createFieldDictionary(null, denominatorField);

        // Step 3: Create KPI
        const kpiData = {
          canonicalKey: `e2e_kpi_${Date.now()}`,
          name: 'E2E Test KPI',
          description: 'End-to-end KPI test',
          numerator: {
            fieldId: createdNumerator.id,
            expression: 'SUM({field})',
            standardPackId: testPackId,
            description: 'Numerator',
          },
          denominator: {
            fieldId: createdDenominator.id,
            expression: 'COUNT({field})',
            standardPackId: testPackId,
            description: 'Denominator',
          },
          governanceTier: 'tier_3' as const,
          owner: null,
          steward: null,
          entityUrn: `urn:metadata:kpi:e2e_kpi_${Date.now()}`,
          domain: 'finance',
          tags: ['test', 'e2e'],
        };

        const createdKPI = await compositeKpiService.createKPI(null, kpiData);
        expect(createdKPI).toBeDefined();
        expect(createdKPI.id).toBeDefined();

        // Step 4: Validate KPI
        const validation = await compositeKpiService.validateKPI(null, createdKPI);
        expect(validation.isValid).toBe(true);
        expect(validation.violations.length).toBe(0);
        expect(validation.numeratorValidation.hasField).toBe(true);
        expect(validation.denominatorValidation.hasField).toBe(true);

        // Step 5: Retrieve KPI
        const retrievedKPI = await compositeKpiService.getKPI(tenantId, createdKPI.id);
        expect(retrievedKPI).not.toBeNull();
        expect(retrievedKPI?.id).toBe(createdKPI.id);
        expect(retrievedKPI?.canonicalKey).toBe(kpiData.canonicalKey);

        // Step 6: List KPIs
        const kpiList = await compositeKpiService.listKPIs(tenantId, {
          governanceTier: 'tier_3',
        });
        expect(kpiList.length).toBeGreaterThan(0);
        expect(kpiList.some(k => k.id === createdKPI.id)).toBe(true);

        // Step 7: Update KPI
        const updatedKPI = await compositeKpiService.updateKPI(tenantId, createdKPI.id, {
          description: 'Updated E2E test KPI',
        });
        expect(updatedKPI).not.toBeNull();
        expect(updatedKPI?.description).toBe('Updated E2E test KPI');

        // Step 8: Get KPI by canonical key
        const kpiByKey = await compositeKpiService.getKPIByCanonicalKey(tenantId, kpiData.canonicalKey);
        expect(kpiByKey).not.toBeNull();
        expect(kpiByKey?.id).toBe(createdKPI.id);
      });
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should handle errors gracefully and recover', async () => {
      await withTestTransaction(async (db) => {
        // Step 1: Try to create KPI with invalid field ID (should fail)
        const packs = await standardPackRepository.listByTenant(null);
        const testPackId = packs[0].id;
        const invalidFieldId = '00000000-0000-0000-0000-000000000000';

        const invalidKpiData = {
          canonicalKey: `invalid_kpi_${Date.now()}`,
          name: 'Invalid KPI',
          description: 'Should fail',
          numerator: {
            fieldId: invalidFieldId,
            expression: 'SUM({field})',
            standardPackId: testPackId,
            description: 'Invalid numerator',
          },
          denominator: {
            fieldId: invalidFieldId,
            expression: 'COUNT({field})',
            standardPackId: testPackId,
            description: 'Invalid denominator',
          },
          governanceTier: 'tier_3' as const,
          owner: null,
          steward: null,
          entityUrn: `urn:metadata:kpi:invalid_kpi_${Date.now()}`,
          domain: null,
          tags: [],
        };

        // Should fail validation
        const validation = await compositeKpiService.validateKPI(tenantId, invalidKpiData);
        expect(validation.isValid).toBe(false);
        expect(validation.violations.length).toBeGreaterThan(0);

        // Step 2: Create valid fields and retry
        const validNumerator = createTestFieldDictionary({
          label: 'Valid Numerator',
          canonicalKey: `valid_numerator_${Date.now()}`,
          dataType: 'number',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        });
        const createdNumerator = await metadataService.createFieldDictionary(tenantId, validNumerator);

        const validDenominator = createTestFieldDictionary({
          label: 'Valid Denominator',
          canonicalKey: `valid_denominator_${Date.now()}`,
          dataType: 'number',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        });
        const createdDenominator = await metadataService.createFieldDictionary(tenantId, validDenominator);

        // Step 3: Create valid KPI (should succeed)
        const validKpiData = {
          ...invalidKpiData,
          numerator: {
            ...invalidKpiData.numerator,
            fieldId: createdNumerator.id,
          },
          denominator: {
            ...invalidKpiData.denominator,
            fieldId: createdDenominator.id,
          },
        };

        const validValidation = await compositeKpiService.validateKPI(tenantId, validKpiData);
        expect(validValidation.isValid).toBe(true);

        const createdKPI = await compositeKpiService.createKPI(tenantId, validKpiData);
        expect(createdKPI).toBeDefined();
        expect(createdKPI.id).toBeDefined();
      });
    });
  });

  describe('Cross-Service Integration', () => {
    it('should integrate all services in a complex workflow', async () => {
      await withTestTransaction(async (db) => {
        // Step 1: Create metadata entities
        const packs = await standardPackRepository.listByTenant(null);
        const testPackId = packs[0].id;

        const term = await metadataService.createBusinessTerm(null, createTestBusinessTerm({
          label: 'Cross-Service Term',
          canonicalKey: `cross_service_term_${Date.now()}`,
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
        }));

        const field = await metadataService.createFieldDictionary(null, createTestFieldDictionary({
          label: 'Cross-Service Field',
          canonicalKey: `cross_service_field_${Date.now()}`,
          dataType: 'number',
          governanceTier: 'tier_3',
          standardPackIdPrimary: testPackId,
          businessTermId: term.id,
        }));

        // Step 2: Search for created entities
        const searchResults = await metadataSearchService.search(tenantId, 'Cross-Service', {}, {});
        expect(searchResults.results.length).toBeGreaterThan(0);

        // Step 3: Create lineage
        if (term.entityUrn && field.entityUrn) {
          const lineageEdge = await lineageService.addEdge(
            null,
            term.entityUrn,
            field.entityUrn,
            'produces'
          );
          expect(lineageEdge).toBeDefined();
        }

        // Step 4: Analyze impact
        if (term.entityUrn) {
          const impact = await impactAnalysisService.analyzeImpact(null, {
            entityUrn: term.entityUrn,
            changeType: 'update',
            description: 'Cross-service test',
          });
          expect(impact).toBeDefined();
        }

        // Step 5: Verify all services work together
        const retrievedTerm = await metadataService.getBusinessTerm(null, term.id);
        expect(retrievedTerm).not.toBeNull();

        const retrievedField = await metadataService.getFieldDictionary(null, field.id);
        expect(retrievedField).not.toBeNull();
      });
    });
  });
});

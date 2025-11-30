/**
 * Test Fixtures
 * 
 * Reusable test data for Metadata Studio MCP tests
 */

import { randomUUID } from 'node:crypto';

/**
 * Generate test tenant ID
 */
export function createTestTenantId(): string {
  return randomUUID();
}

/**
 * Test business term fixture
 */
export function createTestBusinessTerm(overrides?: Partial<any>) {
  return {
    canonicalKey: `test_term_${Date.now()}`,
    label: 'Test Business Term',
    description: 'A test business term for MCP testing',
    domain: 'finance',
    module: 'GL', // Required field
    governanceTier: 'tier_3' as const,
    standardPackIdPrimary: null, // Required but nullable
    standardPackIdSecondary: [], // Required array field
    entityUrn: `urn:metadata:business_term:test_term_${Date.now()}`, // Required but nullable
    owner: 'test-user-1',
    steward: 'test-user-2',
    ...overrides,
  };
}

/**
 * Test data contract fixture
 */
export function createTestDataContract(overrides?: Partial<any>) {
  return {
    canonicalKey: `test_contract_${Date.now()}`,
    name: 'Test Data Contract',
    description: 'A test data contract for MCP testing',
    sourceSystem: 'TEST_SYSTEM', // Required field
    governanceTier: 'tier_3' as const,
    standardPackIdPrimary: null, // Required but nullable
    standardPackIdSecondary: [], // Required array field
    entityUrn: `urn:metadata:data_contract:test_contract_${Date.now()}`, // Required but nullable
    schema: {}, // Required field
    owner: 'test-user-1',
    steward: 'test-user-2',
    ...overrides,
  };
}

/**
 * Test field dictionary fixture
 */
export function createTestFieldDictionary(overrides?: Partial<any>) {
  return {
    canonicalKey: `test_field_${Date.now()}`,
    label: 'Test Field',
    description: 'A test field for MCP testing',
    dataType: 'string' as const, // Required field
    format: null, // Required but nullable
    unit: null, // Required but nullable
    businessTermId: null, // Required but nullable
    dataContractId: null, // Required but nullable
    constraints: {}, // Required field
    examples: [], // Required array field
    governanceTier: 'tier_3' as const,
    standardPackIdPrimary: null, // Required but nullable
    standardPackIdSecondary: [], // Required array field
    entityUrn: `urn:metadata:field_dictionary:test_field_${Date.now()}`, // Required but nullable
    owner: 'test-user-1',
    steward: 'test-user-2',
    ...overrides,
  };
}

/**
 * Test KPI fixture
 */
export function createTestKPI(numeratorFieldId: string, denominatorFieldId: string, standardPackId: string, overrides?: Partial<any>) {
  return {
    canonicalKey: `test_kpi_${Date.now()}`,
    name: 'Test KPI',
    description: 'A test KPI for MCP testing',
    numerator: {
      fieldId: numeratorFieldId,
      expression: 'SUM(revenue)',
      standardPackId,
      description: 'Total revenue',
    },
    denominator: {
      fieldId: denominatorFieldId,
      expression: 'SUM(cost)',
      standardPackId,
      description: 'Total cost',
    },
    governanceTier: 'tier_3' as const,
    owner: 'test-user-1',
    steward: 'test-user-2',
    domain: 'finance',
    ...overrides,
  };
}

/**
 * Test standard pack fixture
 */
export function createTestStandardPack(overrides?: Partial<any>) {
  return {
    name: `TEST_PACK_${Date.now()}`,
    version: '1.0.0',
    standardType: 'CUSTOM' as const,
    description: 'A test standard pack',
    definition: { test: true },
    isDeprecated: false,
    ...overrides,
  };
}

/**
 * Test search query fixture
 */
export function createTestSearchQuery(overrides?: Partial<any>) {
  return {
    query: 'test',
    filters: {
      governanceTier: 'tier_3' as const,
    },
    options: {
      limit: 10,
      offset: 0,
    },
    ...overrides,
  };
}


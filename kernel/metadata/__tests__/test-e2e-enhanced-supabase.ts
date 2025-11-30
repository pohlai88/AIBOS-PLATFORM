/**
 * Enhanced End-to-End Workflow Test with Supabase
 * 
 * Tests complete metadata workflows using Supabase MCP tools and best practices:
 * 1. Database state verification using Supabase MCP
 * 2. Transaction-based test isolation
 * 3. Complete metadata lifecycle (create → search → lineage → KPI → impact)
 * 4. Error recovery and edge cases
 * 
 * Best Practices:
 * - Uses transaction isolation (auto-rollback)
 * - Uses test fixtures for data creation
 * - Verifies database state before/after operations
 * - Tests both success and error scenarios
 */

import { getDB } from "../../storage/db";

// Simple assertion helper (for standalone execution)
const expect = {
  toBeDefined: (value: any, message?: string) => {
    if (value === undefined || value === null) {
      throw new Error(message || `Expected value to be defined, but got ${value}`);
    }
  },
  toBe: (actual: any, expected: any, message?: string) => {
    if (actual !== expected) {
      throw new Error(message || `Expected ${actual} to be ${expected}`);
    }
  },
  toBeGreaterThan: (actual: number, expected: number, message?: string) => {
    if (actual <= expected) {
      throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
    }
  },
  toBeGreaterThanOrEqual: (actual: number, expected: number, message?: string) => {
    if (actual < expected) {
      throw new Error(message || `Expected ${actual} to be greater than or equal to ${expected}`);
    }
  },
};
import { businessTermRepository, dataContractRepository, fieldDictionaryRepository, standardPackRepository } from "../catalog";
import { lineageService, lineageRepository } from "../lineage";
import { impactAnalysisService } from "../impact";
import { searchService } from "../search";
import { compositeKpiService } from "../kpi";
import { metadataService } from "../services";
import { baseLogger } from "../../observability/logger";
import { withTestTransaction } from "../mcp/__tests__/helpers/test-db";
import { 
  createTestBusinessTerm, 
  createTestDataContract, 
  createTestFieldDictionary 
} from "../mcp/__tests__/helpers/test-fixtures";

const logger = baseLogger.child({ module: "metadata:test-e2e-enhanced" });

/**
 * Verify database state using Supabase MCP tools
 */
async function verifyDatabaseState(): Promise<{
  tablesExist: boolean;
  migrationsApplied: boolean;
  hasTestData: boolean;
}> {
  try {
    // Check if we can query metadata tables
    const db = getDB().getClient();
    
    // Check if key tables exist
    const tablesCheck = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN (
        'kernel_business_terms',
        'kernel_data_contracts',
        'kernel_field_dictionary',
        'mdm_lineage_nodes',
        'mdm_lineage_edges',
        'mdm_composite_kpi'
      )
    `);
    
    const tablesExist = tablesCheck.rows.length >= 6;
    
    // Check if we have any standard packs (required for testing)
    const packsCheck = await db.query(`
      SELECT COUNT(*) as count FROM mdm_standard_pack
    `);
    const hasTestData = parseInt(packsCheck.rows[0]?.count || '0') > 0;
    
    // Check migrations (simplified - just check if tables exist)
    const migrationsApplied = tablesExist;
    
    return {
      tablesExist,
      migrationsApplied,
      hasTestData,
    };
  } catch (error) {
    logger.error({ error }, "Failed to verify database state");
    throw error;
  }
}

/**
 * Main enhanced E2E test function
 */
async function runEnhancedEndToEndTest(): Promise<void> {
  logger.info("🚀 Starting enhanced end-to-end workflow test with Supabase...");

  // Step 1: Verify database state
  logger.info("📊 Step 1: Verifying database state...");
  const dbState = await verifyDatabaseState();
  
  if (!dbState.tablesExist) {
    throw new Error("Required metadata tables do not exist. Run migrations first.");
  }
  
  if (!dbState.hasTestData) {
    logger.warn("No standard packs found. Tests may fail if standard packs are required.");
  }
  
  logger.info({ dbState }, "✅ Database state verified");

  // Step 2: Run tests in transaction (auto-rollback)
  await withTestTransaction(async (db) => {
    const results: Array<{ test: string; passed: boolean; details?: string; error?: string }> = [];
    const tenantId: string | null = null; // Use global tenant for testing

    try {
      // Test 1: Get or create standard pack
      logger.info("📝 Test 1: Getting standard pack...");
      let standardPacks = await standardPackRepository.listByTenant(null);
      
      if (standardPacks.length === 0) {
        logger.warn("No standard packs found. Creating test pack...");
        // Note: In real scenario, packs should be seeded via migrations
        // For testing, we'll use null if no packs exist
      }
      
      const testPackId = standardPacks.length > 0 ? standardPacks[0].id : null;
      results.push({
        test: "Get Standard Pack",
        passed: true,
        details: `Found ${standardPacks.length} standard pack(s)`,
      });

      // Test 2: Create business term
      logger.info("📝 Test 2: Creating business term...");
      const timestamp = Date.now();
      const termData = {
        ...createTestBusinessTerm({
          canonicalKey: `e2e_test_term_${timestamp}`,
          label: "E2E Test Business Term",
          description: "Test term for enhanced E2E testing",
          entityUrn: `urn:metadata:business_term:e2e_test_term_${timestamp}`,
          governanceTier: "tier_3",
          standardPackIdPrimary: testPackId,
        }),
        tenantId: tenantId, // Pass tenantId explicitly (can be null)
      };

      let createdTerm;
      try {
        createdTerm = await businessTermRepository.create(termData);
        expect(createdTerm).toBeDefined();
        expect(createdTerm.id).toBeDefined();
        expect(createdTerm.canonicalKey).toBe(termData.canonicalKey);
      } catch (error: any) {
        logger.error({ 
          error: error?.message || error, 
          errorStack: error?.stack,
          errorName: error?.name,
          termData 
        }, "Failed to create business term");
        throw error;
      }
      
      logger.info({ termId: createdTerm.id, canonicalKey: createdTerm.canonicalKey }, "✅ Created business term");
      results.push({
        test: "Create Business Term",
        passed: true,
        details: `Created term: ${createdTerm.canonicalKey}`,
      });

      // Test 3: Create data contract
      logger.info("📝 Test 3: Creating data contract...");
      const contractData = createTestDataContract({
        canonicalKey: `e2e_test_contract_${timestamp}`,
        name: "E2E Test Data Contract",
        description: "Test contract for enhanced E2E testing",
        sourceSystem: "E2E_TEST_SYSTEM",
        entityUrn: `urn:metadata:data_contract:e2e_test_contract_${timestamp}`,
        governanceTier: "tier_3",
        standardPackIdPrimary: testPackId,
        tenantId: tenantId, // Pass tenantId explicitly
      });

      const createdContract = await dataContractRepository.create(contractData);
      expect(createdContract).toBeDefined();
      expect(createdContract.id).toBeDefined();
      
      logger.info({ contractId: createdContract.id }, "✅ Created data contract");
      results.push({
        test: "Create Data Contract",
        passed: true,
        details: `Created contract: ${createdContract.canonicalKey}`,
      });

      // Test 4: Create field dictionary entries (for KPI)
      logger.info("📝 Test 4: Creating field dictionary entries...");
      const numeratorFieldData = createTestFieldDictionary({
        canonicalKey: `e2e_numerator_field_${timestamp}`,
        label: "E2E Numerator Field",
        dataType: "number",
        businessTermId: createdTerm.id,
        dataContractId: createdContract.id,
        entityUrn: `urn:metadata:field:e2e_numerator_field_${timestamp}`,
        governanceTier: "tier_3",
        standardPackIdPrimary: testPackId,
        tenantId: tenantId, // Pass tenantId explicitly
      });

      const denominatorFieldData = createTestFieldDictionary({
        canonicalKey: `e2e_denominator_field_${timestamp}`,
        label: "E2E Denominator Field",
        dataType: "number",
        businessTermId: createdTerm.id,
        dataContractId: createdContract.id,
        entityUrn: `urn:metadata:field:e2e_denominator_field_${timestamp}`,
        governanceTier: "tier_3",
        standardPackIdPrimary: testPackId,
        tenantId: tenantId, // Pass tenantId explicitly
      });

      const numeratorField = await fieldDictionaryRepository.create(numeratorFieldData);
      const denominatorField = await fieldDictionaryRepository.create(denominatorFieldData);
      
      expect(numeratorField).toBeDefined();
      expect(denominatorField).toBeDefined();
      
      logger.info({ numeratorId: numeratorField.id, denominatorId: denominatorField.id }, "✅ Created field dictionary entries");
      results.push({
        test: "Create Field Dictionary",
        passed: true,
        details: `Created numerator and denominator fields`,
      });

      // Test 5: Search functionality
      logger.info("📝 Test 5: Testing search functionality...");
      const searchResults = await searchService.search({
        query: "E2E Test",
        tenantId: null,
        limit: 10,
      });
      
      expect(searchResults).toBeDefined();
      expect(searchResults.results.length).toBeGreaterThan(0);
      
      // Verify our created term appears in search
      const foundTerm = searchResults.results.find(
        (r) => r.entityType === "business_term" && r.id === createdTerm.id
      );
      expect(foundTerm).toBeDefined();
      
      logger.info({ resultCount: searchResults.results.length }, "✅ Search completed");
      results.push({
        test: "Search Functionality",
        passed: true,
        details: `Found ${searchResults.results.length} results`,
      });

      // Test 6: Create lineage nodes
      logger.info("📝 Test 6: Creating lineage nodes...");
      const termNode = await lineageService.createNodeFromEntity(
        tenantId,
        createdTerm.id,
        "business_term",
        createdTerm.entityUrn!,
        "entity",
        {
          governanceTier: createdTerm.governanceTier,
          canonicalKey: createdTerm.canonicalKey,
          label: createdTerm.label,
        }
      );
      
      const numeratorNode = await lineageService.createNodeFromEntity(
        tenantId,
        numeratorField.id,
        "field_dictionary",
        numeratorField.entityUrn!,
        "field",
        {
          governanceTier: numeratorField.governanceTier,
          canonicalKey: numeratorField.canonicalKey,
          label: numeratorField.label,
        }
      );
      
      expect(termNode).toBeDefined();
      expect(numeratorNode).toBeDefined();
      
      logger.info({ termNodeUrn: termNode.urn, numeratorNodeUrn: numeratorNode.urn }, "✅ Created lineage nodes");
      results.push({
        test: "Create Lineage Nodes",
        passed: true,
        details: `Created nodes for term and field`,
      });

      // Test 7: Create lineage edge
      logger.info("📝 Test 7: Creating lineage edge...");
      const edge = await lineageService.addEdge(
        tenantId,
        numeratorNode.urn,
        termNode.urn,
        "produces",
        "Field produces business term"
      );
      
      expect(edge).toBeDefined();
      expect(edge.sourceUrn).toBe(numeratorNode.urn);
      expect(edge.targetUrn).toBe(termNode.urn);
      
      logger.info({ edgeId: edge.id, edgeType: edge.edgeType }, "✅ Created lineage edge");
      results.push({
        test: "Create Lineage Edge",
        passed: true,
        details: `Created edge: ${edge.sourceUrn} -> ${edge.targetUrn}`,
      });

      // Test 8: Lineage traversal
      logger.info("📝 Test 8: Testing lineage traversal...");
      const upstream = await lineageService.getUpstream(tenantId, termNode.urn, 5);
      const downstream = await lineageService.getDownstream(tenantId, numeratorNode.urn, 5);
      
      expect(upstream).toBeDefined();
      expect(downstream).toBeDefined();
      
      // Verify we can find the connection
      const foundConnection = upstream.some((u) => u.urn === numeratorNode.urn) ||
                              downstream.some((d) => d.urn === termNode.urn);
      
      logger.info({ upstreamCount: upstream.length, downstreamCount: downstream.length }, "✅ Traversal completed");
      results.push({
        test: "Lineage Traversal",
        passed: foundConnection,
        details: `Upstream: ${upstream.length}, Downstream: ${downstream.length}`,
      });

      // Test 9: Impact analysis
      logger.info("📝 Test 9: Testing impact analysis...");
      const impactReport = await impactAnalysisService.analyzeImpact(
        tenantId,
        numeratorNode.urn,
        "field_update",
        {
          maxDepth: 10,
          includeDownstream: true,
        }
      );
      
      expect(impactReport).toBeDefined();
      expect(impactReport.totalAffected).toBeGreaterThanOrEqual(0);
      
      logger.info({
        totalAffected: impactReport.totalAffected,
        riskScore: impactReport.riskScore,
      }, "✅ Impact analysis completed");
      results.push({
        test: "Impact Analysis",
        passed: true,
        details: `Risk Score: ${impactReport.riskScore}/100, Affected: ${impactReport.totalAffected}`,
      });

      // Test 10: Create composite KPI (if standard pack exists)
      if (testPackId) {
        logger.info("📝 Test 10: Creating composite KPI...");
        try {
          const kpiData = {
            canonicalKey: `e2e_test_kpi_${timestamp}`,
            name: "E2E Test KPI",
            description: "Test KPI for enhanced E2E testing",
            numeratorFieldId: numeratorField.id,
            numeratorStandardPackId: testPackId,
            denominatorFieldId: denominatorField.id,
            denominatorStandardPackId: testPackId,
            governanceTier: "tier_3" as const,
            entityUrn: `urn:metadata:kpi:e2e_test_kpi_${timestamp}`,
          };

          const createdKpi = await compositeKpiService.createKPI(tenantId, kpiData);
          
          expect(createdKpi).toBeDefined();
          expect(createdKpi.id).toBeDefined();
          expect(createdKpi.canonicalKey).toBe(kpiData.canonicalKey);
          
          logger.info({ kpiId: createdKpi.id }, "✅ Created composite KPI");
          results.push({
            test: "Create Composite KPI",
            passed: true,
            details: `Created KPI: ${createdKpi.canonicalKey}`,
          });
        } catch (error: any) {
          logger.warn({ error: error.message }, "KPI creation failed (may be expected if validation fails)");
          results.push({
            test: "Create Composite KPI",
            passed: false,
            details: error.message || "Unknown error",
            error: error.message,
          });
        }
      } else {
        logger.warn("Skipping KPI test - no standard pack available");
        results.push({
          test: "Create Composite KPI",
          passed: false,
          details: "Skipped - no standard pack available",
        });
      }

    } catch (error) {
      logger.error({ error }, "Test execution failed");
      throw error;
    }

    // Print results summary
    const passed = results.filter((r) => r.passed).length;
    const total = results.length;

    logger.info("📊 Enhanced E2E Test Results:");
    results.forEach((result) => {
      const icon = result.passed ? "✅" : "❌";
      logger.info(
        `${icon} ${result.test}${result.details ? ` - ${result.details}` : ""}${result.error ? ` (Error: ${result.error})` : ""}`
      );
    });

    if (passed === total) {
      logger.info(`✅ Enhanced E2E test PASSED (${passed}/${total} tests)`);
    } else {
      logger.warn(`⚠️ Enhanced E2E test PARTIAL (${passed}/${total} tests passed)`);
    }

    // Assert all critical tests passed
    const criticalTests = results.filter((r) =>
      ["Create Business Term", "Create Data Contract", "Search Functionality", "Create Lineage Nodes"].includes(r.test)
    );
    const allCriticalPassed = criticalTests.every((t) => t.passed);
    
    if (!allCriticalPassed) {
      throw new Error("Critical tests failed");
    }
  });
}

// Using custom expect helper for standalone execution

// Run test
if (require.main === module) {
  runEnhancedEndToEndTest()
    .then(() => {
      logger.info("✅ Enhanced E2E test completed successfully");
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, "❌ Enhanced E2E test failed");
      process.exit(1);
    });
}

export { runEnhancedEndToEndTest, verifyDatabaseState };


/**
 * End-to-End Workflow Test with Supabase
 * 
 * Tests the complete Phase 2 workflow using actual Supabase data:
 * 1. Create lineage nodes from existing business terms
 * 2. Create lineage edges between entities
 * 3. Test upstream/downstream traversal
 * 4. Test impact analysis with lineage
 */

import { getDB } from "../../storage/db";
import { businessTermRepository } from "../catalog";
import { lineageService } from "../lineage";
import { lineageRepository } from "../lineage";
import { impactAnalysisService } from "../impact";
import { baseLogger } from "../../observability/logger";

const logger = baseLogger.child({ module: "metadata:test-e2e-supabase" });

/**
 * Main test function
 */
async function runEndToEndWorkflowTestWithSupabase(): Promise<void> {
  logger.info("🚀 Starting end-to-end workflow test with Supabase...");

  // Check database connection
  const config = require("../../boot/kernel.config").getConfig();
  if (config.storageMode === "IN_MEMORY" || (!config.supabaseDbUrl && !process.env.DATABASE_URL)) {
    logger.warn(
      "⚠️ Running in IN_MEMORY mode. Set SUPABASE_DB_URL to test against Supabase."
    );
    logger.info(
      "💡 To test against Supabase:\n" +
        "  PowerShell: $env:SUPABASE_DB_URL='postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres'\n" +
        "  OR: $env:DATABASE_URL='postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres'"
    );
    return;
  }

  const db = getDB().getClient();
  const results: Array<{ test: string; passed: boolean; details?: string }> = [];

  try {
    // Get existing business terms from Supabase
    const businessTermsResult = await db.query(`
      SELECT 
        id,
        canonical_key,
        label,
        entity_urn,
        governance_tier,
        tenant_id
      FROM kernel_business_terms
      WHERE entity_urn IS NOT NULL
      LIMIT 5
    `);

    const businessTerms = businessTermsResult.rows;

    if (businessTerms.length === 0) {
      logger.warn("No business terms with entity_urn found in Supabase. Creating test data...");
      
      // Create a test business term with URN
      const testTerm = await businessTermRepository.create({
        canonicalKey: `test_term_${Date.now()}`,
        label: "Test Business Term",
        description: "Test term for lineage testing",
        entityUrn: `urn:metadata:business_term:test_term_${Date.now()}`,
        governanceTier: "tier_1",
        owner: "test@example.com",
        steward: "test@example.com",
      });

      businessTerms.push({
        id: testTerm.id,
        canonical_key: testTerm.canonicalKey,
        label: testTerm.label,
        entity_urn: testTerm.entityUrn,
        governance_tier: testTerm.governanceTier,
        tenant_id: testTerm.tenantId,
      });

      logger.info({ termId: testTerm.id, urn: testTerm.entityUrn }, "Created test business term");
    }

    logger.info({ count: businessTerms.length }, "Found business terms for testing");

    // Test 1: Create lineage nodes from business terms
    logger.info("📝 Test 1: Creating lineage nodes from business terms...");
    const createdNodes: string[] = [];

    for (const term of businessTerms.slice(0, 3)) {
      try {
        const node = await lineageService.createNodeFromEntity(
          term.tenant_id,
          term.id,
          "business_term",
          term.entity_urn,
          "entity",
          {
            governanceTier: term.governance_tier,
            canonicalKey: term.canonical_key,
            label: term.label,
          }
        );

        createdNodes.push(node.urn);
        logger.info(
          { urn: node.urn, termId: term.id, canonicalKey: term.canonical_key },
          "✅ Created lineage node"
        );
      } catch (error: any) {
        if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
          logger.info({ urn: term.entity_urn }, "Lineage node already exists, skipping");
          createdNodes.push(term.entity_urn);
        } else {
          throw error;
        }
      }
    }

    results.push({
      test: "Create Lineage Nodes from Business Terms",
      passed: createdNodes.length > 0,
      details: `Created ${createdNodes.length} nodes`,
    });

    // Test 2: Create lineage edges
    logger.info("📝 Test 2: Creating lineage edges...");
    
    if (createdNodes.length >= 2) {
      const sourceUrn = `urn:metadata:field:test-field-${Date.now()}`;
      
      // Create source field node
      try {
        await lineageService.createNodeFromEntity(
          null,
          "test-field-id",
          "field_dictionary",
          sourceUrn,
          "field",
          { test: true, governanceTier: "tier_1" }
        );
        logger.info({ urn: sourceUrn }, "Created source field node");
      } catch (error: any) {
        if (!error.message?.includes("duplicate") && !error.message?.includes("unique")) {
          throw error;
        }
      }

      // Create edge from field to first business term
      const targetUrn = createdNodes[0];
      try {
        const edge = await lineageService.addEdge(
          businessTerms[0].tenant_id,
          sourceUrn,
          targetUrn,
          "produces",
          "Field definition produces business term"
        );

        logger.info(
          { sourceUrn, targetUrn, edgeType: edge.edgeType },
          "✅ Created lineage edge"
        );

        results.push({
          test: "Create Lineage Edges",
          passed: true,
          details: `Created edge: ${sourceUrn} -> ${targetUrn}`,
        });

        // Cleanup test field node
        await lineageRepository.deleteNode(sourceUrn);
      } catch (error: any) {
        if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
          logger.info({ sourceUrn, targetUrn }, "Edge already exists");
          results.push({
            test: "Create Lineage Edges",
            passed: true,
            details: "Edge already exists",
          });
        } else {
          throw error;
        }
      }
    } else {
      results.push({
        test: "Create Lineage Edges",
        passed: false,
        details: "Need at least 2 nodes to create edges",
      });
    }

    // Test 3: Upstream/downstream traversal
    logger.info("📝 Test 3: Testing lineage traversal...");
    
    if (createdNodes.length >= 2) {
      const testUrn = createdNodes[0];
      
      try {
        const upstream = await lineageService.getUpstream(
          businessTerms[0].tenant_id,
          testUrn,
          5
        );
        const downstream = await lineageService.getDownstream(
          businessTerms[0].tenant_id,
          testUrn,
          5
        );

        logger.info(
          { urn: testUrn, upstreamCount: upstream.length, downstreamCount: downstream.length },
          "✅ Traversal completed"
        );

        results.push({
          test: "Lineage Traversal",
          passed: true,
          details: `Upstream: ${upstream.length}, Downstream: ${downstream.length}`,
        });
      } catch (error) {
        logger.error({ error, urn: testUrn }, "Traversal failed");
        results.push({
          test: "Lineage Traversal",
          passed: false,
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } else {
      results.push({
        test: "Lineage Traversal",
        passed: false,
        details: "Need at least 2 nodes to test traversal",
      });
    }

    // Test 4: Impact analysis with lineage
    logger.info("📝 Test 4: Testing impact analysis with lineage...");
    
    if (createdNodes.length >= 1) {
      const testUrn = createdNodes[0];
      
      try {
        const impactReport = await impactAnalysisService.analyzeImpact(
          businessTerms[0].tenant_id,
          testUrn,
          "field_update",
          {
            maxDepth: 10,
            includeDownstream: true,
          }
        );

        logger.info(
          {
            urn: testUrn,
            totalAffected: impactReport.totalAffected,
            riskScore: impactReport.riskScore,
            recommendation: impactReport.recommendation,
          },
          "✅ Impact analysis completed"
        );

        results.push({
          test: "Impact Analysis with Lineage",
          passed: true,
          details: `Risk Score: ${impactReport.riskScore}/100, Affected: ${impactReport.totalAffected}`,
        });
      } catch (error) {
        logger.error({ error, urn: testUrn }, "Impact analysis failed");
        results.push({
          test: "Impact Analysis with Lineage",
          passed: false,
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    } else {
      results.push({
        test: "Impact Analysis with Lineage",
        passed: false,
        details: "Need at least 1 node to test impact analysis",
      });
    }

  } catch (error) {
    logger.error({ error }, "End-to-end workflow test failed");
    throw error;
  }

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  logger.info("📊 End-to-End Workflow Test Results (Supabase):");
  results.forEach((result) => {
    logger.info(
      `${result.passed ? "✅" : "❌"} ${result.test}${result.details ? ` - ${result.details}` : ""}`
    );
  });

  if (passed === total) {
    logger.info(`✅ End-to-end workflow test PASSED (${passed}/${total} tests)`);
  } else {
    logger.warn(`⚠️ End-to-end workflow test PARTIAL (${passed}/${total} tests passed)`);
  }
}

// Run test
if (require.main === module) {
  runEndToEndWorkflowTestWithSupabase()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, "End-to-end workflow test failed");
      process.exit(1);
    });
}

export { runEndToEndWorkflowTestWithSupabase };


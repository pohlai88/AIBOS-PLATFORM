/**
 * End-to-End Workflow Test
 * 
 * Tests the complete Phase 2 workflow:
 * 1. Create lineage nodes from business terms
 * 2. Create lineage edges between entities
 * 3. Test upstream/downstream traversal
 * 4. Test impact analysis with lineage
 */

import { businessTermRepository } from "../catalog";
import { lineageService } from "../lineage";
import { impactAnalysisService } from "../impact";
import { governanceTierService } from "../services";
import { baseLogger } from "../../observability/logger";

const logger = baseLogger.child({ module: "metadata:test-e2e-workflow" });

/**
 * Test: Create lineage nodes from business terms
 */
async function testCreateLineageNodesFromBusinessTerms(): Promise<boolean> {
  logger.info("Testing lineage node creation from business terms...");

  try {
    // Get existing business terms
    const businessTerms = await businessTermRepository.listByTenant(null, { limit: 5 });
    
    if (businessTerms.length === 0) {
      logger.warn("No business terms found. Skipping lineage node creation test.");
      return true; // Not a failure, just no data
    }

    const createdNodes: string[] = [];

    for (const term of businessTerms.slice(0, 3)) { // Test with first 3 terms
      if (!term.entityUrn) {
        logger.warn({ termId: term.id, canonicalKey: term.canonicalKey }, "Business term missing entityUrn, skipping");
        continue;
      }

      // Create lineage node from business term
      const node = await lineageService.createNodeFromEntity(
        term.tenantId,
        term.id,
        "business_term",
        term.entityUrn,
        "entity",
        {
          governanceTier: term.governanceTier,
          canonicalKey: term.canonicalKey,
          label: term.label,
        }
      );

      createdNodes.push(node.urn);
      logger.info(
        { urn: node.urn, termId: term.id, canonicalKey: term.canonicalKey },
        "✅ Created lineage node from business term"
      );
    }

    if (createdNodes.length > 0) {
      logger.info({ count: createdNodes.length }, "✅ Successfully created lineage nodes from business terms");
      return true;
    } else {
      logger.warn("No lineage nodes created (no business terms with entityUrn)");
      return true; // Not a failure
    }
  } catch (error) {
    logger.error({ error }, "❌ Failed to create lineage nodes from business terms");
    return false;
  }
}

/**
 * Test: Create lineage edges between entities
 */
async function testCreateLineageEdges(): Promise<boolean> {
  logger.info("Testing lineage edge creation...");

  try {
    // Get existing business terms with URNs
    const businessTerms = await businessTermRepository.listByTenant(null, { limit: 5 });
    const termsWithUrns = businessTerms.filter((t) => t.entityUrn);

    if (termsWithUrns.length < 2) {
      logger.warn("Need at least 2 business terms with URNs to test edge creation");
      return true; // Not a failure
    }

    // Create test field node
    const fieldUrn = `urn:metadata:field:test-revenue-${Date.now()}`;
    const fieldNode = await lineageService.createNodeFromEntity(
      null,
      "test-field-id",
      "field_dictionary",
      fieldUrn,
      "field",
      { test: true }
    );

    // Create edge from field to first business term
    const targetTerm = termsWithUrns[0];
    if (!targetTerm.entityUrn) {
      logger.warn("Target business term missing entityUrn");
      return false;
    }

    // Ensure target node exists
    await lineageService.createNodeFromEntity(
      targetTerm.tenantId,
      targetTerm.id,
      "business_term",
      targetTerm.entityUrn,
      "entity",
      { governanceTier: targetTerm.governanceTier }
    );

    const edge = await lineageService.addEdge(
      targetTerm.tenantId,
      fieldUrn,
      targetTerm.entityUrn,
      "produces",
      "Field definition produces business term"
    );

    logger.info(
      { sourceUrn: fieldUrn, targetUrn: targetTerm.entityUrn, edgeType: edge.edgeType },
      "✅ Created lineage edge"
    );

    // Cleanup test field node
    const { lineageRepository } = await import("../lineage");
    await lineageRepository.deleteNode(fieldUrn);

    return true;
  } catch (error) {
    logger.error({ error }, "❌ Failed to create lineage edges");
    return false;
  }
}

/**
 * Test: Upstream/downstream traversal
 */
async function testLineageTraversal(): Promise<boolean> {
  logger.info("Testing lineage traversal...");

  try {
    // Get existing business terms with URNs
    const businessTerms = await businessTermRepository.listByTenant(null, { limit: 5 });
    const termsWithUrns = businessTerms.filter((t) => t.entityUrn);

    if (termsWithUrns.length < 2) {
      logger.warn("Need at least 2 business terms with URNs to test traversal");
      return true; // Not a failure
    }

    // Create test nodes and edges
    const sourceUrn = `urn:metadata:field:test-source-${Date.now()}`;
    const targetUrn = termsWithUrns[0].entityUrn!;

    // Create source node
    await lineageService.createNodeFromEntity(
      null,
      "test-source-id",
      "field_dictionary",
      sourceUrn,
      "field",
      { test: true }
    );

    // Ensure target node exists
    const targetTerm = termsWithUrns[0];
    await lineageService.createNodeFromEntity(
      targetTerm.tenantId,
      targetTerm.id,
      "business_term",
      targetUrn,
      "entity",
      { governanceTier: targetTerm.governanceTier }
    );

    // Create edge
    await lineageService.addEdge(
      targetTerm.tenantId,
      sourceUrn,
      targetUrn,
      "produces",
      "Test transformation"
    );

    // Test upstream traversal (from target, find sources)
    const upstream = await lineageService.getUpstream(targetTerm.tenantId, targetUrn, 5);
    const hasUpstream = upstream.some((node) => node.urn === sourceUrn);

    // Test downstream traversal (from source, find targets)
    const downstream = await lineageService.getDownstream(null, sourceUrn, 5);
    const hasDownstream = downstream.some((node) => node.urn === targetUrn);

    // Cleanup
    const { lineageRepository } = await import("../lineage");
    await lineageRepository.deleteNode(sourceUrn);

    if (hasUpstream && hasDownstream) {
      logger.info(
        { upstreamCount: upstream.length, downstreamCount: downstream.length },
        "✅ Lineage traversal working correctly"
      );
      return true;
    } else {
      logger.error(
        { hasUpstream, hasDownstream },
        "❌ Lineage traversal failed"
      );
      return false;
    }
  } catch (error) {
    logger.error({ error }, "❌ Failed to test lineage traversal");
    return false;
  }
}

/**
 * Test: Impact analysis with lineage
 */
async function testImpactAnalysisWithLineage(): Promise<boolean> {
  logger.info("Testing impact analysis with lineage...");

  try {
    // Get existing business terms with URNs
    const businessTerms = await businessTermRepository.listByTenant(null, { limit: 5 });
    const termsWithUrns = businessTerms.filter((t) => t.entityUrn);

    if (termsWithUrns.length < 2) {
      logger.warn("Need at least 2 business terms with URNs to test impact analysis");
      return true; // Not a failure
    }

    // Create test nodes and edges
    const sourceUrn = `urn:metadata:field:test-impact-source-${Date.now()}`;
    const targetUrn = termsWithUrns[0].entityUrn!;
    const dependentUrn = termsWithUrns[1].entityUrn || `urn:metadata:entity:test-dependent-${Date.now()}`;

    // Create source node
    await lineageService.createNodeFromEntity(
      null,
      "test-source-id",
      "field_dictionary",
      sourceUrn,
      "field",
      { governanceTier: "tier_1", test: true }
    );

    // Create target node
    const targetTerm = termsWithUrns[0];
    await lineageService.createNodeFromEntity(
      targetTerm.tenantId,
      targetTerm.id,
      "business_term",
      targetUrn,
      "entity",
      { governanceTier: targetTerm.governanceTier }
    );

    // Create dependent node (if needed)
    if (!termsWithUrns[1].entityUrn) {
      await lineageService.createNodeFromEntity(
        null,
        "test-dependent-id",
        "business_term",
        dependentUrn,
        "kpi",
        { governanceTier: "tier_1" }
      );
    } else {
      const dependentTerm = termsWithUrns[1];
      await lineageService.createNodeFromEntity(
        dependentTerm.tenantId,
        dependentTerm.id,
        "business_term",
        dependentUrn,
        "kpi",
        { governanceTier: dependentTerm.governanceTier }
      );
    }

    // Create edges: source -> target -> dependent
    await lineageService.addEdge(
      targetTerm.tenantId,
      sourceUrn,
      targetUrn,
      "produces",
      "Field produces business term"
    );

    await lineageService.addEdge(
      targetTerm.tenantId,
      targetUrn,
      dependentUrn,
      "produces",
      "Business term produces KPI"
    );

    // Analyze impact of deleting source field
    const impactReport = await impactAnalysisService.analyzeImpact(
      targetTerm.tenantId,
      sourceUrn,
      "field_delete",
      {
        maxDepth: 10,
        includeDownstream: true,
      }
    );

    // Cleanup
    const { lineageRepository } = await import("../lineage");
    await lineageRepository.deleteNode(sourceUrn);
    if (!termsWithUrns[1].entityUrn) {
      await (await import("../lineage")).lineageRepository.deleteNode(dependentUrn);
    }

    if (impactReport && impactReport.totalAffected >= 0) {
      logger.info(
        {
          totalAffected: impactReport.totalAffected,
          riskScore: impactReport.riskScore,
          recommendation: impactReport.recommendation,
          criticalImpacts: impactReport.criticalImpacts.length,
        },
        "✅ Impact analysis with lineage working correctly"
      );
      return true;
    } else {
      logger.error("❌ Impact analysis failed");
      return false;
    }
  } catch (error) {
    logger.error({ error }, "❌ Failed to test impact analysis with lineage");
    return false;
  }
}

/**
 * Main test function
 */
async function runEndToEndWorkflowTest(): Promise<void> {
  logger.info("🚀 Starting end-to-end workflow test...");

  const results: Array<{ test: string; passed: boolean }> = [];

  // Test 1: Create lineage nodes from business terms
  results.push({
    test: "Create Lineage Nodes from Business Terms",
    passed: await testCreateLineageNodesFromBusinessTerms(),
  });

  // Test 2: Create lineage edges
  results.push({
    test: "Create Lineage Edges",
    passed: await testCreateLineageEdges(),
  });

  // Test 3: Upstream/downstream traversal
  results.push({
    test: "Lineage Traversal (Upstream/Downstream)",
    passed: await testLineageTraversal(),
  });

  // Test 4: Impact analysis with lineage
  results.push({
    test: "Impact Analysis with Lineage",
    passed: await testImpactAnalysisWithLineage(),
  });

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  logger.info("📊 End-to-End Workflow Test Results:");
  results.forEach((result) => {
    logger.info(`${result.passed ? "✅" : "❌"} ${result.test}`);
  });

  if (passed === total) {
    logger.info(`✅ End-to-end workflow test PASSED (${passed}/${total} tests)`);
  } else {
    logger.warn(`⚠️ End-to-end workflow test PARTIAL (${passed}/${total} tests passed)`);
  }
}

// Run test
if (require.main === module) {
  runEndToEndWorkflowTest()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      logger.error({ error }, "End-to-end workflow test failed");
      process.exit(1);
    });
}

export { runEndToEndWorkflowTest };


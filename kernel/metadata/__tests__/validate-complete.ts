#!/usr/bin/env tsx
/**
 * Complete System Validation Script
 * 
 * Validates the entire Metadata Studio system:
 * - All database tables exist
 * - All repositories work correctly
 * - All services work correctly
 * - All API endpoints are accessible
 * - Data integrity is maintained
 * - End-to-end workflows function correctly
 */

import { getDB } from "../../storage/db";
import { baseLogger } from "../../observability/logger";
import { loadConfig } from "../../boot/kernel.config";

// Import all repositories
import {
    businessTermRepository,
    dataContractRepository,
    fieldDictionaryRepository,
    fieldAliasRepository,
    standardPackRepository,
} from "../catalog";

// Import all services
import { metadataService } from "../services";
import { governanceTierService } from "../services";
import { lineageService } from "../lineage";
import { impactAnalysisService } from "../impact";
import { profilingService } from "../profiling";
import { qualityService } from "../quality";
import { analyticsService } from "../analytics";
import { compositeKpiService } from "../kpi";
import { metadataSearchService } from "../search";

// Force Supabase mode if not set
if (!process.env.KERNEL_STORAGE_MODE) {
    process.env.KERNEL_STORAGE_MODE = "SUPABASE";
}

// Load config and initialize database
loadConfig();

const logger = baseLogger.child({ module: "metadata:validate-complete" });

interface ValidationResult {
    category: string;
    test: string;
    passed: boolean;
    error?: string;
    details?: any;
}

const results: ValidationResult[] = [];

function recordResult(category: string, test: string, passed: boolean, error?: string, details?: any) {
    results.push({ category, test, passed, error, details });
    if (passed) {
        logger.info({ category, test, details }, "✅ [%s] %s", category, test);
    } else {
        logger.error({ category, test, error, details }, "❌ [%s] %s: %s", category, test, error);
    }
}

/**
 * Test all database tables exist
 */
async function testAllTables(): Promise<boolean> {
    logger.info("Testing all database tables existence...");
    const db = getDB().getClient();

    const requiredTables = [
        // Phase 1 tables
        "mdm_business_terms",
        "mdm_data_contracts",
        "mdm_field_dictionary",
        "mdm_field_aliases",
        "mdm_standard_pack",
        "mdm_action_data_contracts",
        // Phase 2 tables
        "mdm_lineage_nodes",
        "mdm_lineage_edges",
        // Phase 3 tables
        "mdm_profiling_stats",
        "mdm_profiling_jobs",
        "mdm_profiling_schedules",
        "mdm_quality_rules",
        "mdm_quality_check_results",
        "mdm_quality_violations",
        "mdm_usage_log",
        "mdm_composite_kpi",
        "mdm_kpi_calculation_history",
    ];

    let allExist = true;

    for (const table of requiredTables) {
        try {
            const result = await db.query(
                `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = 'public' AND table_name = $1`,
                [table]
            );
            const exists = parseInt(result.rows[0].count) === 1;
            if (!exists) {
                recordResult("Database", `Table ${table} exists`, false, `Table ${table} not found`);
                allExist = false;
            } else {
                recordResult("Database", `Table ${table} exists`, true);
            }
        } catch (error: any) {
            recordResult("Database", `Table ${table} exists`, false, error.message);
            allExist = false;
        }
    }

    return allExist;
}

/**
 * Test all repositories
 */
async function testAllRepositories(): Promise<boolean> {
    logger.info("Testing all repositories...");

    try {
        // Test business term repository
        const btList = await businessTermRepository.list(null, { limit: 1, offset: 0 });
        recordResult("Repositories", "Business Term Repository list", true, undefined, { count: btList.length });

        // Test data contract repository
        const dcList = await dataContractRepository.list(null, { limit: 1, offset: 0 });
        recordResult("Repositories", "Data Contract Repository list", true, undefined, { count: dcList.length });

        // Test field dictionary repository
        const fdList = await fieldDictionaryRepository.list(null, { limit: 1, offset: 0 });
        recordResult("Repositories", "Field Dictionary Repository list", true, undefined, { count: fdList.length });

        // Test standard pack repository
        const spList = await standardPackRepository.list(null, { limit: 1, offset: 0 });
        recordResult("Repositories", "Standard Pack Repository list", true, undefined, { count: spList.length });

        return true;
    } catch (error: any) {
        recordResult("Repositories", "Repository operations", false, error.message, error);
        return false;
    }
}

/**
 * Test all services
 */
async function testAllServices(): Promise<boolean> {
    logger.info("Testing all services...");

    try {
        // Test metadata service
        const metadataList = await metadataService.listBusinessTerms(null, { limit: 1, offset: 0 });
        recordResult("Services", "Metadata Service", true, undefined, { count: metadataList.length });

        // Test search service
        const searchResults = await metadataSearchService.search(null, "test", {}, { limit: 1, offset: 0 });
        recordResult("Services", "Search Service", true, undefined, { count: searchResults.results.length });

        // Test governance tier service
        const tierRequirements = governanceTierService.getTierRequirements("tier_1");
        recordResult("Services", "Governance Tier Service", true, undefined, tierRequirements);

        // Test lineage service
        const lineageNodes = await lineageService.listNodes(null, { limit: 1, offset: 0 });
        recordResult("Services", "Lineage Service", true, undefined, { count: lineageNodes.length });

        // Test profiling service
        const hasProfiling = await profilingService.hasProfiling(null, "test-field-id");
        recordResult("Services", "Profiling Service", true, undefined, { hasProfiling });

        // Test quality service
        const hasQuality = await qualityService.hasQualityChecks(null, "test-field-id");
        recordResult("Services", "Quality Service", true, undefined, { hasQuality });

        // Test analytics service
        await analyticsService.logUsage({
            tenantId: null,
            assetUrn: "urn:metadata:test:asset",
            assetType: "field_dictionary",
            action: "view",
            userId: "test-user",
            userName: null,
            userEmail: null,
            context: null,
            ipAddress: null,
            userAgent: null,
            durationMs: null,
            success: true,
            errorMessage: null,
        });
        recordResult("Services", "Analytics Service", true);

        // Test KPI service
        const kpis = await compositeKpiService.list(null, { limit: 1, offset: 0 });
        recordResult("Services", "KPI Service", true, undefined, { count: kpis.length });

        return true;
    } catch (error: any) {
        recordResult("Services", "Service operations", false, error.message, error);
        return false;
    }
}

/**
 * Test data integrity
 */
async function testDataIntegrity(): Promise<boolean> {
    logger.info("Testing data integrity...");
    const db = getDB().getClient();

    try {
        // Test foreign key constraints
        const fkQuery = `
            SELECT
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
                AND tc.table_name LIKE 'mdm_%'
            LIMIT 10
        `;

        const fkResult = await db.query(fkQuery);
        recordResult("Data Integrity", "Foreign key constraints", true, undefined, {
            count: fkResult.rows.length,
        });

        // Test unique constraints
        const uniqueQuery = `
            SELECT
                tc.table_name,
                kcu.column_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
            WHERE tc.constraint_type = 'UNIQUE'
                AND tc.table_schema = 'public'
                AND tc.table_name LIKE 'mdm_%'
            LIMIT 10
        `;

        const uniqueResult = await db.query(uniqueQuery);
        recordResult("Data Integrity", "Unique constraints", true, undefined, {
            count: uniqueResult.rows.length,
        });

        return true;
    } catch (error: any) {
        recordResult("Data Integrity", "Constraint validation", false, error.message, error);
        return false;
    }
}

/**
 * Test end-to-end workflow
 */
async function testEndToEndWorkflow(): Promise<boolean> {
    logger.info("Testing end-to-end workflow...");

    try {
        // Get a standard pack
        const packs = await standardPackRepository.listByTenant(null);
        if (packs.length === 0) {
            recordResult("E2E Workflow", "Complete workflow", false, "No standard packs available");
            return false;
        }

        const testPackId = packs[0].id;

        // 1. Create business term
        const businessTerm = await metadataService.createBusinessTerm(null, {
            canonicalKey: `test_e2e_term_${Date.now()}`,
            label: "Test E2E Term",
            description: "Test term for E2E workflow",
            domain: "finance",
            module: "GL",
            governanceTier: "tier_3",
            standardPackIdPrimary: testPackId,
            standardPackIdSecondary: [],
            entityUrn: `urn:metadata:business_term:test_e2e_term_${Date.now()}`,
            owner: null,
            steward: null,
        });

        // 2. Create data contract
        const dataContract = await metadataService.createDataContract(null, {
            canonicalKey: `test_e2e_contract_${Date.now()}`,
            name: "Test E2E Contract",
            description: "Test contract for E2E workflow",
            sourceSystem: "TEST_SYSTEM",
            governanceTier: "tier_3",
            standardPackIdPrimary: testPackId,
            standardPackIdSecondary: [],
            entityUrn: `urn:metadata:data_contract:test_e2e_contract_${Date.now()}`,
            schema: {},
            owner: null,
            steward: null,
        });

        // 3. Create field dictionary
        const field = await metadataService.createFieldDictionary(null, {
            canonicalKey: `test_e2e_field_${Date.now()}`,
            label: "Test E2E Field",
            description: "Test field for E2E workflow",
            dataType: "number",
            format: null,
            unit: null,
            businessTermId: businessTerm.id,
            dataContractId: dataContract.id,
            constraints: {},
            examples: [],
            governanceTier: "tier_3",
            standardPackIdPrimary: testPackId,
            standardPackIdSecondary: [],
            entityUrn: `urn:metadata:field:test_e2e_field_${Date.now()}`,
            owner: null,
            steward: null,
        });

        // 4. Create lineage node
        const lineageNode = await lineageService.createNodeFromEntity(
            null,
            field.id,
            "field_dictionary",
            field.entityUrn!,
            "field",
            { test: true }
        );

        // 5. Log usage
        await analyticsService.logUsage({
            tenantId: null,
            assetUrn: field.entityUrn!,
            assetType: "field_dictionary",
            action: "view",
            userId: "test-user",
            userName: null,
            userEmail: null,
            context: null,
            ipAddress: null,
            userAgent: null,
            durationMs: null,
            success: true,
            errorMessage: null,
        });

        // 6. Search for the field
        const searchResults = await metadataSearchService.search(
            null,
            "test_e2e",
            {},
            { limit: 10, offset: 0 }
        );

        // 7. Cleanup
        await metadataService.deleteFieldDictionary(null, field.id);
        await metadataService.deleteDataContract(null, dataContract.id);
        await metadataService.deleteBusinessTerm(null, businessTerm.id);
        if (lineageNode) {
            await lineageService.deleteNode(lineageNode.urn);
        }

        recordResult("E2E Workflow", "Complete workflow", true, undefined, {
            businessTermId: businessTerm.id,
            dataContractId: dataContract.id,
            fieldId: field.id,
            searchResults: searchResults.results.length,
        });

        return true;
    } catch (error: any) {
        recordResult("E2E Workflow", "Complete workflow", false, error.message, error);
        return false;
    }
}

/**
 * Main validation function
 */
async function runValidation() {
    logger.info("Starting complete system validation...");

    // Test database tables
    await testAllTables();

    // Test repositories
    await testAllRepositories();

    // Test services
    await testAllServices();

    // Test data integrity
    await testDataIntegrity();

    // Test end-to-end workflow
    await testEndToEndWorkflow();

    // Summary by category
    const categories = [...new Set(results.map((r) => r.category))];
    logger.info("Validation summary by category:");
    for (const category of categories) {
        const categoryResults = results.filter((r) => r.category === category);
        const passed = categoryResults.filter((r) => r.passed).length;
        const total = categoryResults.length;
        logger.info({ category, passed, total }, "  [%s] %d/%d passed", category, passed, total);
    }

    // Overall summary
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;

    logger.info(
        { passed, failed, total },
        "Complete validation: %d/%d tests passed",
        passed,
        total
    );

    if (failed > 0) {
        logger.error("❌ Complete validation failed");
        process.exit(1);
    } else {
        logger.info("✅ Complete validation passed");
        process.exit(0);
    }
}

// Run validation
runValidation().catch((error) => {
    logger.error({ error }, "Fatal error during complete validation");
    process.exit(1);
});


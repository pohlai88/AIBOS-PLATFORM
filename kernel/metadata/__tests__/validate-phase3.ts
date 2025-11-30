#!/usr/bin/env tsx
/**
 * Phase 3 Validation Script
 * 
 * Validates Phase 3 implementation:
 * - Data Profiling tables and functionality
 * - Data Quality tables and functionality
 * - Usage Analytics tables and functionality
 * - Composite KPI tables and functionality
 * - End-to-end Phase 3 workflows
 */

import { getDB } from "../../storage/db";
import { profilingService } from "../profiling";
import { qualityService } from "../quality";
import { analyticsService } from "../analytics";
import { compositeKpiService } from "../kpi";
import { metadataService } from "../services";
import { standardPackRepository } from "../catalog";
import { baseLogger } from "../../observability/logger";
import { loadConfig } from "../../boot/kernel.config";

// Force Supabase mode if not set
if (!process.env.KERNEL_STORAGE_MODE) {
    process.env.KERNEL_STORAGE_MODE = "SUPABASE";
}

// Load config and initialize database
loadConfig();

const logger = baseLogger.child({ module: "metadata:validate-phase3" });

interface ValidationResult {
    test: string;
    passed: boolean;
    error?: string;
    details?: any;
}

const results: ValidationResult[] = [];

function recordResult(test: string, passed: boolean, error?: string, details?: any) {
    results.push({ test, passed, error, details });
    if (passed) {
        logger.info({ test, details }, "✅ %s", test);
    } else {
        logger.error({ test, error, details }, "❌ %s: %s", test, error);
    }
}

/**
 * Test profiling tables existence
 */
async function testProfilingTables(): Promise<boolean> {
    logger.info("Testing profiling tables existence...");
    const db = getDB().getClient();

    try {
        const tables = [
            "mdm_profiling_stats",
            "mdm_profiling_jobs",
            "mdm_profiling_schedules",
        ];

        for (const table of tables) {
            const result = await db.query(
                `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = 'public' AND table_name = $1`,
                [table]
            );
            const exists = parseInt(result.rows[0].count) === 1;
            if (!exists) {
                recordResult(`Profiling table ${table} exists`, false, `Table ${table} not found`);
                return false;
            }
        }

        recordResult("Profiling tables exist", true);
        return true;
    } catch (error: any) {
        recordResult("Profiling tables exist", false, error.message, error);
        return false;
    }
}

/**
 * Test quality tables existence
 */
async function testQualityTables(): Promise<boolean> {
    logger.info("Testing quality tables existence...");
    const db = getDB().getClient();

    try {
        const tables = [
            "mdm_quality_rules",
            "mdm_quality_check_results",
            "mdm_quality_violations",
        ];

        for (const table of tables) {
            const result = await db.query(
                `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = 'public' AND table_name = $1`,
                [table]
            );
            const exists = parseInt(result.rows[0].count) === 1;
            if (!exists) {
                recordResult(`Quality table ${table} exists`, false, `Table ${table} not found`);
                return false;
            }
        }

        recordResult("Quality tables exist", true);
        return true;
    } catch (error: any) {
        recordResult("Quality tables exist", false, error.message, error);
        return false;
    }
}

/**
 * Test usage analytics tables existence
 */
async function testUsageAnalyticsTables(): Promise<boolean> {
    logger.info("Testing usage analytics tables existence...");
    const db = getDB().getClient();

    try {
        const result = await db.query(
            `SELECT COUNT(*) as count FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name = 'mdm_usage_log'`
        );
        const exists = parseInt(result.rows[0].count) === 1;

        if (exists) {
            recordResult("Usage analytics tables exist", true);
            return true;
        } else {
            recordResult("Usage analytics tables exist", false, "Table mdm_usage_log not found");
            return false;
        }
    } catch (error: any) {
        recordResult("Usage analytics tables exist", false, error.message, error);
        return false;
    }
}

/**
 * Test KPI tables existence
 */
async function testKpiTables(): Promise<boolean> {
    logger.info("Testing KPI tables existence...");
    const db = getDB().getClient();

    try {
        const tables = [
            "mdm_composite_kpi",
            "mdm_kpi_calculation_history",
        ];

        for (const table of tables) {
            const result = await db.query(
                `SELECT COUNT(*) as count FROM information_schema.tables 
           WHERE table_schema = 'public' AND table_name = $1`,
                [table]
            );
            const exists = parseInt(result.rows[0].count) === 1;
            if (!exists) {
                recordResult(`KPI table ${table} exists`, false, `Table ${table} not found`);
                return false;
            }
        }

        recordResult("KPI tables exist", true);
        return true;
    } catch (error: any) {
        recordResult("KPI tables exist", false, error.message, error);
        return false;
    }
}

/**
 * Test profiling service functionality
 */
async function testProfilingService(): Promise<boolean> {
    logger.info("Testing profiling service functionality...");

    try {
        // Get an existing field ID for testing
        const db = getDB().getClient();
        const fieldResult = await db.query(
            `SELECT id FROM kernel_field_dictionary WHERE tenant_id IS NULL LIMIT 1`
        );
        
        if (fieldResult.rows.length === 0) {
            recordResult("Profiling service hasProfiling method", false, "No fields available for testing");
            return false;
        }
        
        const fieldId = fieldResult.rows[0].id;
        
        // Test hasProfiling method with a valid UUID
        const hasProfiling = await profilingService.hasProfiling(null, fieldId);
        
        // Should not throw error even if no profiling data exists
        recordResult("Profiling service hasProfiling method", true, undefined, { hasProfiling });
        return true;
    } catch (error: any) {
        recordResult("Profiling service hasProfiling method", false, error.message, error);
        return false;
    }
}

/**
 * Test quality service functionality
 */
async function testQualityService(): Promise<boolean> {
    logger.info("Testing quality service functionality...");

    try {
        // Get an existing field ID for testing
        const db = getDB().getClient();
        const fieldResult = await db.query(
            `SELECT id FROM kernel_field_dictionary WHERE tenant_id IS NULL LIMIT 1`
        );
        
        if (fieldResult.rows.length === 0) {
            recordResult("Quality service getRulesByField method", false, "No fields available for testing");
            return false;
        }
        
        const fieldId = fieldResult.rows[0].id;
        
        // Test getRulesByField method with a valid UUID
        const rules = await qualityService.getRulesByField(null, fieldId, true);
        
        // Should not throw error even if no rules exist
        recordResult("Quality service getRulesByField method", true, undefined, { ruleCount: rules.length });
        return true;
    } catch (error: any) {
        recordResult("Quality service getRulesByField method", false, error.message, error);
        return false;
    }
}

/**
 * Test analytics service functionality
 */
async function testAnalyticsService(): Promise<boolean> {
    logger.info("Testing analytics service functionality...");

    try {
        // Test logUsage method
        await analyticsService.logUsage({
            tenantId: null,
            assetUrn: "urn:metadata:test:asset",
            assetType: "field_dictionary",
            action: "view",
            userId: "test-user-id",
            userName: null,
            userEmail: null,
            context: null,
            ipAddress: null,
            userAgent: null,
            durationMs: null,
            success: true,
            errorMessage: null,
        });
        
        recordResult("Analytics service logUsage method", true);
        return true;
    } catch (error: any) {
        recordResult("Analytics service logUsage method", false, error.message, error);
        return false;
    }
}

/**
 * Test KPI service functionality
 */
async function testKpiService(): Promise<boolean> {
    logger.info("Testing KPI service functionality...");

    try {
        // Test listKPIs method (should work even with no KPIs)
        const kpis = await compositeKpiService.listKPIs(null, {});
        
        recordResult("KPI service list method", true, undefined, { count: kpis.length });
        return true;
    } catch (error: any) {
        recordResult("KPI service list method", false, error.message, error);
        return false;
    }
}

/**
 * Test KPI validation with SoT enforcement
 */
async function testKpiValidation(): Promise<boolean> {
    logger.info("Testing KPI validation with SoT enforcement...");

    try {
        // Get a standard pack for testing
        const packs = await standardPackRepository.listByTenant(null);
        if (packs.length === 0) {
            recordResult("KPI validation (SoT enforcement)", false, "No standard packs available for testing");
            return false;
        }

        const testPackId = packs[0].id;

        // Create test fields for numerator and denominator
        const numeratorField = await metadataService.createFieldDictionary(null, {
            canonicalKey: `test_numerator_${Date.now()}`,
            label: "Test Numerator",
            description: "Test numerator field",
            dataType: "number",
            format: null,
            unit: null,
            businessTermId: null,
            dataContractId: null,
            constraints: {},
            examples: [],
            governanceTier: "tier_3",
            standardPackIdPrimary: testPackId,
            standardPackIdSecondary: [],
            entityUrn: `urn:metadata:field:test_numerator_${Date.now()}`,
            owner: null,
            steward: null,
        });

        const denominatorField = await metadataService.createFieldDictionary(null, {
            canonicalKey: `test_denominator_${Date.now()}`,
            label: "Test Denominator",
            description: "Test denominator field",
            dataType: "number",
            format: null,
            unit: null,
            businessTermId: null,
            dataContractId: null,
            constraints: {},
            examples: [],
            governanceTier: "tier_3",
            standardPackIdPrimary: testPackId,
            standardPackIdSecondary: [],
            entityUrn: `urn:metadata:field:test_denominator_${Date.now()}`,
            owner: null,
            steward: null,
        });

        // Test KPI validation
        const testKpi = {
            canonicalKey: `test_kpi_${Date.now()}`,
            name: "Test KPI",
            description: "Test KPI for validation",
            numerator: {
                fieldId: numeratorField.id,
                expression: "SUM({field})",
                standardPackId: testPackId,
                description: "Test numerator",
            },
            denominator: {
                fieldId: denominatorField.id,
                expression: "COUNT({field})",
                standardPackId: testPackId,
                description: "Test denominator",
            },
            governanceTier: "tier_3" as const,
            owner: null,
            steward: null,
            entityUrn: `urn:metadata:kpi:test_kpi_${Date.now()}`,
            domain: null,
            tags: [],
        };

        const validation = await compositeKpiService.validateKPI(null, testKpi);

        // Cleanup
        await metadataService.deleteFieldDictionary(null, numeratorField.id);
        await metadataService.deleteFieldDictionary(null, denominatorField.id);

        if (validation.isValid) {
            recordResult("KPI validation (SoT enforcement)", true, undefined, validation);
            return true;
        } else {
            recordResult("KPI validation (SoT enforcement)", false, "Validation failed", validation);
            return false;
        }
    } catch (error: any) {
        recordResult("KPI validation (SoT enforcement)", false, error.message, error);
        return false;
    }
}

/**
 * Test complete KPI creation workflow
 */
async function testKpiCreationWorkflow(): Promise<boolean> {
    logger.info("Testing complete KPI creation workflow...");

    try {
        // Get a standard pack
        const packs = await standardPackRepository.listByTenant(null);
        if (packs.length === 0) {
            recordResult("KPI creation workflow", false, "No standard packs available");
            return false;
        }

        const testPackId = packs[0].id;

        // Create numerator field
        const numeratorField = await metadataService.createFieldDictionary(null, {
            canonicalKey: `test_numerator_workflow_${Date.now()}`,
            label: "Test Numerator Workflow",
            description: "Test numerator for workflow",
            dataType: "number",
            format: null,
            unit: null,
            businessTermId: null,
            dataContractId: null,
            constraints: {},
            examples: [],
            governanceTier: "tier_3",
            standardPackIdPrimary: testPackId,
            standardPackIdSecondary: [],
            entityUrn: `urn:metadata:field:test_numerator_workflow_${Date.now()}`,
            owner: null,
            steward: null,
        });

        // Create denominator field
        const denominatorField = await metadataService.createFieldDictionary(null, {
            canonicalKey: `test_denominator_workflow_${Date.now()}`,
            label: "Test Denominator Workflow",
            description: "Test denominator for workflow",
            dataType: "number",
            format: null,
            unit: null,
            businessTermId: null,
            dataContractId: null,
            constraints: {},
            examples: [],
            governanceTier: "tier_3",
            standardPackIdPrimary: testPackId,
            standardPackIdSecondary: [],
            entityUrn: `urn:metadata:field:test_denominator_workflow_${Date.now()}`,
            owner: null,
            steward: null,
        });

        // Create KPI
        const kpi = await compositeKpiService.createKPI(null, {
            canonicalKey: `test_kpi_workflow_${Date.now()}`,
            name: "Test KPI Workflow",
            description: "Test KPI for workflow validation",
            numerator: {
                fieldId: numeratorField.id,
                expression: "SUM({field})",
                standardPackId: testPackId,
                description: "Test numerator",
            },
            denominator: {
                fieldId: denominatorField.id,
                expression: "COUNT({field})",
                standardPackId: testPackId,
                description: "Test denominator",
            },
            governanceTier: "tier_3",
            owner: null,
            steward: null,
            entityUrn: `urn:metadata:kpi:test_kpi_workflow_${Date.now()}`,
            domain: null,
            tags: [],
        }, { requester: "validation-script" });

        // Verify KPI was created
        const retrievedKpi = await compositeKpiService.getKPI(null, kpi.id);
        if (!retrievedKpi) {
            recordResult("KPI creation workflow", false, "KPI not found after creation");
            return false;
        }

        // Validate KPI
        const validation = await compositeKpiService.validateKPI(null, retrievedKpi);
        if (!validation.isValid) {
            recordResult("KPI creation workflow", false, "KPI validation failed", validation);
            return false;
        }

        // Cleanup
        await compositeKpiService.deleteKPI(null, kpi.id);
        await metadataService.deleteFieldDictionary(null, numeratorField.id);
        await metadataService.deleteFieldDictionary(null, denominatorField.id);

        recordResult("KPI creation workflow", true, undefined, {
            kpiId: kpi.id,
            validation: validation.isValid,
        });
        return true;
    } catch (error: any) {
        recordResult("KPI creation workflow", false, error.message, error);
        return false;
    }
}

/**
 * Main validation function
 */
async function runValidation() {
    logger.info("Starting Phase 3 validation...");

    // Test table existence
    await testProfilingTables();
    await testQualityTables();
    await testUsageAnalyticsTables();
    await testKpiTables();

    // Test service functionality
    await testProfilingService();
    await testQualityService();
    await testAnalyticsService();
    await testKpiService();

    // Test KPI validation
    await testKpiValidation();

    // Test complete workflows
    await testKpiCreationWorkflow();

    // Summary
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    const total = results.length;

    logger.info(
        { passed, failed, total },
        "Phase 3 validation complete: %d/%d tests passed",
        passed,
        total
    );

    if (failed > 0) {
        logger.error("❌ Phase 3 validation failed");
        process.exit(1);
    } else {
        logger.info("✅ Phase 3 validation passed");
        process.exit(0);
    }
}

// Run validation
runValidation().catch((error) => {
    logger.error({ error }, "Fatal error during Phase 3 validation");
    process.exit(1);
});


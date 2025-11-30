/**
 * Impact Analysis Types
 * 
 * GRCD v4.1.0 Compliant: Impact analysis for metadata changes
 * Phase 2.3: Impact Analysis Service
 * 
 * Leverages patterns from kernel/drift/cascade-predictor.ts
 */

import { z } from "zod";
import type { LineageNode, LineageEdge } from "../lineage/types";

// ─────────────────────────────────────────────────────────────
// Impact Types
// ─────────────────────────────────────────────────────────────

export const ImpactTypeEnum = z.enum([
    "breaks",    // Change will break dependent assets
    "degrades",  // Change will degrade functionality
    "warns",     // Change may require review
    "safe",      // Change is safe
]);

export type ImpactType = z.infer<typeof ImpactTypeEnum>;

// ─────────────────────────────────────────────────────────────
// Change Types
// ─────────────────────────────────────────────────────────────

export const ChangeTypeEnum = z.enum([
    "field_update",      // Field definition update
    "field_delete",       // Field deletion
    "sot_change",         // Source of Truth pack change
    "kpi_change",         // KPI definition change
    "tier_change",       // Governance tier change
    "entity_delete",     // Entity deletion
    "schema_change",     // Schema modification
]);

export type ChangeType = z.infer<typeof ChangeTypeEnum>;

// ─────────────────────────────────────────────────────────────
// Affected Asset
// ─────────────────────────────────────────────────────────────

export const ZAffectedAsset = z.object({
    urn: z.string(),
    type: z.enum(["field", "entity", "kpi", "report", "transformation", "source"]),
    impactType: ImpactTypeEnum,
    reason: z.string(),
    distance: z.number().int().min(0), // Distance from source in lineage graph
    governanceTier: z.enum(["tier_1", "tier_2", "tier_3", "tier_4", "tier_5"]).optional(),
    affectedUsers: z.number().int().min(0).optional(),
    affectedWorkflows: z.array(z.string()).optional(),
    estimatedDowntime: z.string().optional(),
    metadata: z.record(z.any()).default({}),
});

export type AffectedAsset = z.infer<typeof ZAffectedAsset>;

// ─────────────────────────────────────────────────────────────
// Impact Report
// ─────────────────────────────────────────────────────────────

export const ZImpactReport = z.object({
    sourceChange: z.object({
        urn: z.string(),
        entityType: z.string(),
        changeType: ChangeTypeEnum,
        description: z.string(),
    }),
    totalAffected: z.number().int().min(0),
    criticalImpacts: z.array(ZAffectedAsset),
    warnings: z.array(ZAffectedAsset),
    safeChanges: z.array(ZAffectedAsset),
    riskScore: z.number().min(0).max(100),
    recommendation: z.enum(["proceed", "review", "block"]),
    estimatedImpact: z.object({
        users: z.number().int().min(0),
        workflows: z.number().int().min(0),
        revenue: z.string().optional(),
    }),
    blastRadius: z.object({
        direct: z.number().int().min(0), // Direct dependents
        indirect: z.number().int().min(0), // Transitive dependents
        maxDepth: z.number().int().min(0),
    }),
    createdAt: z.date(),
});

export type ImpactReport = z.infer<typeof ZImpactReport>;

// ─────────────────────────────────────────────────────────────
// Impact Analysis Options
// ─────────────────────────────────────────────────────────────

export interface ImpactAnalysisOptions {
    maxDepth?: number;  // Maximum traversal depth (default: 10)
    includeUpstream?: boolean;  // Include upstream impacts (default: false)
    includeDownstream?: boolean;  // Include downstream impacts (default: true)
    filterByTier?: Array<"tier_1" | "tier_2" | "tier_3" | "tier_4" | "tier_5">;  // Filter by governance tier
    filterByType?: Array<"field" | "entity" | "kpi" | "report" | "transformation" | "source">;  // Filter by node type
}

// ─────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────

export type { ImpactType, ChangeType };


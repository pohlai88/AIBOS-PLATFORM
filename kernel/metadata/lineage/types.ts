/**
 * Lineage Types
 * 
 * GRCD v4.1.0 Compliant: Lineage tracking for metadata entities
 * Phase 2.2: Data lineage system for Tier 1/2 assets
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Lineage Node Types
// ─────────────────────────────────────────────────────────────

export const LineageNodeTypeEnum = z.enum([
  "field",        // Field dictionary entry
  "entity",       // Business term, data contract
  "kpi",          // Composite KPI
  "report",       // Report or dashboard
  "transformation", // Data transformation/pipeline
  "source",       // Source system
]);

export type LineageNodeType = z.infer<typeof LineageNodeTypeEnum>;

// ─────────────────────────────────────────────────────────────
// Lineage Edge Types
// ─────────────────────────────────────────────────────────────

export const LineageEdgeTypeEnum = z.enum([
  "produces",      // Source produces target (e.g., table → field)
  "consumes",  // Target consumes source (e.g., KPI → field)
  "derived_from",  // Target is derived from source (e.g., calculated field)
  "transforms",    // Source is transformed into target (e.g., ETL pipeline)
  "references",    // Target references source (e.g., report → KPI)
]);

export type LineageEdgeType = z.infer<typeof LineageEdgeTypeEnum>;

// ─────────────────────────────────────────────────────────────
// Lineage Node
// ─────────────────────────────────────────────────────────────

export const ZLineageNode = z.object({
  id: z.string().uuid(),
  urn: z.string().min(1),  // Unique Resource Name (e.g., "urn:metadata:field:revenue")
  type: LineageNodeTypeEnum,
  tenantId: z.string().uuid().nullable(),
  entityId: z.string().uuid().nullable(),  // Reference to business_term, field_dictionary, etc.
  entityType: z.enum(["business_term", "data_contract", "field_dictionary", "kpi", "report", "transformation"]).nullable(),
  metadata: z.record(z.any()).default({}),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type LineageNode = z.infer<typeof ZLineageNode>;

export const ZCreateLineageNode = ZLineageNode.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateLineageNode = z.infer<typeof ZCreateLineageNode>;

// ─────────────────────────────────────────────────────────────
// Lineage Edge
// ─────────────────────────────────────────────────────────────

export const ZLineageEdge = z.object({
  id: z.string().uuid(),
  sourceUrn: z.string().min(1),  // Source node URN
  targetUrn: z.string().min(1),   // Target node URN
  edgeType: LineageEdgeTypeEnum,
  transformation: z.string().nullable(),  // SQL/expression/description of transformation
  tenantId: z.string().uuid().nullable(),
  metadata: z.record(z.any()).default({}),
  createdAt: z.date(),
});

export type LineageEdge = z.infer<typeof ZLineageEdge>;

export const ZCreateLineageEdge = ZLineageEdge.omit({
  id: true,
  createdAt: true,
}).extend({
  transformation: z.string().nullable().optional(),
});

export type CreateLineageEdge = z.infer<typeof ZCreateLineageEdge>;

// ─────────────────────────────────────────────────────────────
// Lineage Graph
// ─────────────────────────────────────────────────────────────

export const ZLineageGraph = z.object({
  nodes: z.array(ZLineageNode),
  edges: z.array(ZLineageEdge),
});

export type LineageGraph = z.infer<typeof ZLineageGraph>;

// ─────────────────────────────────────────────────────────────
// Lineage Traversal Options
// ─────────────────────────────────────────────────────────────

export interface LineageTraversalOptions {
  direction: "upstream" | "downstream" | "both";
  depth: number;  // Maximum depth to traverse (default: 10)
  edgeTypes?: LineageEdgeType[];  // Filter by edge types
  nodeTypes?: LineageNodeType[];   // Filter by node types
}

// ─────────────────────────────────────────────────────────────
// Lineage Path
// ─────────────────────────────────────────────────────────────

export interface LineagePath {
  nodes: LineageNode[];
  edges: LineageEdge[];
  depth: number;
}

// ─────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────

export type { LineageNodeType, LineageEdgeType };


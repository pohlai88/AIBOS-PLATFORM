/**
 * Composite KPI Types
 *
 * GRCD v4.1.0 Compliant: Composite KPI Modeling (MS-F-18)
 * Option 2: Composite KPI Modeling
 *
 * Defines numerator/denominator KPIs with SoT pack enforcement.
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Governance Tier Enum (reuse from catalog)
// ─────────────────────────────────────────────────────────────

export const GovernanceTierEnum = z.enum([
  "tier_1",
  "tier_2",
  "tier_3",
  "tier_4",
  "tier_5",
]);

export type GovernanceTier = z.infer<typeof GovernanceTierEnum>;

// ─────────────────────────────────────────────────────────────
// KPI Component (Numerator/Denominator)
// ─────────────────────────────────────────────────────────────

export const ZKPIComponent = z.object({
  fieldId: z.string().uuid(), // Reference to field_dictionary or business_term
  expression: z.string().nullable(), // Optional SQL expression (e.g., "SUM(revenue)")
  standardPackId: z.string().uuid(), // SoT pack for this component
  description: z.string().nullable(), // Component description
});

export type KPIComponent = z.infer<typeof ZKPIComponent>;

// ─────────────────────────────────────────────────────────────
// Composite KPI
// ─────────────────────────────────────────────────────────────

export const ZCompositeKPI = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  canonicalKey: z.string().min(1), // Unique identifier (e.g., "revenue_margin")
  name: z.string().min(1), // Display name (e.g., "Revenue Margin")
  description: z.string().nullable(),
  numerator: ZKPIComponent,
  denominator: ZKPIComponent,
  governanceTier: GovernanceTierEnum,
  owner: z.string().nullable(), // User ID of owner
  steward: z.string().nullable(), // User ID of steward
  entityUrn: z.string().nullable(), // URN for lineage (e.g., "urn:metadata:kpi:revenue_margin")
  domain: z.string().nullable(), // Domain (e.g., "finance", "sales")
  tags: z.array(z.string()).default([]), // Tags for categorization
  isActive: z.boolean().default(true),
  isDeprecated: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CompositeKPI = z.infer<typeof ZCompositeKPI>;

// ─────────────────────────────────────────────────────────────
// Create Composite KPI
// ─────────────────────────────────────────────────────────────

export const ZCreateCompositeKPI = ZCompositeKPI.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateCompositeKPI = z.infer<typeof ZCreateCompositeKPI>;

// ─────────────────────────────────────────────────────────────
// Update Composite KPI
// ─────────────────────────────────────────────────────────────

export const ZUpdateCompositeKPI = ZCreateCompositeKPI.partial().extend({
  id: z.string().uuid(),
});

export type UpdateCompositeKPI = z.infer<typeof ZUpdateCompositeKPI>;

// ─────────────────────────────────────────────────────────────
// KPI Validation Result
// ─────────────────────────────────────────────────────────────

export const ZKPIValidationResult = z.object({
  isValid: z.boolean(),
  violations: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  numeratorValidation: z.object({
    hasField: z.boolean(),
    hasStandardPack: z.boolean(),
    hasLineage: z.boolean().optional(),
  }),
  denominatorValidation: z.object({
    hasField: z.boolean(),
    hasStandardPack: z.boolean(),
    hasLineage: z.boolean().optional(),
  }),
});

export type KPIValidationResult = z.infer<typeof ZKPIValidationResult>;

// ─────────────────────────────────────────────────────────────
// KPI Calculation Result
// ─────────────────────────────────────────────────────────────

export const ZKPICalculationResult = z.object({
  kpiId: z.string().uuid(),
  kpiCanonicalKey: z.string(),
  numeratorValue: z.number(),
  denominatorValue: z.number(),
  kpiValue: z.number(),
  calculatedAt: z.date(),
  calculationContext: z.record(z.any()).optional(), // Additional context
});

export type KPICalculationResult = z.infer<typeof ZKPICalculationResult>;

// ─────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────

export type {
  GovernanceTier,
  KPIComponent,
  CompositeKPI,
  CreateCompositeKPI,
  UpdateCompositeKPI,
  KPIValidationResult,
  KPICalculationResult,
};


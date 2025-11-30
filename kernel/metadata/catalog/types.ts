/**
 * Metadata Catalog Types
 *
 * Core types for the Business Term / Data Contract / Field Dictionary system.
 */

import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

export const DataTypeEnum = z.enum([
  "string",
  "number",
  "integer",
  "boolean",
  "date",
  "datetime",
  "decimal",
  "currency",
  "percentage",
  "json",
  "array",
  "object",
]);

// GRCD v4.1.0: Governance Tiers (replaces status enum)
export const GovernanceTierEnum = z.enum([
  "tier_1",  // Critical - finance/reporting, requires lineage
  "tier_2",  // Important - operational, requires profiling
  "tier_3",  // Standard - general use
  "tier_4",  // Low priority
  "tier_5",  // Deprecated/archived
]);

// Legacy status enum (deprecated, kept for backward compatibility during transition)
export const FieldStatusEnum = z.enum([
  "draft",
  "active",
  "deprecated",
  "archived",
]);

export const ContractStatusEnum = z.enum([
  "draft",
  "active",
  "deprecated",
  "archived",
]);

export const ClassificationEnum = z.enum([
  "public",
  "internal",
  "financial",
  "operational",
  "regulatory",
]);

export const SensitivityEnum = z.enum([
  "public",
  "internal",
  "confidential",
  "restricted",
]);

export const AccessTypeEnum = z.enum([
  "read",
  "write",
  "read-write",
]);

export const AliasSourceEnum = z.enum([
  "manual",      // Human-curated
  "ai_suggested", // AI suggested, pending approval
  "ai_approved",  // AI suggested, approved
  "import",      // Auto-created during import
  "legacy",      // Migrated from legacy system
]);

// ─────────────────────────────────────────────────────────────
// Business Term
// ─────────────────────────────────────────────────────────────

export const ZBusinessTerm = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  canonicalKey: z.string().min(1),              // GRCD: canonical lower_snake_case (replaces slug)
  label: z.string().min(1),                     // human-readable
  description: z.string().nullable(),
  domain: z.string().nullable(),                 // e.g. "finance", "hr", "sales"
  module: z.string().nullable(),                 // GRCD: Module (GL, AR, AP, etc.)
  synonyms: z.array(z.string()).default([]),
  governanceTier: GovernanceTierEnum.default("tier_3"),  // GRCD: Tier 1-5 (replaces status)
  standardPackIdPrimary: z.string().uuid().nullable(),    // GRCD: Primary SoT pack reference
  standardPackIdSecondary: z.array(z.string().uuid()).default([]),  // GRCD: Secondary SoT pack references
  entityUrn: z.string().nullable(),              // GRCD: Unique Resource Name for lineage
  owner: z.string().nullable(),                  // GRCD: Owner
  steward: z.string().nullable(),                // GRCD: Steward
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type BusinessTerm = z.infer<typeof ZBusinessTerm>;

export const ZCreateBusinessTerm = ZBusinessTerm.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateBusinessTerm = z.infer<typeof ZCreateBusinessTerm>;

// ─────────────────────────────────────────────────────────────
// Data Contract
// ─────────────────────────────────────────────────────────────

export const ZDataContract = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  canonicalKey: z.string().min(1),              // GRCD: canonical lower_snake_case (replaces slug)
  name: z.string().min(1),
  description: z.string().nullable(),
  version: z.number().int().positive().default(1),
  owner: z.string().nullable(),                 // team/person responsible
  steward: z.string().nullable(),               // GRCD: Steward
  sourceSystem: z.string().nullable(),         // e.g. "SAP", "Salesforce"
  classification: ClassificationEnum.default("internal"), // data classification
  sensitivity: SensitivityEnum.default("internal"),       // sensitivity level
  governanceTier: GovernanceTierEnum.default("tier_3"),  // GRCD: Tier 1-5 (replaces status)
  standardPackIdPrimary: z.string().uuid().nullable(),    // GRCD: Primary SoT pack reference
  standardPackIdSecondary: z.array(z.string().uuid()).default([]),  // GRCD: Secondary SoT pack references
  entityUrn: z.string().nullable(),              // GRCD: Unique Resource Name for lineage
  schema: z.record(z.any()).nullable(),         // JSON schema or field definitions
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DataContract = z.infer<typeof ZDataContract>;

export const ZCreateDataContract = ZDataContract.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateDataContract = z.infer<typeof ZCreateDataContract>;

// ─────────────────────────────────────────────────────────────
// Field Dictionary Entry
// ─────────────────────────────────────────────────────────────

export const ZFieldDictionaryEntry = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  canonicalKey: z.string().min(1),              // GRCD: canonical lower_snake_case (replaces slug)
  label: z.string().min(1),
  description: z.string().nullable(),
  dataType: DataTypeEnum,
  format: z.string().nullable(),                // e.g. "YYYY-MM-DD", "###,###.##"
  unit: z.string().nullable(),                  // e.g. "USD", "kg", "%"
  businessTermId: z.string().uuid().nullable(), // link to business term
  dataContractId: z.string().uuid().nullable(), // link to data contract
  constraints: z.record(z.any()).nullable(),   // min, max, pattern, enum, etc.
  examples: z.array(z.string()).default([]),
  governanceTier: GovernanceTierEnum.default("tier_3"),  // GRCD: Tier 1-5 (replaces status)
  standardPackIdPrimary: z.string().uuid().nullable(),    // GRCD: Primary SoT pack reference
  standardPackIdSecondary: z.array(z.string().uuid()).default([]),  // GRCD: Secondary SoT pack references
  entityUrn: z.string().nullable(),              // GRCD: Unique Resource Name for lineage
  owner: z.string().nullable(),                  // GRCD: Owner
  steward: z.string().nullable(),                // GRCD: Steward
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FieldDictionaryEntry = z.infer<typeof ZFieldDictionaryEntry>;

export const ZCreateFieldDictionaryEntry = ZFieldDictionaryEntry.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateFieldDictionaryEntry = z.infer<typeof ZCreateFieldDictionaryEntry>;

// ─────────────────────────────────────────────────────────────
// Field Alias
// ─────────────────────────────────────────────────────────────

export const ZFieldAlias = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  aliasRaw: z.string().min(1),          // original external name
  aliasNormalized: z.string().min(1),   // normalized for lookup
  canonicalKey: z.string().min(1),      // GRCD: points to field dictionary canonical_key (replaces canonical_slug)
  source: AliasSourceEnum.default("manual"),
  confidence: z.number().min(0).max(1).nullable(), // for AI suggestions
  approvedBy: z.string().nullable(),
  approvedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type FieldAlias = z.infer<typeof ZFieldAlias>;

export const ZCreateFieldAlias = ZFieldAlias.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateFieldAlias = z.infer<typeof ZCreateFieldAlias>;

// ─────────────────────────────────────────────────────────────
// Standard Pack (GRCD v4.1.0)
// ─────────────────────────────────────────────────────────────

export const StandardTypeEnum = z.enum([
  "IFRS",
  "MFRS",
  "HL7",
  "GS1",
  "HACCP",
  "CUSTOM",
]);

export const ZStandardPack = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  name: z.string().min(1),              // "IFRS_15", "MFRS_1", "HL7_FHIR_R4"
  version: z.string().regex(/^\d+\.\d+\.\d+$/),  // SemVer: "1.0.0"
  standardType: StandardTypeEnum,
  isDeprecated: z.boolean().default(false),
  definition: z.record(z.any()),        // JSONB pack contents
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type StandardPack = z.infer<typeof ZStandardPack>;

export const ZCreateStandardPack = ZStandardPack.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateStandardPack = z.infer<typeof ZCreateStandardPack>;

// ─────────────────────────────────────────────────────────────
// Type Exports
// ─────────────────────────────────────────────────────────────

export type DataType = z.infer<typeof DataTypeEnum>;
export type GovernanceTier = z.infer<typeof GovernanceTierEnum>;
export type StandardType = z.infer<typeof StandardTypeEnum>;
export type FieldStatus = z.infer<typeof FieldStatusEnum>;  // Deprecated, use GovernanceTier
export type ContractStatus = z.infer<typeof ContractStatusEnum>;  // Deprecated, use GovernanceTier
export type Classification = z.infer<typeof ClassificationEnum>;
export type Sensitivity = z.infer<typeof SensitivityEnum>;
export type AccessType = z.infer<typeof AccessTypeEnum>;
export type AliasSource = z.infer<typeof AliasSourceEnum>;

// ─────────────────────────────────────────────────────────────
// Action ↔ Data Contract Link
// ─────────────────────────────────────────────────────────────

export const ZActionDataContractLink = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().nullable(),
  actionId: z.string().min(1),           // e.g. "accounting.createJournalEntry"
  dataContractId: z.string().uuid(),
  accessType: AccessTypeEnum,
  createdAt: z.date(),
});

export type ActionDataContractLink = z.infer<typeof ZActionDataContractLink>;

export const ZCreateActionDataContractLink = ZActionDataContractLink.omit({
  id: true,
  createdAt: true,
});

export type CreateActionDataContractLink = z.infer<typeof ZCreateActionDataContractLink>;


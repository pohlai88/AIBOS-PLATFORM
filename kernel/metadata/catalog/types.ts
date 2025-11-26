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
  slug: z.string().min(1),              // canonical lower_snake_case
  label: z.string().min(1),             // human-readable
  description: z.string().nullable(),
  domain: z.string().nullable(),        // e.g. "finance", "hr", "sales"
  synonyms: z.array(z.string()).default([]),
  status: FieldStatusEnum.default("active"),
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
  slug: z.string().min(1),              // canonical lower_snake_case
  name: z.string().min(1),
  description: z.string().nullable(),
  version: z.number().int().positive().default(1),
  owner: z.string().nullable(),         // team/person responsible
  sourceSystem: z.string().nullable(),  // e.g. "SAP", "Salesforce"
  classification: ClassificationEnum.default("internal"), // data classification
  sensitivity: SensitivityEnum.default("internal"),       // sensitivity level
  status: ContractStatusEnum.default("active"),
  schema: z.record(z.any()).nullable(), // JSON schema or field definitions
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
  slug: z.string().min(1),              // canonical lower_snake_case
  label: z.string().min(1),
  description: z.string().nullable(),
  dataType: DataTypeEnum,
  format: z.string().nullable(),        // e.g. "YYYY-MM-DD", "###,###.##"
  unit: z.string().nullable(),          // e.g. "USD", "kg", "%"
  businessTermId: z.string().uuid().nullable(), // link to business term
  dataContractId: z.string().uuid().nullable(), // link to data contract
  constraints: z.record(z.any()).nullable(), // min, max, pattern, enum, etc.
  examples: z.array(z.string()).default([]),
  status: FieldStatusEnum.default("active"),
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
  canonicalSlug: z.string().min(1),     // points to field dictionary slug
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
// Type Exports
// ─────────────────────────────────────────────────────────────

export type DataType = z.infer<typeof DataTypeEnum>;
export type FieldStatus = z.infer<typeof FieldStatusEnum>;
export type ContractStatus = z.infer<typeof ContractStatusEnum>;
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


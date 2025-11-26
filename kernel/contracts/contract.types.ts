import type { z } from "zod";

export interface ContractResult {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

// ─────────────────────────────────────────────────────────────
// Action Contract Types
// ─────────────────────────────────────────────────────────────

export type RiskBand = "low" | "medium" | "high" | "critical";
export type SideEffectLevel = "none" | "read" | "local" | "write" | "external";

export interface KernelActionMetadata {
  /** Domain: 'finance', 'hr', 'sales', etc. */
  domain: string;
  /** Category within domain: 'journal_entries', 'payroll', etc. */
  category?: string;
  /** Human-readable description */
  description?: string;
  /** Searchable tags */
  tags?: string[];
  /** Reference to data contract slug: 'journal_entries' */
  dataContractRef?: string;
  /** Risk classification */
  riskBand?: RiskBand;
  /** Side effect level */
  sideEffectLevel?: SideEffectLevel;
}

/**
 * Generic runtime contract for actions.
 *
 * TInSchema / TOutSchema = Zod schemas (runtime); types inferred at compile-time.
 */
export interface KernelActionContract<
  TInSchema extends z.ZodTypeAny = z.ZodTypeAny,
  TOutSchema extends z.ZodTypeAny = z.ZodTypeAny,
> {
  /** Stable action ID: 'accounting.createJournalEntry' */
  actionId: string;
  /** Contract version */
  version: number;
  /** Zod input schema */
  inputSchema: TInSchema;
  /** Zod output schema */
  outputSchema: TOutSchema;
  /** Action metadata for governance, UI, AI */
  metadata?: KernelActionMetadata;
}

/**
 * Alias for use in action definition files
 */
export type ZActionContract<
  TInSchema extends z.ZodTypeAny = z.ZodTypeAny,
  TOutSchema extends z.ZodTypeAny = z.ZodTypeAny,
> = KernelActionContract<TInSchema, TOutSchema>;


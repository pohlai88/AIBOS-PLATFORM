/**
 * Action Contract: accounting.createJournalEntry
 *
 * Fully aligned with:
 * - kernel_field_dictionary (canonical slugs)
 * - kernel_data_contracts (journal_entries)
 * - kernel_action_data_contracts (action link)
 * - Policy V2 (data-contract-aware authorization)
 */

import type { KernelActionContract } from "../contract.types";
import {
  ZCreateJournalEntryInput,
  ZCreateJournalEntryOutput,
  type CreateJournalEntryInput,
  type CreateJournalEntryOutput,
} from "../schemas/journal-entry.schema";

/**
 * Stable action ID – MUST match:
 * - kernel_action_data_contracts.action_id
 * - PolicyEngine context.actionId
 */
export const CREATE_JOURNAL_ENTRY_ACTION_ID = "accounting.createJournalEntry" as const;

/**
 * Create Journal Entry Action Contract
 *
 * Uses canonical slugs from kernel_field_dictionary:
 * - journal_date, gl_account_code, debit_amount, credit_amount
 * - line_description, document_number, currency_code, created_by
 */
export const createJournalEntryActionContract: KernelActionContract<
  typeof ZCreateJournalEntryInput,
  typeof ZCreateJournalEntryOutput
> = {
  actionId: CREATE_JOURNAL_ENTRY_ACTION_ID,
  version: 1,
  inputSchema: ZCreateJournalEntryInput,
  outputSchema: ZCreateJournalEntryOutput,
  metadata: {
    domain: "finance",
    category: "journal_entries",
    description: "Create a balanced double-entry journal entry. IFRS/MFRS compliant.",
    tags: ["finance", "journal", "double-entry", "accounting"],
    dataContractRef: "journal_entries",
    riskBand: "high",
    sideEffectLevel: "write",
  },
};

/**
 * Type-safe handler signature for action implementations
 */
export type CreateJournalEntryHandler = (
  input: CreateJournalEntryInput,
  context: {
    tenantId: string | null;
    principalId: string;
    traceId?: string;
  },
) => Promise<CreateJournalEntryOutput>;

/**
 * Re-export Zod schemas for direct validation
 */
export { ZCreateJournalEntryInput, ZCreateJournalEntryOutput };
export type { CreateJournalEntryInput, CreateJournalEntryOutput };

/**
 * Journal Entry Domain Schema
 *
 * Zod schemas aligned with kernel_field_dictionary canonical slugs:
 * - journal_date
 * - gl_account_code
 * - debit_amount
 * - credit_amount
 * - line_description
 * - document_number
 * - currency_code
 * - created_by
 */

import { z } from "zod";

/**
 * One journal line – aligned with kernel_field_dictionary
 */
export const ZJournalEntryLine = z
  .object({
    gl_account_code: z
      .string()
      .min(1, "GL account code is required")
      .describe("Code of the GL account being debited or credited"),

    debit_amount: z
      .number()
      .nonnegative("Debit amount cannot be negative")
      .default(0)
      .describe("Debit amount in transaction currency"),

    credit_amount: z
      .number()
      .nonnegative("Credit amount cannot be negative")
      .default(0)
      .describe("Credit amount in transaction currency"),

    line_description: z
      .string()
      .max(512, "Line description too long")
      .optional()
      .describe("Description for the journal line"),

    document_number: z
      .string()
      .max(64, "Document number too long")
      .optional()
      .describe("External document or reference number"),

    currency_code: z
      .string()
      .length(3, "Currency code must be 3 letters (ISO-4217)")
      .default("MYR")
      .describe("Transaction currency code (e.g. MYR, USD)"),
  })
  .refine(
    (line) => line.debit_amount === 0 || line.credit_amount === 0,
    {
      message: "A line cannot have both debit and credit non-zero",
      path: ["debit_amount"],
    },
  );

export type JournalEntryLine = z.infer<typeof ZJournalEntryLine>;

/**
 * Input schema for accounting.createJournalEntry
 *
 * Fields aligned with kernel_business_terms + kernel_field_dictionary
 */
export const ZCreateJournalEntryInput = z
  .object({
    journal_date: z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}$/,
        "journal_date must be in format YYYY-MM-DD",
      )
      .describe("Journal posting date (YYYY-MM-DD)"),

    lines: z
      .array(ZJournalEntryLine)
      .min(1, "At least one journal line is required")
      .describe("Journal entry lines"),

    created_by: z
      .string()
      .min(1, "created_by is required")
      .describe("User who created the journal entry"),
  })
  .refine(
    (payload) => {
      const totalDebit = payload.lines.reduce(
        (sum, l) => sum + (l.debit_amount ?? 0),
        0,
      );
      const totalCredit = payload.lines.reduce(
        (sum, l) => sum + (l.credit_amount ?? 0),
        0,
      );
      return Math.abs(totalDebit - totalCredit) < 0.001; // floating point tolerance
    },
    {
      message: "Total debit must equal total credit",
      path: ["lines"],
    },
  );

export type CreateJournalEntryInput = z.infer<typeof ZCreateJournalEntryInput>;

/**
 * Output schema for accounting.createJournalEntry
 */
export const ZCreateJournalEntryOutput = z.object({
  journal_entry_id: z
    .string()
    .min(1, "journal_entry_id is required")
    .describe("Identifier of the created journal entry"),

  status: z
    .enum(["posted", "draft", "pending_approval"])
    .default("posted")
    .describe("Posting status of the journal entry"),

  posted_at: z
    .string()
    .datetime()
    .optional()
    .describe("Timestamp when the entry was posted (ISO-8601)"),
});

export type CreateJournalEntryOutput = z.infer<typeof ZCreateJournalEntryOutput>;


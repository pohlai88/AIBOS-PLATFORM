// contracts/schemas/journal-entry.schema.ts
import { z } from 'zod';

// Core journal entry line (debit/credit pair flattened for simplicity).
// You can extend this later to support multi-line entries if your schema
// already has a header/lines split.
export const JournalEntrySchema = z.object({
  id: z.string().min(1),
  tenantId: z.string().min(1),
  orgId: z.string().min(1).optional(),
  journalNo: z.string().min(1),
  journalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // ISO date
  debitAccountId: z.string().min(1),
  creditAccountId: z.string().min(1),
  amount: z.number().finite(),
  currencyCode: z.string().min(3).max(3),
  description: z.string().max(2048).optional(),
  status: z.enum(['draft', 'posted', 'void']).default('posted'),
  createdAt: z.string().datetime(),
  createdBy: z.string().optional(),
  updatedAt: z.string().datetime().optional(),
  updatedBy: z.string().optional(),
});

export type JournalEntry = z.infer<typeof JournalEntrySchema>;

// Input schema for accounting.read.journal_entries
export const ReadJournalEntriesInputSchema = z.object({
  // Tenant is taken from auth/HTTP, but we allow optional filter override
  // for system-level calls. In most cases this should be ignored and
  // kernel will use the authenticated tenant.
  tenantId: z.string().min(1).optional(),
  // Optional filters
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  accountId: z.string().min(1).optional(),
  status: z.enum(['draft', 'posted', 'void']).optional(),
  // Pagination
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(500).default(50),
});

export type ReadJournalEntriesInput = z.infer<typeof ReadJournalEntriesInputSchema>;

export const ReadJournalEntriesOutputSchema = z.object({
  items: z.array(JournalEntrySchema),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(1),
  total: z.number().int().min(0),
});

export type ReadJournalEntriesOutput = z.infer<typeof ReadJournalEntriesOutputSchema>;

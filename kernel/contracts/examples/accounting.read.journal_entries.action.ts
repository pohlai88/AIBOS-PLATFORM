// contracts/examples/accounting.read.journal_entries.action.ts
import type { KernelActionContract } from '../contract.types';
import {
  ReadJournalEntriesInputSchema,
  ReadJournalEntriesOutputSchema,
} from '../schemas/journal-entry.schema';

export const accountingReadJournalEntriesContract: KernelActionContract<
  typeof ReadJournalEntriesInputSchema,
  typeof ReadJournalEntriesOutputSchema
> = {
  id: 'accounting.read.journal_entries',
  version: '1.0.0',
  domain: 'accounting',
  kind: 'query',
  summary: 'Read journal entries with filters and pagination',
  description:
    'Returns a paginated list of journal entries for the current tenant, with optional date, account, and status filters.',
  inputSchema: ReadJournalEntriesInputSchema,
  outputSchema: ReadJournalEntriesOutputSchema,
  // Optional classification for security / data contract mapping
  classification: {
    piiLevel: 'low',
    sensitivity: 'financial',
  },
  // Optional tagging for policy engine & lineage
  tags: ['accounting', 'journal', 'read', 'query'],
};


// engines/accounting/index.ts
import type { KernelEngineManifest } from '../../types/engine.types';
import { accountingReadJournalEntriesContract } from '../../contracts/examples/accounting.read.journal_entries.action';
import { readJournalEntriesAction } from './read-journal-entries.action';

export const accountingEngineManifest: KernelEngineManifest = {
  id: 'accounting',
  name: 'Accounting Engine',
  version: '1.0.0',
  description: 'Core accounting actions for AI-BOS (journal entries, ledgers, etc.)',
  domain: 'accounting',
  actions: {
    'read.journal_entries': {
      id: 'read.journal_entries',
      contract: accountingReadJournalEntriesContract,
      description: 'Read journal entries for a tenant',
      tags: ['journal', 'read', 'accounting'],
    },
  },
};

export const accountingEngine = {
  id: accountingEngineManifest.id,
  manifest: accountingEngineManifest,
  actions: {
    'read.journal_entries': readJournalEntriesAction,
  },
};

// Register engine with the global registry
import { registerEngine } from '../../registry/engine.loader';
registerEngine(accountingEngine);


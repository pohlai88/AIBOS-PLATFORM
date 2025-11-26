/**
 * Action Contract Examples Index
 *
 * Central export of all example action contracts.
 * The registry loader imports from here.
 */

import type { KernelActionContract } from "../contract.types";
import {
  createJournalEntryActionContract,
  CREATE_JOURNAL_ENTRY_ACTION_ID,
} from "./create-journal-entry.action";

// Re-export individual contracts
export {
  createJournalEntryActionContract,
  CREATE_JOURNAL_ENTRY_ACTION_ID,
};

/**
 * All example action contracts.
 * Add new contracts here as you create them.
 */
export const exampleActionContracts: KernelActionContract[] = [
  createJournalEntryActionContract,
  // Future: getJournalEntriesActionContract,
  // Future: updateJournalEntryActionContract,
];


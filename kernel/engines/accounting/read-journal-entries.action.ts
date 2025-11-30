// engines/accounting/read-journal-entries.action.ts
import type { ReadJournalEntriesInput, ReadJournalEntriesOutput } from '../../contracts/schemas/journal-entry.schema';
import type { JournalEntry } from '../../contracts/schemas/journal-entry.schema';

// This action function is designed to be executed by the sandbox v2.
//
// It relies on the `ctx.db` proxy, which should expose a minimal query
// interface such as:
//   ctx.db.query<T>(sql: string, params?: unknown[]): Promise<T[]>
//
// Adjust the table name and column mapping to match your actual schema
// (e.g. `acc_journal_entries`, `gl_journal_entry`, etc.).

export interface AccountingActionContext {
  input: ReadJournalEntriesInput;
  tenant: string | null;
  user: unknown; // Principal is kept opaque at engine level
  db: {
    query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  };
  cache: unknown;
  metadata: unknown;
  emit: (event: string, payload: unknown) => void;
  log: (...args: unknown[]) => void;
  engineConfig: unknown;
}

export async function readJournalEntriesAction(ctx: AccountingActionContext): Promise<ReadJournalEntriesOutput> {
  const { input, tenant, db, log } = ctx;

  if (!tenant && !input.tenantId) {
    throw new Error('Tenant context is required to read journal entries');
  }

  const effectiveTenant = input.tenantId ?? tenant;
  if (!effectiveTenant) {
    throw new Error('Unable to resolve tenant for journal entries query');
  }

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 50;
  const offset = (page - 1) * pageSize;

  const whereClauses: string[] = ['tenant_id = $1'];
  const params: unknown[] = [effectiveTenant];
  let paramIndex = params.length + 1;

  if (input.dateFrom) {
    whereClauses.push(`journal_date >= $${paramIndex++}`);
    params.push(input.dateFrom);
  }

  if (input.dateTo) {
    whereClauses.push(`journal_date <= $${paramIndex++}`);
    params.push(input.dateTo);
  }

  if (input.accountId) {
    // Filter either debit or credit side matching the account
    whereClauses.push(`(debit_account_id = $${paramIndex} OR credit_account_id = $${paramIndex})`);
    params.push(input.accountId);
    paramIndex++;
  }

  if (input.status) {
    whereClauses.push(`status = $${paramIndex++}`);
    params.push(input.status);
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  const baseSql = `
    FROM kernel_journal_entries
    ${whereSql}
  `;

  const rows = await db.query<JournalEntry>(
    `
      SELECT
        id,
        tenant_id as "tenantId",
        org_id as "orgId",
        journal_no as "journalNo",
        journal_date as "journalDate",
        debit_account_id as "debitAccountId",
        credit_account_id as "creditAccountId",
        amount,
        currency_code as "currencyCode",
        description,
        status,
        created_at as "createdAt",
        created_by as "createdBy",
        updated_at as "updatedAt",
        updated_by as "updatedBy"
      ${baseSql}
      ORDER BY journal_date DESC, journal_no DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex}
    `,
    [...params, pageSize, offset],
  );

  const [{ count }] = await db.query<{ count: number }>(
    `SELECT COUNT(*)::int as count ${baseSql}`,
    params,
  );

  log(
    '[accounting.read.journal_entries] fetched rows',
    rows.length,
    'for tenant',
    effectiveTenant,
  );

  return {
    items: rows,
    page,
    pageSize,
    total: count,
  };
}


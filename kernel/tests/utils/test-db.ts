// tests/utils/test-db.ts
import { kernelContainer } from "../../core/container";

/**
 * Seed test data for integration tests
 * 
 * Creates sample data across multiple tenants for isolation testing
 */
export async function seedTestData(): Promise<void> {
  const db = await kernelContainer.getDatabase();

  // Create test tenants
  await db.none(
    `INSERT INTO tenants (id, name) VALUES ('tenant-a', 'Tenant A'), ('tenant-b', 'Tenant B') ON CONFLICT DO NOTHING`
  );

  // Seed journal entries for tenant-a
  await db.none(
    `INSERT INTO journal_entries (id, tenant_id, journal_no, journal_date, amount, description) 
     VALUES 
       ('je-a1', 'tenant-a', 'JE-001', '2025-01-01', 1000.00, 'Test Entry A1'),
       ('je-a2', 'tenant-a', 'JE-002', '2025-01-02', 2000.00, 'Test Entry A2')
     ON CONFLICT DO NOTHING`
  );

  // Seed journal entries for tenant-b
  await db.none(
    `INSERT INTO journal_entries (id, tenant_id, journal_no, journal_date, amount, description) 
     VALUES 
       ('je-b1', 'tenant-b', 'JE-001', '2025-01-01', 500.00, 'Test Entry B1'),
       ('je-b2', 'tenant-b', 'JE-002', '2025-01-02', 1500.00, 'Test Entry B2')
     ON CONFLICT DO NOTHING`
  );

  console.info("[TestDB] Seed data created");
}

/**
 * Reset database to clean state
 * 
 * Truncates test tables (use with caution!)
 */
export async function resetDb(): Promise<void> {
  const db = await kernelContainer.getDatabase();

  await db.none(`TRUNCATE TABLE journal_entries CASCADE`);
  await db.none(`TRUNCATE TABLE tenants CASCADE`);

  console.info("[TestDB] Database reset");
}

/**
 * Create a test tenant
 */
export async function createTestTenant(
  id: string,
  name: string
): Promise<void> {
  const db = await kernelContainer.getDatabase();

  await db.none(
    `INSERT INTO tenants (id, name) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [id, name]
  );
}

/**
 * Clean up test data after tests
 */
export async function cleanupTestData(): Promise<void> {
  await resetDb();
}


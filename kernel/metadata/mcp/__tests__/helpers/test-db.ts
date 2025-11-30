/**
 * Test Database Setup
 * 
 * Utilities for setting up and tearing down test database
 */

import { Database } from '../../../../storage/db';
import { baseLogger } from '../../../../observability/logger';

const logger = baseLogger.child({ module: 'metadata:mcp-test-db' });

/**
 * Setup test database
 * Creates schema and seeds test data
 */
export async function setupTestDB(): Promise<void> {
  try {
    // Ensure Supabase mode is enabled for tests
    if (!process.env.KERNEL_STORAGE_MODE || process.env.KERNEL_STORAGE_MODE === 'IN_MEMORY') {
      process.env.KERNEL_STORAGE_MODE = 'SUPABASE';
    }
    
    // Initialize database if not already initialized
    Database.init();
    const db = Database.getClient();
    
    // Verify we're using Supabase (not IN_MEMORY)
    const isSupabase = process.env.KERNEL_STORAGE_MODE === 'SUPABASE' && 
                       (process.env.SUPABASE_DB_URL || process.env.DATABASE_URL);
    
    if (!isSupabase) {
      logger.warn('Test database is not using Supabase. Set KERNEL_STORAGE_MODE=SUPABASE and SUPABASE_DB_URL in .env');
    }
    
    logger.info({ 
      storageMode: process.env.KERNEL_STORAGE_MODE,
      hasDbUrl: !!(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL)
    }, 'Test database setup complete');
  } catch (error) {
    logger.error({ error }, 'Failed to setup test database');
    throw error;
  }
}

/**
 * Teardown test database
 * Cleans up test data
 */
export async function teardownTestDB(): Promise<void> {
  try {
    // Clean up test data if needed
    // For now, we'll rely on test isolation via transactions
    
    logger.info('Test database teardown complete');
  } catch (error) {
    logger.error({ error }, 'Failed to teardown test database');
    throw error;
  }
}

/**
 * Create a test transaction for isolation
 */
export async function withTestTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  // Ensure Supabase mode is enabled
  if (!process.env.KERNEL_STORAGE_MODE || process.env.KERNEL_STORAGE_MODE === 'IN_MEMORY') {
    process.env.KERNEL_STORAGE_MODE = 'SUPABASE';
  }
  
  Database.init();
  const db = Database.getClient();
  
  // Verify we're using Supabase
  const config = await import('../../../../boot/kernel.config');
  const kernelConfig = config.getConfig();
  
  if (kernelConfig.storageMode !== 'SUPABASE') {
    throw new Error(`Test requires SUPABASE mode, but got ${kernelConfig.storageMode}. Set KERNEL_STORAGE_MODE=SUPABASE and SUPABASE_DB_URL in .env`);
  }
  
  await db.query('BEGIN');
  
  try {
    const result = await callback(db);
    await db.query('ROLLBACK'); // Always rollback in tests
    return result;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

/**
 * Seed test data
 */
export async function seedTestData(tenantId: string | null = null): Promise<void> {
  Database.init();
  const db = Database.getClient();
  
  // Seed standard packs
  await db.query(`
    INSERT INTO mdm_standard_pack (id, tenant_id, name, version, standard_type, description, definition, is_deprecated)
    VALUES 
      (gen_random_uuid(), $1, 'IFRS_15', '1.0.0', 'IFRS', 'IFRS 15 Standard Pack', '{}'::jsonb, false),
      (gen_random_uuid(), $1, 'MFRS_1', '1.0.0', 'MFRS', 'MFRS 1 Standard Pack', '{}'::jsonb, false)
    ON CONFLICT DO NOTHING
  `, [tenantId]);
  
  logger.info({ tenantId }, 'Test data seeded');
}


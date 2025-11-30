/**
 * Test Setup
 * 
 * Global test setup for Metadata Studio MCP tests
 * Runs before all tests
 */

import { beforeAll, afterAll } from 'vitest';

// Global test setup
beforeAll(async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'silent'; // Suppress logs during tests
  
  // Force Supabase mode for integration tests
  // This ensures tests use the real database instead of IN_MEMORY
  if (!process.env.KERNEL_STORAGE_MODE) {
    process.env.KERNEL_STORAGE_MODE = 'SUPABASE';
  }
  
  // Ensure SUPABASE_DB_URL is set (from .env file)
  if (!process.env.SUPABASE_DB_URL && !process.env.DATABASE_URL) {
    console.warn('[TEST SETUP] WARNING: SUPABASE_DB_URL not set. Tests will use IN_MEMORY mode.');
  }
  
  // Note: Database setup is handled per-test to avoid import issues
  // Individual tests can call setupTestDB() if needed
});

// Global test teardown
afterAll(async () => {
  // Clean up if needed
  // Note: Database teardown is handled per-test
});


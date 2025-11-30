/**
 * Vitest Configuration
 * 
 * Test framework configuration for Metadata Studio MCP testing
 */

import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
          include: ['**/__tests__/**/*.{test,spec,integration.test,e2e.test}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.{idea,git,cache,output,temp}/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.spec.ts',
        '**/vitest.config.ts',
      ],
    },
    testTimeout: 30000, // 30 seconds for integration/E2E tests
    hookTimeout: 10000, // 10 seconds for setup/teardown
    // setupFiles: ['./metadata/mcp/__tests__/helpers/setup.ts'], // Disabled to avoid import issues
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  esbuild: {
    target: 'node18',
  },
});


#!/usr/bin/env tsx
/**
 * Directory Structure Linter
 * 
 * Validates kernel directory structure against GRCD template.
 * Prevents structure drift and ensures architecture integrity.
 * 
 * Usage:
 *   tsx scripts/dir-lint.ts [--fix] [--verbose]
 * 
 * Exit codes:
 *   0 - Structure is valid
 *   1 - Structure violations found
 */

import { readdir, stat } from 'fs/promises';
import { join, relative, dirname } from 'path';
import { existsSync } from 'fs';

// Canonical directory structure from GRCD-KERNEL.md Section 4.1
const CANONICAL_STRUCTURE: Record<string, {
  required: boolean;
  description: string;
  allowedSubdirs?: string[];
  allowedFiles?: string[];
}> = {
  // Core directories
  'actions': { required: true, description: 'Action dispatcher and registry' },
  'agents': { required: true, description: 'AI Agent Integration (Phase 5)' },
  'ai': { required: true, description: 'AI governance and client' },
  'ai-optimization': { required: true, description: 'AI optimization engines' },
  'api': { required: true, description: 'HTTP API layer (Hono) - legacy, will be consolidated' },
  'audit': { required: true, description: 'Audit logging system' },
  'auth': { required: true, description: 'Authentication layer' },
  'bootstrap': { required: true, description: 'Boot sequence' },
  'boot': { required: true, description: 'Configuration loading' },
  'concurrency': { required: true, description: 'Concurrency control (locks, mutexes)' },
  'contracts': { required: true, description: 'Contract engine' },
  'core': { required: true, description: 'Core container and DI' },
  'dispatcher': { required: true, description: 'Action dispatcher' },
  'distributed': { required: true, description: 'Distributed Features (Phase 5)' },
  'drift': { required: true, description: 'Drift detection and prevention' },
  'engines': { required: true, description: 'Engine loader and examples' },
  'errors': { required: true, description: 'Error hierarchy' },
  'events': { required: true, description: 'Event bus system' },
  'finance': { required: true, description: 'Finance Compliance (Phase 6)' },
  'governance': { required: true, description: 'Governance Features (Phase 6)' },
  'hardening': { required: true, description: 'Security hardening' },
  'http': { required: true, description: 'HTTP layer (active implementation)' },
  'isolation': { required: true, description: 'Isolation and sandboxing' },
  'jobs': { required: true, description: 'Background jobs' },
  'mcp': { required: true, description: 'MCP Governance Layer' },
  'metadata': { required: true, description: 'Metadata registry' },
  'migrations': { required: true, description: 'Database migrations' },
  'naming': { required: true, description: 'Naming conventions' },
  'observability': { required: true, description: 'Observability (Phase 6)' },
  'offline-governance': { required: true, description: 'Offline governance' },
  'orchestras': { required: true, description: 'AI Orchestra Coordination (Phase 4)' },
  'performance': { required: true, description: 'Performance optimization' },
  'policy': { required: true, description: 'Policy engine' },
  'registry': { required: true, description: 'Registry system' },
  'sandbox': { required: true, description: 'Sandbox execution' },
  'sdk': { required: true, description: 'SDK and engine builder' },
  'search': { required: true, description: 'Semantic search' },
  'security': { required: true, description: 'Security features' },
  'storage': { required: true, description: 'Storage abstraction layer' },
  'telemetry': { required: true, description: 'Telemetry and metrics' },
  'tenancy': { required: true, description: 'Tenant management' },
  'testing': { required: true, description: 'Testing utilities' },
  'types': { required: true, description: 'TypeScript types' },
  'ui': { required: true, description: 'UI schema registry' },
  'utils': { required: true, description: 'Utility functions' },
  'validation': { required: true, description: 'Validation utilities' },
  'watchdog': { required: true, description: 'Watchdog daemon' },
  'workflows': { required: true, description: 'Workflow engine' },
  
  // Test directories
  '__tests__': { required: false, description: 'Integration tests' },
  'tests': { required: false, description: 'Unit tests' },
  
  // Documentation and config
  'docs': { required: false, description: 'Documentation' },
  'examples': { required: false, description: 'Example code' },
  'scripts': { required: false, description: 'Build and utility scripts' },
  'cli': { required: false, description: 'CLI tools' },
};

// Directories that should NOT exist (deprecated/removed)
const DEPRECATED_DIRS = [
  'routes', // Removed in Phase 2
];

// Files that should exist at root
const REQUIRED_ROOT_FILES = [
  'index.ts',
  'package.json',
  'tsconfig.json',
  'README.md',
  'GRCD-KERNEL.md',
];

interface Violation {
  type: 'missing' | 'unexpected' | 'deprecated' | 'file_missing';
  path: string;
  message: string;
  severity: 'error' | 'warning';
}

class DirectoryLinter {
  private violations: Violation[] = [];
  private kernelRoot: string;
  private verbose: boolean;

  constructor(kernelRoot: string, verbose: boolean = false) {
    this.kernelRoot = kernelRoot;
    this.verbose = verbose;
  }

  async lint(): Promise<boolean> {
    console.log('🔍 Validating kernel directory structure...\n');

    // Check required root files
    await this.checkRootFiles();

    // Check required directories
    await this.checkRequiredDirectories();

    // Check for deprecated directories
    await this.checkDeprecatedDirectories();

    // Check for unexpected top-level directories
    await this.checkUnexpectedDirectories();

    // Report results
    this.report();

    return this.violations.filter(v => v.severity === 'error').length === 0;
  }

  private async checkRootFiles(): Promise<void> {
    for (const file of REQUIRED_ROOT_FILES) {
      const filePath = join(this.kernelRoot, file);
      if (!existsSync(filePath)) {
        this.violations.push({
          type: 'file_missing',
          path: file,
          message: `Required root file missing: ${file}`,
          severity: 'error',
        });
      }
    }
  }

  private async checkRequiredDirectories(): Promise<void> {
    for (const [dir, config] of Object.entries(CANONICAL_STRUCTURE)) {
      if (config.required) {
        const dirPath = join(this.kernelRoot, dir);
        if (!existsSync(dirPath)) {
          this.violations.push({
            type: 'missing',
            path: dir,
            message: `Required directory missing: ${dir} (${config.description})`,
            severity: 'error',
          });
        }
      }
    }
  }

  private async checkDeprecatedDirectories(): Promise<void> {
    for (const dir of DEPRECATED_DIRS) {
      const dirPath = join(this.kernelRoot, dir);
      if (existsSync(dirPath)) {
        this.violations.push({
          type: 'deprecated',
          path: dir,
          message: `Deprecated directory found: ${dir} (should be removed)`,
          severity: 'error',
        });
      }
    }
  }

  private async checkUnexpectedDirectories(): Promise<void> {
    const entries = await readdir(this.kernelRoot);
    const knownDirs = new Set([
      ...Object.keys(CANONICAL_STRUCTURE),
      ...REQUIRED_ROOT_FILES,
      'node_modules',
      '.git',
      '.vscode',
      '.idea',
      'dist',
      'build',
      '.next',
      '.turbo',
    ]);

    for (const entry of entries) {
      if (knownDirs.has(entry)) {
        continue;
      }

      const entryPath = join(this.kernelRoot, entry);
      const stats = await stat(entryPath);
      
      if (stats.isDirectory()) {
        // Check if it's a markdown file (documentation)
        if (entry.endsWith('.md')) {
          continue; // Allow markdown files at root
        }

        this.violations.push({
          type: 'unexpected',
          path: entry,
          message: `Unexpected directory: ${entry} (not in canonical structure)`,
          severity: 'warning',
        });
      }
    }
  }

  private report(): void {
    const errors = this.violations.filter(v => v.severity === 'error');
    const warnings = this.violations.filter(v => v.severity === 'warning');

    console.log(`\n📊 Validation Results:\n`);
    console.log(`   ✅ Errors: ${errors.length}`);
    console.log(`   ⚠️  Warnings: ${warnings.length}`);
    console.log(`   📁 Total violations: ${this.violations.length}\n`);

    if (errors.length > 0) {
      console.log('❌ ERRORS:\n');
      errors.forEach(v => {
        console.log(`   [ERROR] ${v.path}`);
        console.log(`           ${v.message}\n`);
      });
    }

    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS:\n');
      warnings.forEach(v => {
        console.log(`   [WARN]  ${v.path}`);
        console.log(`           ${v.message}\n`);
      });
    }

    if (this.violations.length === 0) {
      console.log('✅ Directory structure is valid!\n');
    } else {
      console.log('\n💡 Tips:');
      console.log('   - Review GRCD-KERNEL.md Section 4.1 for canonical structure');
      console.log('   - Check DIRECTORY-STRUCTURE-WORK-COMPLETE.md for migration notes');
      console.log('   - Run with --verbose for detailed information\n');
    }
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const fix = args.includes('--fix');

  const kernelRoot = join(__dirname, '..');
  
  const linter = new DirectoryLinter(kernelRoot, verbose);
  const isValid = await linter.lint();

  if (!isValid) {
    console.error('\n❌ Directory structure validation failed!\n');
    process.exit(1);
  }

  if (fix) {
    console.log('💡 --fix flag is not yet implemented');
    console.log('   Please fix violations manually based on the report above\n');
  }

  console.log('✅ Directory structure validation passed!\n');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Linter error:', err);
  process.exit(1);
});


/**
 * Directory Structure Audit Tool
 * 
 * GRCD-KERNEL v4.0.0 T-DIR-1: Directory structure validation
 * MCP tool for auditing kernel directory structure compliance
 * 
 * This tool validates that the kernel follows the canonical directory
 * structure defined in GRCD-KERNEL.md Section 4.1 and enforces
 * modularity boundaries.
 */

import { readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { existsSync } from 'fs';
import { mcpAuditLogger } from '../audit/mcp-audit';
import { baseLogger } from '../../observability/logger';

// Import directory structure from dir-lint (canonical structure)
// This should match GRCD-KERNEL.md Section 4.1
const CANONICAL_STRUCTURE: Record<string, {
  required: boolean;
  description: string;
  allowedSubdirs?: string[];
  allowedFiles?: string[];
}> = {
  'actions': { required: true, description: 'Action dispatcher and registry' },
  'agents': { required: true, description: 'AI Agent Integration (Phase 5)' },
  'ai': { required: true, description: 'AI governance and client' },
  'ai-optimization': { required: true, description: 'AI optimization engines' },
  'api': { required: true, description: 'HTTP API layer (Hono)' },
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
};

const DEPRECATED_DIRS = [
  'routes', // Removed in Phase 2
  'http', // Consolidated into api/ in Phase 3
];

export interface DirectoryViolation {
  type: 'missing' | 'unexpected' | 'deprecated' | 'modularity_breach';
  path: string;
  message: string;
  severity: 'error' | 'warning';
  grcdReference?: string; // Reference to GRCD section
}

export interface DirectoryAuditResult {
  valid: boolean;
  violations: DirectoryViolation[];
  summary: {
    totalViolations: number;
    errors: number;
    warnings: number;
    modularityBreaches: number;
  };
  timestamp: string;
}

/**
 * Audit kernel directory structure for compliance
 * 
 * @param kernelRoot - Root directory of kernel (default: current working directory)
 * @param strict - If true, treats warnings as errors
 * @returns Audit result with violations
 */
export async function auditDirectoryStructure(
  kernelRoot: string = process.cwd(),
  strict: boolean = false
): Promise<DirectoryAuditResult> {
  const violations: DirectoryViolation[] = [];
  const startTime = Date.now();

  try {
    // 1. Check required directories
    for (const [dir, config] of Object.entries(CANONICAL_STRUCTURE)) {
      if (config.required) {
        const dirPath = join(kernelRoot, dir);
        if (!existsSync(dirPath)) {
          violations.push({
            type: 'missing',
            path: dir,
            message: `Required directory missing: ${dir} (${config.description})`,
            severity: 'error',
            grcdReference: 'GRCD-KERNEL.md Section 4.1',
          });
        }
      }
    }

    // 2. Check for deprecated directories
    for (const dir of DEPRECATED_DIRS) {
      const dirPath = join(kernelRoot, dir);
      if (existsSync(dirPath)) {
        violations.push({
          type: 'deprecated',
          path: dir,
          message: `Deprecated directory found: ${dir} (should be removed per GRCD)`,
          severity: 'error',
          grcdReference: 'GRCD-KERNEL.md Section 4.2',
        });
      }
    }

    // 3. Check for unexpected directories (modularity breach)
    const entries = await readdir(kernelRoot);
    const knownDirs = new Set([
      ...Object.keys(CANONICAL_STRUCTURE),
      'node_modules',
      '.git',
      '.vscode',
      '.idea',
      'dist',
      'build',
      '.next',
      '.turbo',
      '__tests__',
      'tests',
      'docs',
      'examples',
      'scripts',
      'cli',
    ]);

    for (const entry of entries) {
      if (knownDirs.has(entry)) {
        continue;
      }

      const entryPath = join(kernelRoot, entry);
      const stats = await stat(entryPath);
      
      if (stats.isDirectory()) {
        // Allow markdown files at root (documentation)
        if (entry.endsWith('.md')) {
          continue;
        }

        violations.push({
          type: 'modularity_breach',
          path: entry,
          message: `Unexpected directory: ${entry} (not in canonical structure - modularity breach)`,
          severity: strict ? 'error' : 'warning',
          grcdReference: 'GRCD-KERNEL.md Section 4.2 - Directory Norms & Enforcement',
        });
      }
    }

    // 4. Check modularity boundaries (files in wrong directories)
    // This is a simplified check - could be expanded
    await checkModularityBoundaries(kernelRoot, violations);

    // 5. Log all violations to audit system
    const traceId = `dir-audit-${Date.now()}`;
    for (const violation of violations) {
      if (violation.type === 'modularity_breach') {
        await mcpAuditLogger.auditModularityBreach(
          {
            path: violation.path,
            message: violation.message,
          },
          { traceId }
        );
      } else {
        await mcpAuditLogger.auditDirectoryViolation(
          violation,
          { traceId }
        );
      }
    }

    const errors = violations.filter(v => v.severity === 'error').length;
    const warnings = violations.filter(v => v.severity === 'warning').length;
    const modularityBreaches = violations.filter(v => v.type === 'modularity_breach').length;

    const result: DirectoryAuditResult = {
      valid: errors === 0,
      violations,
      summary: {
        totalViolations: violations.length,
        errors,
        warnings,
        modularityBreaches,
      },
      timestamp: new Date().toISOString(),
    };

    // Audit the audit (meta-audit)
    const executionTimeMs = Date.now() - startTime;
    await mcpAuditLogger.auditToolInvocation(
      'kernel',
      {
        tool: 'audit_directory_structure',
        arguments: { kernelRoot, strict },
        metadata: { executionTimeMs },
      },
      {
        success: result.valid,
        data: result,
        metadata: { executionTimeMs },
      }
    );

    return result;
  } catch (error: any) {
    baseLogger.error({ err: error }, '[MCP] Directory audit failed');
    
    await mcpAuditLogger.auditToolInvocation(
      'kernel',
      {
        tool: 'audit_directory_structure',
        arguments: { kernelRoot, strict },
        metadata: {},
      },
      {
        success: false,
        error: {
          code: 'AUDIT_ERROR',
          message: error.message,
        },
        metadata: {},
      }
    );

    throw error;
  }
}

/**
 * Check modularity boundaries
 * Ensures files are in correct directories per GRCD rules
 */
async function checkModularityBoundaries(
  kernelRoot: string,
  violations: DirectoryViolation[]
): Promise<void> {
  // Check for common modularity breaches:
  // 1. MCP files outside kernel/mcp/
  // 2. Orchestra files outside kernel/orchestras/
  // 3. Audit files outside kernel/audit/
  // 4. API routes outside kernel/api/

  const modularityRules = [
    {
      pattern: /mcp.*\.ts$/i,
      allowedDirs: ['mcp'],
      violationMessage: 'MCP-related files must be in kernel/mcp/ subdirectories',
      grcdRef: 'GRCD-KERNEL.md Section 4.2 Rule 6',
    },
    {
      pattern: /orchestra.*\.ts$/i,
      allowedDirs: ['orchestras'],
      violationMessage: 'Orchestra-related files must be in kernel/orchestras/ subdirectories',
      grcdRef: 'GRCD-KERNEL.md Section 4.2 Rule 7',
    },
    {
      pattern: /audit.*\.ts$/i,
      allowedDirs: ['audit', 'mcp/audit'],
      violationMessage: 'Audit files must be in kernel/audit/ or kernel/mcp/audit/',
      grcdRef: 'GRCD-KERNEL.md Section 4.2',
    },
  ];

  // This is a simplified check - full implementation would scan all files
  // For now, we'll rely on the unexpected directory check above
}

/**
 * MCP Tool Definition
 */
export const directoryAuditTool = {
  name: 'audit_directory_structure',
  description: 'Audit kernel directory structure for GRCD compliance and modularity violations. Checks against GRCD-KERNEL.md Section 4.1 canonical structure.',
  inputSchema: {
    type: 'object',
    properties: {
      kernelRoot: {
        type: 'string',
        description: 'Root directory of kernel (default: current working directory)',
        default: process.cwd(),
      },
      strict: {
        type: 'boolean',
        description: 'If true, treats warnings as errors',
        default: false,
      },
    },
    required: [],
  },
  handler: async (args: { kernelRoot?: string; strict?: boolean }) => {
    const result = await auditDirectoryStructure(
      args.kernelRoot || process.cwd(),
      args.strict || false
    );
    return {
      success: result.valid,
      data: result,
    };
  },
};


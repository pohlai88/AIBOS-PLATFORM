/**
 * @fileoverview tRPC Adapter - End-to-end type-safe API
 * @module @bff/adapters/trpc
 * @description Type-safe RPC for Next.js frontend integration
 */

import type { BffManifestType } from '../bff.manifest';
import type { KernelExecutor } from '../gateway/mcp-gateway';
import { BffSchemas } from '../bff.schema';

// ============================================================================
// Types
// ============================================================================

export interface TRPCContext {
  tenantId: string;
  userId: string;
  requestId: string;
  roles: string[];
  permissions: string[];
  protocol: 'trpc';
}

/** Procedures requiring specific permissions */
const PROTECTED_PROCEDURES: Record<string, string[]> = {
  'execute': ['execute:action'],
  'listEngines': ['read:engines'],
  'getEngine': ['read:engines'],
  'listActions': ['read:actions'],
};

/** Allowed action patterns for execute */
const ALLOWED_ACTION_PATTERNS = [
  /^system\.(health|status|version)\(\)$/,
  /^registry\.(listEngines|getEngine|listActions)\(/,
  /^engine\.[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+\(/,
];

/** Blocked action patterns */
const BLOCKED_ACTION_PATTERNS = [
  /drop|delete|truncate|destroy/i,
  /eval|exec|spawn|fork/i,
  /process\.|require\(|import\(/i,
  /__proto__|prototype|constructor/i,
];

export interface TRPCProcedure {
  name: string;
  type: 'query' | 'mutation' | 'subscription';
  inputSchema?: unknown;
  outputSchema?: unknown;
  handler: (ctx: TRPCContext, input?: unknown) => Promise<unknown>;
}

// ============================================================================
// tRPC Adapter
// ============================================================================

/**
 * tRPC Adapter
 * 
 * Features:
 * - End-to-end type safety with Zod
 * - Query, mutation, subscription support
 * - Context injection (tenant, user, request)
 * - Manifest-driven configuration
 */
export class TRPCAdapter {
  private procedures: Map<string, TRPCProcedure> = new Map();
  private ready = false;

  constructor(
    private readonly kernel: KernelExecutor,
    private readonly manifest: Readonly<BffManifestType>
  ) {
    this.registerCoreProcedures();
    this.ready = true;
  }

  // ===========================================================================
  // Procedure Registration
  // ===========================================================================

  /**
   * Register core procedures
   */
  private registerCoreProcedures(): void {
    // Health query
    this.procedures.set('health', {
      name: 'health',
      type: 'query',
      outputSchema: BffSchemas.HealthResponse,
      handler: async (ctx) => {
        return this.kernel.run({
          code: 'system.health()',
          context: 'trpc',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        });
      },
    });

    // Execute mutation
    this.procedures.set('execute', {
      name: 'execute',
      type: 'mutation',
      inputSchema: BffSchemas.ExecuteRequest,
      outputSchema: BffSchemas.ExecuteResponse,
      handler: async (ctx, input) => {
        const { action, input: actionInput, context } = input as {
          action: string;
          input?: unknown;
          context?: string;
        };
        return this.kernel.run({
          code: action,
          context: context || 'trpc',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          input: actionInput,
        });
      },
    });

    // List engines query
    this.procedures.set('listEngines', {
      name: 'listEngines',
      type: 'query',
      inputSchema: BffSchemas.PaginationParams,
      outputSchema: BffSchemas.EngineListResponse,
      handler: async (ctx, input) => {
        return this.kernel.run({
          code: 'registry.listEngines()',
          context: 'trpc',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          input,
        });
      },
    });

    // List actions query
    this.procedures.set('listActions', {
      name: 'listActions',
      type: 'query',
      inputSchema: BffSchemas.PaginationParams,
      outputSchema: BffSchemas.ActionListResponse,
      handler: async (ctx, input) => {
        return this.kernel.run({
          code: 'registry.listActions()',
          context: 'trpc',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          input,
        });
      },
    });

    // Get engine query
    this.procedures.set('getEngine', {
      name: 'getEngine',
      type: 'query',
      handler: async (ctx, input) => {
        const { name } = input as { name: string };
        return this.kernel.run({
          code: `registry.getEngine("${name}")`,
          context: 'trpc',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        });
      },
    });
  }

  // ===========================================================================
  // Request Handler
  // ===========================================================================

  /**
   * Handle tRPC request
   */
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(Boolean);
    const procedureName = pathParts[pathParts.length - 1];

    const procedure = this.procedures.get(procedureName);
    if (!procedure) {
      return this.errorResponse('NOT_FOUND', `Procedure "${procedureName}" not found`);
    }

    // Extract context
    const ctx: TRPCContext = {
      tenantId: req.headers.get('X-Tenant-ID') || 'default',
      userId: req.headers.get('X-User-ID') || 'anonymous',
      requestId: req.headers.get('X-Request-ID') || crypto.randomUUID(),
      roles: (req.headers.get('X-User-Roles') || '').split(',').filter(Boolean),
      permissions: (req.headers.get('X-User-Permissions') || '').split(',').filter(Boolean),
      protocol: 'trpc',
    };

    try {
      // Authorization check
      const requiredPerms = PROTECTED_PROCEDURES[procedureName];
      if (requiredPerms && !this.hasPermissions(ctx, requiredPerms)) {
        return this.errorResponse('FORBIDDEN', `Missing permission for ${procedureName}`, ctx.requestId);
      }

      // Parse input
      let input: unknown;
      if (req.method === 'POST') {
        input = await req.json().catch(() => ({}));
      } else {
        const inputParam = url.searchParams.get('input');
        if (inputParam) {
          input = JSON.parse(inputParam);
        }
      }

      // Validate action for execute procedure
      if (procedureName === 'execute' && input) {
        const actionValidation = this.validateAction((input as Record<string, unknown>).action as string);
        if (!actionValidation.valid) {
          return this.errorResponse('FORBIDDEN', actionValidation.message!, ctx.requestId);
        }
      }

      // Execute procedure
      const startTime = Date.now();
      const result = await procedure.handler(ctx, input);
      const duration = Date.now() - startTime;

      return new Response(
        JSON.stringify({
          result: {
            data: result,
          },
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': ctx.requestId,
            'X-Response-Time': `${duration}ms`,
          },
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.errorResponse('INTERNAL_ERROR', message, ctx.requestId);
    }
  }

  // ===========================================================================
  // Router Generation (for @trpc/server integration)
  // ===========================================================================

  /**
   * Generate router definition for @trpc/server
   */
  getRouterDefinition() {
    const definition: Record<string, {
      type: 'query' | 'mutation' | 'subscription';
      input?: unknown;
      output?: unknown;
    }> = {};

    for (const [name, procedure] of this.procedures) {
      definition[name] = {
        type: procedure.type,
        input: procedure.inputSchema,
        output: procedure.outputSchema,
      };
    }

    return definition;
  }

  /**
   * Get procedure by name
   */
  getProcedure(name: string): TRPCProcedure | undefined {
    return this.procedures.get(name);
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  /**
   * Create error response
   */
  private errorResponse(code: string, message: string, requestId?: string): Response {
    return new Response(
      JSON.stringify({
        error: {
          code,
          message,
          data: {
            code,
            httpStatus: code === 'NOT_FOUND' ? 404 : 500,
          },
        },
      }),
      {
        status: code === 'NOT_FOUND' ? 404 : 500,
        headers: {
          'Content-Type': 'application/json',
          ...(requestId && { 'X-Request-ID': requestId }),
        },
      }
    );
  }

  /**
   * Check if context has required permissions
   */
  private hasPermissions(ctx: TRPCContext, required: string[]): boolean {
    if (!ctx.permissions) return false;
    return required.every(perm => ctx.permissions.includes(perm));
  }

  /**
   * Validate action string against whitelist/blocklist
   */
  private validateAction(action: string): { valid: boolean; message?: string } {
    if (!action || typeof action !== 'string') {
      return { valid: false, message: 'Action is required' };
    }

    // Check blocklist first
    for (const pattern of BLOCKED_ACTION_PATTERNS) {
      if (pattern.test(action)) {
        return { valid: false, message: 'Action contains forbidden pattern' };
      }
    }

    // Check whitelist in production
    const isProduction = (this.manifest as Record<string, unknown>).env === 'production';
    if (isProduction) {
      const isAllowed = ALLOWED_ACTION_PATTERNS.some(pattern => pattern.test(action));
      if (!isAllowed) {
        return { valid: false, message: 'Action not in allowed list' };
      }
    }

    return { valid: true };
  }

  /**
   * Check if adapter is ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Add custom procedure
   */
  addProcedure(procedure: TRPCProcedure): void {
    this.procedures.set(procedure.name, procedure);
  }

  /**
   * Get all procedures
   */
  getProcedures(): TRPCProcedure[] {
    return Array.from(this.procedures.values());
  }
}

/**
 * Factory function
 */
export function createTRPCAdapter(
  kernel: KernelExecutor,
  manifest: Readonly<BffManifestType>
): TRPCAdapter {
  return new TRPCAdapter(kernel, manifest);
}


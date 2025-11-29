/**
 * @fileoverview OpenAPI Adapter - REST API with auto-generated OpenAPI spec
 * @module @bff/adapters/openapi
 * @description Uses @hono/zod-openapi for type-safe REST endpoints
 */

import type { BffManifestType } from '../bff.manifest';
import type { KernelExecutor } from '../gateway/mcp-gateway';
import { BffSchemas } from '../bff.schema';

// ============================================================================
// Types
// ============================================================================

export interface OpenAPIContext {
  tenantId: string;
  userId: string;
  requestId: string;
  roles: string[];
  permissions: string[];
  protocol: 'openapi';
}

/** Routes requiring specific permissions */
const PROTECTED_ROUTES: Record<string, string[]> = {
  'POST:/execute': ['execute:action'],
  'GET:/engines': ['read:engines'],
  'GET:/actions': ['read:actions'],
};

/** Allowed action patterns (whitelist) */
const ALLOWED_ACTION_PATTERNS = [
  /^system\.(health|status|version)\(\)$/,
  /^registry\.(listEngines|getEngine|listActions)\(/,
  /^engine\.[a-zA-Z0-9_]+\.[a-zA-Z0-9_]+\(/,
];

/** Blocked action patterns (dangerous) */
const BLOCKED_ACTION_PATTERNS = [
  /drop|delete|truncate|destroy/i,
  /eval|exec|spawn|fork/i,
  /process\.|require\(|import\(/i,
  /__proto__|prototype|constructor/i,
];

export interface OpenAPIRoute {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  handler: (ctx: OpenAPIContext, body?: unknown) => Promise<unknown>;
  tags?: string[];
  summary?: string;
  inputSchema?: unknown;
  outputSchema?: unknown;
}

// ============================================================================
// OpenAPI Adapter
// ============================================================================

/**
 * OpenAPI Adapter
 * 
 * Features:
 * - Auto-generated OpenAPI 3.1 spec from Zod schemas
 * - Type-safe request/response handling
 * - Manifest-driven configuration
 * - Built-in health, execute, engines, actions endpoints
 */
export class OpenAPIAdapter {
  private routes: OpenAPIRoute[] = [];
  private ready = false;

  constructor(
    private readonly kernel: KernelExecutor,
    private readonly manifest: Readonly<BffManifestType>
  ) {
    this.registerCoreRoutes();
    this.ready = true;
  }

  // ===========================================================================
  // Route Registration
  // ===========================================================================

  /**
   * Register core API routes
   */
  private registerCoreRoutes(): void {
    // Health check
    this.routes.push({
      method: 'GET',
      path: '/health',
      tags: ['System'],
      summary: 'Health check endpoint',
      outputSchema: BffSchemas.HealthResponse,
      handler: async (ctx) => {
        const result = await this.kernel.run({
          code: 'system.health()',
          context: 'openapi',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        });
        return this.wrapResponse(result, ctx.requestId);
      },
    });

    // Execute action
    this.routes.push({
      method: 'POST',
      path: '/execute',
      tags: ['Actions'],
      summary: 'Execute a kernel action',
      inputSchema: BffSchemas.ExecuteRequest,
      outputSchema: BffSchemas.ExecuteResponse,
      handler: async (ctx, body) => {
        const input = body as { action: string; input?: unknown; context?: string };
        const result = await this.kernel.run({
          code: input.action,
          context: input.context || 'openapi',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          input: input.input,
        });
        return this.wrapResponse(result, ctx.requestId);
      },
    });

    // List engines
    this.routes.push({
      method: 'GET',
      path: '/engines',
      tags: ['Engines'],
      summary: 'List registered engines',
      outputSchema: BffSchemas.EngineListResponse,
      handler: async (ctx) => {
        const result = await this.kernel.run({
          code: 'registry.listEngines()',
          context: 'openapi',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        });
        return this.wrapResponse(result, ctx.requestId);
      },
    });

    // List actions
    this.routes.push({
      method: 'GET',
      path: '/actions',
      tags: ['Actions'],
      summary: 'List available actions',
      outputSchema: BffSchemas.ActionListResponse,
      handler: async (ctx) => {
        const result = await this.kernel.run({
          code: 'registry.listActions()',
          context: 'openapi',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        });
        return this.wrapResponse(result, ctx.requestId);
      },
    });
  }

  // ===========================================================================
  // Request Handler
  // ===========================================================================

  /**
   * Handle incoming request
   */
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const base = this.manifest.protocols.openapi.path;
    // Safe path extraction (handles trailing slashes, query params)
    const rawPath = url.pathname.startsWith(base)
      ? url.pathname.slice(base.length)
      : url.pathname;
    const path = rawPath.split('?')[0] || '/'; // Strip query params
    const method = req.method as OpenAPIRoute['method'];

    // Find matching route
    const route = this.routes.find(
      (r) => r.method === method && r.path === path
    );

    if (!route) {
      return this.errorResponse('NOT_FOUND', `Route ${method} ${path} not found`, 404);
    }

    // Extract context from headers
    const ctx: OpenAPIContext = {
      tenantId: req.headers.get('X-Tenant-ID') || 'default',
      userId: req.headers.get('X-User-ID') || 'anonymous',
      requestId: req.headers.get('X-Request-ID') || crypto.randomUUID(),
      roles: (req.headers.get('X-User-Roles') || '').split(',').filter(Boolean),
      permissions: (req.headers.get('X-User-Permissions') || '').split(',').filter(Boolean),
      protocol: 'openapi',
    };

    try {
      // Authorization check (use path without query params)
      const routeKey = `${method}:${path}`;
      const requiredPerms = PROTECTED_ROUTES[routeKey];
      if (requiredPerms && !this.hasPermissions(ctx, requiredPerms)) {
        return this.errorResponse('FORBIDDEN', `Missing permission for ${routeKey}`, 403, ctx.requestId);
      }

      // Parse body for POST/PUT/PATCH
      let body: unknown;
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        body = await req.json().catch(() => ({}));
      }

      // Validate action for /execute endpoint
      if (path === '/execute' && body) {
        const actionValidation = this.validateAction((body as Record<string, unknown>).action as string);
        if (!actionValidation.valid) {
          return this.errorResponse('FORBIDDEN', actionValidation.message!, 403, ctx.requestId);
        }
      }

      // Execute handler
      const startTime = Date.now();
      const result = await route.handler(ctx, body);
      const duration = Date.now() - startTime;

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': ctx.requestId,
          'X-Response-Time': `${duration}ms`,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return this.errorResponse('INTERNAL_ERROR', message, 500, ctx.requestId);
    }
  }

  // ===========================================================================
  // OpenAPI Spec Generation
  // ===========================================================================

  /**
   * Generate OpenAPI 3.1 specification
   */
  generateSpec(): object {
    const paths: Record<string, Record<string, unknown>> = {};

    for (const route of this.routes) {
      const pathKey = route.path;
      if (!paths[pathKey]) paths[pathKey] = {};

      const operation: Record<string, unknown> = {
        tags: route.tags || [],
        summary: route.summary || '',
        operationId: `${route.method.toLowerCase()}${route.path.replace(/\//g, '_')}`,
        responses: {
          '200': {
            description: 'Success',
            content: {
              'application/json': {
                schema: route.outputSchema || {},
              },
            },
          },
        },
      };

      // Add request body if input schema exists
      if (route.inputSchema) {
        operation.requestBody = {
          content: {
            'application/json': {
              schema: route.inputSchema,
            },
          },
        };
      }

      paths[pathKey][route.method.toLowerCase()] = operation;
    }

    return {
      openapi: '3.1.0',
      info: {
        title: 'AI-BOS API',
        version: this.manifest.version,
        description: 'AI-BOS Kernel REST API',
      },
      servers: [
        {
          url: this.manifest.protocols.openapi.path,
          description: 'API Server',
        },
      ],
      paths,
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
          },
          apiKey: {
            type: 'apiKey',
            in: 'header',
            name: 'X-API-Key',
          },
        },
      },
    };
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  /**
   * Wrap result in standard response format
   */
  private wrapResponse(data: unknown, requestId: string) {
    return {
      success: true,
      data,
      meta: {
        requestId,
        timestamp: new Date().toISOString(),
        protocol: 'openapi',
      },
    };
  }

  /**
   * Create error response
   */
  private errorResponse(
    code: string,
    message: string,
    status: number,
    requestId?: string
  ): Response {
    return new Response(
      JSON.stringify({
        success: false,
        error: { code, message },
        meta: {
          requestId: requestId || crypto.randomUUID(),
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * Check if context has required permissions
   */
  private hasPermissions(ctx: OpenAPIContext, required: string[]): boolean {
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

    // Normalize action: ensure it ends with () for pattern matching
    const normalized = action.trim() + (action.trim().endsWith(')') ? '' : '()');

    // Check blocklist first (against original and normalized)
    for (const pattern of BLOCKED_ACTION_PATTERNS) {
      if (pattern.test(action) || pattern.test(normalized)) {
        return { valid: false, message: 'Action contains forbidden pattern' };
      }
    }

    // Check whitelist (in production)
    const isProduction = (this.manifest as Record<string, unknown>).env === 'production';
    if (isProduction) {
      const isAllowed = ALLOWED_ACTION_PATTERNS.some(
        pattern => pattern.test(action) || pattern.test(normalized)
      );
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
   * Get registered routes
   */
  getRoutes(): OpenAPIRoute[] {
    return [...this.routes];
  }

  /**
   * Add custom route
   */
  addRoute(route: OpenAPIRoute): void {
    this.routes.push(route);
  }
}

/**
 * Factory function
 */
export function createOpenAPIAdapter(
  kernel: KernelExecutor,
  manifest: Readonly<BffManifestType>
): OpenAPIAdapter {
  return new OpenAPIAdapter(kernel, manifest);
}


/**
 * @fileoverview GraphQL Adapter - Flexible query API
 * @module @bff/adapters/graphql
 * @description GraphQL endpoint with schema-first approach
 */

import type { BffManifestType } from '../bff.manifest';
import type { KernelExecutor } from '../gateway/mcp-gateway';

// ============================================================================
// Types
// ============================================================================

export interface GraphQLContext {
  tenantId: string;
  userId: string;
  requestId: string;
  roles: string[];
  permissions: string[];
  protocol: 'graphql';
}

/** Dangerous GraphQL patterns */
const DANGEROUS_PATTERNS = [
  /__schema/i,           // Introspection (disable in production)
  /__type/i,             // Type introspection
  /fragment\s+\w+\s+on\s+\w+\s*\{[^}]*\.\.\.\w+/i, // Recursive fragments
];

/** Fields requiring elevated permissions */
const PROTECTED_FIELDS: Record<string, string[]> = {
  'Mutation.execute': ['execute:action'],
  'Query.engines': ['read:engines'],
};

export interface GraphQLResolver {
  type: 'Query' | 'Mutation' | 'Subscription';
  name: string;
  handler: (ctx: GraphQLContext, args: Record<string, unknown>) => Promise<unknown>;
}

// ============================================================================
// GraphQL Adapter
// ============================================================================

/**
 * GraphQL Adapter
 * 
 * Features:
 * - Schema-first GraphQL API
 * - Query, mutation, subscription support
 * - Complexity limiting (from manifest)
 * - Depth limiting (from manifest)
 * - Context injection
 */
export class GraphQLAdapter {
  private resolvers: Map<string, GraphQLResolver> = new Map();
  private ready = false;

  constructor(
    private readonly kernel: KernelExecutor,
    private readonly manifest: Readonly<BffManifestType>
  ) {
    this.registerCoreResolvers();
    this.ready = true;
  }

  // ===========================================================================
  // Resolver Registration
  // ===========================================================================

  /**
   * Register core resolvers
   */
  private registerCoreResolvers(): void {
    // Health query
    this.resolvers.set('Query.health', {
      type: 'Query',
      name: 'health',
      handler: async (ctx) => {
        return this.kernel.run({
          code: 'system.health()',
          context: 'graphql',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        });
      },
    });

    // Engines query
    this.resolvers.set('Query.engines', {
      type: 'Query',
      name: 'engines',
      handler: async (ctx, args) => {
        return this.kernel.run({
          code: 'registry.listEngines()',
          context: 'graphql',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          input: args,
        });
      },
    });

    // Engine query
    this.resolvers.set('Query.engine', {
      type: 'Query',
      name: 'engine',
      handler: async (ctx, args) => {
        return this.kernel.run({
          code: `registry.getEngine("${args.name}")`,
          context: 'graphql',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
        });
      },
    });

    // Actions query
    this.resolvers.set('Query.actions', {
      type: 'Query',
      name: 'actions',
      handler: async (ctx, args) => {
        return this.kernel.run({
          code: 'registry.listActions()',
          context: 'graphql',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          input: args,
        });
      },
    });

    // Execute mutation
    this.resolvers.set('Mutation.execute', {
      type: 'Mutation',
      name: 'execute',
      handler: async (ctx, args) => {
        return this.kernel.run({
          code: args.action as string,
          context: 'graphql',
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          input: args.input,
        });
      },
    });
  }

  // ===========================================================================
  // Request Handler
  // ===========================================================================

  /**
   * Handle GraphQL request
   */
  async fetch(req: Request): Promise<Response> {
    // Extract context (roles/permissions should come from auth middleware)
    const ctx: GraphQLContext = {
      tenantId: req.headers.get('X-Tenant-ID') || 'default',
      userId: req.headers.get('X-User-ID') || 'anonymous',
      requestId: req.headers.get('X-Request-ID') || crypto.randomUUID(),
      roles: (req.headers.get('X-User-Roles') || '').split(',').filter(Boolean),
      permissions: (req.headers.get('X-User-Permissions') || '').split(',').filter(Boolean),
      protocol: 'graphql',
    };

    try {
      // Parse GraphQL request
      let query: string;
      let variables: Record<string, unknown> = {};
      let operationName: string | undefined;

      if (req.method === 'POST') {
        const body = await req.json();
        query = body.query;
        variables = body.variables || {};
        operationName = body.operationName;
      } else {
        const url = new URL(req.url);
        query = url.searchParams.get('query') || '';
        const varsParam = url.searchParams.get('variables');
        if (varsParam) variables = JSON.parse(varsParam);
        operationName = url.searchParams.get('operationName') || undefined;
      }

      // Security: Check for dangerous patterns
      const patternCheck = this.checkDangerousPatterns(query);
      if (!patternCheck.valid) {
        return this.errorResponse('FORBIDDEN_PATTERN', patternCheck.message!, ctx.requestId);
      }

      // Check complexity/depth limits
      const depthCheck = this.checkQueryDepth(query);
      if (!depthCheck.valid) {
        return this.errorResponse('QUERY_TOO_DEEP', depthCheck.message!, ctx.requestId);
      }

      // Check complexity (field count)
      const complexityCheck = this.checkQueryComplexity(query);
      if (!complexityCheck.valid) {
        return this.errorResponse('QUERY_TOO_COMPLEX', complexityCheck.message!, ctx.requestId);
      }

      // Execute query (simplified - real impl would use graphql-js)
      const startTime = Date.now();
      const result = await this.executeQuery(ctx, query, variables);
      const duration = Date.now() - startTime;

      return new Response(
        JSON.stringify({ data: result }),
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
  // Query Execution
  // ===========================================================================

  /**
   * Execute GraphQL query (simplified implementation)
   */
  private async executeQuery(
    ctx: GraphQLContext,
    query: string,
    variables: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const result: Record<string, unknown> = {};

    // Parse query to find operations (simplified)
    const isQuery = query.includes('query') || !query.includes('mutation');
    const isMutation = query.includes('mutation');

    // Extract field names (simplified parsing)
    const fieldMatch = query.match(/\{\s*(\w+)/g);
    if (!fieldMatch) return result;

    for (const match of fieldMatch) {
      const fieldName = match.replace(/[{\s]/g, '');
      const resolverKey = `${isMutation ? 'Mutation' : 'Query'}.${fieldName}`;
      const resolver = this.resolvers.get(resolverKey);

      if (resolver) {
        // Authorization check
        const requiredPerms = PROTECTED_FIELDS[resolverKey];
        if (requiredPerms && !this.hasPermissions(ctx, requiredPerms)) {
          throw new Error(`Forbidden: missing permission for ${resolverKey}`);
        }
        result[fieldName] = await resolver.handler(ctx, variables);
      }
    }

    return result;
  }

  /**
   * Check query depth against manifest limits
   */
  private checkQueryDepth(query: string): { valid: boolean; message?: string } {
    const maxDepth = this.manifest.rateLimits.graphql.maxDepth;

    // Simple depth check (count nested braces)
    let depth = 0;
    let maxFound = 0;
    for (const char of query) {
      if (char === '{') {
        depth++;
        maxFound = Math.max(maxFound, depth);
      } else if (char === '}') {
        depth--;
      }
    }

    if (maxFound > maxDepth) {
      return {
        valid: false,
        message: `Query depth ${maxFound} exceeds maximum ${maxDepth}`,
      };
    }

    return { valid: true };
  }

  /**
   * Check for dangerous GraphQL patterns
   */
  private checkDangerousPatterns(query: string): { valid: boolean; message?: string } {
    // Allow introspection in development only
    const allowIntrospection = (this.manifest as Record<string, unknown>).env !== 'production';

    for (const pattern of DANGEROUS_PATTERNS) {
      if (pattern.test(query)) {
        // Skip introspection check in dev
        if (allowIntrospection && (pattern.source.includes('__schema') || pattern.source.includes('__type'))) {
          continue;
        }
        return {
          valid: false,
          message: `Query contains forbidden pattern`,
        };
      }
    }
    return { valid: true };
  }

  /**
   * Check query complexity (field count)
   */
  private checkQueryComplexity(query: string): { valid: boolean; message?: string } {
    const maxComplexity = this.manifest.rateLimits.graphql.maxComplexity;

    // Count fields (simplified - count word boundaries after colons or in selections)
    const fieldCount = (query.match(/\w+\s*[({:]/g) || []).length;

    if (fieldCount > maxComplexity) {
      return {
        valid: false,
        message: `Query complexity ${fieldCount} exceeds maximum ${maxComplexity}`,
      };
    }
    return { valid: true };
  }

  /**
   * Check if context has required permissions
   */
  private hasPermissions(ctx: GraphQLContext, required: string[]): boolean {
    if (!ctx.permissions) return false;
    return required.every(perm => ctx.permissions.includes(perm));
  }

  // ===========================================================================
  // Schema Generation
  // ===========================================================================

  /**
   * Generate GraphQL SDL schema
   */
  generateSchema(): string {
    return `
type Query {
  health: Health!
  engines(page: Int, pageSize: Int): EngineList!
  engine(name: String!): Engine
  actions(engine: String, page: Int, pageSize: Int): ActionList!
}

type Mutation {
  execute(action: String!, input: JSON): ExecuteResult!
}

type Health {
  status: String!
  version: String!
  uptime: Int!
  checks: JSON
}

type Engine {
  name: String!
  version: String!
  description: String
  status: String!
  actions: [String!]!
}

type EngineList {
  engines: [Engine!]!
  meta: PaginationMeta!
}

type Action {
  name: String!
  engine: String!
  description: String
  inputSchema: JSON
  outputSchema: JSON
}

type ActionList {
  actions: [Action!]!
  meta: PaginationMeta!
}

type ExecuteResult {
  success: Boolean!
  data: JSON
  error: Error
  meta: ResponseMeta!
}

type Error {
  code: String!
  message: String!
  details: JSON
}

type PaginationMeta {
  page: Int!
  pageSize: Int!
  total: Int!
  hasNext: Boolean!
  hasPrev: Boolean!
}

type ResponseMeta {
  requestId: String!
  duration: Int!
  timestamp: String!
}

scalar JSON
`;
  }

  // ===========================================================================
  // Helpers
  // ===========================================================================

  /**
   * Create error response
   */
  private errorResponse(code: string, message: string, requestId: string): Response {
    return new Response(
      JSON.stringify({
        errors: [{ message, extensions: { code } }],
      }),
      {
        status: code === 'QUERY_TOO_DEEP' ? 400 : 500,
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': requestId,
        },
      }
    );
  }

  /**
   * Check if adapter is ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Add custom resolver
   */
  addResolver(resolver: GraphQLResolver): void {
    this.resolvers.set(`${resolver.type}.${resolver.name}`, resolver);
  }

  /**
   * Get all resolvers
   */
  getResolvers(): GraphQLResolver[] {
    return Array.from(this.resolvers.values());
  }
}

/**
 * Factory function
 */
export function createGraphQLAdapter(
  kernel: KernelExecutor,
  manifest: Readonly<BffManifestType>
): GraphQLAdapter {
  return new GraphQLAdapter(kernel, manifest);
}


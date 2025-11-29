// examples/using-sdk.example.ts
/**
 * Example: Using the MCP Engine SDK
 * 
 * This demonstrates how to use the SDK to create a complete engine
 * with zero boilerplate and full type safety.
 */

import { z } from 'zod';
import { defineAction, defineEngine, quickAction } from '../sdk/engine-builder';

// ============================================================================
// EXAMPLE 1: Full Action Definition
// ============================================================================

// Step 1: Define schemas
const PingInputSchema = z.object({
  message: z.string().optional(),
});

const PingOutputSchema = z.object({
  message: z.string(),
  timestamp: z.string(),
});

// Step 2: Define action with SDK
const pingAction = defineAction({
  id: 'ping',
  domain: 'system',
  summary: 'Health check ping',
  description: 'Returns a pong response with timestamp',
  input: PingInputSchema,
  output: PingOutputSchema,
  permissions: ['system.ping'],
  tags: ['health', 'monitoring'],
  classification: {
    piiLevel: 'none',
    sensitivity: 'public',
  },
  handler: async (ctx) => {
    // ✅ ctx.input is fully typed as { message?: string }
    ctx.log('Ping received:', ctx.input.message);

    return {
      message: ctx.input.message || 'pong',
      timestamp: new Date().toISOString(),
    };
  },
});

// ============================================================================
// EXAMPLE 2: Query Action with Database
// ============================================================================

const ListUsersInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(50),
  role: z.enum(['admin', 'user', 'guest']).optional(),
});

const ListUsersOutputSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      email: z.string(),
      role: z.string(),
      createdAt: z.string(),
    })
  ),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
});

const listUsersAction = defineAction({
  id: 'list.users',  // ← Auto-detects kind as 'query'
  domain: 'users',
  summary: 'List users with pagination',
  input: ListUsersInputSchema,
  output: ListUsersOutputSchema,
  permissions: ['users.read'],
  handler: async (ctx) => {
    // ✅ Full type safety on ctx.input
    const { page, pageSize, role } = ctx.input;
    const offset = (page - 1) * pageSize;

    // Build query with optional role filter
    const whereClauses: string[] = ['tenant_id = $1'];
    const params: unknown[] = [ctx.tenant];

    if (role) {
      whereClauses.push(`role = $${params.length + 1}`);
      params.push(role);
    }

    // ✅ ctx.db is fully typed (DatabaseProxy)
    const rows = await ctx.db.query(
      `SELECT id, email, role, created_at as "createdAt"
       FROM users
       WHERE ${whereClauses.join(' AND ')}
       ORDER BY created_at DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, pageSize, offset]
    );

    const [{ count }] = await ctx.db.query<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM users WHERE ${whereClauses.join(' AND ')}`,
      params
    );

    return {
      items: rows as any[],
      page,
      pageSize,
      total: count,
    };
  },
});

// ============================================================================
// EXAMPLE 3: Command Action (Create)
// ============================================================================

const CreateUserInputSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['admin', 'user', 'guest']).default('user'),
});

const CreateUserOutputSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
  createdAt: z.string(),
});

const createUserAction = defineAction({
  id: 'create.user',  // ← Auto-detects kind as 'command'
  domain: 'users',
  summary: 'Create a new user',
  input: CreateUserInputSchema,
  output: CreateUserOutputSchema,
  permissions: ['users.create'],
  classification: {
    piiLevel: 'high',
    sensitivity: 'pii',
    compliance: ['GDPR', 'SOC2'],
  },
  handler: async (ctx) => {
    const { email, name, role } = ctx.input;

    // Generate ID
    const id = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Insert user
    const [user] = await ctx.db.query(
      `INSERT INTO users (id, tenant_id, email, name, role, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, email, name, role, created_at as "createdAt"`,
      [id, ctx.tenant, email, name, role]
    );

    // Emit event
    ctx.emit('user.created', {
      userId: id,
      tenantId: ctx.tenant,
      email,
    });

    ctx.log('User created:', id);

    return user as any;
  },
});

// ============================================================================
// EXAMPLE 4: Quick Action (for simple cases)
// ============================================================================

const statusAction = quickAction(
  'system',
  'status',
  z.object({}),
  z.object({
    status: z.string(),
    uptime: z.number(),
  }),
  async (ctx) => {
    return {
      status: 'ok',
      uptime: process.uptime(),
    };
  }
);

// ============================================================================
// EXAMPLE 5: Define Engine
// ============================================================================

const systemEngine = defineEngine({
  id: 'system',
  name: 'System Engine',
  version: '1.0.0',
  domain: 'system',
  description: 'Core system utilities and health checks',
  actions: [pingAction, statusAction],
  tags: ['core', 'system'],
  onInit: async (config) => {
    console.log('[SystemEngine] Initialized with config:', config);
  },
  onShutdown: async () => {
    console.log('[SystemEngine] Shutting down...');
  },
});

const usersEngine = defineEngine({
  id: 'users',
  name: 'Users Engine',
  version: '1.0.0',
  domain: 'users',
  description: 'User management actions',
  actions: [listUsersAction, createUserAction],
  tags: ['users', 'identity'],
});

// ============================================================================
// What the SDK Auto-Generated:
// ============================================================================

/*
For pingAction:
- ✅ Full action ID: 'system.ping'
- ✅ Kind: 'query' (auto-detected from 'ping')
- ✅ Tags: ['health', 'monitoring', 'system', 'query', 'ping']
- ✅ Contract with inputSchema + outputSchema
- ✅ Permissions: ['system.ping']

For listUsersAction:
- ✅ Full action ID: 'users.list.users'
- ✅ Kind: 'query' (auto-detected from 'list' prefix)
- ✅ Tags: ['users', 'query', 'list', 'users']
- ✅ Contract with inputSchema + outputSchema
- ✅ Permissions: ['users.read']

For createUserAction:
- ✅ Full action ID: 'users.create.user'
- ✅ Kind: 'command' (auto-detected from 'create' prefix)
- ✅ Tags: ['users', 'command', 'create', 'user']
- ✅ Contract with inputSchema + outputSchema
- ✅ Permissions: ['users.create']
- ✅ Classification: PII, GDPR, SOC2

For systemEngine:
- ✅ Engine registered in global registry
- ✅ 2 actions available
- ✅ Lifecycle hooks: onInit, onShutdown

For usersEngine:
- ✅ Engine registered in global registry
- ✅ 2 actions available
*/

// ============================================================================
// USAGE
// ============================================================================

// Engines are auto-registered! Just import this file in your bootstrap:
// import './examples/using-sdk.example';

// Now you can call actions via dispatcher:
// const result = await actionDispatcher.dispatch('system.ping', { message: 'hello' }, context);
// const users = await actionDispatcher.dispatch('users.list.users', { page: 1 }, context);


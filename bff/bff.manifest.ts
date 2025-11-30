/**
 * @fileoverview BFF Manifest (Class Version)
 * @module @kernel/bff/manifest
 * @description Fully typed, validated, drift-safe manifest with MCP signature.
 */

import { z } from 'zod';
import crypto from 'crypto';

// ============================================================================
// Utilities: Deep Merge + Deep Freeze
// ============================================================================

function isObject(item: unknown): item is Record<string, unknown> {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const output = { ...target } as T;
  for (const key of Object.keys(source) as (keyof T)[]) {
    const sourceVal = source[key];
    const targetVal = target[key];
    if (isObject(sourceVal) && isObject(targetVal)) {
      output[key] = deepMerge(targetVal as Record<string, unknown>, sourceVal as Record<string, unknown>) as T[keyof T];
    } else if (sourceVal !== undefined) {
      output[key] = sourceVal as T[keyof T];
    }
  }
  return output;
}

function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') return obj;
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const value = (obj as Record<string, unknown>)[key];
    if (value !== null && typeof value === 'object' && !Object.isFrozen(value)) {
      deepFreeze(value);
    }
  }
  return obj as Readonly<T>;
}

// ============================================================================
// Enums
// ============================================================================

export const ProtocolEnum = z.enum(['openapi', 'trpc', 'graphql', 'websocket', 'grpc']);
export type ProtocolName = z.infer<typeof ProtocolEnum>;

export const VersioningStrategyEnum = z.enum(['header', 'path', 'query']);
export type VersioningStrategy = z.infer<typeof VersioningStrategyEnum>;

export const TimeoutStrategyEnum = z.enum(['fail-fast', 'soft', 'retry', 'fallback']);
export type TimeoutStrategy = z.infer<typeof TimeoutStrategyEnum>;

export const ErrorCodeEnum = z.enum([
  'VALIDATION_ERROR',
  'AUTH_ERROR',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'METHOD_NOT_ALLOWED',
  'CONFLICT',
  'PAYLOAD_TOO_LARGE',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
  'NOT_IMPLEMENTED',
  'SERVICE_UNAVAILABLE',
  'GATEWAY_TIMEOUT',
  'TENANT_NOT_FOUND',
  'ENGINE_NOT_FOUND',
  'ACTION_NOT_FOUND',
  'EXECUTION_FAILED',
  'DRIFT_DETECTED',
]);
export type ErrorCode = z.infer<typeof ErrorCodeEnum>;

// ============================================================================
// Zod Schema for Manifest Structure
// ============================================================================

const ProtocolConfigSchema = z.object({
  enabled: z.boolean(),
  path: z.string(),
  version: z.string().optional(),
  docsPath: z.string().optional(),
  specPath: z.string().optional(),
  playgroundPath: z.string().optional(),
  heartbeatInterval: z.number().optional(),
  maxConnections: z.number().optional(),
  status: z.enum(['active', 'deprecated', 'planned']).optional(),
  transport: z.enum(['http', 'tcp', 'ws']).optional(),
});

const TimeoutConfigSchema = z.object({
  ms: z.number(),
  strategy: TimeoutStrategyEnum,
});

const ManifestSchema = z.object({
  kind: z.literal('bff-manifest'),
  name: z.string(),
  version: z.string(),
  description: z.string(),

  // Protocols
  protocols: z.object({
    openapi: ProtocolConfigSchema,
    trpc: ProtocolConfigSchema,
    graphql: ProtocolConfigSchema,
    websocket: ProtocolConfigSchema,
    grpc: ProtocolConfigSchema,
  }),

  // Protocol signature for DriftShield
  protocolSignature: z.string(),

  // Versioning
  versioning: z.object({
    strategy: VersioningStrategyEnum,
    header: z.string(),
    supported: z.array(z.string()),
    default: z.string(),
    latest: z.string(),
    deprecationWarning: z.boolean(),
    backwardsCompatible: z.number(),
    semver: z.boolean().default(true),
    allowLatestAlias: z.boolean().default(true),
  }),

  // Rate Limits
  rateLimits: z.object({
    requests: z.object({ window: z.string(), max: z.number() }),
    burst: z.object({ window: z.string(), max: z.number() }),
    websocket: z.object({
      connections: z.number(),
      messagesPerSecond: z.number(),
    }),
    graphql: z.object({
      maxDepth: z.number(),
      maxComplexity: z.number(),
      maxCPU: z.number().default(50),
    }),
  }),

  // Payload Limits
  payloadLimits: z.object({
    maxRequestSize: z.string(),
    maxResponseSize: z.string(),
    maxBatchSize: z.number(),
    maxArrayLength: z.number(),
    maxStringLength: z.number(),
    maxDepth: z.number().default(20),
  }),

  // Required Headers
  requiredHeaders: z.object({
    all: z.array(z.string()),
    authenticated: z.array(z.string()),
    optional: z.array(z.string()).optional(),
  }),

  // CORS
  cors: z.object({
    development: z.array(z.string()),
    staging: z.array(z.string()),
    production: z.array(z.string()),
    methods: z.array(z.string()),
    headers: z.array(z.string()),
    exposedHeaders: z.array(z.string()),
    credentials: z.boolean(),
    maxAge: z.number(),
  }),

  // Security Rules
  security: z.object({
    requireTenantId: z.boolean(),
    requireAuth: z.boolean(),
    allowAnonymous: z.array(z.string()),
    auditHighRisk: z.boolean(),
    auditMutations: z.boolean(),
    sanitizeInputs: z.boolean(),
    validateOutputs: z.boolean(),
    immutableHeaders: z.array(z.string()),
  }),

  // Enforcement Rules
  enforcement: z.object({
    allCallsThroughMCP: z.boolean(),
    zodValidationRequired: z.boolean(),
    tenantIsolationRequired: z.boolean(),
    auditTrailRequired: z.boolean(),
    rateLimitRequired: z.boolean(),
    aiFirewallRequired: z.boolean(),
    driftShieldRequired: z.boolean(),
    standardErrorFormat: z.boolean(),
    responseMetaRequired: z.boolean(),
    // Zone isolation config
    zones: z.object({
      systemBypassEnabled: z.boolean().default(true),
      crossTenantEnabled: z.boolean().default(false),
      crossTenantPermission: z.string().default('cross_tenant_access'),
      isolatedResources: z.array(z.string()),
      sharedResources: z.array(z.string()),
    }),
    // Error masking (hide internal details in production)
    errorMaskingEnabled: z.boolean().default(true),
  }),

  // Error Codes
  errorCodes: z.record(
    z.string(),
    z.object({
      status: z.number(),
      recoverable: z.boolean(),
    })
  ),

  // Timeouts
  timeouts: z.object({
    default: TimeoutConfigSchema,
    longRunning: TimeoutConfigSchema,
    websocket: TimeoutConfigSchema,
    healthCheck: TimeoutConfigSchema,
  }),

  // Retry
  retry: z.object({
    maxAttempts: z.number(),
    initialDelay: z.number(),
    maxDelay: z.number(),
    backoffMultiplier: z.number(),
    jitter: z.boolean().default(true),
    retryableErrors: z.array(z.string()),
  }),

  // Error Aliases
  errorAliases: z.record(z.string(), z.string()),

  // Hardening config
  hardening: z.object({
    securityHeadersEnabled: z.boolean().default(true),
    hostHeaderRequired: z.boolean().default(true),
    hostWhitelist: z.array(z.string()).optional(),
    stripForwardedHeaders: z.boolean().default(true),
    strictTransportSecurity: z.boolean().default(true),
  }),

  // Computed signature (added at runtime)
  signature: z.string().optional(),
});

export type BffManifestType = z.infer<typeof ManifestSchema>;

// ============================================================================
// Typed Manifest Class with Validation + Auto Signature
// ============================================================================

export class BffManifestClass {
  private readonly manifest: BffManifestType;

  constructor(config: Omit<BffManifestType, 'signature'>) {
    const result = ManifestSchema.safeParse(config);

    if (!result.success) {
      console.error('❌ Invalid BFF Manifest');
      console.error(result.error.format());
      throw new Error(`Invalid BFF Manifest: ${result.error.message}`);
    }

    // Validate invariants
    this.validateInvariants(result.data);

    // Assign manifest
    this.manifest = result.data;

    // Add MCP drift signature
    this.manifest.signature = this.computeSignature();
  }

  /**
   * Validate manifest invariants (policy consistency)
   */
  private validateInvariants(config: BffManifestType): void {
    const { security, enforcement } = config;

    // Invariant: requireTenantId implies tenantIsolationRequired
    if (security.requireTenantId && !enforcement.tenantIsolationRequired) {
      throw new Error('Invariant violation: requireTenantId=true requires tenantIsolationRequired=true');
    }

    // Invariant: auditMutations implies auditTrailRequired
    if (security.auditMutations && !enforcement.auditTrailRequired) {
      throw new Error('Invariant violation: auditMutations=true requires auditTrailRequired=true');
    }

    // Invariant: aiFirewallRequired needs sanitizeInputs
    if (enforcement.aiFirewallRequired && !security.sanitizeInputs) {
      throw new Error('Invariant violation: aiFirewallRequired=true requires sanitizeInputs=true');
    }
  }

  /**
   * Generate SHA256 checksum - used by DriftShield
   */
  private computeSignature(): string {
    const hash = crypto.createHash('sha256');
    // Exclude signature field from hash computation
    const { signature, ...rest } = this.manifest;
    hash.update(JSON.stringify(rest, Object.keys(rest).sort())); // Stable stringify
    return `sha256-${hash.digest('hex')}`;
  }

  /**
   * Public accessor - returns deeply immutable config
   */
  get config(): Readonly<BffManifestType> {
    return deepFreeze(this.manifest);
  }

  /**
   * Verify manifest integrity
   */
  verifyIntegrity(): boolean {
    const currentSignature = this.computeSignature();
    return this.manifest.signature === currentSignature;
  }

  /**
   * Verify integrity with detailed report (for DriftShield)
   */
  verifyIntegrityDetailed(): { ok: boolean; expected: string; actual: string } {
    const actual = this.computeSignature();
    return {
      ok: this.manifest.signature === actual,
      expected: this.manifest.signature || '',
      actual,
    };
  }

  /**
   * Get protocol config by name
   */
  getProtocol(name: ProtocolName) {
    return this.manifest.protocols[name];
  }

  /**
   * Check if protocol is enabled
   */
  isProtocolEnabled(name: ProtocolName): boolean {
    return this.manifest.protocols[name]?.enabled ?? false;
  }

  /**
   * Get error code info
   */
  getErrorInfo(code: string) {
    return this.manifest.errorCodes[code];
  }

  /**
   * Check if path allows anonymous access
   */
  isAnonymousAllowed(path: string): boolean {
    return this.manifest.security.allowAnonymous.some(
      (p) => path.startsWith(p) || p === path
    );
  }
}

// ============================================================================
// Default Manifest Configuration
// ============================================================================

const DEFAULT_MANIFEST_CONFIG: Omit<BffManifestType, 'signature'> = {
  kind: 'bff-manifest',
  name: 'ai-bos-bff',
  version: '1.0.0',
  description: 'MCP-Gateway Multi-Protocol API Surface',

  protocols: {
    openapi: {
      enabled: true,
      version: '3.1.0',
      path: '/api/v1',
      docsPath: '/api/docs',
      specPath: '/api/openapi.json',
    },
    trpc: {
      enabled: true,
      version: '10',
      path: '/trpc',
    },
    graphql: {
      enabled: true,
      version: 'Oct2021',
      path: '/graphql',
      playgroundPath: '/graphql/playground',
    },
    websocket: {
      enabled: true,
      path: '/ws',
      heartbeatInterval: 30000,
      maxConnections: 10000,
    },
    grpc: {
      enabled: false,
      status: 'planned',
      path: '/grpc',
      transport: 'tcp',
    },
  },

  protocolSignature: 'sha256-openapi:3.1.0/trpc:10/graphql:Oct2021/websocket:1.0',

  versioning: {
    strategy: 'header',
    header: 'X-API-Version',
    supported: ['v1'],
    default: 'v1',
    latest: 'v1',
    deprecationWarning: true,
    backwardsCompatible: 2,
    semver: true,
    allowLatestAlias: true,
  },

  rateLimits: {
    requests: { window: '1m', max: 1000 },
    burst: { window: '1s', max: 100 },
    websocket: { connections: 100, messagesPerSecond: 50 },
    graphql: { maxDepth: 10, maxComplexity: 1000, maxCPU: 50 },
  },

  payloadLimits: {
    maxRequestSize: '10mb',
    maxResponseSize: '50mb',
    maxBatchSize: 100,
    maxArrayLength: 1000,
    maxStringLength: 100000,
    maxDepth: 20,
  },

  requiredHeaders: {
    all: ['X-Request-ID'],
    authenticated: ['Authorization', 'X-Tenant-ID'],
    optional: ['X-API-Version', 'X-Client-Type', 'X-Client-Version'],
  },

  cors: {
    development: ['http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:3000'],
    staging: ['https://*.staging.aibos.io'],
    production: ['https://*.aibos.io', 'https://app.aibos.io'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    headers: [
      'Content-Type',
      'Authorization',
      'X-Request-ID',
      'X-Tenant-ID',
      'X-API-Key',
      'X-API-Version',
      'X-Client-Type',
    ],
    exposedHeaders: [
      'X-Request-ID',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'X-API-Version',
      'X-API-Deprecation',
    ],
    credentials: true,
    maxAge: 86400,
  },

  security: {
    requireTenantId: true,
    requireAuth: true,
    allowAnonymous: ['/api/v1/health', '/api/v1/ready', '/api/docs', '/api/openapi.json'],
    auditHighRisk: true,
    auditMutations: true,
    sanitizeInputs: true,
    validateOutputs: true,
    immutableHeaders: ['X-MCP-Signature', 'X-Kernel-Trace-ID', 'X-Internal-Request'],
  },

  enforcement: {
    allCallsThroughMCP: true,
    zodValidationRequired: true,
    tenantIsolationRequired: true,
    auditTrailRequired: true,
    rateLimitRequired: true,
    aiFirewallRequired: true,
    driftShieldRequired: true,
    standardErrorFormat: true,
    responseMetaRequired: true,
    zones: {
      systemBypassEnabled: true,
      crossTenantEnabled: false,
      crossTenantPermission: 'cross_tenant_access',
      isolatedResources: ['/execute', '/engines', '/actions', '/metadata', '/tenants'],
      sharedResources: ['/health', '/ready', '/docs', '/openapi.json', '/graphql/playground'],
    },
    errorMaskingEnabled: true,
  },

  errorCodes: {
    VALIDATION_ERROR: { status: 400, recoverable: true },
    AUTH_ERROR: { status: 401, recoverable: true },
    UNAUTHORIZED: { status: 401, recoverable: true },
    FORBIDDEN: { status: 403, recoverable: false },
    NOT_FOUND: { status: 404, recoverable: false },
    METHOD_NOT_ALLOWED: { status: 405, recoverable: false },
    CONFLICT: { status: 409, recoverable: true },
    PAYLOAD_TOO_LARGE: { status: 413, recoverable: true },
    RATE_LIMITED: { status: 429, recoverable: true },
    INTERNAL_ERROR: { status: 500, recoverable: false },
    NOT_IMPLEMENTED: { status: 501, recoverable: false },
    SERVICE_UNAVAILABLE: { status: 503, recoverable: true },
    GATEWAY_TIMEOUT: { status: 504, recoverable: true },
    TENANT_NOT_FOUND: { status: 404, recoverable: false },
    ENGINE_NOT_FOUND: { status: 404, recoverable: false },
    ACTION_NOT_FOUND: { status: 404, recoverable: false },
    EXECUTION_FAILED: { status: 500, recoverable: true },
    DRIFT_DETECTED: { status: 409, recoverable: false },
  },

  timeouts: {
    default: { ms: 30000, strategy: 'fail-fast' },
    longRunning: { ms: 300000, strategy: 'soft' },
    websocket: { ms: 60000, strategy: 'retry' },
    healthCheck: { ms: 5000, strategy: 'fail-fast' },
  },

  retry: {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
    retryableErrors: ['RATE_LIMITED', 'SERVICE_UNAVAILABLE', 'GATEWAY_TIMEOUT'],
  },

  errorAliases: {
    RATE_LIMITED: 'E429_RATE_LIMITED',
    VALIDATION_ERROR: 'E400_VALIDATION_ERROR',
    UNAUTHORIZED: 'E401_UNAUTHORIZED',
    FORBIDDEN: 'E403_FORBIDDEN',
    NOT_FOUND: 'E404_NOT_FOUND',
    INTERNAL_ERROR: 'E500_INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'E503_SERVICE_UNAVAILABLE',
  },

  hardening: {
    securityHeadersEnabled: true,
    hostHeaderRequired: false, // Relaxed for dev/local
    hostWhitelist: undefined,
    stripForwardedHeaders: true,
    strictTransportSecurity: true,
  },
};

// ============================================================================
// Export Singleton Instance + Factory
// ============================================================================

/**
 * Create a new BFF manifest with custom config (deep merged)
 */
export const createBffManifest = (
  config: Partial<Omit<BffManifestType, 'signature'>> = {}
): Readonly<BffManifestType> => {
  const merged = deepMerge(DEFAULT_MANIFEST_CONFIG, config) as Omit<BffManifestType, 'signature'>;
  return new BffManifestClass(merged).config;
};

/**
 * Default BFF Manifest instance
 */
export const BffManifest = createBffManifest();

/**
 * Re-export schema for external validation
 */
export { ManifestSchema as BffManifestSchema };

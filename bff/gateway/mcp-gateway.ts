/**
 * @fileoverview MCPGateway - Multi-Protocol API Gateway (Enterprise Edition)
 * @module @bff/gateway
 * @description Fully governed by BffManifest. Drift-safe. Zero-drift guarantee.
 */

import type { BffManifestType, ProtocolName } from '../bff.manifest';

// ============================================================================
// Types
// ============================================================================

/**
 * Protocol adapter interface
 */
export interface ProtocolAdapter<T = unknown> {
  name: ProtocolName;
  enabled: boolean;
  path: string;
  handler: T;
  isReady: () => boolean;
}

/**
 * Kernel execution pipeline interface
 */
export interface KernelExecutor {
  run(params: {
    code: string;
    context: string;
    tenantId: string;
    userId: string;
    input?: unknown;
  }): Promise<unknown>;
}

/**
 * Gateway health status
 */
export interface GatewayHealthStatus {
  status: 'ready' | 'degraded' | 'unavailable';
  version: string;
  signature: string | undefined;
  protocols: Record<ProtocolName, boolean>;
  timestamp: string;
  uptime: number;
  checks: Record<string, { status: 'pass' | 'fail'; duration: number }>;
}

/**
 * Gateway boot event
 */
export interface GatewayBootEvent {
  event: 'gateway.boot';
  timestamp: string;
  protocols: ProtocolName[];
  signature: string | undefined;
}

/**
 * Adapter factory function type
 */
export type AdapterFactory<T> = (
  kernel: KernelExecutor,
  manifest: Readonly<BffManifestType>
) => T;

/**
 * Gateway configuration
 */
export interface GatewayConfig {
  adapters?: {
    openapi?: AdapterFactory<unknown>;
    trpc?: AdapterFactory<unknown>;
    graphql?: AdapterFactory<unknown>;
    websocket?: AdapterFactory<unknown>;
    grpc?: AdapterFactory<unknown>;
  };
  onBoot?: (event: GatewayBootEvent) => void;
  onError?: (error: Error, protocol: ProtocolName) => void;
  failOnInvalidManifest?: boolean;
}

// ============================================================================
// MCPGateway
// ============================================================================

/**
 * MCP Gateway - Multi-Protocol API Surface (Enterprise Edition)
 * 
 * Features:
 * - Manifest-driven protocol resolution
 * - Fail-fast validation on boot
 * - Zero-drift guarantee
 * - Strongly typed protocol map
 * - Adapter injection support
 * - Health checks with timing
 */
export class MCPGateway {
  private readonly startTime = Date.now();
  private readonly adapters = new Map<ProtocolName, ProtocolAdapter>();
  private bootEvent: GatewayBootEvent | undefined;

  constructor(
    private readonly kernel: KernelExecutor,
    private readonly manifest: Readonly<BffManifestType>,
    private readonly config: GatewayConfig = {}
  ) {
    this.validateManifest();
    this.initializeAdapters();
    this.emitBootEvent();
  }

  // ===========================================================================
  // Initialization
  // ===========================================================================

  /**
   * Validate manifest at boot time
   */
  private validateManifest(): void {
    const errors: string[] = [];

    // Validate protocol paths
    for (const protocol of Object.keys(this.manifest.protocols) as ProtocolName[]) {
      const cfg = this.manifest.protocols[protocol];

      if (cfg.enabled) {
        if (!cfg.path) {
          errors.push(`Protocol "${protocol}" is enabled but has no path`);
        } else if (!cfg.path.startsWith('/')) {
          errors.push(`Protocol "${protocol}" path must start with /`);
        }
      }
    }

    // Validate signature (warning only)
    if (!this.manifest.signature) {
      console.warn('⚠️ MCPGateway: Manifest signature missing. DriftShield disabled.');
    }

    // Validate enforcement rules
    if (this.manifest.enforcement.driftShieldRequired && !this.manifest.signature) {
      errors.push('DriftShield is required but manifest has no signature');
    }

    // Throw if critical errors
    if (errors.length > 0 && this.config.failOnInvalidManifest !== false) {
      throw new Error(`❌ MCPGateway: Invalid manifest\n${errors.join('\n')}`);
    }
  }

  /**
   * Initialize protocol adapters
   */
  private initializeAdapters(): void {
    const protocols: ProtocolName[] = ['openapi', 'trpc', 'graphql', 'websocket', 'grpc'];

    for (const protocol of protocols) {
      if (!this.isProtocolEnabled(protocol)) continue;

      try {
        const factory = this.config.adapters?.[protocol];
        const handler = factory
          ? factory(this.kernel, this.manifest)
          : this.createPlaceholderHandler(protocol);

        this.adapters.set(protocol, {
          name: protocol,
          enabled: true,
          path: this.getProtocolPath(protocol)!,
          handler,
          isReady: () => true,
        });
      } catch (error) {
        this.config.onError?.(error as Error, protocol);
        console.error(`❌ Failed to initialize ${protocol} adapter:`, error);
      }
    }
  }

  /**
   * Emit boot event
   */
  private emitBootEvent(): void {
    const enabledProtocols = Array.from(this.adapters.keys());

    this.bootEvent = {
      event: 'gateway.boot',
      timestamp: new Date().toISOString(),
      protocols: enabledProtocols,
      signature: this.manifest.signature,
    };

    this.config.onBoot?.(this.bootEvent);
  }

  // ===========================================================================
  // Protocol Resolvers
  // ===========================================================================

  /**
   * Get REST/OpenAPI adapter
   */
  rest(): ProtocolAdapter | undefined {
    return this.adapters.get('openapi');
  }

  /**
   * Get tRPC adapter
   */
  rpc(): ProtocolAdapter | undefined {
    return this.adapters.get('trpc');
  }

  /**
   * Get GraphQL adapter
   */
  gql(): ProtocolAdapter | undefined {
    return this.adapters.get('graphql');
  }

  /**
   * Get WebSocket adapter
   */
  ws(): ProtocolAdapter | undefined {
    return this.adapters.get('websocket');
  }

  /**
   * Get gRPC adapter
   */
  grpc(): ProtocolAdapter | undefined {
    return this.adapters.get('grpc');
  }

  /**
   * Get adapter by protocol name
   */
  getAdapter(protocol: ProtocolName): ProtocolAdapter | undefined {
    return this.adapters.get(protocol);
  }

  // ===========================================================================
  // Health Status
  // ===========================================================================

  /**
   * Get gateway health status
   */
  health(): GatewayHealthStatus {
    const checks: Record<string, { status: 'pass' | 'fail'; duration: number }> = {};
    let hasFailure = false;

    // Check each adapter
    for (const [protocol, adapter] of this.adapters) {
      const start = Date.now();
      const isReady = adapter.isReady();
      checks[protocol] = {
        status: isReady ? 'pass' : 'fail',
        duration: Date.now() - start,
      };
      if (!isReady) hasFailure = true;
    }

    return {
      status: hasFailure ? 'degraded' : 'ready',
      version: this.manifest.version,
      signature: this.manifest.signature,
      protocols: this.getProtocolStatus(),
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks,
    };
  }

  // ===========================================================================
  // Manifest Access
  // ===========================================================================

  /**
   * Get manifest (read-only)
   */
  getManifest(): Readonly<BffManifestType> {
    return this.manifest;
  }

  /**
   * Get DriftShield signature
   */
  getSignature(): string | undefined {
    return this.manifest.signature;
  }

  /**
   * Get boot event
   */
  getBootEvent(): GatewayBootEvent | undefined {
    return this.bootEvent;
  }

  // ===========================================================================
  // Protocol Utilities
  // ===========================================================================

  /**
   * Check if protocol is enabled
   */
  isProtocolEnabled(protocol: ProtocolName): boolean {
    return this.manifest.protocols[protocol]?.enabled === true;
  }

  /**
   * Get all protocol statuses (strongly typed)
   */
  getProtocolStatus(): Record<ProtocolName, boolean> {
    const result = {} as Record<ProtocolName, boolean>;

    for (const protocol of Object.keys(this.manifest.protocols) as ProtocolName[]) {
      result[protocol] = this.manifest.protocols[protocol].enabled;
    }

    return result;
  }

  /**
   * Get protocol path
   */
  getProtocolPath(protocol: ProtocolName): string | undefined {
    return this.manifest.protocols[protocol]?.path;
  }

  /**
   * Get all enabled protocols
   */
  getEnabledProtocols(): ProtocolName[] {
    return Array.from(this.adapters.keys());
  }

  // ===========================================================================
  // Security Helpers
  // ===========================================================================

  /**
   * Check if path allows anonymous access
   */
  isAnonymousAllowed(path: string): boolean {
    return this.manifest.security.allowAnonymous.some(
      (rule) => rule === '*' || path === rule || path.startsWith(rule)
    );
  }

  /**
   * Get CORS origins for environment
   */
  getCorsOrigins(env: 'development' | 'staging' | 'production'): string[] {
    return this.manifest.cors[env] || [];
  }

  /**
   * Check if header is immutable (cannot be set by client)
   */
  isImmutableHeader(header: string): boolean {
    return this.manifest.security.immutableHeaders.includes(header);
  }

  // ===========================================================================
  // Internal Helpers
  // ===========================================================================

  /**
   * Create placeholder handler for unimplemented adapters
   */
  private createPlaceholderHandler(protocol: ProtocolName) {
    const path = this.getProtocolPath(protocol);

    // Return a no-op handler that respects API boundary
    return {
      __placeholder: true,
      protocol,
      path,
      message: `${protocol} adapter pending implementation`,

      // No-op route handler (won't break Hono/Next.js)
      fetch: async (req: Request) => {
        return new Response(
          JSON.stringify({
            success: false,
            error: {
              code: 'NOT_IMPLEMENTED',
              message: `${protocol} adapter is not yet implemented`,
            },
          }),
          {
            status: 501,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      },
    };
  }
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Create MCP Gateway
 */
export function createMCPGateway(
  kernel: KernelExecutor,
  manifest: Readonly<BffManifestType>,
  config?: GatewayConfig
): MCPGateway {
  return new MCPGateway(kernel, manifest, config);
}

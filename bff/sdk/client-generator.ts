/**
 * @fileoverview SDK Client Generator - Auto-generate TypeScript SDK
 * @module @kernel/bff/sdk
 * @description Generates type-safe SDK from BFF schemas and manifest
 */

import type { BffManifestType } from '../bff.manifest';
import { BffSchemas } from '../bff.schema';

export interface SdkConfig {
  baseUrl: string;
  tenantId: string;
  apiKey?: string;
  timeout?: number;
}

export interface SdkRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Type-safe BFF SDK Client
 */
export class BffSdkClient {
  private requestId = 0;

  constructor(
    private readonly config: SdkConfig,
    private readonly manifest: Readonly<BffManifestType>
  ) {}

  // ===========================================================================
  // Core Methods
  // ===========================================================================

  /**
   * Execute an action
   */
  async execute<T = unknown>(
    action: string,
    input?: unknown,
    options?: SdkRequestOptions
  ): Promise<SdkResponse<T>> {
    return this.post<T>('/execute', { action, input }, options);
  }

  /**
   * Health check
   */
  async health(): Promise<SdkResponse<HealthResponse>> {
    return this.get<HealthResponse>('/health');
  }

  /**
   * List engines
   */
  async listEngines(
    params?: PaginationParams
  ): Promise<SdkResponse<EngineListResponse>> {
    return this.get<EngineListResponse>('/engines', params);
  }

  /**
   * List actions
   */
  async listActions(
    engineName?: string,
    params?: PaginationParams
  ): Promise<SdkResponse<ActionListResponse>> {
    const query = engineName ? { ...params, engine: engineName } : params;
    return this.get<ActionListResponse>('/actions', query);
  }

  // ===========================================================================
  // HTTP Methods
  // ===========================================================================

  private async get<T>(
    path: string,
    params?: Record<string, unknown>,
    options?: SdkRequestOptions
  ): Promise<SdkResponse<T>> {
    const url = this.buildUrl(path, params);
    return this.request<T>('GET', url, undefined, options);
  }

  private async post<T>(
    path: string,
    body: unknown,
    options?: SdkRequestOptions
  ): Promise<SdkResponse<T>> {
    const url = this.buildUrl(path);
    return this.request<T>('POST', url, body, options);
  }

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    options?: SdkRequestOptions
  ): Promise<SdkResponse<T>> {
    const requestId = `sdk-${++this.requestId}-${Date.now()}`;
    const startTime = Date.now();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Request-ID': requestId,
      'X-Tenant-ID': this.config.tenantId,
      'X-API-Version': this.manifest.versioning.latest,
      ...options?.headers,
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal,
      });

      const data = await response.json();
      const duration = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          error: data.error || {
            code: `HTTP_${response.status}`,
            message: response.statusText,
          },
          meta: {
            requestId,
            duration,
            timestamp: new Date().toISOString(),
            status: response.status,
          },
        };
      }

      return {
        success: true,
        data: data.data ?? data,
        meta: {
          requestId,
          duration,
          timestamp: new Date().toISOString(),
          status: response.status,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        meta: {
          requestId,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          status: 0,
        },
      };
    }
  }

  private buildUrl(path: string, params?: Record<string, unknown>): string {
    const base = `${this.config.baseUrl}${this.manifest.protocols.openapi.path}${path}`;
    if (!params) return base;

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    }

    const queryString = searchParams.toString();
    return queryString ? `${base}?${queryString}` : base;
  }
}

// ===========================================================================
// Types (inferred from schemas)
// ===========================================================================

type HealthResponse = {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  checks: Record<string, { status: 'pass' | 'fail'; duration: number }>;
};

type PaginationParams = {
  page?: number;
  pageSize?: number;
  cursor?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
};

type EngineListResponse = {
  engines: Array<{
    name: string;
    version: string;
    description?: string;
    status: 'active' | 'inactive' | 'error';
    actions: string[];
  }>;
  meta: PaginationMeta;
};

type ActionListResponse = {
  actions: Array<{
    name: string;
    engine: string;
    description?: string;
    inputSchema?: unknown;
    outputSchema?: unknown;
  }>;
  meta: PaginationMeta;
};

type PaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

interface SdkResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta: {
    requestId: string;
    duration: number;
    timestamp: string;
    status: number;
  };
}

/**
 * Create SDK client
 */
export function createBffSdk(
  config: SdkConfig,
  manifest: Readonly<BffManifestType>
): BffSdkClient {
  return new BffSdkClient(config, manifest);
}


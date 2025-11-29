/**
 * SDK Types
 */

export interface KernelClientConfig {
  /**
   * Base URL of the Kernel API
   * @example "http://localhost:5656"
   */
  baseUrl: string;

  /**
   * Static API key for authentication
   * Either apiKey or getToken must be provided
   */
  apiKey?: string;

  /**
   * Function to get JWT token for authentication
   * Either apiKey or getToken must be provided
   */
  getToken?: () => Promise<string> | string;

  /**
   * Request timeout in milliseconds
   * @default 30000
   */
  timeout?: number;

  /**
   * Enable automatic retries on network errors
   * @default true
   */
  retry?: boolean;

  /**
   * Max number of retry attempts
   * @default 3
   */
  maxRetries?: number;

  /**
   * Custom fetch implementation (for testing)
   */
  fetch?: typeof fetch;
}

export interface KernelClientOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ListOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Tenant Types
export interface CreateTenantRequest {
  name: string;
  config?: Record<string, unknown>;
}

export interface UpdateTenantRequest {
  name?: string;
  config?: Record<string, unknown>;
}

// Engine Types
export interface EngineExecutionRequest {
  engineId: string;
  tenantId?: string;
  config: Record<string, unknown>;
}

export interface EngineExecutionResult {
  id: string;
  engineId: string;
  status: "pending" | "running" | "completed" | "failed";
  output?: unknown;
  error?: string;
  metadata: {
    startedAt: string;
    completedAt?: string;
    durationMs?: number;
  };
}

// Audit Types
export interface AuditEventListOptions extends ListOptions {
  tenantId?: string;
  eventType?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
}


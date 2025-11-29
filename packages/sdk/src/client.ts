/**
 * Kernel Client - Main SDK Entry Point
 */

import { TenantsAPI } from "./resources/tenants";
import { EnginesAPI } from "./resources/engines";
import { AuditAPI } from "./resources/audit";
import { HealthAPI } from "./resources/health";
import { InvoiceResource } from "./resources/invoices";
import type { KernelClientConfig, KernelClientOptions } from "./types";
import { KernelError, NetworkError, TimeoutError } from "./errors";

export class KernelClient {
  private config: Required<KernelClientConfig>;

  public readonly tenants: TenantsAPI;
  public readonly engines: EnginesAPI;
  public readonly audit: AuditAPI;
  public readonly health: HealthAPI;
  public readonly invoices: InvoiceResource;

  constructor(config: KernelClientConfig) {
    // Validate config
    if (!config.baseUrl) {
      throw new Error("KernelClient: baseUrl is required");
    }

    if (!config.apiKey && !config.getToken) {
      throw new Error("KernelClient: either apiKey or getToken must be provided");
    }

    // Set defaults
    this.config = {
      timeout: 30000,
      retry: true,
      maxRetries: 3,
      fetch: globalThis.fetch.bind(globalThis),
      ...config,
    } as Required<KernelClientConfig>;

    // Initialize API resources
    this.tenants = new TenantsAPI(this);
    this.engines = new EnginesAPI(this);
    this.audit = new AuditAPI(this);
    this.health = new HealthAPI(this);
    this.invoices = new InvoiceResource(this);
  }

  /**
   * Internal: Make a request to the Kernel API
   */
  async request<T = unknown>(
    method: string,
    path: string,
    options?: KernelClientOptions & { body?: unknown }
  ): Promise<T> {
    const url = new URL(path, this.config.baseUrl).toString();
    const headers = await this.buildHeaders(options?.headers);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await this.fetchWithRetry(url, {
        method,
        headers,
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: options?.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        return response.json();
      }

      return response.text() as T;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        throw new TimeoutError(`Request timeout after ${this.config.timeout}ms`);
      }

      if (error instanceof KernelError) {
        throw error;
      }

      throw new NetworkError("Network request failed", error);
    }
  }

  /**
   * Build headers for the request
   */
  private async buildHeaders(
    customHeaders?: Record<string, string>
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "@aibos/sdk/0.1.0",
      ...customHeaders,
    };

    // Add authentication
    if (this.config.apiKey) {
      headers["x-api-key"] = this.config.apiKey;
    } else if (this.config.getToken) {
      const token = await this.config.getToken();
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Fetch with automatic retries
   */
  private async fetchWithRetry(
    url: string,
    init: RequestInit
  ): Promise<Response> {
    let lastError: Error | null = null;
    const maxAttempts = this.config.retry ? this.config.maxRetries : 1;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await this.config.fetch(url, init);

        // Don't retry on 4xx errors (client errors)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }

        // Retry on 5xx errors
        if (response.status >= 500 && attempt < maxAttempts - 1) {
          await this.delay(this.getRetryDelay(attempt));
          continue;
        }

        return response;
      } catch (error: any) {
        lastError = error;

        // Don't retry on AbortError
        if (error.name === "AbortError") {
          throw error;
        }

        // Retry on network errors
        if (attempt < maxAttempts - 1) {
          await this.delay(this.getRetryDelay(attempt));
          continue;
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: any;

    try {
      errorData = await response.json();
    } catch {
      errorData = {
        message: response.statusText || "Unknown error",
        code: "UNKNOWN_ERROR",
        statusCode: response.status,
      };
    }

    throw KernelError.fromResponse({
      ...errorData,
      statusCode: response.status,
    });
  }

  /**
   * Get retry delay with exponential backoff
   */
  private getRetryDelay(attempt: number): number {
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}


/**
 * Health API Resource
 */

import type { KernelClient } from "../client";

export interface HealthStatus {
  status: "healthy" | "degraded" | "down";
  version: string;
  timestamp: string;
  checks: {
    database: {
      status: "healthy" | "degraded" | "down";
      latencyMs: number;
    };
    redis: {
      status: "healthy" | "degraded" | "down";
      latencyMs: number;
    };
  };
}

export class HealthAPI {
  constructor(private client: KernelClient) {}

  /**
   * Check overall health
   */
  async check(): Promise<HealthStatus> {
    return this.client.request<HealthStatus>("GET", "/health");
  }

  /**
   * Liveness probe (for Kubernetes)
   */
  async live(): Promise<{ ok: boolean }> {
    return this.client.request<{ ok: boolean }>("GET", "/health/live");
  }

  /**
   * Readiness probe (for Kubernetes)
   */
  async ready(): Promise<{ ok: boolean }> {
    return this.client.request<{ ok: boolean }>("GET", "/health/ready");
  }
}


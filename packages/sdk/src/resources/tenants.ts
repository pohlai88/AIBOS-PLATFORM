/**
 * Tenants API Resource
 */

import type { KernelClient } from "../client";
import type {
  CreateTenantRequest,
  UpdateTenantRequest,
  ListOptions,
  PaginatedResponse,
} from "../types";

export interface Tenant {
  id: string;
  name: string;
  config?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export class TenantsAPI {
  constructor(private client: KernelClient) {}

  /**
   * List all tenants
   */
  async list(options?: ListOptions): Promise<PaginatedResponse<Tenant>> {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.pageSize) params.set("pageSize", String(options.pageSize));
    if (options?.sortBy) params.set("sortBy", options.sortBy);
    if (options?.sortOrder) params.set("sortOrder", options.sortOrder);

    const query = params.toString();
    const path = `/api/tenants${query ? `?${query}` : ""}`;

    return this.client.request<PaginatedResponse<Tenant>>("GET", path);
  }

  /**
   * Get a tenant by ID
   */
  async get(id: string): Promise<Tenant> {
    return this.client.request<Tenant>("GET", `/api/tenants/${id}`);
  }

  /**
   * Create a new tenant
   */
  async create(data: CreateTenantRequest): Promise<Tenant> {
    return this.client.request<Tenant>("POST", "/api/tenants", { body: data });
  }

  /**
   * Update a tenant
   */
  async update(id: string, data: UpdateTenantRequest): Promise<Tenant> {
    return this.client.request<Tenant>("PATCH", `/api/tenants/${id}`, { body: data });
  }

  /**
   * Delete a tenant
   */
  async delete(id: string): Promise<void> {
    return this.client.request<void>("DELETE", `/api/tenants/${id}`);
  }
}


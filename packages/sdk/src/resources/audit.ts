/**
 * Audit API Resource
 */

import type { KernelClient } from "../client";
import type { AuditEventListOptions, PaginatedResponse } from "../types";

export interface AuditEvent {
  id: string;
  eventType: string;
  tenantId: string | null;
  userId: string | null;
  resourceType: string;
  resourceId: string;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export class AuditAPI {
  constructor(private client: KernelClient) {}

  /**
   * List audit events
   */
  async events(options?: AuditEventListOptions): Promise<PaginatedResponse<AuditEvent>> {
    const params = new URLSearchParams();
    if (options?.page) params.set("page", String(options.page));
    if (options?.pageSize) params.set("pageSize", String(options.pageSize));
    if (options?.tenantId) params.set("tenantId", options.tenantId);
    if (options?.eventType) params.set("eventType", options.eventType);
    if (options?.userId) params.set("userId", options.userId);
    if (options?.startDate) params.set("startDate", options.startDate);
    if (options?.endDate) params.set("endDate", options.endDate);

    const query = params.toString();
    const path = `/api/audit/events${query ? `?${query}` : ""}`;

    return this.client.request<PaginatedResponse<AuditEvent>>("GET", path);
  }

  /**
   * Get a specific audit event
   */
  async getEvent(id: string): Promise<AuditEvent> {
    return this.client.request<AuditEvent>("GET", `/api/audit/events/${id}`);
  }
}


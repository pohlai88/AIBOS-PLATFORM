/**
 * Event Types
 * 
 * Type definitions for kernel events.
 */

export interface KernelEvent {
  type: string;
  payload: unknown;
  metadata: EventMetadata;
}

export interface EventMetadata {
  timestamp: Date;
  source: string;
  tenantId?: string;
  correlationId?: string;
}

export type EventHandler = (event: KernelEvent) => Promise<void> | void;

// Common event types
export const EventTypes = {
  // Engine events
  ENGINE_REGISTERED: 'engine.registered',
  ENGINE_UNREGISTERED: 'engine.unregistered',
  ENGINE_ERROR: 'engine.error',
  
  // Action events
  ACTION_STARTED: 'action.started',
  ACTION_COMPLETED: 'action.completed',
  ACTION_FAILED: 'action.failed',
  
  // Tenant events
  TENANT_CREATED: 'tenant.created',
  TENANT_UPDATED: 'tenant.updated',
  TENANT_DELETED: 'tenant.deleted',
  
  // Security events
  AUTH_SUCCESS: 'auth.success',
  AUTH_FAILURE: 'auth.failure',
  PERMISSION_DENIED: 'permission.denied',
} as const;


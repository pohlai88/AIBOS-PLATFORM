/**
 * Error Utilities
 * 
 * Custom error classes and error handling.
 */

export class KernelError extends Error {
  code: string;
  context?: Record<string, unknown>;

  constructor(code: string, message: string, context?: Record<string, unknown>) {
    super(message);
    this.name = 'KernelError';
    this.code = code;
    this.context = context;
  }
}

export class ValidationError extends KernelError {
  constructor(message: string, context?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, context);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends KernelError {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} not found: ${id}`, { resource, id });
    this.name = 'NotFoundError';
  }
}

export class PermissionError extends KernelError {
  constructor(action: string, resource?: string) {
    super('PERMISSION_DENIED', `Permission denied: ${action}`, { action, resource });
    this.name = 'PermissionError';
  }
}

export class TenantError extends KernelError {
  constructor(message: string, tenantId?: string) {
    super('TENANT_ERROR', message, { tenantId });
    this.name = 'TenantError';
  }
}


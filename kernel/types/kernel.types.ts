/**
 * Kernel Types
 * 
 * Core type definitions for the kernel.
 */

export interface KernelState {
  status: 'booting' | 'ready' | 'error' | 'shutdown';
  startedAt?: Date;
  version: string;
}

export interface KernelContext {
  tenantId: string;
  userId?: string;
  correlationId: string;
  permissions: string[];
}

export interface KernelError {
  code: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export type KernelModule = 
  | 'registry'
  | 'validation'
  | 'security'
  | 'tenancy'
  | 'events'
  | 'api'
  | 'ai'
  | 'storage';


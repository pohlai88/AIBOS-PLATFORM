/**
 * Action Types
 * 
 * Type definitions for actions.
 */

export interface Action {
  id: string;
  name: string;
  engineId: string;
  description?: string;
  schema: ActionSchema;
  handler?: ActionHandler;
}

export interface ActionSchema {
  input: Record<string, unknown>;
  output: Record<string, unknown>;
}

export type ActionHandler = (
  input: unknown,
  context: ActionContext
) => Promise<unknown>;

export interface ActionContext {
  tenantId: string;
  userId?: string;
  correlationId: string;
  metadata?: Record<string, unknown>;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: ActionError;
}

export interface ActionError {
  code: string;
  message: string;
  details?: unknown;
}


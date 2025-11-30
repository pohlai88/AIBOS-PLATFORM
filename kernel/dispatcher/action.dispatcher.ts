// dispatcher/action.dispatcher.ts
import { engineRegistry } from '../registry/engine.loader';
import type { ActionContext } from '../types/engine.types';
import type { KernelActionContract } from '../contracts/contract.types';
import { appendAuditEntry } from '../audit/hash-chain.store';

/**
 * Action Dispatch Result
 */
export interface DispatchResult<TOutput = unknown> {
  /** Success flag */
  success: boolean;

  /** Action output (if successful) */
  data?: TOutput;

  /** Error (if failed) */
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };

  /** Metadata */
  meta: {
    actionId: string;
    duration: number;
    timestamp: string;
    requestId: string;
  };
}

/**
 * Action Dispatcher
 * 
 * Dispatches HTTP requests to kernel actions.
 * Handles:
 * - Action resolution (via engine registry)
 * - Contract validation (input/output)
 * - Context injection (tenant, user, db, cache, etc.)
 * - Error handling
 * - Audit logging
 * - Metrics
 */
export class ActionDispatcher {
  /**
   * Dispatch an action
   * 
   * @param actionId - Full action ID (e.g., accounting.read.journal_entries)
   * @param input - Action input (will be validated)
   * @param context - Execution context (tenant, user, etc.)
   * @returns Dispatch result
   */
  async dispatch<TOutput = unknown>(
    actionId: string,
    input: unknown,
    context: Partial<ActionContext>
  ): Promise<DispatchResult<TOutput>> {
    const startTime = Date.now();
    const requestId = context.requestId || this.generateRequestId();

    try {
      // 1. Resolve action handler
      const handler = engineRegistry.getActionHandler(actionId);
      if (!handler) {
        return {
          success: false,
          error: {
            code: 'ACTION_NOT_FOUND',
            message: `Action "${actionId}" not found`,
          },
          meta: {
            actionId,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            requestId,
          },
        };
      }

      // 2. Get action contract
      const contract = this.getContract(actionId);
      if (!contract) {
        return {
          success: false,
          error: {
            code: 'CONTRACT_NOT_FOUND',
            message: `Contract for action "${actionId}" not found`,
          },
          meta: {
            actionId,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            requestId,
          },
        };
      }

      // 3. Validate input against contract
      const validatedInput = this.validateInput(contract, input);
      if (!validatedInput.success) {
        return {
          success: false,
          error: {
            code: 'INPUT_VALIDATION_FAILED',
            message: 'Input validation failed',
            details: validatedInput.errors,
          },
          meta: {
            actionId,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            requestId,
          },
        };
      }

      // 4. Build action context
      const actionContext: ActionContext = {
        input: validatedInput.data,
        tenant: context.tenant || null,
        user: context.user || null,
        db: context.db!,
        cache: context.cache!,
        metadata: context.metadata!,
        emit: context.emit || this.defaultEmit,
        log: context.log || this.defaultLog,
        engineConfig: context.engineConfig || {},
        requestId,
        correlationId: context.correlationId,
      };

      // 5. Execute action handler
      console.log(`[ActionDispatcher] Executing action: ${actionId} (tenant: ${actionContext.tenant})`);
      const output = await handler(actionContext);

      // 6. Validate output against contract
      const validatedOutput = this.validateOutput(contract, output);
      if (!validatedOutput.success) {
        // Audit failed output validation
        await this.auditAction(actionContext, actionId, input, {
          success: false,
          error: {
            code: 'OUTPUT_VALIDATION_FAILED',
            message: 'Output validation failed',
            details: validatedOutput.errors,
          },
        });

        return {
          success: false,
          error: {
            code: 'OUTPUT_VALIDATION_FAILED',
            message: 'Output validation failed',
            details: validatedOutput.errors,
          },
          meta: {
            actionId,
            duration: Date.now() - startTime,
            timestamp: new Date().toISOString(),
            requestId,
          },
        };
      }

      // 7. Audit successful execution
      await this.auditAction(actionContext, actionId, input, {
        success: true,
        output: validatedOutput.data,
      });

      // 8. Return success
      return {
        success: true,
        data: validatedOutput.data as TOutput,
        meta: {
          actionId,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
    } catch (error) {
      // 9. Audit execution error
      await this.auditAction(actionContext, actionId, input, {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      }).catch((auditError) => {
        console.error(`[ActionDispatcher] Failed to audit error for ${actionId}:`, auditError);
      });

      // 10. Handle errors
      console.error(`[ActionDispatcher] Error executing action ${actionId}:`, error);

      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
        meta: {
          actionId,
          duration: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          requestId,
        },
      };
    }
  }

  /**
   * Get contract for an action
   * 
   * @param actionId - Full action ID
   * @returns Contract or null
   */
  private getContract(actionId: string): KernelActionContract | null {
    const parts = actionId.split('.');
    if (parts.length < 2) return null;

    const domain = parts[0];
    const actionName = parts.slice(1).join('.');

    const engine = engineRegistry.get(domain);
    if (!engine) return null;

    const actionMeta = engine.manifest.actions[actionName];
    return actionMeta?.contract || null;
  }

  /**
   * Validate input against contract schema
   * 
   * @param contract - Action contract
   * @param input - Input to validate
   * @returns Validation result
   */
  private validateInput(contract: KernelActionContract, input: unknown): {
    success: boolean;
    data?: unknown;
    errors?: unknown;
  } {
    try {
      const data = contract.inputSchema.parse(input);
      return { success: true, data };
    } catch (error) {
      return { success: false, errors: error };
    }
  }

  /**
   * Validate output against contract schema
   * 
   * @param contract - Action contract
   * @param output - Output to validate
   * @returns Validation result
   */
  private validateOutput(contract: KernelActionContract, output: unknown): {
    success: boolean;
    data?: unknown;
    errors?: unknown;
  } {
    try {
      const data = contract.outputSchema.parse(output);
      return { success: true, data };
    } catch (error) {
      return { success: false, errors: error };
    }
  }

  /**
   * Generate a unique request ID
   * 
   * @returns Request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Default emit function
   */
  private defaultEmit(event: string, payload: unknown): void {
    console.log(`[Event] ${event}:`, payload);
  }

  /**
   * Default log function
   */
  private defaultLog(...args: unknown[]): void {
    console.log('[Action]', ...args);
  }

  /**
   * Audit action execution
   * 
   * Appends entry to cryptographic audit chain.
   * Runs asynchronously to not block action execution.
   * 
   * @param context - Action context
   * @param actionId - Action ID
   * @param input - Action input
   * @param result - Execution result
   */
  private async auditAction(
    context: Partial<ActionContext>,
    actionId: string,
    input: unknown,
    result: { success: boolean; output?: unknown; error?: unknown }
  ): Promise<void> {
    try {
      // Skip audit if no tenant (system actions)
      if (!context.tenant) {
        return;
      }

      // Extract actor ID from user context
      const actorId = (context.user as any)?.id || 'system';

      // Append to audit chain
      await appendAuditEntry({
        tenantId: context.tenant,
        actorId,
        actionId,
        payload: {
          input,
          result,
          requestId: context.requestId,
          correlationId: context.correlationId,
        },
      });
    } catch (error) {
      // Log audit failures but don't throw (audit should never break the action)
      console.error(`[ActionDispatcher] Audit failed for ${actionId}:`, error);
    }
  }
}

/**
 * Global action dispatcher instance
 */
export const actionDispatcher = new ActionDispatcher();


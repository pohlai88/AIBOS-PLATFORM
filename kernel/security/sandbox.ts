/**
 * Sandbox v2 (Slim)
 *
 * Minimal, focused sandbox for executing action code safely.
 * Responsibilities:
 * - Enforce hard blocks (dangerous constructs)
 * - Freeze context (prevent mutation)
 * - Safe execution with error capture
 * - Freeze output (prevent prototype leaks)
 *
 * NOTE: Validation is NOT done here. Use validation/contract.validator.ts
 * for input/output validation against Zod schemas.
 */

import { enforceHardBlocks } from './guards/hard-blocks';
import { safeAwait } from '../hardening/guards/safe-await';

export interface SandboxContext {
  input: unknown;
  tenantId: string | null;
  principalId: string | null;
  metadata?: Record<string, unknown>;
  db?: unknown;
  cache?: unknown;
  emit?: (event: string, data: unknown) => void;
  log?: (...args: unknown[]) => void;
  engineConfig?: unknown;
}

/**
 * Execute an action function in a sandboxed environment.
 *
 * @param actionFn - The action function to execute
 * @param ctx - The execution context (will be frozen)
 * @returns The frozen output from the action
 */
export async function executeInSandbox<T = unknown>(
  actionFn: (ctx: SandboxContext) => Promise<T> | T,
  ctx: SandboxContext,
): Promise<T> {
  // 1. Block dangerous constructs in the action function
  enforceHardBlocks(actionFn);

  // 2. Freeze ctx so actions cannot mutate it
  const frozenCtx = Object.freeze({ ...ctx });

  // 3. Execute action inside controlled environment
  const [err, output] = await safeAwait(Promise.resolve(actionFn(frozenCtx)));

  if (err) {
    throw err;
  }

  // 4. Freeze output so actions cannot leak prototypes
  if (output !== null && typeof output === 'object') {
    return Object.freeze(output) as T;
  }

  return output as T;
}

/**
 * @deprecated Use executeInSandbox instead. This is kept for backward compatibility.
 */
export const runInSandbox = executeInSandbox;

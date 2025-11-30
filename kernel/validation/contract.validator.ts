/**
 * Contract Validation Engine v2
 *
 * Provides safe Zod-based validation for contracts, action inputs, and outputs.
 * All validation failures are logged with trace IDs for observability.
 */

import type { ZodSchema, ZodTypeAny } from 'zod';
import { ContractError } from '../hardening/errors/contract-error';
import type { KernelActionContract } from '../contracts/contract.types';
import { ZContractBase } from '../contracts/schemas/contract.schema';
import { ZActionContractSchema } from '../contracts/schemas/action-contract.schema';
import { createTraceLogger } from '../observability/logger';

const logger = createTraceLogger();

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  issues?: string[];
}

// ─────────────────────────────────────────────────────────────
// Error Types
// ─────────────────────────────────────────────────────────────

export class KernelContractError extends ContractError {
  readonly issues: string[];

  constructor(message: string, options: { issues: string[] }) {
    super(message);
    this.name = 'KernelContractError';
    this.issues = options.issues;
  }
}

export class KernelValidationError extends Error {
  readonly actionId: string;
  readonly issues: string[];
  readonly phase: 'input' | 'output';

  constructor(
    message: string,
    options: { actionId: string; issues: string[]; phase: 'input' | 'output' },
  ) {
    super(message);
    this.name = 'KernelValidationError';
    this.actionId = options.actionId;
    this.issues = options.issues;
    this.phase = options.phase;
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function toIssues(error: unknown): string[] {
  if (!error) return ['Unknown validation error'];

  if (typeof error === 'string') return [error];

  if (error instanceof Error) {
    // ZodError has .issues; we keep it generic here but you can
    // refine if you want richer diagnostics.
    const anyErr = error as any;
    if (Array.isArray(anyErr.issues)) {
      return anyErr.issues.map((issue: any) => {
        const path = Array.isArray(issue.path)
          ? issue.path.join('.')
          : String(issue.path ?? '');
        return path ? `${path}: ${issue.message}` : issue.message;
      });
    }
    return [anyErr.message];
  }

  return ['Unknown validation error (non-Error thrown)'];
}

async function safeParse<T>(
  schema: ZodSchema<T>,
  value: unknown,
): Promise<ValidationResult<T>> {
  try {
    const parsed = await schema.parseAsync(value);
    return { ok: true, value: parsed };
  } catch (err) {
    return { ok: false, issues: toIssues(err) };
  }
}

// ─────────────────────────────────────────────────────────────
// Contract Validation
// ─────────────────────────────────────────────────────────────

/**
 * Validate a generic kernel contract using the shared ContractSchema.
 * Throws KernelContractError on failure and logs structured diagnostics.
 */
export async function validateContract<T>(contract: unknown): Promise<T> {
  const result = await safeParse(ZContractBase as unknown as ZodSchema<T>, contract);

  if (!result.ok || !result.value) {
    logger.warn({ issues: result.issues }, '[Validation] contract.validation_failed');
    throw new KernelContractError('Contract validation failed', {
      issues: result.issues ?? [],
    });
  }

  return result.value;
}

/**
 * Validate an action contract definition specifically.
 * This should be called when loading engine manifests / registering actions.
 */
export async function validateActionContract(
  contract: unknown,
): Promise<KernelActionContract<ZodTypeAny, ZodTypeAny>> {
  const result = await safeParse(
    ZActionContractSchema as unknown as ZodSchema<KernelActionContract<ZodTypeAny, ZodTypeAny>>,
    contract,
  );

  if (!result.ok || !result.value) {
    logger.warn({ issues: result.issues }, '[Validation] action_contract.validation_failed');
    throw new KernelContractError('Action contract validation failed', {
      issues: result.issues ?? [],
    });
  }

  return result.value;
}

// ─────────────────────────────────────────────────────────────
// Action Input/Output Validation
// ─────────────────────────────────────────────────────────────

/**
 * Validate action input against the contract's input schema.
 *
 * This is the primary guard at the action dispatcher boundary: all user
 * provided payloads must pass here before reaching engine code.
 */
export async function validateActionInput<TInput>(
  contract: KernelActionContract<ZodTypeAny, ZodTypeAny>,
  input: unknown,
): Promise<TInput> {
  if (!contract.inputSchema) {
    // For actions without input, treat anything as undefined/null
    return undefined as unknown as TInput;
  }

  const result = await safeParse(contract.inputSchema as unknown as ZodSchema<TInput>, input);

  if (!result.ok || !result.value) {
    logger.warn(
      {
        actionId: contract.actionId,
        issues: result.issues,
      },
      '[Validation] action_input.validation_failed',
    );

    throw new KernelValidationError('Action input validation failed', {
      actionId: contract.actionId,
      issues: result.issues ?? [],
      phase: 'input',
    });
  }

  return result.value;
}

/**
 * Validate action output against the contract's output schema.
 *
 * This is the last line of defense before the kernel returns data to
 * external callers (API, MCP, UI). It protects against buggy engines.
 */
export async function validateActionOutput<TOutput>(
  contract: KernelActionContract<ZodTypeAny, ZodTypeAny>,
  output: unknown,
): Promise<TOutput> {
  if (!contract.outputSchema) {
    // If no output schema is defined, we allow any output. You may choose
    // to tighten this later by requiring schemas for all actions.
    return output as TOutput;
  }

  const result = await safeParse(contract.outputSchema as unknown as ZodSchema<TOutput>, output);

  if (!result.ok || !result.value) {
    logger.error(
      {
        actionId: contract.actionId,
        issues: result.issues,
      },
      '[Validation] action_output.validation_failed',
    );

    throw new KernelValidationError('Action output validation failed', {
      actionId: contract.actionId,
      issues: result.issues ?? [],
      phase: 'output',
    });
  }

  return result.value;
}

// ─────────────────────────────────────────────────────────────
// Convenience Helper
// ─────────────────────────────────────────────────────────────

/**
 * Convenience helper for entire action lifecycles: validates both input and
 * output, assuming the handler function is pure relative to the contract.
 */
export async function executeWithValidation<TInput, TOutput>(
  contract: KernelActionContract<ZodTypeAny, ZodTypeAny>,
  rawInput: unknown,
  handler: (input: TInput) => Promise<TOutput> | TOutput,
): Promise<TOutput> {
  const validatedInput = await validateActionInput<TInput>(contract, rawInput);
  const rawOutput = await handler(validatedInput);
  const validatedOutput = await validateActionOutput<TOutput>(contract, rawOutput);
  return validatedOutput;
}

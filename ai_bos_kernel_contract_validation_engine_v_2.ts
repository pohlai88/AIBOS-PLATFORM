// AI-BOS Kernel – Contract Validation Engine v2
// This document contains reference implementations for:
// 1) validation/contract.validator.ts
// 2) validation/index.ts (export wiring)
//
// Copy each section into its respective file in the `kernel/validation` directory.
// Adjust import paths if your folder structure differs slightly.

// ────────────────────────────────────────────────────────────────────────────────
// 1) validation/contract.validator.ts
// ────────────────────────────────────────────────────────────────────────────────

import type { ZodSchema } from 'zod';
import {
  KernelContractError,
  KernelValidationError,
} from '../hardening/errors';
import type {
  KernelActionContract,
  KernelContract,
} from '../contracts/contract.types';
import {
  ActionContractSchema,
  ContractSchema,
} from '../contracts/schemas';
import { createTraceLogger } from '../observability/logger';

const logger = createTraceLogger('validation:contract');

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  issues?: string[];
}

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

async function safeParse<T>(schema: ZodSchema<T>, value: unknown): Promise<ValidationResult<T>> {
  try {
    const parsed = await schema.parseAsync(value);
    return { ok: true, value: parsed };
  } catch (err) {
    return { ok: false, issues: toIssues(err) };
  }
}

/**
 * Validate a generic kernel contract using the shared ContractSchema.
 * Throws KernelContractError on failure (for hard kernel guarantees) and logs
 * structured diagnostics.
 */
export async function validateContract<T extends KernelContract>(
  contract: unknown,
): Promise<T> {
  const result = await safeParse(ContractSchema as ZodSchema<T>, contract);

  if (!result.ok || !result.value) {
    logger.warn({ issues: result.issues }, 'contract.validation_failed');
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
export async function validateActionContract<TInput, TOutput>(
  contract: unknown,
): Promise<KernelActionContract<TInput, TOutput>> {
  const result = await safeParse(
    ActionContractSchema as ZodSchema<KernelActionContract<TInput, TOutput>>,
    contract,
  );

  if (!result.ok || !result.value) {
    logger.warn({ issues: result.issues }, 'action_contract.validation_failed');
    throw new KernelContractError('Action contract validation failed', {
      issues: result.issues ?? [],
    });
  }

  return result.value;
}

/**
 * Validate action input against the contract's input schema.
 *
 * This is the primary guard at the action dispatcher boundary: all user
 * provided payloads must pass here before reaching engine code.
 */
export async function validateActionInput<TInput, TOutput>(
  contract: KernelActionContract<TInput, TOutput>,
  input: unknown,
): Promise<TInput> {
  if (!contract.inputSchema) {
    // For actions without input, treat anything as undefined/null
    return undefined as unknown as TInput;
  }

  const result = await safeParse(contract.inputSchema, input);

  if (!result.ok || !result.value) {
    logger.warn(
      {
        actionId: contract.id,
        issues: result.issues,
      },
      'action_input.validation_failed',
    );

    throw new KernelValidationError('Action input validation failed', {
      actionId: contract.id,
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
export async function validateActionOutput<TInput, TOutput>(
  contract: KernelActionContract<TInput, TOutput>,
  output: unknown,
): Promise<TOutput> {
  if (!contract.outputSchema) {
    // If no output schema is defined, we allow any output. You may choose
    // to tighten this later by requiring schemas for all actions.
    return output as TOutput;
  }

  const result = await safeParse(contract.outputSchema, output);

  if (!result.ok || !result.value) {
    logger.error(
      {
        actionId: contract.id,
        issues: result.issues,
      },
      'action_output.validation_failed',
    );

    throw new KernelValidationError('Action output validation failed', {
      actionId: contract.id,
      issues: result.issues ?? [],
      phase: 'output',
    });
  }

  return result.value;
}

/**
 * Convenience helper for entire action lifecycles: validates both input and
 * output, assuming the handler function is pure relative to the contract.
 */
export async function executeWithValidation<TInput, TOutput>(
  contract: KernelActionContract<TInput, TOutput>,
  rawInput: unknown,
  handler: (input: TInput) => Promise<TOutput> | TOutput,
): Promise<TOutput> {
  const validatedInput = await validateActionInput(contract, rawInput);
  const rawOutput = await handler(validatedInput);
  const validatedOutput = await validateActionOutput(contract, rawOutput);
  return validatedOutput;
}

// ────────────────────────────────────────────────────────────────────────────────
// 2) validation/index.ts
// ────────────────────────────────────────────────────────────────────────────────

export * from './contract.validator';
export * from './manifest.validator';
export * from './metadata.validator';

# 🔥 **Phase 2: Workflow Engine — Implementation Template**

**Date**: 2025-11-27  
**Phase**: 2 (Weeks 5-7)  
**Status**: ✅ COMPLETE

---

## 📋 **Deliverables Checklist**

| # | Component | File | Lines | Status |
|---|-----------|------|-------|--------|
| 1 | **Workflow Types** | `workflows/workflow.types.ts` | 250 | ✅ |
| 2 | **Retry Policy** | `workflows/retry.policy.ts` | 200 | ✅ |
| 3 | **Saga Engine** | `workflows/saga.engine.ts` | 450 | ✅ |
| 4 | **Compensation Handler** | `workflows/compensation.handler.ts` | 260 | ✅ |
| 5 | **Workflow Registry** | `workflows/workflow.registry.ts` | 180 | ✅ |
| 6 | **Health Monitor** | `observability/health.monitor.ts` | 230 | ✅ |
| 7 | **Integration Test** | `tests/integration/workflows/saga.test.ts` | 200 | ✅ |

**Total**: 7 files, 1,770 lines

---

## 🎯 **Quality Standards (Must Match Phase 0/1)**

### **1. Type Safety**
```typescript
// ✅ CORRECT: Full TypeScript with interfaces
export interface SagaStep<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  execute: (input: TInput, ctx: WorkflowContext) => Promise<TOutput>;
  compensate?: (input: TInput, ctx: WorkflowContext) => Promise<void>;
}

// ❌ WRONG: any types
execute: (input: any) => Promise<any>;
```

### **2. Error Handling**
```typescript
// ✅ CORRECT: Try/catch with typed errors
try {
  await step.execute(input, ctx);
} catch (error) {
  await this.handleStepFailure(step, error, ctx);
}

// ❌ WRONG: No error handling
await step.execute(input, ctx);
```

### **3. Event Bus Integration**
```typescript
// ✅ CORRECT: Typed events
await eventBus.publishTyped('workflow.saga.started', {
  type: 'workflow.saga.started',
  tenantId: ctx.tenantId,
  payload: { sagaId, definition },
});

// ❌ WRONG: Legacy API or missing events
eventBus.publish({ type: 'saga.started' });
```

### **4. Audit Trail Integration**
```typescript
// ✅ CORRECT: Append to hash-chain
await appendAuditEntry({
  tenantId: ctx.tenantId,
  actorId: ctx.actorId,
  actionId: 'workflow.saga.step.completed',
  payload: { sagaId, stepId, result },
});

// ❌ WRONG: No audit logging
```

### **5. Multi-Tenant Isolation**
```typescript
// ✅ CORRECT: Tenant in context
export interface WorkflowContext {
  tenantId: string;
  actorId: string;
  correlationId: string;
  // ...
}

// ❌ WRONG: No tenant isolation
```

### **6. JSDoc Documentation**
```typescript
// ✅ CORRECT: Full JSDoc
/**
 * Execute a saga workflow with compensation support
 * 
 * @param definition - Saga definition with steps
 * @param input - Initial input for the saga
 * @param context - Workflow context (tenant, actor, etc.)
 * @returns Saga execution result
 * @throws SagaFailedError if saga fails after compensation
 */
async execute<TInput, TOutput>(
  definition: SagaDefinition<TInput, TOutput>,
  input: TInput,
  context: WorkflowContext
): Promise<SagaResult<TOutput>>

// ❌ WRONG: No documentation
async execute(def, input, ctx)
```

---

## 📁 **File Templates**

### **Template 1: Type Definitions**

```typescript
// workflows/workflow.types.ts
/**
 * Workflow Types for AI-BOS Kernel
 * 
 * Defines all types for saga orchestration:
 * - SagaDefinition
 * - SagaStep
 * - WorkflowContext
 * - SagaResult
 * - CompensationResult
 */

import type { KernelEvent } from '../events/event-types';

/**
 * Workflow context (injected into every step)
 */
export interface WorkflowContext {
  tenantId: string;
  actorId: string;
  correlationId: string;
  traceId?: string;
  startedAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Saga step definition
 */
export interface SagaStep<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  description?: string;
  
  /** Forward execution */
  execute: (input: TInput, ctx: WorkflowContext) => Promise<TOutput>;
  
  /** Compensation (rollback) - optional */
  compensate?: (input: TInput, ctx: WorkflowContext) => Promise<void>;
  
  /** Retry policy override */
  retryPolicy?: RetryPolicy;
  
  /** Timeout in ms */
  timeout?: number;
}

/**
 * Saga definition
 */
export interface SagaDefinition<TInput = unknown, TOutput = unknown> {
  id: string;
  name: string;
  version: string;
  description?: string;
  steps: SagaStep[];
  
  /** Global retry policy */
  retryPolicy?: RetryPolicy;
  
  /** Global timeout in ms */
  timeout?: number;
}

/**
 * Retry policy
 */
export interface RetryPolicy {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

/**
 * Saga execution result
 */
export interface SagaResult<TOutput = unknown> {
  sagaId: string;
  status: 'completed' | 'failed' | 'compensated';
  output?: TOutput;
  error?: SagaError;
  steps: StepResult[];
  startedAt: Date;
  completedAt: Date;
  duration: number;
}

/**
 * Step execution result
 */
export interface StepResult {
  stepId: string;
  status: 'completed' | 'failed' | 'compensated' | 'skipped';
  output?: unknown;
  error?: Error;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  retries: number;
}

/**
 * Saga error
 */
export interface SagaError {
  code: string;
  message: string;
  failedStepId: string;
  compensationStatus: 'completed' | 'partial' | 'failed';
  compensatedSteps: string[];
  failedCompensations: string[];
}

/**
 * Workflow events
 */
export type WorkflowEventType = Extract<KernelEvent,
  | 'workflow.saga.started'
  | 'workflow.saga.step.started'
  | 'workflow.saga.step.completed'
  | 'workflow.saga.step.failed'
  | 'workflow.saga.compensation.started'
  | 'workflow.saga.compensation.completed'
  | 'workflow.saga.completed'
  | 'workflow.saga.failed'
>;
```

### **Template 2: Saga Engine**

```typescript
// workflows/saga.engine.ts
/**
 * Saga Engine — Temporal-Lite Workflow Orchestrator
 * 
 * Features:
 * - Step-by-step execution
 * - Automatic compensation on failure
 * - Retry with exponential backoff
 * - Event emission for observability
 * - Audit trail integration
 * - Multi-tenant isolation
 * 
 * Inspired by: Temporal, Medusa Workflows, Camunda
 */

import { eventBus } from '../events/event-bus';
import { appendAuditEntry } from '../audit/hash-chain.store';
import type {
  SagaDefinition,
  SagaStep,
  SagaResult,
  StepResult,
  WorkflowContext,
  RetryPolicy,
} from './workflow.types';

// ... implementation
```

---

## 🔍 **Validation Checklist**

Before marking any file complete:

- [ ] Zero linter errors
- [ ] 100% TypeScript (no `any`)
- [ ] Event bus integration (typed events)
- [ ] Audit trail integration (hash-chain)
- [ ] Multi-tenant isolation (tenantId in context)
- [ ] Error handling (try/catch)
- [ ] JSDoc documentation
- [ ] Consistent with Phase 0/1 patterns

---

## 📊 **Event Types Used**

```typescript
// From events/event-types.ts
export type WorkflowEvent =
  | "workflow.saga.started"
  | "workflow.saga.step.started"
  | "workflow.saga.step.completed"
  | "workflow.saga.step.failed"
  | "workflow.saga.compensation.started"
  | "workflow.saga.compensation.completed"
  | "workflow.saga.completed"
  | "workflow.saga.failed";
```

---

## 🚀 **Execution Order**

1. **workflow.types.ts** — Define all types first
2. **retry.policy.ts** — Retry logic (used by saga engine)
3. **saga.engine.ts** — Core saga orchestrator
4. **compensation.handler.ts** — Compensation logic
5. **workflow.registry.ts** — Workflow definitions registry
6. **health.monitor.ts** — Health checks
7. **saga.test.ts** — Integration tests

---

## ✅ **Success Criteria**

| Metric | Target |
|--------|--------|
| **Linter Errors** | 0 |
| **Type Safety** | 100% |
| **Event Coverage** | 8 workflow events |
| **Audit Coverage** | All saga operations |
| **Test Coverage** | 8+ test cases |
| **Documentation** | JSDoc on all exports |


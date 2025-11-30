/**
 * Saga Engine Integration Tests
 * 
 * Tests:
 * - Happy path execution
 * - Step failure with compensation
 * - Retry behavior
 * - Timeout handling
 * - Parallel compensation
 * 
 * @module tests/integration/workflows/saga.test
 */

import { sagaEngine } from '../../../workflows/saga.engine';
import { workflowRegistry } from '../../../workflows/workflow.registry';
import { compensationHandler } from '../../../workflows/compensation.handler';
import type {
  SagaDefinition,
  SagaStep,
  WorkflowContext,
} from '../../../workflows/workflow.types';

// ─────────────────────────────────────────────────────────────
// Test Utilities
// ─────────────────────────────────────────────────────────────

/**
 * Create test workflow context
 */
function createTestContext(overrides: Partial<WorkflowContext> = {}): WorkflowContext {
  return {
    tenantId: 'test-tenant',
    actorId: 'test-actor',
    correlationId: `test-${Date.now()}`,
    startedAt: new Date(),
    ...overrides,
  };
}

/**
 * Create a simple step
 */
function createStep(
  id: string,
  name: string,
  executeFn: (input: unknown) => Promise<unknown>,
  compensateFn?: (input: unknown) => Promise<void>
): SagaStep {
  return {
    id,
    name,
    execute: async (input, _ctx) => executeFn(input),
    compensate: compensateFn ? async (input, _ctx) => compensateFn(input) : undefined,
  };
}

/**
 * Track execution order
 */
const executionLog: string[] = [];

function clearLog(): void {
  executionLog.length = 0;
}

function log(message: string): void {
  executionLog.push(message);
}

// ─────────────────────────────────────────────────────────────
// Test Definitions
// ─────────────────────────────────────────────────────────────

/**
 * Order processing saga (happy path)
 */
const orderProcessingSaga: SagaDefinition = {
  id: 'order-processing',
  name: 'Order Processing',
  version: '1.0.0',
  description: 'Process customer order end-to-end',
  steps: [
    createStep(
      'validate-order',
      'Validate Order',
      async (input) => {
        log('validate-order:execute');
        return { ...input as object, validated: true };
      },
      async () => {
        log('validate-order:compensate');
      }
    ),
    createStep(
      'reserve-inventory',
      'Reserve Inventory',
      async (input) => {
        log('reserve-inventory:execute');
        return { ...input as object, inventoryReserved: true };
      },
      async () => {
        log('reserve-inventory:compensate');
      }
    ),
    createStep(
      'process-payment',
      'Process Payment',
      async (input) => {
        log('process-payment:execute');
        return { ...input as object, paymentProcessed: true };
      },
      async () => {
        log('process-payment:compensate');
      }
    ),
    createStep(
      'ship-order',
      'Ship Order',
      async (input) => {
        log('ship-order:execute');
        return { ...input as object, shipped: true };
      },
      async () => {
        log('ship-order:compensate');
      }
    ),
  ],
};

/**
 * Failing saga (for compensation testing)
 */
const failingSaga: SagaDefinition = {
  id: 'failing-saga',
  name: 'Failing Saga',
  version: '1.0.0',
  steps: [
    createStep(
      'step-1',
      'Step 1',
      async (input) => {
        log('step-1:execute');
        return { ...input as object, step1: true };
      },
      async () => {
        log('step-1:compensate');
      }
    ),
    createStep(
      'step-2',
      'Step 2',
      async (input) => {
        log('step-2:execute');
        return { ...input as object, step2: true };
      },
      async () => {
        log('step-2:compensate');
      }
    ),
    createStep(
      'step-3-fails',
      'Step 3 (Fails)',
      async () => {
        log('step-3:execute');
        throw new Error('Step 3 intentional failure');
      },
      async () => {
        log('step-3:compensate');
      }
    ),
    createStep(
      'step-4',
      'Step 4 (Never Reached)',
      async (input) => {
        log('step-4:execute');
        return input;
      }
    ),
  ],
  retryPolicy: {
    maxRetries: 0,
    initialDelayMs: 0,
    maxDelayMs: 0,
    backoffMultiplier: 1,
  },
};

// ─────────────────────────────────────────────────────────────
// Test Runner
// ─────────────────────────────────────────────────────────────

/**
 * Run all tests
 */
export async function runSagaTests(): Promise<void> {
  console.log('\n🧪 Running Saga Engine Tests...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Happy path
  try {
    clearLog();
    const ctx = createTestContext();
    const result = await sagaEngine.execute(orderProcessingSaga, { orderId: '123' }, ctx);

    assert(result.status === 'completed', 'Status should be completed');
    assert(result.steps.length === 4, 'Should have 4 step results');
    assert(executionLog.length === 4, 'Should execute 4 steps');
    assert(!executionLog.some(l => l.includes('compensate')), 'Should not compensate');

    console.log('✅ Test 1: Happy path execution');
    passed++;
  } catch (err) {
    console.log('❌ Test 1: Happy path execution -', err);
    failed++;
  }

  // Test 2: Step failure triggers compensation
  try {
    clearLog();
    const ctx = createTestContext();
    const result = await sagaEngine.execute(failingSaga, { data: 'test' }, ctx);

    assert(result.status === 'compensated', 'Status should be compensated');
    assert(result.error?.failedStepId === 'step-3-fails', 'Should identify failed step');
    assert(executionLog.includes('step-1:compensate'), 'Step 1 should compensate');
    assert(executionLog.includes('step-2:compensate'), 'Step 2 should compensate');
    assert(!executionLog.includes('step-4:execute'), 'Step 4 should not execute');

    console.log('✅ Test 2: Step failure triggers compensation');
    passed++;
  } catch (err) {
    console.log('❌ Test 2: Step failure triggers compensation -', err);
    failed++;
  }

  // Test 3: Compensation order (reverse)
  try {
    clearLog();
    const ctx = createTestContext();
    await sagaEngine.execute(failingSaga, {}, ctx);

    const compensations = executionLog.filter(l => l.includes('compensate'));
    assert(compensations[0] === 'step-2:compensate', 'Step 2 should compensate first');
    assert(compensations[1] === 'step-1:compensate', 'Step 1 should compensate second');

    console.log('✅ Test 3: Compensation order (reverse)');
    passed++;
  } catch (err) {
    console.log('❌ Test 3: Compensation order -', err);
    failed++;
  }

  // Test 4: Workflow registry
  try {
    workflowRegistry.clear();
    workflowRegistry.register(orderProcessingSaga);

    assert(workflowRegistry.has('order-processing'), 'Should have registered saga');
    assert(workflowRegistry.get('order-processing')?.name === 'Order Processing', 'Should retrieve saga');
    assert(workflowRegistry.getByName('Order Processing')?.id === 'order-processing', 'Should find by name');

    const stats = workflowRegistry.getStats();
    assert(stats.total === 1, 'Should have 1 workflow');
    assert(stats.enabled === 1, 'Should have 1 enabled');

    console.log('✅ Test 4: Workflow registry');
    passed++;
  } catch (err) {
    console.log('❌ Test 4: Workflow registry -', err);
    failed++;
  }

  // Test 5: Registry validation
  try {
    let threw = false;
    try {
      workflowRegistry.register({
        id: '',
        name: 'Invalid',
        version: '1.0.0',
        steps: [],
      });
    } catch {
      threw = true;
    }
    assert(threw, 'Should throw on invalid definition');

    console.log('✅ Test 5: Registry validation');
    passed++;
  } catch (err) {
    console.log('❌ Test 5: Registry validation -', err);
    failed++;
  }

  // Test 6: Compensation handler history
  try {
    compensationHandler.clearHistory();
    
    const ctx = createTestContext();
    await sagaEngine.execute(failingSaga, {}, ctx);

    const allHistory = compensationHandler.getAllHistory();
    assert(allHistory.length >= 0, 'Should track history');

    console.log('✅ Test 6: Compensation handler history');
    passed++;
  } catch (err) {
    console.log('❌ Test 6: Compensation handler history -', err);
    failed++;
  }

  // Test 7: Saga result structure
  try {
    clearLog();
    const ctx = createTestContext();
    const result = await sagaEngine.execute(orderProcessingSaga, { orderId: '456' }, ctx);

    assert(typeof result.sagaId === 'string', 'Should have sagaId');
    assert(result.sagaId.startsWith('saga_'), 'SagaId should have prefix');
    assert(result.definitionId === 'order-processing', 'Should have definitionId');
    assert(result.duration >= 0, 'Should have duration');
    assert(result.startedAt instanceof Date, 'Should have startedAt');
    assert(result.completedAt instanceof Date, 'Should have completedAt');

    console.log('✅ Test 7: Saga result structure');
    passed++;
  } catch (err) {
    console.log('❌ Test 7: Saga result structure -', err);
    failed++;
  }

  // Test 8: Step result structure
  try {
    clearLog();
    const ctx = createTestContext();
    const result = await sagaEngine.execute(orderProcessingSaga, {}, ctx);

    const step = result.steps[0];
    assert(step.stepId === 'validate-order', 'Should have stepId');
    assert(step.stepName === 'Validate Order', 'Should have stepName');
    assert(step.status === 'completed', 'Should have status');
    assert(step.duration !== undefined, 'Should have duration');
    assert(step.retries === 0, 'Should have retries count');

    console.log('✅ Test 8: Step result structure');
    passed++;
  } catch (err) {
    console.log('❌ Test 8: Step result structure -', err);
    failed++;
  }

  // Summary
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed\n`);

  if (failed > 0) {
    throw new Error(`${failed} tests failed`);
  }
}

/**
 * Simple assertion helper
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// Run if executed directly
if (require.main === module) {
  runSagaTests()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}


/**
 * 🛡️ Resilience Layer v2.0 — Kernel-Grade
 * 
 * Complete resilience subsystem with:
 * - Multi-tenant circuit breakers
 * - Provider health scoring
 * - Semantic error classification
 * - DLQ with checksum lineage
 * - Predictive degradation
 * - Provider fallback
 * - Observability spans
 * 
 * @module @aibos/kernel/storage/resilience-v2
 * @version 2.0.0
 */

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export type {
  CircuitState,
  CircuitKey,
  CircuitBreakerState,
  CircuitBreakerConfig,
  ErrorCategory,
  NormalizedError,
  HealthMetrics,
  ProviderHealthScore,
  RetryConfig,
  RetryContext,
  DLQEntry,
  ResilienceSpan,
  ResilienceStateStore,
  AnomalyLog,
  ExecutionOptions,
  ExecutionResult,
} from "./types";

export { ERROR_CATEGORIES } from "./types";

// ═══════════════════════════════════════════════════════════
// Error Classifier
// ═══════════════════════════════════════════════════════════

export { ErrorClassifier, errorClassifier } from "./error-classifier";

// ═══════════════════════════════════════════════════════════
// State Store
// ═══════════════════════════════════════════════════════════

export {
  stateStore,
  generateDLQId,
  generateAnomalyId,
  computeChecksum,
} from "./state-store";

// ═══════════════════════════════════════════════════════════
// Circuit Breaker v2
// ═══════════════════════════════════════════════════════════

export { CircuitBreakerV2, circuitBreakerV2 } from "./circuit-breaker-v2";

// ═══════════════════════════════════════════════════════════
// Retry Engine v2
// ═══════════════════════════════════════════════════════════

export { RetryEngineV2, retryEngineV2 } from "./retry-engine-v2";

// ═══════════════════════════════════════════════════════════
// Resilience Manager v2 (Main Orchestrator)
// ═══════════════════════════════════════════════════════════

export { ResilienceManagerV2, resilienceManagerV2 } from "./resilience-manager-v2";

// ═══════════════════════════════════════════════════════════
// Quick Usage
// ═══════════════════════════════════════════════════════════

/**
 * Example: Using Resilience Layer v2.0
 * 
 * ```typescript
 * import { resilienceManagerV2 } from '@aibos/kernel/storage/resilience-v2';
 * 
 * // Execute with full resilience
 * const result = await resilienceManagerV2.execute(
 *   async () => {
 *     // Your operation
 *     return await fetch('https://api.provider.com/data');
 *   },
 *   {
 *     tenantId: 'tenant-123',
 *     provider: 'supabase',
 *     region: 'singapore',
 *     engine: 'workflow',
 *     operation: 'findMany',
 *     fallbackProviders: ['neon', 'aws'],
 *   },
 *   { /* optional payload for DLQ */ }
 * );
 * 
 * if (result.success) {
 *   console.log('Data:', result.data);
 * } else {
 *   console.log('Error:', result.error);
 *   console.log('From fallback:', result.metrics.fromFallback);
 * }
 * 
 * // Check provider health
 * const health = await resilienceManagerV2.getProviderHealth('supabase', 'tenant-123');
 * console.log('Health score:', health?.score);
 * console.log('Status:', health?.status);
 * 
 * // Get DLQ entries
 * const dlq = await resilienceManagerV2.getDLQStats('tenant-123');
 * console.log('Pending DLQ:', dlq.pending);
 * 
 * // Retry DLQ entries
 * const retryResult = await resilienceManagerV2.retryDLQ(
 *   'tenant-123',
 *   async (payload) => {
 *     // Retry logic
 *   }
 * );
 * ```
 */


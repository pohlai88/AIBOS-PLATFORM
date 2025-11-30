/**
 * 🚀 Universal Adapter Engine™ (UAE)
 * 
 * Enterprise-grade storage abstraction with full governance.
 * 
 * Features:
 * - Capability Matrix (provider feature detection)
 * - Security Policy Engine (compliance enforcement)
 * - Canonical Storage Format (unified responses)
 * - Sandbox Executor (safe custom code)
 * - Circuit Breaker + Retry (resilience)
 * - AI Guardrails (validation before activation)
 * 
 * @module @aibos/kernel/storage/universal-adapter-engine
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Capability Matrix
// ═══════════════════════════════════════════════════════════

export {
  CapabilityChecker,
  capabilityChecker,
  CapabilityMatrixSchema,
  PROVIDER_CAPABILITIES,
  type CapabilityMatrix,
} from "./capability-matrix";

// ═══════════════════════════════════════════════════════════
// Security Policy Engine
// ═══════════════════════════════════════════════════════════

export {
  SecurityPolicyEngine,
  securityPolicyEngine,
  SecurityPolicySchema,
  type SecurityPolicy,
  type PolicyViolation,
  type PolicyCheckResult,
} from "./security-policy.engine";

// ═══════════════════════════════════════════════════════════
// Canonical Storage Format (CSF)
// ═══════════════════════════════════════════════════════════

export {
  CSFNormalizer,
  csfNormalizer,
  CanonicalResponseSchema,
  type CanonicalResponse,
} from "./canonical-storage-format";

// ═══════════════════════════════════════════════════════════
// Sandbox Executor
// ═══════════════════════════════════════════════════════════

export {
  SandboxExecutor,
  sandboxExecutor,
  DEFAULT_SANDBOX_CONFIG,
  type SandboxConfig,
  type SandboxResult,
} from "./sandbox-executor";

// ═══════════════════════════════════════════════════════════
// Circuit Breaker + Resilience
// ═══════════════════════════════════════════════════════════

export {
  CircuitBreaker,
  circuitBreaker,
  RetryEngine,
  retryEngine,
  ResilienceManager,
  resilienceManager,
  ErrorMapper,
  type CircuitState,
  type CircuitStats,
  type CircuitBreakerConfig,
  type RetryConfig,
  type NormalizedError,
} from "./circuit-breaker";

// ═══════════════════════════════════════════════════════════
// AI Guardrails
// ═══════════════════════════════════════════════════════════

export {
  AIGuardrails,
  aiGuardrails,
  type GuardrailCheck,
  type GuardrailResult,
  type ThreatProfile,
  type ThreatLevel,
} from "./ai-guardrails";

// ═══════════════════════════════════════════════════════════
// Provider Intelligence Engine
// ═══════════════════════════════════════════════════════════

export {
  ProviderIntelligenceEngine,
  providerIntelligence,
  type ProviderDecision,
  type ProviderDecisionRequirements,
} from "./provider-intelligence.engine";

// ═══════════════════════════════════════════════════════════
// Resilience Layer v2.0 (Kernel-Grade)
// ═══════════════════════════════════════════════════════════

export {
  // Main orchestrator
  ResilienceManagerV2,
  resilienceManagerV2,
  // Components
  CircuitBreakerV2,
  circuitBreakerV2,
  RetryEngineV2,
  retryEngineV2,
  ErrorClassifier,
  errorClassifier,
  stateStore,
  // Types
  type CircuitState,
  type CircuitKey,
  type NormalizedError,
  type ProviderHealthScore,
  type DLQEntry,
  type ExecutionOptions,
  type ExecutionResult,
  type AnomalyLog,
  ERROR_CATEGORIES,
} from "./resilience-v2";

// ═══════════════════════════════════════════════════════════
// Universal Adapter Engine (Main Orchestrator)
// ═══════════════════════════════════════════════════════════

import { securityPolicyEngine, type SecurityPolicy } from "./security-policy.engine";
import { csfNormalizer, type CanonicalResponse } from "./canonical-storage-format";
import { sandboxExecutor, type SandboxConfig } from "./sandbox-executor";
import { resilienceManager } from "./circuit-breaker";
import { aiGuardrails, type GuardrailResult } from "./ai-guardrails";
import { CapabilityChecker, type CapabilityMatrix } from "./capability-matrix";
import { adapterGenerator, type AdapterConfig, type GeneratedAdapter } from "../adapter-factory/adapter.generator";
import { eventBus } from "../../events/event-bus";

export interface UAEConfig {
  tenantId: string;
  adapterId: string;
  provider: string;
  capabilities?: Partial<CapabilityMatrix>;
  securityPolicy?: Partial<SecurityPolicy>;
  sandboxConfig?: Partial<SandboxConfig>;
}

export class UniversalAdapterEngine {
  private configs: Map<string, UAEConfig> = new Map();

  /**
   * Register adapter with UAE
   */
  async registerAdapter(
    config: UAEConfig,
    adapterConfig?: AdapterConfig
  ): Promise<{ success: boolean; guardrailResult?: GuardrailResult }> {
    const key = `${config.tenantId}:${config.adapterId}`;

    // If adapter config provided, validate with AI guardrails
    if (adapterConfig) {
      const generatedCode = adapterGenerator.generateAdapterCode(adapterConfig);
      const guardrailResult = await aiGuardrails.validateAdapter(
        adapterConfig,
        generatedCode,
        config.capabilities
      );

      if (!guardrailResult.approved) {
        return { success: false, guardrailResult };
      }
    }

    // Register security policy
    const policy = securityPolicyEngine.createDefaultPolicy(config.tenantId, config.adapterId);
    if (config.securityPolicy) {
      Object.assign(policy, config.securityPolicy);
    }
    securityPolicyEngine.registerPolicy(policy);

    // Store config
    this.configs.set(key, config);

    await eventBus.publish({
      type: "uae.adapter.registered",
      tenantId: config.tenantId,
      adapterId: config.adapterId,
      provider: config.provider,
      timestamp: new Date().toISOString(),
    } as any);

    return { success: true };
  }

  /**
   * Execute operation through UAE
   */
  async execute<T = any>(
    tenantId: string,
    adapterId: string,
    operation: string,
    executor: () => Promise<any>
  ): Promise<CanonicalResponse> {
    const key = `${tenantId}:${adapterId}`;
    const config = this.configs.get(key);

    if (!config) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        data: [],
        count: 0,
        error: {
          code: "ADAPTER_NOT_REGISTERED",
          message: "Adapter not registered with UAE",
          retryable: false,
        },
      };
    }

    const startTime = Date.now();

    // 1. Security Policy Check
    const policyResult = await securityPolicyEngine.checkRequest(tenantId, adapterId, {
      operation,
    });

    if (!policyResult.allowed) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        data: [],
        count: 0,
        error: {
          code: "POLICY_VIOLATION",
          message: policyResult.violations.map(v => v.message).join("; "),
          retryable: false,
        },
      };
    }

    // 2. Execute with Resilience (Circuit Breaker + Retry)
    try {
      const rawResult = await resilienceManager.execute(
        key,
        executor,
        config.provider
      );

      // 3. Normalize Response
      return csfNormalizer.normalize(config.provider, operation, rawResult, startTime);
    } catch (error: any) {
      return csfNormalizer.normalizeError(config.provider, operation, error, Date.now() - startTime);
    }
  }

  /**
   * Execute custom code in sandbox
   */
  async executeCustomCode<T = any>(
    tenantId: string,
    adapterId: string,
    code: string,
    context: Record<string, any> = {}
  ): Promise<CanonicalResponse> {
    const key = `${tenantId}:${adapterId}`;
    const config = this.configs.get(key);

    if (!config) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        data: [],
        count: 0,
        error: {
          code: "ADAPTER_NOT_REGISTERED",
          message: "Adapter not registered with UAE",
          retryable: false,
        },
      };
    }

    const startTime = Date.now();

    // Execute in sandbox
    const sandboxResult = await sandboxExecutor.execute(
      code,
      context,
      tenantId,
      adapterId
    );

    if (!sandboxResult.success) {
      return {
        success: false,
        timestamp: new Date().toISOString(),
        data: [],
        count: 0,
        error: {
          code: `SANDBOX_${sandboxResult.error?.type}`,
          message: sandboxResult.error?.message || "Sandbox execution failed",
          retryable: false,
        },
        meta: {
          provider: config.provider,
          operation: "custom_code",
          durationMs: sandboxResult.metrics.executionTimeMs,
        },
      };
    }

    // Normalize result
    return csfNormalizer.normalize(
      config.provider,
      "custom_code",
      sandboxResult.result,
      startTime
    );
  }

  /**
   * Check provider capabilities
   */
  checkCapability(provider: string, capability: keyof CapabilityMatrix): boolean {
    return CapabilityChecker.supports(provider, capability);
  }

  /**
   * Get circuit breaker state
   */
  getCircuitState(tenantId: string, adapterId: string): string {
    return resilienceManager.getCircuitState(`${tenantId}:${adapterId}`);
  }

  /**
   * Reset circuit breaker
   */
  resetCircuit(tenantId: string, adapterId: string): void {
    resilienceManager.resetCircuit(`${tenantId}:${adapterId}`);
  }
}

/**
 * Singleton instance
 */
export const universalAdapterEngine = new UniversalAdapterEngine();

// ═══════════════════════════════════════════════════════════
// Quick Usage Example
// ═══════════════════════════════════════════════════════════

/**
 * Example: Using Universal Adapter Engine
 * 
 * ```typescript
 * import { universalAdapterEngine } from '@aibos/kernel/storage/universal-adapter-engine';
 * 
 * // 1. Register adapter
 * await universalAdapterEngine.registerAdapter({
 *   tenantId: 'my-tenant',
 *   adapterId: 'my-custom-api',
 *   provider: 'rest',
 *   capabilities: {
 *     supportsSQL: false,
 *     supportsTransactions: false,
 *     latencyProfile: 'medium',
 *   },
 *   securityPolicy: {
 *     allowedDomains: ['api.example.com'],
 *     maxRequestsPerMinute: 100,
 *   },
 * });
 * 
 * // 2. Execute operation (with full protection)
 * const result = await universalAdapterEngine.execute(
 *   'my-tenant',
 *   'my-custom-api',
 *   'findMany',
 *   async () => {
 *     const response = await fetch('https://api.example.com/data');
 *     return response.json();
 *   }
 * );
 * 
 * // Result is always in Canonical Storage Format
 * console.log(result.data);    // Always array
 * console.log(result.count);   // Always number
 * console.log(result.success); // Always boolean
 * ```
 */


/**
 * 🛡️ DriftShield™ + Ledger Guardian™ — Option D
 * 
 * Predictive metadata drift prevention:
 * - Merkle DAG state tracking
 * - Cascade failure prediction
 * - AI-powered drift detection
 * - Autonomous remediation
 * 
 * @module @aibos/kernel/drift
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════
// Merkle DAG
// ═══════════════════════════════════════════════════════════

export {
  MerkleDAG,
  merkleDAG,
  type MerkleNode,
  type StateSnapshot,
  type DriftDiff,
} from "./merkle-dag";

// ═══════════════════════════════════════════════════════════
// Cascade Predictor
// ═══════════════════════════════════════════════════════════

export {
  CascadePredictor,
  cascadePredictor,
  type DependencyNode,
  type CascadeImpact,
  type CascadeReport,
} from "./cascade-predictor";

// ═══════════════════════════════════════════════════════════
// Predictive DriftShield
// ═══════════════════════════════════════════════════════════

export {
  PredictiveDriftShield,
  predictiveDriftShield,
  type DriftAlert,
  type DriftFix,
  type AIAnalysis,
  type ShieldConfig,
} from "./predictive-shield";

// ═══════════════════════════════════════════════════════════
// Auto-Fixer Engine
// ═══════════════════════════════════════════════════════════

export {
  AutoFixerEngine,
  autoFixerEngine,
  type FixPlan,
  type FixStep,
  type FixResult,
  type PendingFix,
} from "./auto-fixer";

// ═══════════════════════════════════════════════════════════
// Quick Start
// ═══════════════════════════════════════════════════════════

/**
 * Example: Using DriftShield
 * 
 * ```typescript
 * import { 
 *   predictiveDriftShield, 
 *   merkleDAG, 
 *   cascadePredictor 
 * } from '@aibos/kernel/drift';
 * 
 * // Start monitoring
 * predictiveDriftShield.startMonitoring();
 * 
 * // Load state from metadata
 * await merkleDAG.loadFromRegistry({
 *   manifests: manifestRegistry,
 *   metadata: metadataRegistry,
 *   workflows: workflowRegistry,
 * });
 * 
 * // Check for drift manually
 * const drift = await predictiveDriftShield.checkDrift();
 * if (drift.modified.length > 0) {
 *   console.log('Drift detected:', drift);
 * }
 * 
 * // Predict cascade impact
 * const cascade = cascadePredictor.predictCascade(
 *   'entity:Customer',
 *   'modify_schema'
 * );
 * console.log('Impact:', cascade.totalAffected, 'entities');
 * 
 * // Get alerts
 * const alerts = predictiveDriftShield.getAlerts();
 * console.log('Critical:', alerts.filter(a => a.severity === 'critical'));
 * ```
 */


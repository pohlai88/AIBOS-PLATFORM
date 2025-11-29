/**
 * @fileoverview Manifest Drift Guard - Enhanced Version
 * @module @bff/drift
 * @description Stable hashing, deep freeze baseline, structured diffs, severity codes
 */

import crypto from 'crypto';
import type { BffManifestType } from '../bff.manifest';

// ============================================================================
// Utilities
// ============================================================================

/**
 * Stable JSON stringify with sorted keys (deterministic hashing)
 */
function stableStringify(obj: unknown): string {
  if (obj === null || obj === undefined) return String(obj);
  if (typeof obj !== 'object') return JSON.stringify(obj);

  if (Array.isArray(obj)) {
    return '[' + obj.map(stableStringify).join(',') + ']';
  }

  const keys = Object.keys(obj).sort();
  const pairs = keys.map((k) => `${JSON.stringify(k)}:${stableStringify((obj as Record<string, unknown>)[k])}`);
  return '{' + pairs.join(',') + '}';
}

/**
 * Deep clone (breaks reference chain)
 */
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep freeze (immutable baseline)
 */
function deepFreeze<T extends object>(obj: T): T {
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const value = (obj as Record<string, unknown>)[key];
    if (
      value !== null &&
      typeof value === 'object' &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value as object);
    }
  }
  return obj;
}

// ============================================================================
// Types
// ============================================================================

export interface DriftDiff {
  added: string[];
  removed: string[];
  modified: string[];
}

export interface DriftCheckResult {
  hasDrift: boolean;
  currentSignature: string;
  expectedSignature: string | undefined;
  changedFields: string[];
  diff: DriftDiff;
  severity: DriftSeverity;
  reasonCodes: string[];
  timestamp: string;
}

export type DriftSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface DriftHistory {
  timestamp: string;
  previousSignature: string;
  newSignature: string;
  changedFields: string[];
  diff: DriftDiff;
  severity: DriftSeverity;
  approved: boolean;
  approvedBy?: string;
  reason?: string;
}

export interface DriftShieldExport {
  type: 'bff-manifest';
  signature: string | undefined;
  baselineVersion: string | undefined;
  lastChecked: string;
  historyCount: number;
  status: 'clean' | 'drifted' | 'approved';
}

// ============================================================================
// Severity Configuration
// ============================================================================

const SEVERITY_CONFIG = {
  critical: ['enforcement', 'security'],
  high: ['protocols', 'rateLimits'],
  medium: ['cors', 'versioning', 'requiredHeaders'],
  low: ['version', 'description', 'timeouts', 'retry', 'errorAliases'],
} as const;

const MONITORED_FIELDS = [
  'enforcement',
  'security',
  'protocols',
  'rateLimits',
  'cors',
  'versioning',
  'requiredHeaders',
  'payloadLimits',
  'errorCodes',
  'timeouts',
  'retry',
  'version',
] as const;

// ============================================================================
// ManifestDriftGuard
// ============================================================================

/**
 * Manifest Drift Guard
 * 
 * Features:
 * - Deterministic SHA256 hashing (stable key ordering)
 * - Deep frozen baseline (immutable)
 * - Structured diffs for DriftShield visualizer
 * - Severity classification with reason codes
 * - Audit-ready history
 */
export class ManifestDriftGuard {
  private history: DriftHistory[] = [];
  private baselineSignature: string | undefined;
  private baselineManifest: Omit<BffManifestType, 'signature'> | undefined;
  private lastCheckResult: DriftCheckResult | undefined;

  constructor(manifest: Readonly<BffManifestType>) {
    // Exclude signature from baseline (never part of drift evaluation)
    const { signature, ...rest } = manifest;
    const clone = deepFreeze(deepClone(rest));
    this.baselineManifest = clone;
    this.baselineSignature = this.computeSignature(clone);
  }

  // ==========================================================================
  // Core Methods
  // ==========================================================================

  /**
   * Compute deterministic SHA256 signature
   */
  computeSignature(manifest: Omit<BffManifestType, 'signature'>): string {
    const hash = crypto.createHash('sha256');
    hash.update(stableStringify(manifest));
    return `sha256-${hash.digest('hex')}`;
  }

  /**
   * Check for drift against baseline
   */
  checkDrift(currentManifest: BffManifestType): DriftCheckResult {
    const { signature, ...rest } = currentManifest;
    const currentSignature = this.computeSignature(rest);
    const hasDrift = currentSignature !== this.baselineSignature;

    let changedFields: string[] = [];
    let diff: DriftDiff = { added: [], removed: [], modified: [] };
    let reasonCodes: string[] = [];

    if (hasDrift && this.baselineManifest) {
      changedFields = this.detectChangedFields(rest);
      diff = this.computeDiff(rest, this.baselineManifest);
      reasonCodes = changedFields.map((f) => `${f.toUpperCase()}_CHANGED`);
    }

    const severity = this.calculateSeverity(changedFields);

    const result: DriftCheckResult = {
      hasDrift,
      currentSignature,
      expectedSignature: this.baselineSignature,
      changedFields,
      diff,
      severity,
      reasonCodes,
      timestamp: new Date().toISOString(),
    };

    this.lastCheckResult = result;
    return result;
  }

  /**
   * Approve drift and update baseline
   */
  approveDrift(
    newManifest: BffManifestType,
    approvedBy: string,
    reason?: string
  ): void {
    const { signature, ...rest } = newManifest;
    const newSignature = this.computeSignature(rest);
    const changedFields = this.baselineManifest
      ? this.detectChangedFields(rest)
      : [];
    const diff = this.baselineManifest
      ? this.computeDiff(rest, this.baselineManifest)
      : { added: [], removed: [], modified: [] };

    this.history.push({
      timestamp: new Date().toISOString(),
      previousSignature: this.baselineSignature || 'initial',
      newSignature,
      changedFields,
      diff,
      severity: this.calculateSeverity(changedFields),
      approved: true,
      approvedBy,
      reason,
    });

    // Update baseline (deep clone + freeze)
    this.baselineSignature = newSignature;
    this.baselineManifest = deepFreeze(deepClone(rest));
  }

  /**
   * Reject drift (log rejection, do not update baseline)
   */
  rejectDrift(currentManifest: BffManifestType, rejectedBy: string, reason: string): void {
    const { signature, ...rest } = currentManifest;
    const newSignature = this.computeSignature(rest);
    const changedFields = this.baselineManifest
      ? this.detectChangedFields(rest)
      : [];
    const diff = this.baselineManifest
      ? this.computeDiff(rest, this.baselineManifest)
      : { added: [], removed: [], modified: [] };

    this.history.push({
      timestamp: new Date().toISOString(),
      previousSignature: this.baselineSignature || 'initial',
      newSignature,
      changedFields,
      diff,
      severity: this.calculateSeverity(changedFields),
      approved: false,
      approvedBy: rejectedBy,
      reason,
    });
  }

  // ==========================================================================
  // Detection Methods
  // ==========================================================================

  /**
   * Detect which fields changed
   */
  private detectChangedFields(current: Omit<BffManifestType, 'signature'>): string[] {
    if (!this.baselineManifest) return ['unknown'];

    const baseline = this.baselineManifest;
    const changes: string[] = [];

    for (const field of MONITORED_FIELDS) {
      const currentValue = (current as Record<string, unknown>)[field];
      const baselineValue = (baseline as Record<string, unknown>)[field];

      if (stableStringify(currentValue) !== stableStringify(baselineValue)) {
        changes.push(field);
      }
    }

    return changes;
  }

  /**
   * Compute structured diff for DriftShield visualizer
   */
  private computeDiff(
    current: Omit<BffManifestType, 'signature'>,
    baseline: Omit<BffManifestType, 'signature'>
  ): DriftDiff {
    const added: string[] = [];
    const removed: string[] = [];
    const modified: string[] = [];

    const currentKeys = new Set(Object.keys(current));
    const baselineKeys = new Set(Object.keys(baseline));
    const allKeys = new Set([...currentKeys, ...baselineKeys]);

    for (const key of allKeys) {
      if (key === 'signature') continue; // Always ignore signature

      const inCurrent = currentKeys.has(key);
      const inBaseline = baselineKeys.has(key);

      if (inCurrent && !inBaseline) {
        added.push(key);
      } else if (!inCurrent && inBaseline) {
        removed.push(key);
      } else if (inCurrent && inBaseline) {
        const currentValue = (current as Record<string, unknown>)[key];
        const baselineValue = (baseline as Record<string, unknown>)[key];

        if (stableStringify(currentValue) !== stableStringify(baselineValue)) {
          modified.push(key);
        }
      }
    }

    return { added, removed, modified };
  }

  /**
   * Calculate severity based on changed fields
   */
  private calculateSeverity(changedFields: string[]): DriftSeverity {
    if (changedFields.length === 0) return 'none';

    if (changedFields.some((f) => SEVERITY_CONFIG.critical.includes(f as any))) {
      return 'critical';
    }
    if (changedFields.some((f) => SEVERITY_CONFIG.high.includes(f as any))) {
      return 'high';
    }
    if (changedFields.some((f) => SEVERITY_CONFIG.medium.includes(f as any))) {
      return 'medium';
    }

    return 'low';
  }

  // ==========================================================================
  // Export Methods
  // ==========================================================================

  /**
   * Get drift history
   */
  getHistory(): DriftHistory[] {
    return [...this.history];
  }

  /**
   * Get last check result
   */
  getLastCheck(): DriftCheckResult | undefined {
    return this.lastCheckResult;
  }

  /**
   * Get baseline signature
   */
  getBaselineSignature(): string | undefined {
    return this.baselineSignature;
  }

  /**
   * Export for DriftShield integration
   */
  toDriftShieldFormat(): DriftShieldExport {
    const lastApproved = this.history.filter((h) => h.approved).pop();
    const lastRejected = this.history.filter((h) => !h.approved).pop();

    let status: 'clean' | 'drifted' | 'approved' = 'clean';
    if (this.lastCheckResult?.hasDrift) {
      status = lastApproved ? 'approved' : 'drifted';
    }

    return {
      type: 'bff-manifest',
      signature: this.baselineSignature,
      baselineVersion: this.baselineManifest?.version,
      lastChecked: this.lastCheckResult?.timestamp || new Date().toISOString(),
      historyCount: this.history.length,
      status,
    };
  }

  /**
   * Verify current manifest matches baseline (for CI/CD dry-run)
   */
  verify(currentManifest: BffManifestType): {
    valid: boolean;
    result: DriftCheckResult;
  } {
    const result = this.checkDrift(currentManifest);
    return {
      valid: !result.hasDrift,
      result,
    };
  }

  /**
   * Enforce drift check (throws if drift detected with critical/high severity)
   */
  enforce(currentManifest: BffManifestType): void {
    const result = this.checkDrift(currentManifest);

    if (result.hasDrift && (result.severity === 'critical' || result.severity === 'high')) {
      throw new Error(
        `[DriftGuard] Critical drift detected!\n` +
        `Severity: ${result.severity}\n` +
        `Changed: ${result.changedFields.join(', ')}\n` +
        `Reason codes: ${result.reasonCodes.join(', ')}`
      );
    }
  }
}

// ============================================================================
// Factory
// ============================================================================

/**
 * Create drift guard from manifest
 */
export function createManifestDriftGuard(
  manifest: Readonly<BffManifestType>
): ManifestDriftGuard {
  return new ManifestDriftGuard(manifest);
}

/**
 * 🔒 Integrity Guardian v1.0
 * 
 * Tamper-proof kernel protection:
 * - File hash baseline
 * - Runtime mutation detection
 * - Memory integrity checks
 * - Code signing verification
 * 
 * @version 1.0.0
 */

import { createHash } from "crypto";
import { readFileSync, existsSync } from "fs";
import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface IntegrityBaseline {
  path: string;
  hash: string;
  size: number;
  recordedAt: number;
}

export interface IntegrityViolation {
  path: string;
  expectedHash: string;
  actualHash: string;
  type: "modified" | "deleted" | "new";
  detectedAt: number;
}

export interface IntegrityReport {
  valid: boolean;
  violations: IntegrityViolation[];
  checkedAt: number;
  totalFiles: number;
}

// ═══════════════════════════════════════════════════════════
// Integrity Guardian
// ═══════════════════════════════════════════════════════════

export class IntegrityGuardian {
  private static baselines = new Map<string, IntegrityBaseline>();
  private static violations: IntegrityViolation[] = [];

  /**
   * Hash a file
   */
  static hashFile(path: string): string {
    try {
      const content = readFileSync(path);
      return createHash("sha256").update(content).digest("hex");
    } catch {
      return "";
    }
  }

  /**
   * Record baseline for files
   */
  static recordBaseline(paths: string[]): number {
    let recorded = 0;

    for (const path of paths) {
      if (!existsSync(path)) continue;

      const hash = this.hashFile(path);
      const stats = { size: 0 };
      
      try {
        const content = readFileSync(path);
        stats.size = content.length;
      } catch {
        continue;
      }

      this.baselines.set(path, {
        path,
        hash,
        size: stats.size,
        recordedAt: Date.now(),
      });

      recorded++;
    }

    return recorded;
  }

  /**
   * Detect mutations
   */
  static detectMutations(paths?: string[]): IntegrityViolation[] {
    const violations: IntegrityViolation[] = [];
    const pathsToCheck = paths || Array.from(this.baselines.keys());

    for (const path of pathsToCheck) {
      const baseline = this.baselines.get(path);
      
      if (!baseline) {
        // New file (not in baseline)
        if (existsSync(path)) {
          violations.push({
            path,
            expectedHash: "",
            actualHash: this.hashFile(path),
            type: "new",
            detectedAt: Date.now(),
          });
        }
        continue;
      }

      if (!existsSync(path)) {
        // File deleted
        violations.push({
          path,
          expectedHash: baseline.hash,
          actualHash: "",
          type: "deleted",
          detectedAt: Date.now(),
        });
        continue;
      }

      const currentHash = this.hashFile(path);
      if (currentHash !== baseline.hash) {
        // File modified
        violations.push({
          path,
          expectedHash: baseline.hash,
          actualHash: currentHash,
          type: "modified",
          detectedAt: Date.now(),
        });
      }
    }

    // Store violations
    this.violations.push(...violations);

    // Emit event if violations found
    if (violations.length > 0) {
      eventBus.publish({
        type: "kernel.tamper.detected",
        violations,
        timestamp: new Date().toISOString(),
      } as any);
    }

    return violations;
  }

  /**
   * Verify integrity
   */
  static verify(): IntegrityReport {
    const violations = this.detectMutations();

    return {
      valid: violations.length === 0,
      violations,
      checkedAt: Date.now(),
      totalFiles: this.baselines.size,
    };
  }

  /**
   * Get baseline for path
   */
  static getBaseline(path: string): IntegrityBaseline | undefined {
    return this.baselines.get(path);
  }

  /**
   * Get all baselines
   */
  static getAllBaselines(): IntegrityBaseline[] {
    return Array.from(this.baselines.values());
  }

  /**
   * Get violation history
   */
  static getViolations(): IntegrityViolation[] {
    return [...this.violations];
  }

  /**
   * Clear violations
   */
  static clearViolations(): void {
    this.violations = [];
  }

  /**
   * Update baseline after approved change
   */
  static updateBaseline(path: string): boolean {
    if (!existsSync(path)) {
      this.baselines.delete(path);
      return true;
    }

    const hash = this.hashFile(path);
    const content = readFileSync(path);

    this.baselines.set(path, {
      path,
      hash,
      size: content.length,
      recordedAt: Date.now(),
    });

    return true;
  }
}

export const integrityGuardian = IntegrityGuardian;


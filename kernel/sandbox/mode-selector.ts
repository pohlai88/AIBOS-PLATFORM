/**
 * 🎯 Execution Mode Selector v3.0
 * 
 * Auto-selects optimal sandbox mode:
 * - vm2: Low risk, simple code
 * - worker: Medium risk, heavy ops
 * - wasm: Compute-intensive
 * - isolated: High risk, untrusted
 * 
 * @version 3.0.0
 */

import { type SandboxMode, type ASTRiskResult, type SandboxContract } from "./types";

export interface ModeSelectionInput {
  astResult: ASTRiskResult;
  code: string;
  contract?: SandboxContract;
  preferredMode?: SandboxMode;
}

export interface ModeSelectionResult {
  mode: SandboxMode;
  reason: string;
  confidence: number;
}

export class ModeSelector {
  /**
   * Select optimal execution mode
   */
  static select(input: ModeSelectionInput): ModeSelectionResult {
    const { astResult, code, contract, preferredMode } = input;

    // If preferred mode is specified and safe, use it
    if (preferredMode && this.isModeAllowed(preferredMode, astResult)) {
      return {
        mode: preferredMode,
        reason: "User-preferred mode",
        confidence: 0.9,
      };
    }

    // Critical risk → isolated (strictest)
    if (astResult.score >= 70 || astResult.issues.some(i => i.severity === "critical")) {
      return {
        mode: "isolated",
        reason: `High risk score (${astResult.score}) or critical issues`,
        confidence: 0.95,
      };
    }

    // High risk → worker (process isolation)
    if (astResult.score >= 40) {
      return {
        mode: "worker",
        reason: `Medium-high risk score (${astResult.score})`,
        confidence: 0.85,
      };
    }

    // Large code → worker (memory isolation)
    if (code.length > 10000) {
      return {
        mode: "worker",
        reason: `Large code size (${code.length} chars)`,
        confidence: 0.8,
      };
    }

    // High memory estimate → worker
    if (astResult.estimatedMemoryMB > 20) {
      return {
        mode: "worker",
        reason: `High memory estimate (${astResult.estimatedMemoryMB}MB)`,
        confidence: 0.8,
      };
    }

    // Compute-intensive patterns → wasm
    if (this.isComputeIntensive(code)) {
      return {
        mode: "wasm",
        reason: "Compute-intensive patterns detected",
        confidence: 0.75,
      };
    }

    // High complexity → worker
    if (astResult.complexity > 30) {
      return {
        mode: "worker",
        reason: `High complexity (${astResult.complexity})`,
        confidence: 0.7,
      };
    }

    // Network calls with strict contract → worker
    if (astResult.hasNetworkCalls && contract?.allowedDomains?.length) {
      return {
        mode: "worker",
        reason: "Network calls with domain restrictions",
        confidence: 0.7,
      };
    }

    // Default → vm2 (fastest)
    return {
      mode: "vm2",
      reason: "Low risk, simple code",
      confidence: 0.9,
    };
  }

  /**
   * Check if mode is safe for given risk
   */
  private static isModeAllowed(mode: SandboxMode, astResult: ASTRiskResult): boolean {
    switch (mode) {
      case "vm2":
        return astResult.score < 40 && !astResult.issues.some(i => i.severity === "critical");
      case "worker":
        return astResult.score < 70;
      case "wasm":
        return astResult.score < 50;
      case "isolated":
        return true; // Always allowed
      default:
        return false;
    }
  }

  /**
   * Detect compute-intensive patterns
   */
  private static isComputeIntensive(code: string): boolean {
    const patterns = [
      /matrix|vector|tensor/i,
      /crypto|hash|encrypt|decrypt/i,
      /fft|fourier|transform/i,
      /image|pixel|canvas/i,
      /neural|ml|model/i,
      /sort.*\d{4,}|filter.*\d{4,}|map.*\d{4,}/i,
    ];

    return patterns.some(p => p.test(code));
  }
}

export const modeSelector = ModeSelector;


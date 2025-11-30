/**
 * 👑 Sovereign Kernel Mode v1.0
 * 
 * Lockdown mode where:
 * - No manifest can modify core systems
 * - No engine can override rules
 * - No state change without multi-party validation
 * - Kernel becomes "sovereign"
 * 
 * @version 1.0.0
 */

import { eventBus } from "../events/event-bus";

// ═══════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════

export interface SovereignConfig {
  allowedOperations: string[];
  requiredApprovers: number;
  lockdownLevel: "partial" | "full" | "emergency";
  bypassToken?: string;
}

export interface SovereignState {
  enabled: boolean;
  enabledAt?: number;
  enabledBy?: string;
  config: SovereignConfig;
  blockedAttempts: number;
}

// ═══════════════════════════════════════════════════════════
// Sovereign Mode
// ═══════════════════════════════════════════════════════════

export class SovereignMode {
  private static state: SovereignState = {
    enabled: false,
    config: {
      allowedOperations: ["read", "query", "health"],
      requiredApprovers: 2,
      lockdownLevel: "partial",
    },
    blockedAttempts: 0,
  };

  /**
   * Enable sovereign mode
   */
  static enable(enabledBy: string, config?: Partial<SovereignConfig>): void {
    this.state = {
      enabled: true,
      enabledAt: Date.now(),
      enabledBy,
      config: { ...this.state.config, ...config },
      blockedAttempts: 0,
    };

    eventBus.publish({
      type: "kernel.sovereign.enabled",
      enabledBy,
      config: this.state.config,
      timestamp: new Date().toISOString(),
    } as any);
  }

  /**
   * Disable sovereign mode
   */
  static disable(disabledBy: string, bypassToken?: string): boolean {
    if (this.state.config.bypassToken && bypassToken !== this.state.config.bypassToken) {
      this.state.blockedAttempts++;
      return false;
    }

    this.state.enabled = false;

    eventBus.publish({
      type: "kernel.sovereign.disabled",
      disabledBy,
      timestamp: new Date().toISOString(),
    } as any);

    return true;
  }

  /**
   * Check if sovereign mode is active
   */
  static isActive(): boolean {
    return this.state.enabled;
  }

  /**
   * Guard an operation
   */
  static guard(operation: string): void {
    if (!this.state.enabled) return;

    if (!this.state.config.allowedOperations.includes(operation)) {
      this.state.blockedAttempts++;

      eventBus.publish({
        type: "kernel.sovereign.blocked",
        operation,
        timestamp: new Date().toISOString(),
      } as any);

      throw new Error(`Sovereign Mode: Operation '${operation}' is blocked during lockdown.`);
    }
  }

  /**
   * Check if operation is allowed
   */
  static isAllowed(operation: string): boolean {
    if (!this.state.enabled) return true;
    return this.state.config.allowedOperations.includes(operation);
  }

  /**
   * Get current state
   */
  static getState(): SovereignState {
    return { ...this.state };
  }

  /**
   * Get lockdown level
   */
  static getLockdownLevel(): SovereignConfig["lockdownLevel"] {
    return this.state.config.lockdownLevel;
  }

  /**
   * Emergency lockdown (blocks everything except health)
   */
  static emergencyLockdown(enabledBy: string): void {
    this.enable(enabledBy, {
      allowedOperations: ["health"],
      lockdownLevel: "emergency",
      requiredApprovers: 3,
    });
  }
}

export const sovereignMode = SovereignMode;


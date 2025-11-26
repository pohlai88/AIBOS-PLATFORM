/**
 * ChaosHarness - Chaos engineering for kernel resilience testing
 * 
 * Hardening v2: Inject failures to test recovery (internal testing only)
 */

import { eventBus } from "../events/event-bus";
import { engineRegistry } from "../registry/engine.registry";

export type ChaosType = "latency" | "error" | "timeout" | "corruption" | "restart";

export interface ChaosConfig {
  type: ChaosType;
  probability: number; // 0-1
  target: string;      // e.g., "db", "cache", "action", "engine"
  params?: Record<string, any>;
}

export class ChaosHarness {
  private static activeConfigs: ChaosConfig[] = [];
  private static enabled = false;

  /**
   * Enable chaos testing (NEVER in production)
   */
  static enable(): void {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ChaosHarness cannot be enabled in production");
    }
    this.enabled = true;
  }

  /**
   * Disable chaos testing
   */
  static disable(): void {
    this.enabled = false;
  }

  /**
   * Add chaos configuration
   */
  static addConfig(config: ChaosConfig): void {
    this.activeConfigs.push(config);
  }

  /**
   * Check if chaos should be injected
   */
  static shouldInject(target: string): ChaosConfig | null {
    if (!this.enabled) return null;
    
    for (const config of this.activeConfigs) {
      if (config.target === target || config.target === "*") {
        if (Math.random() < config.probability) {
          return config;
        }
      }
    }
    return null;
  }

  /**
   * Inject chaos (call in target code)
   */
  static async inject(target: string): Promise<void> {
    const config = this.shouldInject(target);
    if (!config) return;

    switch (config.type) {
      case "latency":
        const delay = config.params?.delayMs ?? 1000;
        await new Promise(r => setTimeout(r, delay));
        break;
      case "error":
        throw new Error(`Chaos: Injected error for ${target}`);
      case "timeout":
        await new Promise(() => {}); // Never resolves
        break;
      case "corruption":
        // Handled by caller
        break;
    }
  }

  /**
   * Randomly restart engines (stress test)
   */
  static async randomEngineRestart(iterations = 10): Promise<void> {
    const engines = engineRegistry.list();
    for (let i = 0; i < iterations; i++) {
      const victim = engines[Math.floor(Math.random() * engines.length)];
      if (victim) {
        eventBus.publish({
          name: "engine.restart.requested",
          payload: { engine: victim },
          timestamp: Date.now(),
          tenant: "system",
          engine: "chaos-harness"
        });
      }
    }
  }

  /**
   * Simulate engine failure
   */
  static async simulateEngineFailure(engineName: string): Promise<void> {
    eventBus.publish({
      name: "engine.failure.simulated",
      payload: { engine: engineName, reason: "chaos-test" },
      timestamp: Date.now(),
      tenant: "system",
      engine: "chaos-harness"
    });
  }

  /**
   * Simulate high load
   */
  static async simulateHighLoad(eventsPerSecond: number, durationMs: number): Promise<void> {
    const interval = 1000 / eventsPerSecond;
    const endTime = Date.now() + durationMs;
    
    while (Date.now() < endTime) {
      eventBus.publish({
        name: "chaos.load.event",
        payload: { timestamp: Date.now() },
        timestamp: Date.now(),
        tenant: "system",
        engine: "chaos-harness"
      });
      await new Promise(r => setTimeout(r, interval));
    }
  }

  /**
   * Clear all configs
   */
  static clear(): void {
    this.activeConfigs = [];
    this.enabled = false;
  }
}

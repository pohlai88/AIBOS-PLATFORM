/**
 * EngineDependencyGraph - Manages engine dependencies and isolation tiers
 * 
 * Hardening v2: Ensures correct engine initialization order and prevents cascading failures
 */

export type EngineName = string;

export interface EngineDependencyEdge {
  from: EngineName;
  to: EngineName;
  reason?: string; // e.g. "reads-metadata", "calls-actions"
}

export type IsolationTier = "core" | "critical" | "standard" | "experimental";

export interface EngineNode {
  name: EngineName;
  tier: IsolationTier;
  dependsOn: EngineName[];
  loaded?: boolean;
}

export class EngineDependencyGraph {
  private static nodes = new Map<EngineName, EngineNode>();

  static registerNode(node: EngineNode): void {
    this.nodes.set(node.name, { ...node, loaded: false });
  }

  static getNode(name: EngineName): EngineNode | undefined {
    return this.nodes.get(name);
  }

  static getAllNodes(): EngineNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get engines that depend on the target
   */
  static getDependants(target: EngineName): EngineName[] {
    const result: EngineName[] = [];
    for (const node of this.nodes.values()) {
      if (node.dependsOn.includes(target)) {
        result.push(node.name);
      }
    }
    return result;
  }

  /**
   * Get topologically sorted load order
   */
  static getLoadOrder(): EngineName[] {
    const visited = new Set<EngineName>();
    const result: EngineName[] = [];

    const visit = (name: EngineName, stack: Set<EngineName>) => {
      if (stack.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }
      if (visited.has(name)) return;

      stack.add(name);
      const node = this.nodes.get(name);
      if (node) {
        for (const dep of node.dependsOn) {
          visit(dep, stack);
        }
      }
      stack.delete(name);
      visited.add(name);
      result.push(name);
    };

    for (const name of this.nodes.keys()) {
      visit(name, new Set());
    }

    return result;
  }

  /**
   * Detect circular dependencies
   */
  static detectCycles(): EngineName[][] {
    const visited = new Set<EngineName>();
    const stack = new Set<EngineName>();
    const cycles: EngineName[][] = [];

    const dfs = (node: EngineName, path: EngineName[]) => {
      if (stack.has(node)) {
        const idx = path.indexOf(node);
        cycles.push(path.slice(idx));
        return;
      }
      if (visited.has(node)) return;
      visited.add(node);
      stack.add(node);

      const n = this.nodes.get(node);
      if (!n) return;

      for (const dep of n.dependsOn) {
        dfs(dep, [...path, dep]);
      }

      stack.delete(node);
    };

    for (const name of this.nodes.keys()) {
      if (!visited.has(name)) {
        dfs(name, [name]);
      }
    }

    return cycles;
  }

  /**
   * Check if all dependencies are loaded
   */
  static canLoad(name: EngineName): boolean {
    const node = this.nodes.get(name);
    if (!node) return false;
    return node.dependsOn.every(dep => {
      const depNode = this.nodes.get(dep);
      return depNode?.loaded ?? false;
    });
  }

  /**
   * Mark engine as loaded
   */
  static markLoaded(name: EngineName): void {
    const node = this.nodes.get(name);
    if (node) node.loaded = true;
  }

  /**
   * Get engines by tier
   */
  static getByTier(tier: IsolationTier): EngineNode[] {
    return Array.from(this.nodes.values()).filter(n => n.tier === tier);
  }

  /**
   * Validate no cycles in critical tiers
   */
  static validateCriticalTiers(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const cycles = this.detectCycles();
    
    for (const cycle of cycles) {
      const involvedNodes = cycle.map(name => this.nodes.get(name)).filter(Boolean);
      const hasCritical = involvedNodes.some(n => n!.tier === "core" || n!.tier === "critical");
      if (hasCritical) {
        errors.push(`Cycle in critical tier: ${cycle.join(" -> ")}`);
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Clear graph (for testing)
   */
  static clear(): void {
    this.nodes.clear();
  }
}

import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { runVisualEngine } from "../engines/visualEngine.js";

export function validateVisual(nodes: DesignNode[]): ValidationError[] {
  let results: ValidationError[] = [];

  nodes.forEach((node) => {
    const nodeErrors = runVisualEngine(node);
    results = results.concat(nodeErrors);

    // Recursively validate children
    if (node.children && node.children.length > 0) {
      results = results.concat(validateVisual(node.children));
    }
  });

  return results;
}

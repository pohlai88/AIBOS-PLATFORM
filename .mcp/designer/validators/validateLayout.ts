import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { runLayoutEngine } from "../engines/layoutEngine.js";

export function validateLayout(nodes: DesignNode[]): ValidationError[] {
  let results: ValidationError[] = [];

  nodes.forEach((node) => {
    const nodeErrors = runLayoutEngine(node);
    results = results.concat(nodeErrors);

    // Recursively validate children
    if (node.children && node.children.length > 0) {
      results = results.concat(validateLayout(node.children));
    }
  });

  return results;
}

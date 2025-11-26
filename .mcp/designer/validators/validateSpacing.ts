import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { runSpacingEngine } from "../engines/spacingEngine.js";

export function validateSpacing(nodes: DesignNode[]): ValidationError[] {
  let results: ValidationError[] = [];

  nodes.forEach((node) => {
    const nodeErrors = runSpacingEngine(node);
    results = results.concat(nodeErrors);

    // Recursively validate children
    if (node.children && node.children.length > 0) {
      results = results.concat(validateSpacing(node.children));
    }
  });

  return results;
}

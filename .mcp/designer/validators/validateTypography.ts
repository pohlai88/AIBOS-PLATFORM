import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { runTypographyEngine } from "../engines/typographyEngine.js";

export function validateTypography(nodes: DesignNode[]): ValidationError[] {
  let results: ValidationError[] = [];

  nodes.forEach((node) => {
    const nodeErrors = runTypographyEngine(node);
    results = results.concat(nodeErrors);

    // Recursively validate children
    if (node.children && node.children.length > 0) {
      results = results.concat(validateTypography(node.children));
    }
  });

  return results;
}

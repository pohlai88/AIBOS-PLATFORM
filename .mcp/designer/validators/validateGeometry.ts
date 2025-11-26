import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { runGeometryEngine } from "../engines/geometryEngine.js";

export function validateGeometry(nodes: DesignNode[]): ValidationError[] {
  let results: ValidationError[] = [];

  nodes.forEach((node) => {
    const nodeErrors = runGeometryEngine(node);
    results = results.concat(nodeErrors);

    // Recursively validate children
    if (node.children && node.children.length > 0) {
      results = results.concat(validateGeometry(node.children));
    }
  });

  return results;
}

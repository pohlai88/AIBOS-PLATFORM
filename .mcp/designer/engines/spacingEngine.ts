import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { errorCodes } from "../errors/errorCodes.js";

// Default rules - can be overridden by tenant config
const defaultRules = {
  gridStep: 4,
  allowedSpacing: [0, 2, 4, 6, 8, 12, 16, 20, 24, 32, 40],
  siblingAlignmentTolerance: 2,
  spacingExceptions: [
    "Checkbox",
    "Radio",
    "Toggle",
    "Badge",
    "Tooltip",
    "Spinner",
  ],
};

// Check if component name is in exceptions list
function isExcepted(nodeName: string | undefined, exceptions: string[]): boolean {
  if (!nodeName) return false;
  return exceptions.some(
    (ex) => nodeName.toLowerCase().includes(ex.toLowerCase())
  );
}

export function runSpacingEngine(
  node: DesignNode,
  rules = defaultRules
): ValidationError[] {
  const errors: ValidationError[] = [];

  // ------------------------------------------
  // Validate padding uses allowed spacing grid (with exceptions)
  // ------------------------------------------
  const exceptions = (rules as any).spacingExceptions || defaultRules.spacingExceptions;
  const isExceptedComponent = isExcepted(node.name, exceptions);

  if (node.padding && !isExceptedComponent) {
    const paddings = Object.values(node.padding);
    paddings.forEach((padValue) => {
      if (
        typeof padValue === "number" &&
        !rules.allowedSpacing.includes(padValue)
      ) {
        errors.push({
          code: errorCodes.SPC_ILLEGAL_VALUE,
          severity: "warning",
          message: `Padding ${padValue}px is not in allowed spacing set.`,
          nodeId: node.id,
          nodeType: node.type,
          parentId: node.parentId,
        });
      }
    });
  }

  // ------------------------------------------
  // Validate gap (Auto-layout) uses spacing grid
  // ------------------------------------------
  if (node.gap !== undefined && !rules.allowedSpacing.includes(node.gap) && !isExceptedComponent) {
    errors.push({
      code: errorCodes.SPC_NOT_GRID,
      severity: "warning",
      message: `Gap ${node.gap}px does not follow spacing grid.`,
      nodeId: node.id,
      nodeType: node.type,
      parentId: node.parentId,
    });
  }

  return errors;
}

export function runSpacingEngineTree(
  nodes: DesignNode[],
  rules = defaultRules
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const node of nodes) {
    errors.push(...runSpacingEngine(node, rules));

    if (node.children) {
      errors.push(...runSpacingEngineTree(node.children, rules));
    }
  }

  return errors;
}

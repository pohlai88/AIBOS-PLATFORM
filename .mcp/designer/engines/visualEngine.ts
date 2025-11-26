import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { errorCodes } from "../errors/errorCodes.js";

// Default rules - can be overridden by tenant config
const defaultRules = {
  allowedSurfaceRoles: ["primary", "secondary", "muted", "elevated"],
  forbiddenEffects: ["innerShadow", "hardShadow"],
};

export function runVisualEngine(
  node: DesignNode,
  rules = defaultRules
): ValidationError[] {
  const errors: ValidationError[] = [];

  // ------------------------------------------
  // Surface role correctness
  // ------------------------------------------
  if (
    node.surfaceRole &&
    !rules.allowedSurfaceRoles.includes(node.surfaceRole)
  ) {
    errors.push({
      code: errorCodes.VIS_ILLEGAL_SURFACE,
      severity: "warning",
      message: `Surface role '${node.surfaceRole}' is not allowed. Use: [${rules.allowedSurfaceRoles.join(", ")}].`,
      nodeId: node.id,
      nodeType: node.type,
      parentId: node.parentId,
    });
  }

  // ------------------------------------------
  // Visual effects (shadow, blur, glow)
  // ------------------------------------------
  if (node.effects) {
    node.effects.forEach((effect) => {
      if (rules.forbiddenEffects.includes(effect)) {
        errors.push({
          code: errorCodes.VIS_FORBIDDEN_EFFECT,
          severity: "error",
          message: `Effect '${effect}' is forbidden for this theme.`,
          nodeId: node.id,
          nodeType: node.type,
          parentId: node.parentId,
        });
      }
    });
  }

  return errors;
}

export function runVisualEngineTree(
  nodes: DesignNode[],
  rules = defaultRules
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const node of nodes) {
    errors.push(...runVisualEngine(node, rules));

    if (node.children) {
      errors.push(...runVisualEngineTree(node.children, rules));
    }
  }

  return errors;
}

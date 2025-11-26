import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { errorCodes } from "../errors/errorCodes.js";

// Default rules - can be overridden by tenant config
const defaultRules = {
  minFontSize: 12,
  recommendedFontSize: 14,
  modularScale: 1.25,
  allowedWeights: [400, 500, 600, 700],
  lineHeightRange: { min: 1.2, max: 1.6 },
  maxHeadingJump: 1,
};

export function runTypographyEngine(
  node: DesignNode,
  rules = defaultRules
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (node.type !== "text") return errors;

  // -----------------------
  // Font size too small
  // -----------------------
  if (node.fontSize && node.fontSize < rules.minFontSize) {
    errors.push({
      code: errorCodes.TYP_TOO_SMALL,
      severity: "error",
      message: `Font size ${node.fontSize}px < minimum ${rules.minFontSize}px.`,
      nodeId: node.id,
      nodeType: node.type,
      parentId: node.parentId,
    });
  }

  // -----------------------
  // Wrong font weight
  // -----------------------
  if (node.fontWeight && !rules.allowedWeights.includes(node.fontWeight)) {
    errors.push({
      code: errorCodes.TYP_INVALID_WEIGHT,
      severity: "warning",
      message: `Font weight ${node.fontWeight} is not allowed.`,
      nodeId: node.id,
      nodeType: node.type,
      parentId: node.parentId,
    });
  }

  // -----------------------
  // Line height out of range
  // -----------------------
  if (
    node.lineHeight &&
    (node.lineHeight < rules.lineHeightRange.min ||
      node.lineHeight > rules.lineHeightRange.max)
  ) {
    errors.push({
      code: errorCodes.TYP_INVALID_LINEHEIGHT,
      severity: "warning",
      message: `Line-height ${node.lineHeight} is outside recommended range ${rules.lineHeightRange.min}–${rules.lineHeightRange.max}.`,
      nodeId: node.id,
      nodeType: node.type,
      parentId: node.parentId,
    });
  }

  // -----------------------
  // (Future extension) Modular scale / heading jumps
  // -----------------------

  return errors;
}

export function runTypographyEngineTree(
  nodes: DesignNode[],
  rules = defaultRules
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const node of nodes) {
    errors.push(...runTypographyEngine(node, rules));

    if (node.children) {
      errors.push(...runTypographyEngineTree(node.children, rules));
    }
  }

  return errors;
}

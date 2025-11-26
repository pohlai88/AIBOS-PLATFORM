import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { errorCodes } from "../errors/errorCodes.js";

// Default rules - can be overridden by tenant config
const defaultRules = {
  minButtonPaddingY: 8,
  minButtonPaddingX: 12,
  allowedIconSizes: [12, 14, 16, 20, 24, 32, 40, 48],
  allowedRadius: [0, 2, 4, 6, 8, 12, 9999],
  buttonPaddingExceptions: [
    "Checkbox",
    "Radio",
    "Toggle",
    "Switch",
    "Avatar",
    "Badge",
    "Tooltip",
    "Spinner",
    "IconButton",
  ],
};

// Check if component name is in exceptions list
function isExcepted(nodeName: string | undefined, exceptions: string[]): boolean {
  if (!nodeName) return false;
  return exceptions.some(
    (ex) => nodeName.toLowerCase().includes(ex.toLowerCase())
  );
}

export function runGeometryEngine(
  node: DesignNode,
  rules = defaultRules
): ValidationError[] {
  const errors: ValidationError[] = [];

  // ------------------------------------------
  // Icon size
  // ------------------------------------------
  if (
    node.type === "icon" &&
    node.width &&
    !rules.allowedIconSizes.includes(node.width)
  ) {
    errors.push({
      code: errorCodes.GEO_ICON_TOO_SMALL,
      severity: "warning",
      message: `Icon size ${node.width}px not in allowed set [${rules.allowedIconSizes.join(", ")}].`,
      nodeId: node.id,
      nodeType: node.type,
      parentId: node.parentId,
    });
  }

  // ------------------------------------------
  // Button padding (with exceptions for form controls)
  // ------------------------------------------
  const exceptions = (rules as any).buttonPaddingExceptions || defaultRules.buttonPaddingExceptions;
  const isExceptedComponent = isExcepted(node.name, exceptions);

  if (node.type === "button" && node.padding && !isExceptedComponent) {
    const { top, bottom, left, right } = node.padding;

    if (top !== undefined && top < rules.minButtonPaddingY) {
      errors.push({
        code: errorCodes.GEO_BUTTON_PADDING,
        severity: "error",
        message: `Button padding top ${top}px < minimum ${rules.minButtonPaddingY}px.`,
        nodeId: node.id,
        nodeType: node.type,
        parentId: node.parentId,
      });
    }

    if (bottom !== undefined && bottom < rules.minButtonPaddingY) {
      errors.push({
        code: errorCodes.GEO_BUTTON_PADDING,
        severity: "error",
        message: `Button padding bottom ${bottom}px < minimum ${rules.minButtonPaddingY}px.`,
        nodeId: node.id,
        nodeType: node.type,
        parentId: node.parentId,
      });
    }

    if (left !== undefined && left < rules.minButtonPaddingX) {
      errors.push({
        code: errorCodes.GEO_BUTTON_PADDING,
        severity: "error",
        message: `Button padding left ${left}px < minimum ${rules.minButtonPaddingX}px.`,
        nodeId: node.id,
        nodeType: node.type,
        parentId: node.parentId,
      });
    }

    if (right !== undefined && right < rules.minButtonPaddingX) {
      errors.push({
        code: errorCodes.GEO_BUTTON_PADDING,
        severity: "error",
        message: `Button padding right ${right}px < minimum ${rules.minButtonPaddingX}px.`,
        nodeId: node.id,
        nodeType: node.type,
        parentId: node.parentId,
      });
    }
  }

  // ------------------------------------------
  // Corner radius validation
  // ------------------------------------------
  if (node.cornerRadius !== undefined) {
    const radius =
      typeof node.cornerRadius === "number" ? node.cornerRadius : null;

    if (radius !== null && !rules.allowedRadius.includes(radius)) {
      errors.push({
        code: errorCodes.GEO_RADIUS_INVALID,
        severity: "warning",
        message: `Corner radius ${radius}px not in allowed set [${rules.allowedRadius.join(", ")}].`,
        nodeId: node.id,
        nodeType: node.type,
        parentId: node.parentId,
      });
    }
  }

  return errors;
}

export function runGeometryEngineTree(
  nodes: DesignNode[],
  rules = defaultRules
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const node of nodes) {
    errors.push(...runGeometryEngine(node, rules));

    if (node.children) {
      errors.push(...runGeometryEngineTree(node.children, rules));
    }
  }

  return errors;
}

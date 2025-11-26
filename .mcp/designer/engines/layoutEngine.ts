import type { DesignNode } from "../types/DesignNode.js";
import type { ValidationError } from "../types/ValidationError.js";
import { errorCodes } from "../errors/errorCodes.js";

// Default rules - can be overridden by tenant config
const defaultRules = {
  maxFrameWidth: 1440,
  minFrameWidth: 240,
  minFramePadding: 16,
  alignmentTolerance: 2,
  frameWidthExceptions: [
    "Spinner",
    "Avatar",
    "Checkbox",
    "Radio",
    "Toggle",
    "Switch",
    "Badge",
    "Icon",
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

export function runLayoutEngine(
  node: DesignNode,
  rules = defaultRules
): ValidationError[] {
  const errors: ValidationError[] = [];

  // ------------------------------------------
  // Frame size validation (with exceptions for small components)
  // ------------------------------------------
  const exceptions = (rules as any).frameWidthExceptions || defaultRules.frameWidthExceptions;
  const isExceptedComponent = isExcepted(node.name, exceptions);

  if (node.width && !isExceptedComponent) {
    if (node.width > rules.maxFrameWidth) {
      errors.push({
        code: errorCodes.LAY_FRAME_TOO_WIDE,
        severity: "warning",
        message: `Frame width ${node.width}px exceeds max ${rules.maxFrameWidth}px.`,
        nodeId: node.id,
        nodeType: node.type,
        parentId: node.parentId,
      });
    }

    if (node.width < rules.minFrameWidth) {
      errors.push({
        code: errorCodes.LAY_FRAME_TOO_NARROW,
        severity: "warning",
        message: `Frame width ${node.width}px smaller than min ${rules.minFrameWidth}px.`,
        nodeId: node.id,
        nodeType: node.type,
        parentId: node.parentId,
      });
    }
  }

  // ------------------------------------------
  // Alignment tolerance (Figma-style)
  // ------------------------------------------
  if (node.x && node.x % rules.alignmentTolerance !== 0) {
    errors.push({
      code: errorCodes.LAY_ALIGNMENT,
      severity: "info",
      message: `Position ${node.x}px is not aligned with ${rules.alignmentTolerance}px grid.`,
      nodeId: node.id,
      nodeType: node.type,
      parentId: node.parentId,
    });
  }

  return errors;
}

export function runLayoutEngineTree(
  nodes: DesignNode[],
  rules = defaultRules
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const node of nodes) {
    errors.push(...runLayoutEngine(node, rules));

    if (node.children) {
      errors.push(...runLayoutEngineTree(node.children, rules));
    }
  }

  return errors;
}

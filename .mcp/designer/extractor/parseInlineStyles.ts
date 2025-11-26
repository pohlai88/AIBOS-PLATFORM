import type { DesignNode } from "../types/DesignNode.js";

/**
 * Parse inline style object expression from JSX.
 * Handles: style={{ fontSize: 16, padding: 8 }}
 */
export function parseInlineStyles(expr: any): Partial<DesignNode> {
  if (!expr || expr.type !== "ObjectExpression") {
    return {};
  }

  const result: Partial<DesignNode> = {};
  const padding: { top?: number; bottom?: number; left?: number; right?: number } = {};

  for (const prop of expr.properties) {
    if (prop.type !== "ObjectProperty") continue;

    const key = getPropertyKey(prop.key);
    if (!key) continue;

    const value = getPropertyValue(prop.value);

    switch (key) {
      // Typography
      case "fontSize":
        result.fontSize = parseNumericValue(value);
        break;

      case "fontWeight":
        result.fontWeight = parseNumericValue(value);
        break;

      case "lineHeight":
        result.lineHeight = parseNumericValue(value);
        break;

      // Padding
      case "padding":
        const padValue = parseNumericValue(value);
        if (padValue !== undefined) {
          padding.top = padValue;
          padding.bottom = padValue;
          padding.left = padValue;
          padding.right = padValue;
        }
        break;

      case "paddingTop":
        padding.top = parseNumericValue(value);
        break;

      case "paddingBottom":
        padding.bottom = parseNumericValue(value);
        break;

      case "paddingLeft":
        padding.left = parseNumericValue(value);
        break;

      case "paddingRight":
        padding.right = parseNumericValue(value);
        break;

      case "paddingInline":
      case "paddingHorizontal":
        const hPad = parseNumericValue(value);
        if (hPad !== undefined) {
          padding.left = hPad;
          padding.right = hPad;
        }
        break;

      case "paddingBlock":
      case "paddingVertical":
        const vPad = parseNumericValue(value);
        if (vPad !== undefined) {
          padding.top = vPad;
          padding.bottom = vPad;
        }
        break;

      // Gap
      case "gap":
        result.gap = parseNumericValue(value);
        break;

      // Dimensions
      case "width":
        result.width = parseNumericValue(value);
        break;

      case "height":
        result.height = parseNumericValue(value);
        break;

      // Border radius
      case "borderRadius":
        result.cornerRadius = parseNumericValue(value);
        break;
    }
  }

  // Assign padding if any values were set
  if (Object.keys(padding).length > 0) {
    result.padding = padding;
  }

  return result;
}

/**
 * Get property key name from AST node.
 */
function getPropertyKey(node: any): string | null {
  if (node.type === "Identifier") {
    return node.name;
  }
  if (node.type === "StringLiteral") {
    return node.value;
  }
  return null;
}

/**
 * Get property value from AST node.
 */
function getPropertyValue(node: any): string | number | null {
  if (node.type === "NumericLiteral") {
    return node.value;
  }
  if (node.type === "StringLiteral") {
    return node.value;
  }
  if (node.type === "UnaryExpression" && node.operator === "-") {
    const arg = node.argument;
    if (arg.type === "NumericLiteral") {
      return -arg.value;
    }
  }
  return null;
}

/**
 * Parse numeric value from string or number.
 * Handles "16px", "1.5rem", 16, etc.
 */
function parseNumericValue(value: string | number | null): number | undefined {
  if (value === null) return undefined;

  if (typeof value === "number") {
    return value;
  }

  // Handle px values
  if (value.endsWith("px")) {
    return parseFloat(value);
  }

  // Handle rem values (assuming 16px base)
  if (value.endsWith("rem")) {
    return parseFloat(value) * 16;
  }

  // Handle em values
  if (value.endsWith("em")) {
    return parseFloat(value) * 16;
  }

  // Try parsing as number
  const num = parseFloat(value);
  if (!isNaN(num)) {
    return num;
  }

  return undefined;
}


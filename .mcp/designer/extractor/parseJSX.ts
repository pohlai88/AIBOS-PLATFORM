import * as t from "@babel/types";
import { parseTailwind } from "./parseTailwind.js";
import { parseInlineStyles } from "./parseInlineStyles.js";
import type { DesignNode, DesignNodeType } from "../types/DesignNode.js";

type IdGenerator = () => string;

/**
 * Convert a JSXElement AST node to a DesignNode.
 */
export function parseJSX(
  node: t.JSXElement,
  generateId: IdGenerator,
  parentId?: string
): DesignNode | null {
  const opening = node.openingElement;

  // Get tag name
  let tag = "unknown";
  if (t.isJSXIdentifier(opening.name)) {
    tag = opening.name.name;
  } else if (t.isJSXMemberExpression(opening.name)) {
    // Handle Component.SubComponent
    tag = getJSXMemberExpressionName(opening.name);
  }

  const nodeId = generateId();

  const designNode: DesignNode = {
    id: nodeId,
    name: tag,
    type: detectNodeType(tag),
    parentId,
    children: [],
  };

  // Process attributes/props
  for (const attr of opening.attributes) {
    if (!t.isJSXAttribute(attr)) continue;
    if (!t.isJSXIdentifier(attr.name)) continue;

    const propName = attr.name.name;

    // -------------------------------
    // className (Tailwind classes)
    // -------------------------------
    if (propName === "className") {
      const classValue = getAttributeStringValue(attr);
      if (classValue) {
        const twResult = parseTailwind(classValue);
        Object.assign(designNode, twResult);
      }
    }

    // -------------------------------
    // style (inline styles)
    // -------------------------------
    if (propName === "style" && t.isJSXExpressionContainer(attr.value)) {
      const styleObj = parseInlineStyles(attr.value.expression);
      Object.assign(designNode, styleObj);
    }

    // -------------------------------
    // data-surface-role
    // -------------------------------
    if (propName === "data-surface-role") {
      const value = getAttributeStringValue(attr);
      if (value) {
        designNode.surfaceRole = value;
      }
    }

    // -------------------------------
    // width / height props
    // -------------------------------
    if (propName === "width") {
      const value = getAttributeNumericValue(attr);
      if (value !== null) {
        designNode.width = value;
      }
    }

    if (propName === "height") {
      const value = getAttributeNumericValue(attr);
      if (value !== null) {
        designNode.height = value;
      }
    }
  }

  // -------------------------------
  // Process children recursively
  // -------------------------------
  if (node.children && node.children.length > 0) {
    designNode.children = node.children
      .map((child) => {
        if (t.isJSXElement(child)) {
          return parseJSX(child, generateId, nodeId);
        }
        // Handle JSX text nodes
        if (t.isJSXText(child)) {
          const text = child.value.trim();
          if (text) {
            return {
              id: generateId(),
              name: "#text",
              type: "text" as DesignNodeType,
              parentId: nodeId,
            };
          }
        }
        return null;
      })
      .filter((child): child is DesignNode => child !== null);
  }

  return designNode;
}

/**
 * Detect DesignNode type from HTML/React tag name.
 */
function detectNodeType(tag: string): DesignNodeType {
  // Text elements
  if (["p", "span", "label", "h1", "h2", "h3", "h4", "h5", "h6", "Text", "Heading"].includes(tag)) {
    return "text";
  }

  // Icon elements
  if (tag === "img" || tag === "svg" || tag.endsWith("Icon") || tag === "Icon") {
    return "icon";
  }

  // Button elements
  if (tag === "button" || tag === "Button" || tag.endsWith("Button")) {
    return "button";
  }

  // Container/frame elements
  if (["div", "section", "header", "footer", "main", "article", "aside", "nav"].includes(tag)) {
    return "frame";
  }

  // Card-like containers
  if (tag === "Card" || tag.endsWith("Card") || tag === "Surface") {
    return "container";
  }

  // Default to component
  return "component";
}

/**
 * Get string value from JSX attribute.
 */
function getAttributeStringValue(attr: t.JSXAttribute): string | null {
  if (t.isStringLiteral(attr.value)) {
    return attr.value.value;
  }

  if (t.isJSXExpressionContainer(attr.value)) {
    const expr = attr.value.expression;
    if (t.isStringLiteral(expr)) {
      return expr.value;
    }
    if (t.isTemplateLiteral(expr) && expr.quasis.length === 1) {
      return expr.quasis[0].value.raw;
    }
  }

  return null;
}

/**
 * Get numeric value from JSX attribute.
 */
function getAttributeNumericValue(attr: t.JSXAttribute): number | null {
  if (t.isJSXExpressionContainer(attr.value)) {
    const expr = attr.value.expression;
    if (t.isNumericLiteral(expr)) {
      return expr.value;
    }
  }

  if (t.isStringLiteral(attr.value)) {
    const num = parseFloat(attr.value.value);
    if (!isNaN(num)) return num;
  }

  return null;
}

/**
 * Get full name from JSX member expression (e.g., Card.Header → "Card.Header")
 */
function getJSXMemberExpressionName(node: t.JSXMemberExpression): string {
  const parts: string[] = [];

  let current: t.JSXMemberExpression | t.JSXIdentifier = node;

  while (t.isJSXMemberExpression(current)) {
    if (t.isJSXIdentifier(current.property)) {
      parts.unshift(current.property.name);
    }
    current = current.object as t.JSXMemberExpression | t.JSXIdentifier;
  }

  if (t.isJSXIdentifier(current)) {
    parts.unshift(current.name);
  }

  return parts.join(".");
}


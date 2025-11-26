/**
 * JSX Rewrite Engine
 * Applies fixes to JSX source code using Babel AST transformations.
 */

import { smartReplaceInClassName, mergeInlineStyles } from "./smartReplace.js";
import type { FixSuggestion } from "./fixRules.js";

export interface FixEntry {
  nodeId: string;
  fix: FixSuggestion;
}

/**
 * Rewrite JSX source code with fixes applied.
 */
export function rewriteJSX(source: string, fixes: FixEntry[]): string {
  // Dynamic imports for Babel (may not be available in all environments)
  let parser: any;
  let traverse: any;
  let generate: any;
  let t: any;

  try {
    parser = require("@babel/parser");
    traverse = require("@babel/traverse").default;
    generate = require("@babel/generator").default;
    t = require("@babel/types");
  } catch {
    console.warn(
      "[AutoFix] Babel packages not available. Install @babel/parser, @babel/traverse, @babel/generator"
    );
    return source;
  }

  if (fixes.length === 0) {
    return source;
  }

  const ast = parser.parse(source, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  let nodeIndex = 0;

  traverse(ast, {
    JSXElement(path: any) {
      const node = path.node;
      const nodeId = String(node.loc?.start.line || nodeIndex);
      nodeIndex++;

      // Find fix for this node
      const fixEntry = fixes.find((f) => f.nodeId === nodeId);
      if (!fixEntry) return;

      const { fix } = fixEntry;
      const opening = node.openingElement;

      // Process attributes
      opening.attributes.forEach((attr: any) => {
        if (attr.type !== "JSXAttribute") return;

        const attrName =
          typeof attr.name.name === "string" ? attr.name.name : attr.name.name?.name;

        // ========================
        // Fix className (Tailwind)
        // ========================
        if (attrName === "className" && fix.fixType === "tailwind") {
          if (t.isStringLiteral(attr.value)) {
            const newClassName = smartReplaceInClassName(attr.value.value, {
              class: fix.replacement?.class,
              removeClass: fix.replacement?.removeClass,
            });
            attr.value.value = newClassName;
          }
        }

        // ========================
        // Fix inline styles
        // ========================
        if (attrName === "style" && fix.fixType === "style" && fix.replacement?.style) {
          if (t.isJSXExpressionContainer(attr.value)) {
            const expr = attr.value.expression;

            if (t.isObjectExpression(expr)) {
              // Merge new styles into existing object
              const newStyleProps = Object.entries(fix.replacement.style).map(
                ([key, value]) =>
                  t.objectProperty(
                    t.identifier(key),
                    typeof value === "number"
                      ? t.numericLiteral(value)
                      : t.stringLiteral(String(value))
                  )
              );

              // Remove existing properties that we're replacing
              const existingProps = expr.properties.filter((prop: any) => {
                if (!t.isObjectProperty(prop)) return true;
                const key = t.isIdentifier(prop.key) ? prop.key.name : null;
                return !fix.replacement!.style![key as string];
              });

              expr.properties = [...existingProps, ...newStyleProps];
            }
          }
        }
      });

      // ========================
      // Add missing className if needed
      // ========================
      if (fix.fixType === "tailwind" && fix.replacement?.class) {
        const hasClassName = opening.attributes.some(
          (attr: any) =>
            attr.type === "JSXAttribute" &&
            (attr.name.name === "className" || attr.name.name?.name === "className")
        );

        if (!hasClassName) {
          opening.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier("className"),
              t.stringLiteral(fix.replacement.class)
            )
          );
        }
      }

      // ========================
      // Add missing style if needed
      // ========================
      if (fix.fixType === "style" && fix.replacement?.style) {
        const hasStyle = opening.attributes.some(
          (attr: any) =>
            attr.type === "JSXAttribute" &&
            (attr.name.name === "style" || attr.name.name?.name === "style")
        );

        if (!hasStyle) {
          const styleProps = Object.entries(fix.replacement.style).map(([key, value]) =>
            t.objectProperty(
              t.identifier(key),
              typeof value === "number"
                ? t.numericLiteral(value)
                : t.stringLiteral(String(value))
            )
          );

          opening.attributes.push(
            t.jsxAttribute(
              t.jsxIdentifier("style"),
              t.jsxExpressionContainer(t.objectExpression(styleProps))
            )
          );
        }
      }
    },
  });

  const output = generate(ast, {
    retainLines: true,
    compact: false,
  });

  return output.code;
}

/**
 * Rewrite a single className string with fixes (no AST needed).
 * Useful for quick fixes without full source rewrite.
 */
export function rewriteClassName(
  className: string,
  fix: FixSuggestion
): string {
  if (fix.fixType !== "tailwind") {
    return className;
  }

  return smartReplaceInClassName(className, {
    class: fix.replacement?.class,
    removeClass: fix.replacement?.removeClass,
  });
}

/**
 * Rewrite inline style object with fixes.
 */
export function rewriteStyle(
  style: Record<string, any> | undefined,
  fix: FixSuggestion
): Record<string, any> {
  if (fix.fixType !== "style" || !fix.replacement?.style) {
    return style || {};
  }

  return mergeInlineStyles(style, fix.replacement.style);
}


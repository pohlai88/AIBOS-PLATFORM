import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";
import type { DesignNode } from "../types/DesignNode.js";
import { parseJSX } from "./parseJSX.js";

// Handle ESM/CJS interop
const traverse = (_traverse as any).default || _traverse;

/**
 * Parse a React component source and extract DesignNode tree.
 */
export function parseComponent(source: string, filename = "component.tsx"): DesignNode[] {
  const nodes: DesignNode[] = [];
  let nodeIdCounter = 0;

  try {
    const ast = parse(source, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
      errorRecovery: true,
    });

    traverse(ast, {
      JSXElement(path: any) {
        // Only process top-level JSX elements (not nested ones)
        // Nested elements are handled recursively by parseJSX
        const parent = path.parent;
        if (
          parent.type !== "JSXElement" &&
          parent.type !== "JSXFragment"
        ) {
          const node = parseJSX(path.node, () => {
            nodeIdCounter++;
            return `node-${nodeIdCounter}`;
          });
          if (node) {
            nodes.push(node);
          }
        }
      },
    });
  } catch (err) {
    console.error(`[Designer Extractor] Parse error in ${filename}:`, err);
  }

  return nodes;
}


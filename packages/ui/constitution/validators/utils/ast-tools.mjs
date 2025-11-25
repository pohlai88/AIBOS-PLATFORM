/**
 * AST Tools Utility
 * 
 * Provides AST parsing and analysis utilities for component validation.
 * 
 * @module ast-tools
 */

import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

/**
 * Parse a file and return its AST
 * 
 * @param {string} filePath - Path to file
 * @param {string} content - File content (optional, will read if not provided)
 * @returns {Object} Parsed AST
 */
export function parseFile(filePath, content = null) {
  if (!content) {
    const fs = require("fs");
    content = fs.readFileSync(filePath, "utf8");
  }

  try {
    return parse(content, {
      sourceType: "module",
      plugins: ["typescript", "jsx", "decorators-legacy"],
    });
  } catch (error) {
    throw new Error(`Failed to parse ${filePath}: ${error.message}`);
  }
}

/**
 * Check if a component uses forwardRef
 * 
 * @param {Object} ast - Parsed AST
 * @returns {boolean} True if forwardRef is used
 */
export function hasForwardRef(ast) {
  let found = false;

  traverse.default(ast, {
    CallExpression(path) {
      if (
        path.node.callee.type === "Identifier" &&
        path.node.callee.name === "forwardRef"
      ) {
        found = true;
        path.stop();
      }
    },
  });

  return found;
}

/**
 * Check if a component has displayName
 * 
 * @param {Object} ast - Parsed AST
 * @returns {boolean} True if displayName is set
 */
export function hasDisplayName(ast) {
  let found = false;

  traverse.default(ast, {
    MemberExpression(path) {
      if (
        path.node.object.type === "Identifier" &&
        path.node.property.type === "Identifier" &&
        path.node.property.name === "displayName"
      ) {
        found = true;
        path.stop();
      }
    },
  });

  return found;
}

/**
 * Check if file has 'use client' directive
 * 
 * @param {Object} ast - Parsed AST
 * @param {string} content - Original file content
 * @returns {boolean} True if 'use client' is present
 */
export function hasUseClientDirective(content) {
  return content.trim().startsWith("'use client'") ||
         content.trim().startsWith('"use client"') ||
         content.trim().startsWith("'use client';") ||
         content.trim().startsWith('"use client";');
}

/**
 * Extract component name from AST
 * 
 * @param {Object} ast - Parsed AST
 * @returns {string|null} Component name or null
 */
export function getComponentName(ast) {
  let componentName = null;

  traverse.default(ast, {
    VariableDeclarator(path) {
      if (
        path.node.id.type === "Identifier" &&
        path.node.init &&
        path.node.init.type === "CallExpression" &&
        path.node.init.callee.name === "forwardRef"
      ) {
        componentName = path.node.id.name;
        path.stop();
      }
    },
    FunctionDeclaration(path) {
      if (path.node.id && /^[A-Z]/.test(path.node.id.name)) {
        componentName = path.node.id.name;
        path.stop();
      }
    },
  });

  return componentName;
}

/**
 * Check if component uses forbidden browser APIs
 * 
 * @param {Object} ast - Parsed AST
 * @param {string[]} forbiddenGlobals - List of forbidden global names
 * @returns {Object[]} Array of violations
 */
export function checkForbiddenGlobals(ast, forbiddenGlobals) {
  const violations = [];

  traverse.default(ast, {
    Identifier(path) {
      if (
        forbiddenGlobals.includes(path.node.name) &&
        !path.scope.hasBinding(path.node.name)
      ) {
        violations.push({
          type: "forbidden_global",
          name: path.node.name,
          line: path.node.loc?.start.line,
        });
      }
    },
  });

  return violations;
}

/**
 * Check if component uses forbidden hooks
 * 
 * @param {Object} ast - Parsed AST
 * @param {string[]} forbiddenHooks - List of forbidden hook names
 * @returns {Object[]} Array of violations
 */
export function checkForbiddenHooks(ast, forbiddenHooks) {
  const violations = [];

  traverse.default(ast, {
    CallExpression(path) {
      if (
        path.node.callee.type === "Identifier" &&
        forbiddenHooks.includes(path.node.callee.name)
      ) {
        violations.push({
          type: "forbidden_hook",
          name: path.node.callee.name,
          line: path.node.loc?.start.line,
        });
      }
    },
  });

  return violations;
}

/**
 * Extract all imports from AST
 * 
 * @param {Object} ast - Parsed AST
 * @returns {Object[]} Array of import declarations
 */
export function extractImports(ast) {
  const imports = [];

  traverse.default(ast, {
    ImportDeclaration(path) {
      imports.push({
        source: path.node.source.value,
        specifiers: path.node.specifiers.map(spec => ({
          type: spec.type,
          imported: spec.imported?.name || spec.local.name,
          local: spec.local.name,
        })),
        line: path.node.loc?.start.line,
      });
    },
  });

  return imports;
}

/**
 * Check if component imports Radix UI
 * 
 * @param {Object} ast - Parsed AST
 * @returns {boolean} True if Radix UI is imported
 */
export function importsRadixUI(ast) {
  const imports = extractImports(ast);
  return imports.some(imp => imp.source.startsWith("@radix-ui/"));
}

/**
 * Check if component is async (server component indicator)
 * 
 * @param {Object} ast - Parsed AST
 * @returns {boolean} True if component is async
 */
export function isAsyncComponent(ast) {
  let isAsync = false;

  traverse.default(ast, {
    FunctionDeclaration(path) {
      if (path.node.async) {
        isAsync = true;
        path.stop();
      }
    },
    ArrowFunctionExpression(path) {
      if (path.node.async) {
        isAsync = true;
        path.stop();
      }
    },
  });

  return isAsync;
}


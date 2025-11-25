/**
 * Import Tracer Utility
 * 
 * Traces import chains to detect transitive violations of RSC boundaries.
 * Prevents browser APIs, client hooks, and Radix UI from being imported
 * transitively into server components.
 * 
 * @module import-tracer
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "@babel/parser";
import traverse from "@babel/traverse";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Trace an import to its source and check for violations
 * 
 * @param {string} importPath - Import path to trace
 * @param {string} fromFile - File that imports this path
 * @param {Object} options - Tracing options
 * @param {string[]} options.forbiddenPatterns - Patterns to detect (e.g., ["window", "useState"])
 * @param {number} options.maxDepth - Maximum recursion depth
 * @param {Set} options.visited - Set of already visited files (prevents cycles)
 * @returns {Object} Violation report
 */
export function traceImport(importPath, fromFile, options = {}) {
  const {
    forbiddenPatterns = [],
    maxDepth = 10,
    visited = new Set(),
  } = options;

  if (visited.has(importPath) || visited.size >= maxDepth) {
    return { violations: [], resolved: false };
  }

  visited.add(importPath);

  const violations = [];
  const resolvedPath = resolveImportPath(importPath, fromFile);

  if (!resolvedPath || !fs.existsSync(resolvedPath)) {
    return { violations, resolved: false };
  }

  try {
    const fileContent = fs.readFileSync(resolvedPath, "utf8");
    const ast = parse(fileContent, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    // Check for forbidden patterns in the file
    traverse.default(ast, {
      Identifier(path) {
        const name = path.node.name;
        if (forbiddenPatterns.includes(name)) {
          violations.push({
            type: "forbidden_identifier",
            identifier: name,
            file: resolvedPath,
            line: path.node.loc?.start.line,
          });
        }
      },
      ImportDeclaration(path) {
        // Recursively trace nested imports
        const nestedImport = path.node.source.value;
        if (!nestedImport.startsWith(".") && !nestedImport.startsWith("/")) {
          // External package - check if it's in forbidden list
          if (forbiddenPatterns.some(pattern => nestedImport.includes(pattern))) {
            violations.push({
              type: "forbidden_import",
              import: nestedImport,
              file: resolvedPath,
              line: path.node.loc?.start.line,
            });
          }
        } else {
          // Local import - trace recursively
          const nestedResult = traceImport(nestedImport, resolvedPath, {
            ...options,
            visited: new Set(visited),
          });
          violations.push(...nestedResult.violations);
        }
      },
    });
  } catch (error) {
    // File might not be parseable (e.g., CSS, JSON)
    return { violations, resolved: true };
  }

  return { violations, resolved: true };
}

/**
 * Resolve import path to actual file path
 * 
 * @param {string} importPath - Import path
 * @param {string} fromFile - File that imports this
 * @returns {string|null} Resolved file path or null
 */
function resolveImportPath(importPath, fromFile) {
  // Handle relative imports
  if (importPath.startsWith(".") || importPath.startsWith("/")) {
    const fromDir = path.dirname(fromFile);
    const resolved = path.resolve(fromDir, importPath);
    
    // Try common extensions
    const extensions = [".js", ".jsx", ".ts", ".tsx", ".mjs"];
    for (const ext of extensions) {
      const withExt = resolved + ext;
      if (fs.existsSync(withExt)) {
        return withExt;
      }
    }
    
    // Try index files
    for (const ext of extensions) {
      const indexFile = path.join(resolved, `index${ext}`);
      if (fs.existsSync(indexFile)) {
        return indexFile;
      }
    }
    
    return fs.existsSync(resolved) ? resolved : null;
  }

  // Handle package imports (node_modules)
  // This is a simplified version - in production, use proper module resolution
  const nodeModulesPath = path.resolve(process.cwd(), "node_modules", importPath);
  if (fs.existsSync(nodeModulesPath)) {
    return nodeModulesPath;
  }

  return null;
}

/**
 * Check if an import chain contains any forbidden patterns
 * 
 * @param {string} filePath - File to check
 * @param {Object} constitution - RSC constitution rules
 * @returns {Object} Violation report
 */
export function checkImportChain(filePath, constitution) {
  const rules = constitution.constitution || constitution;
  const forbidden = {
    browserGlobals: rules.server?.forbidden?.browser_globals || [],
    hooks: rules.server?.forbidden?.hooks || [],
    imports: rules.server?.forbidden?.imports || [],
  };

  const allForbidden = [
    ...forbidden.browserGlobals,
    ...forbidden.hooks,
    ...forbidden.imports.map(imp => imp.replace("@radix-ui/react-", "")),
  ];

  const violations = [];
  
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const ast = parse(fileContent, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    traverse.default(ast, {
      ImportDeclaration(path) {
        const importPath = path.node.source.value;
        const result = traceImport(importPath, filePath, {
          forbiddenPatterns: allForbidden,
          maxDepth: 10,
        });
        violations.push(...result.violations);
      },
    });
  } catch (error) {
    return {
      violations: [{
        type: "parse_error",
        file: filePath,
        error: error.message,
      }],
      valid: false,
    };
  }

  return {
    violations,
    valid: violations.length === 0,
  };
}


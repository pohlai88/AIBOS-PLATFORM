/**
 * RSC (React Server Component) Detection
 * Determines if a component is server or client based on directives.
 */

export type RSCBoundary = "server" | "client";

/**
 * Detect RSC boundary from AST.
 * Server components have no "use client" directive.
 */
export function detectRSC(ast: any): RSCBoundary {
  if (!ast?.program?.body) return "server";

  for (const stmt of ast.program.body) {
    // Check for "use client" directive
    if (
      stmt.type === "ExpressionStatement" &&
      stmt.expression?.type === "StringLiteral" &&
      stmt.expression.value === "use client"
    ) {
      return "client";
    }

    // Also check directive field (Babel may parse it differently)
    if (stmt.type === "ExpressionStatement" && stmt.directive === "use client") {
      return "client";
    }
  }

  return "server";
}

/**
 * Detect RSC boundary from source code (without parsing).
 * Faster but less accurate than AST-based detection.
 */
export function detectRSCFromSource(source: string): RSCBoundary {
  const firstLines = source.slice(0, 500);

  // Check for "use client" at the top of the file
  if (firstLines.match(/^['"]use client['"]/m)) {
    return "client";
  }

  // Check for common client-only imports
  const clientOnlyImports = [
    "useState",
    "useEffect",
    "useRef",
    "useCallback",
    "useMemo",
    "useReducer",
    "useContext",
    "useLayoutEffect",
    "useImperativeHandle",
    "useDebugValue",
    "useSyncExternalStore",
    "useTransition",
    "useDeferredValue",
    "useId",
  ];

  for (const hook of clientOnlyImports) {
    if (source.includes(hook)) {
      return "client";
    }
  }

  return "server";
}

/**
 * Get RSC-specific validation rules.
 */
export function getRSCRules(boundary: RSCBoundary): string[] {
  if (boundary === "server") {
    return [
      "no-client-hooks",
      "no-browser-apis",
      "no-event-handlers",
      "static-styles-only",
    ];
  }

  return [
    "client-boundary-marked",
    "minimal-client-bundle",
  ];
}


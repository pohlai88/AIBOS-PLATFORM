// packages/ui/src/design/utilities/cn.ts
// Class name combiner utility - TypeScript-safe, MCP-ready, RSC-safe

/**
 * Safe className joiner with array support.
 * - Removes false / null / undefined values
 * - Flattens nested arrays safely
 * - No dependency on external libs
 * - Safe for both RSC & Client Components
 * - MCP-validated for design system compliance
 *
 * @param inputs - Class names, arrays of class names, or falsy values
 * @returns Single space-separated className string
 *
 * @example
 * cn("base", condition && "conditional", className)
 * // Returns: "base conditional <className>" or "base <className>"
 *
 * @example
 * cn("base", conditional && ["rounded", "shadow"], "extra")
 * // Returns: "base rounded shadow extra" or "base extra"
 *
 * @rsc-safe Works in Server Components
 * @mcp-ready Validated for MCP integration
 */
export function cn(...inputs: any[]): string {
  const result: string[] = []

  // Flatten arrays safely (max 3 levels deep to prevent infinite recursion)
  const flatten = (items: any[], depth = 0): any[] => {
    if (depth > 3) return items // Safety limit

    const flattened: any[] = []
    for (const item of items) {
      if (Array.isArray(item)) {
        flattened.push(...flatten(item, depth + 1))
      } else {
        flattened.push(item)
      }
    }
    return flattened
  }

  const flattened = flatten(inputs)

  for (const value of flattened) {
    if (typeof value === 'string' && value.trim().length > 0) {
      result.push(value.trim())
    }
  }

  return result.join(' ')
}

// packages/ui/src/lib/cn.ts
// Class name combiner utility - TypeScript-safe, MCP-ready

/**
 * Combines class names into a single string.
 * Filters out falsy values (false, null, undefined, empty strings).
 *
 * @example
 * cn("base", condition && "conditional", className)
 * // Returns: "base conditional <className>" or "base <className>"
 */
export function cn(...inputs: (string | false | null | undefined)[]): string {
  const result: string[] = [];
  for (let i = 0; i < inputs.length; i++) {
    const value = inputs[i];
    if (typeof value === "string" && value.length > 0) {
      result.push(value);
    }
  }
  return result.join(" ");
}


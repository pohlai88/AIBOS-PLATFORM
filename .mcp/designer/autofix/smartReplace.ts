/**
 * Smart Replacement Utilities
 * Handles intelligent merging of Tailwind classes, styles, and tokens.
 */

export interface ClassReplacement {
  class?: string;
  removeClass?: string[];
}

export interface StyleReplacement {
  style?: Record<string, string | number>;
}

/**
 * Smart replace in className string.
 * Removes conflicting classes and adds new ones.
 */
export function smartReplaceInClassName(
  className: string,
  replacement: ClassReplacement
): string {
  let parts = className.split(/\s+/).filter(Boolean);

  // Remove explicitly listed classes
  if (replacement.removeClass) {
    parts = parts.filter((p) => !replacement.removeClass!.includes(p));
  }

  // Remove conflicting classes based on prefix
  if (replacement.class) {
    const newClasses = replacement.class.split(/\s+/);

    for (const newClass of newClasses) {
      const prefix = getClassPrefix(newClass);
      if (prefix) {
        parts = parts.filter((p) => !p.startsWith(prefix));
      }
    }

    // Add new classes
    parts.push(...newClasses);
  }

  // Deduplicate and return
  return [...new Set(parts)].join(" ");
}

/**
 * Get the prefix of a Tailwind class for conflict detection.
 */
function getClassPrefix(className: string): string | null {
  // Font size: text-xs, text-sm, text-base, etc.
  if (className.match(/^text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)$/)) {
    return "text-";
  }

  // Font weight
  if (className.match(/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/)) {
    return "font-";
  }

  // Line height
  if (className.startsWith("leading-")) {
    return "leading-";
  }

  // Padding (all sides)
  if (className.match(/^p-\d+$/)) {
    return "p-";
  }

  // Padding X/Y
  if (className.match(/^px-\d+$/)) return "px-";
  if (className.match(/^py-\d+$/)) return "py-";

  // Gap
  if (className.match(/^gap-\d+$/)) {
    return "gap-";
  }

  // Border radius
  if (className.match(/^rounded(-|$)/)) {
    return "rounded";
  }

  // Max/min width
  if (className.startsWith("max-w-")) return "max-w-";
  if (className.startsWith("min-w-")) return "min-w-";

  // Overflow
  if (className.startsWith("overflow-")) return "overflow-";

  return null;
}

/**
 * Merge inline styles, with new values overriding old.
 */
export function mergeInlineStyles(
  existingStyle: Record<string, any> | undefined,
  newStyle: Record<string, string | number>
): Record<string, any> {
  return {
    ...existingStyle,
    ...newStyle,
  };
}

/**
 * Convert a style object to a CSS string.
 */
export function styleObjectToString(style: Record<string, any>): string {
  return Object.entries(style)
    .map(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase();
      return `${cssKey}: ${value}`;
    })
    .join("; ");
}

/**
 * Parse a CSS string into a style object.
 */
export function parseStyleString(styleStr: string): Record<string, string> {
  const result: Record<string, string> = {};

  styleStr.split(";").forEach((part) => {
    const [key, value] = part.split(":").map((s) => s.trim());
    if (key && value) {
      // Convert kebab-case to camelCase
      const camelKey = key.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      result[camelKey] = value;
    }
  });

  return result;
}

/**
 * Check if a Tailwind class is a utility class that can be auto-fixed.
 */
export function isFixableClass(className: string): boolean {
  const fixablePrefixes = [
    "text-",
    "font-",
    "leading-",
    "p-",
    "px-",
    "py-",
    "pt-",
    "pr-",
    "pb-",
    "pl-",
    "m-",
    "mx-",
    "my-",
    "gap-",
    "rounded",
    "max-w-",
    "min-w-",
    "w-",
    "h-",
    "overflow-",
  ];

  return fixablePrefixes.some(
    (prefix) => className.startsWith(prefix) || className === prefix.slice(0, -1)
  );
}


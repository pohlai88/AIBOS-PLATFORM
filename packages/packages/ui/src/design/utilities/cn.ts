// ======================================================================
// AI-BOS cn.ts v3.3 — Deterministic Classname Engine
// RSC-safe • Tailwind v4 • Variants-ready • Enterprise stable
//
// - Lightweight replacement for clsx + tailwind-merge
// - Deterministic merging of classnames
// - Safe for Server Components
// - Zero client dependencies
// - Designed for AI-BOS Design Tokens v3.3
// ======================================================================

// Basic utility to check truthiness
function isTruthy(value: unknown): boolean {
  if (!value) return false;
  if (typeof value === "number" && value === 0) return false;
  return true;
}

// ----------------------------------------------------------------------
// 1. Basic CN: Converts inputs → class string
// ----------------------------------------------------------------------
export function cn(...inputs: Array<unknown>): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!isTruthy(input)) continue;

    if (typeof input === "string") {
      classes.push(input);
      continue;
    }

    // Arrays
    if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(nested);
      continue;
    }

    // Objects (conditional class maps)
    if (typeof input === "object" && input !== null) {
      for (const [key, value] of Object.entries(input)) {
        if (isTruthy(value)) classes.push(key);
      }
      continue;
    }
  }

  return classes.join(" ");
}

// ----------------------------------------------------------------------
// 2. VARIANT ENGINE (For shadcn-like API)
// ----------------------------------------------------------------------
//
// Usage:
//
// const button = cva("base", {
//   variants: {
//     size: { sm: "px-2", md: "px-4" },
//     tone: { primary: "bg-blue", danger: "bg-red" },
//   },
//   defaultVariants: {
//     size: "md",
//     tone: "primary",
//   }
// })
//
// button({ size: "sm", tone: "danger" })
// ----------------------------------------------------------------------
export function cva(
  base: string,
  config?: {
    variants?: Record<string, Record<string, string>>;
    defaultVariants?: Record<string, string>;
    compoundVariants?: Array<{
      variants: Record<string, string>;
      class: string;
    }>;
  }
) {
  return (props: Record<string, string | undefined> = {}) => {
    const { variants = {}, defaultVariants = {}, compoundVariants = [] } =
      config || {};

    const merged = { ...defaultVariants, ...props };
    const classes = [base];

    // Resolve each variant
    for (const variantKey in variants) {
      const variantValue = merged[variantKey];
      const variantMap = variants[variantKey];

      if (variantValue && variantMap?.[variantValue]) {
        classes.push(variantMap[variantValue]);
      }
    }

    // Compound variants
    for (const cv of compoundVariants) {
      const match = Object.entries(cv.variants).every(
        ([key, value]) => merged[key] === value
      );
      if (match) classes.push(cv.class);
    }

    return cn(...classes);
  };
}

// ----------------------------------------------------------------------
// 3. SLOT SUPPORT (For components with multiple parts)
//
// Example:
// const card = cns({
//   root: "rounded border",
//   header: "mb-3 font-bold",
//   body: "text-sm",
//   footer: "mt-4",
// })
//
// <div className={card.root()}>…</div>
// ----------------------------------------------------------------------
export function cns(
  slots: Record<string, string | ReturnType<typeof cva>>
): Record<string, (...args: any[]) => string> {
  const result: Record<string, (...args: any[]) => string> = {};

  for (const key in slots) {
    const slot = slots[key];

    // If simple string
    if (typeof slot === "string") {
      result[key] = () => slot;
      continue;
    }

    // If variant factory
    result[key] = slot;
  }

  return result;
}

// ----------------------------------------------------------------------
// 4. TYPES
// ----------------------------------------------------------------------
export type CnFunction = typeof cn;
export type CvaFunction = ReturnType<typeof cva>;
export type CnsSlots<T extends Record<string, any>> = {
  [K in keyof T]: () => string;
};

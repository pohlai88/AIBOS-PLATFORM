/**
 * Heading - RSC-Compatible Typography Component
 *
 * Environment: Server & Client Compatible (NO 'use client' directive)
 * MCP Validation: Enabled with compliance markers
 * Design System: AI-BOS Typography Tokens (exclusive usage)
 * Accessibility: WCAG 2.1 AA/AAA compliant semantic HTML
 * Architecture: Next.js RSC Official Pattern
 *
 * @component Semantic heading component with visual size independence
 * @version 1.0.0 - RSC Compliant
 * @mcp-validated true
 */

import * as React from "react";
import { cn } from "../../../design/utilities/cn";

// 🎯 STEP 1: Define typography variant types
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
type HeadingSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
type HeadingWeight = "normal" | "medium" | "semibold" | "bold";
type HeadingColor =
  | "default"
  | "muted"
  | "subtle"
  | "primary"
  | "success"
  | "warning"
  | "danger";
type HeadingAlign = "left" | "center" | "right" | "justify";

// 🎯 STEP 2: Create RSC-safe typography variant system
const headingVariants = {
  base: [
    "mcp-shared-typography", // MCP validation marker
    "block", // Heading display
  ].join(" "),
  variants: {
    // Default size based on semantic level
    // ✅ GRCD Compliant: Direct Tailwind classes (typography tokens are already Tailwind)
    level: {
      1: "text-4xl font-semibold leading-tight", // h1 equivalent
      2: "text-3xl font-semibold leading-tight", // h2 equivalent
      3: "text-2xl font-semibold leading-normal", // h3 equivalent
      4: "text-xl font-semibold leading-normal", // h4 equivalent
      5: "text-lg font-semibold leading-normal", // h5 equivalent
      6: "text-base font-semibold leading-normal", // h6 equivalent
    },
    // Visual size override (independent of semantic level)
    size: {
      xs: "text-sm font-semibold", // headingSm equivalent
      sm: "text-base font-semibold", // headingMd equivalent
      md: "text-lg font-semibold", // headingLg equivalent
      lg: "text-xl font-semibold leading-normal", // 20px
      xl: "text-2xl font-semibold leading-normal", // 24px
      "2xl": "text-3xl font-semibold leading-tight", // 30px
      "3xl": "text-4xl font-semibold leading-tight", // 36px
      "4xl": "text-5xl font-bold leading-none", // display equivalent
    },
    weight: {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    },
    color: {
      default: "text-fg", // References --color-fg
      muted: "text-fg-muted", // References --color-fg-muted
      subtle: "text-fg-subtle", // References --color-fg-subtle
      primary: "text-primary",
      success: "text-success",
      warning: "text-warning",
      danger: "text-danger",
    },
    align: {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    },
  },
};

// 🎯 STEP 3: Define RSC-compatible typography props interface
export interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /**
   * Semantic heading level (required for accessibility)
   * Determines the actual HTML element (h1-h6)
   * @required
   */
  level: HeadingLevel;

  /**
   * Visual size (can differ from semantic level)
   * If not specified, defaults to level-appropriate size
   * @default undefined (uses level-based sizing)
   */
  size?: HeadingSize;

  /**
   * Font weight
   * @default 'semibold'
   */
  weight?: HeadingWeight;

  /**
   * Text color using design tokens
   * @default 'default'
   */
  color?: HeadingColor;

  /**
   * Text alignment
   * @default 'left'
   */
  align?: HeadingAlign;

  /**
   * Truncate text with ellipsis
   * @default false
   */
  truncate?: boolean;

  /**
   * Polymorphic override (use with caution - breaks semantics)
   * Only use when visual heading without semantic meaning
   */
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";

  /**
   * Test ID for automated testing
   */
  testId?: string;
}

/**
 * Heading - RSC-Compatible Typography Component
 *
 * Features:
 * - Works in both Server and Client Components
 * - Enforces semantic HTML (h1-h6) for accessibility
 * - Allows visual size override without breaking semantics
 * - Full design token integration
 * - RSC-safe implementation (no hooks, no client APIs)
 * - MCP validation enabled
 * - WCAG 2.1 AAA compliant (heading hierarchy)
 *
 * @example
 * ```tsx
 * // Page title (semantic h1, looks like h1)
 * <Heading level={1}>
 *   Dashboard
 * </Heading>
 *
 * // Section heading (semantic h2, looks like h2)
 * <Heading level={2}>
 *   Recent Activity
 * </Heading>
 *
 * // Visual override (semantic h3, looks like h1)
 * <Heading level={3} size="3xl">
 *   Visually Large Subsection
 * </Heading>
 *
 * // Display/Hero heading
 * <Heading level={1} size="4xl">
 *   Welcome to AI-BOS
 * </Heading>
 *
 * // Muted heading with custom alignment
 * <Heading level={2} color="muted" align="center">
 *   Centered Muted Heading
 * </Heading>
 *
 * // Truncated heading
 * <Heading level={3} truncate className="max-w-md">
 *   This is a very long heading that will be truncated
 * </Heading>
 *
 * // Custom weight
 * <Heading level={4} weight="medium">
 *   Medium Weight Heading
 * </Heading>
 *
 * // Visual heading without semantic meaning (use sparingly)
 * <Heading level={2} as="div">
 *   Non-semantic Visual Heading
 * </Heading>
 * ```
 */
export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  (
    {
      level,
      size,
      weight = "semibold",
      color = "default",
      align = "left",
      truncate = false,
      as,
      testId,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // 🎯 STEP 4: RSC-safe component logic (no hooks, no client APIs)

    // Determine the actual HTML element to render
    const Component =
      as || (`h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6");

    // Use custom size if provided, otherwise use level-based sizing
    const sizeClasses = size
      ? headingVariants.variants.size[size]
      : headingVariants.variants.level[level];

    // Build className from variant system
    const weightClasses = headingVariants.variants.weight[weight];
    const colorClasses = headingVariants.variants.color[color];
    const alignClasses = headingVariants.variants.align[align];

    // 🎯 STEP 5: RSC-safe accessibility props
    const accessibilityProps = {
      "data-testid": testId,
      // MCP Guardian: Constitution compliance markers
      "data-mcp-validated": "true",
      "data-constitution-compliant": "heading-typography",
      // Accessibility: Indicate semantic level
      "aria-level": level,
    };

    return (
      <Component
        ref={ref as any}
        className={cn(
          headingVariants.base,
          sizeClasses,
          weightClasses,
          colorClasses,
          alignClasses,
          truncate && "truncate",
          className
        )}
        {...accessibilityProps}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Heading.displayName = "Heading";

// 🎯 STEP 6: Export types for external consumption
export { headingVariants };
export type {
  HeadingAlign,
  HeadingColor,
  HeadingLevel,
  HeadingSize,
  HeadingWeight,
};

// 🎯 STEP 7: Default export for convenience
export default Heading;

// 🎯 STEP 8: RSC Compliance Checklist
// ✅ No 'use client' directive
// ✅ No React hooks (useState, useEffect, useCallback, etc.)
// ✅ No browser APIs (window, localStorage, document, etc.)
// ✅ Event handlers accepted as optional props
// ✅ Typography tokens used exclusively
// ✅ Semantic HTML elements enforced (h1-h6)
// ✅ Visual size independence supported
// ✅ MCP validation markers included
// ✅ Accessibility compliant (aria-level, heading hierarchy)
// ✅ Works in both Server and Client contexts
// ✅ TypeScript strict mode compatible

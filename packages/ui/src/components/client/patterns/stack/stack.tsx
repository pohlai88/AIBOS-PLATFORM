/**
 * Stack Component - Layer 3 Complex Pattern
 *
 * Flexible layout component for vertical or horizontal spacing.
 * Provides consistent spacing between child elements.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { Stack } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <Stack spacing="lg">
 *       <Card>Item 1</Card>
 *       <Card>Item 2</Card>
 *     </Stack>
 *   );
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type { StackProps, StackDirection, StackSpacing } from "./stack.types";

/**
 * Stack - Flexible layout component
 *
 * Features:
 * - Row and column directions
 * - Alignment and justification options
 * - Token-based spacing system
 * - Wrap control
 * - Custom gap support
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  (
    {
      direction = "column",
      align = "stretch",
      justify = "start",
      spacing = "md",
      wrap = "nowrap",
      gap,
      className,
      testId,
      ...props
    },
    ref
  ) => {
    // Direction-based styling
    const directionStyles: Record<StackDirection, string> = {
      row: "flex-row",
      column: "flex-col",
    };

    // Alignment styles (cross-axis)
    const alignStyles: Record<StackProps["align"], string> = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    };

    // Justify styles (main-axis)
    const justifyStyles: Record<StackProps["justify"], string> = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
      evenly: "justify-evenly",
    };

    // Spacing styles (gap)
    const spacingStyles: Record<StackSpacing, string> = {
      none: "gap-0",
      xs: "gap-1", // 4px
      sm: "gap-2", // 8px
      md: "gap-4", // 16px
      lg: "gap-6", // 24px
      xl: "gap-8", // 32px
      "2xl": "gap-12", // 48px
    };

    // Wrap styles
    const wrapStyles: Record<StackProps["wrap"], string> = {
      nowrap: "flex-nowrap",
      wrap: "flex-wrap",
      "wrap-reverse": "flex-wrap-reverse",
    };

    // Calculate gap style
    const gapStyle = React.useMemo(() => {
      if (gap) {
        return {
          gap:
            typeof gap === "number" ? `${gap}px` : gap,
        };
      }
      return undefined;
    }, [gap]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex",
          directionStyles[direction],
          alignStyles[align],
          justifyStyles[justify],
          gap ? "" : spacingStyles[spacing],
          wrapStyles[wrap],
          "mcp-layer3-pattern",
          className
        )}
        style={gapStyle}
        data-testid={testId}
        {...props}
      />
    );
  }
);

Stack.displayName = "Stack";


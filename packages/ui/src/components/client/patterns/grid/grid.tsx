/**
 * Grid Component - Layer 3 Complex Pattern
 *
 * Responsive grid layout component for organizing content in columns.
 * Provides flexible column-based layouts with consistent spacing.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { Grid, GridItem } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <Grid columns={12} gap="md">
 *       <GridItem span={6}>Left</GridItem>
 *       <GridItem span={6}>Right</GridItem>
 *     </Grid>
 *   );
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type { GridProps, GridItemProps, GridGap } from "./grid.types";

/**
 * Grid - Responsive grid layout component
 *
 * Features:
 * - Configurable column count (1-12)
 * - Token-based gap system
 * - Item alignment
 * - Custom gap support
 * - GridItem for column spanning
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  (
    {
      columns = 12,
      gap = "md",
      align = "stretch",
      gapValue,
      className,
      testId,
      ...props
    },
    ref
  ) => {
    // Column-based grid template
    const gridColumns = React.useMemo(() => {
      return {
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      };
    }, [columns]);

    // Gap styles
    const gapStyles: Record<GridGap, string> = {
      none: "gap-0",
      xs: "gap-1", // 4px
      sm: "gap-2", // 8px
      md: "gap-4", // 16px
      lg: "gap-6", // 24px
      xl: "gap-8", // 32px
      "2xl": "gap-12", // 48px
    };

    // Alignment styles
    const alignStyles: Record<GridProps["align"], string> = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    };

    // Calculate gap style
    const gapStyle = React.useMemo(() => {
      const styles: React.CSSProperties = { ...gridColumns };
      if (gapValue) {
        styles.gap =
          typeof gapValue === "number" ? `${gapValue}px` : gapValue;
      }
      return styles;
    }, [gapValue, gridColumns]);

    return (
      <div
        ref={ref}
        className={cn(
          "grid",
          gapValue ? "" : gapStyles[gap],
          alignStyles[align],
          "mcp-layer3-pattern",
          className
        )}
        style={gapValue ? gapStyle : { ...gridColumns }}
        data-testid={testId}
        {...props}
      />
    );
  }
);

Grid.displayName = "Grid";

/**
 * GridItem - Grid item component for column spanning
 *
 * Features:
 * - Column span control
 * - Start/end position control
 * - Design token-based styling
 * - MCP validation enabled
 *
 * @mcp-marker client-component-pattern
 */
export const GridItem = React.forwardRef<HTMLDivElement, GridItemProps>(
  ({ span, start, end, className, testId, ...props }, ref) => {
    // Calculate grid column styles
    const gridColumnStyle = React.useMemo(() => {
      const styles: React.CSSProperties = {};
      if (span) {
        styles.gridColumn = `span ${span} / span ${span}`;
      } else if (start !== undefined && end !== undefined) {
        styles.gridColumn = `${start} / ${end}`;
      } else if (start !== undefined) {
        styles.gridColumn = `${start} / auto`;
      } else if (end !== undefined) {
        styles.gridColumn = `auto / ${end}`;
      }
      return styles;
    }, [span, start, end]);

    return (
      <div
        ref={ref}
        className={cn("mcp-layer3-pattern-item", className)}
        style={Object.keys(gridColumnStyle).length > 0 ? gridColumnStyle : undefined}
        data-testid={testId}
        {...props}
      />
    );
  }
);

GridItem.displayName = "GridItem";


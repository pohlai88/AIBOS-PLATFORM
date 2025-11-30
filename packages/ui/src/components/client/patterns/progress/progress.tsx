/**
 * Progress Component - Layer 3 Complex Pattern
 *
 * Progress indicator component built on Radix UI Progress primitive.
 * Displays progress with variant-based styling and optional value labels.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { Progress } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return <Progress value={50} variant="primary" />;
 * }
 * ```
 */

"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

// Import Layer 1 Typography
import { Text } from "../../../shared/typography/text";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type { ProgressProps, ProgressVariant } from "./progress.types";

/**
 * Progress - Progress indicator component
 *
 * Features:
 * - Value-based progress (0-100)
 * - Multiple variants (default, primary, success, warning, error)
 * - Size variants
 * - Optional value label
 * - Custom label formatter
 * - Composes Radix UI Progress primitive
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value = 0,
      max = 100,
      variant = "default",
      size = "md",
      showValue = false,
      formatValue,
      className,
      testId,
      ...props
    },
    ref
  ) => {
    // Clamp value between 0 and max
    const clampedValue = Math.min(Math.max(value, 0), max);
    const percentage = (clampedValue / max) * 100;

    // Variant-based styling
    const variantStyles: Record<ProgressVariant, string> = {
      default: "bg-primary",
      primary: "bg-primary",
      success: "bg-success",
      warning: "bg-warning",
      error: "bg-danger",
    };

    // Size-based styling
    const sizeStyles = {
      sm: "h-1",
      md: "h-2",
      lg: "h-3",
    };

    // Format value label
    const valueLabel = React.useMemo(() => {
      if (!showValue) return null;
      if (formatValue) {
        return formatValue(clampedValue, max);
      }
      return `${Math.round(percentage)}%`;
    }, [showValue, formatValue, clampedValue, max, percentage]);

    return (
      <div
        ref={ref}
        className={cn("mcp-layer3-pattern", className)}
        data-testid={testId}
        {...props}
      >
        <div className="flex items-center justify-between mb-1">
          {showValue && valueLabel && (
            <Text size="sm" color="muted" className="m-0">
              {valueLabel}
            </Text>
          )}
        </div>
        <ProgressPrimitive.Root
          value={percentage}
          max={100}
          className={cn(
            "relative overflow-hidden rounded-full",
            "bg-bg-muted",
            sizeStyles[size],
            "mcp-layer3-pattern-root"
          )}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full w-full flex-1 transition-all",
              variantStyles[variant],
              "mcp-layer3-pattern-indicator"
            )}
            style={{ transform: `translateX(-${100 - percentage}%)` }}
            aria-label="Progress"
          />
        </ProgressPrimitive.Root>
      </div>
    );
  }
);

Progress.displayName = "Progress";


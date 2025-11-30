/**
 * Skeleton Component - Layer 3 Complex Pattern
 *
 * Loading placeholder component for content that is being loaded.
 * Provides visual feedback during async operations.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { Skeleton } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return <Skeleton variant="text" width="200px" />;
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type { SkeletonProps, SkeletonVariant } from "./skeleton.types";

/**
 * Skeleton - Loading placeholder component
 *
 * Features:
 * - Multiple variants (default, text, circular, rectangular)
 * - Size variants
 * - Custom width/height
 * - Animated pulse effect
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = "default",
      size = "md",
      width,
      height,
      animate = true,
      className,
      testId,
      ...props
    },
    ref
  ) => {
    // Variant-based styling
    const variantStyles: Record<SkeletonVariant, string> = {
      default: "rounded-md",
      text: "rounded",
      circular: "rounded-full",
      rectangular: "rounded-none",
    };

    // Size-based styling for text variant
    const sizeStyles = {
      sm: "h-3",
      md: "h-4",
      lg: "h-6",
    };

    // Calculate dimensions
    const style = React.useMemo(() => {
      const styles: React.CSSProperties = {};
      if (width) {
        styles.width =
          typeof width === "number" ? `${width}px` : width;
      }
      if (height) {
        styles.height =
          typeof height === "number" ? `${height}px` : height;
      }
      return styles;
    }, [width, height]);

    // Text variant uses size for height
    const textHeight =
      variant === "text" && !height ? sizeStyles[size] : "";

    return (
      <div
        ref={ref}
        className={cn(
          "bg-bg-muted",
          variantStyles[variant],
          variant === "text" && textHeight,
          animate && "animate-pulse",
          "mcp-layer3-pattern",
          className
        )}
        style={style}
        data-testid={testId}
        aria-busy="true"
        aria-label="Loading content"
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";


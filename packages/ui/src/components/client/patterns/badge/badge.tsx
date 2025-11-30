/**
 * Badge Component - Layer 3 Complex Pattern
 *
 * Enhanced badge component with icon support and dismissible functionality.
 * Composes Layer 1 Badge primitive with additional interactive features.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { Badge } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <Badge variant="success" leadingIcon={<CheckIcon />} dismissible>
 *       Active
 *     </Badge>
 *   );
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import Layer 1 Badge primitive
import { Badge as BadgePrimitive } from "../../../shared/primitives/badge";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type { BadgeProps } from "./badge.types";

/**
 * Badge - Enhanced pattern component
 *
 * Features:
 * - Icon support (leading/trailing)
 * - Dismissible badges
 * - Clickable badges
 * - Composes Badge primitive
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "default",
      size = "md",
      leadingIcon,
      trailingIcon,
      dismissible = false,
      onDismiss,
      clickable = false,
      onClick,
      className,
      testId,
      children,
      ...props
    },
    ref
  ) => {
    const [isDismissed, setIsDismissed] = React.useState(false);

    const handleDismiss = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setIsDismissed(true);
        onDismiss?.();
      },
      [onDismiss]
    );

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLSpanElement>) => {
        if (clickable && onClick) {
          onClick(e);
        }
      },
      [clickable, onClick]
    );

    // Don't render if dismissed
    if (isDismissed) {
      return null;
    }

    return (
      <BadgePrimitive
        ref={ref}
        variant={variant}
        size={size}
        testId={testId}
        onClick={clickable ? handleClick : undefined}
        className={cn(
          "mcp-layer3-pattern",
          // Icon spacing adjustments
          leadingIcon && "pl-2",
          trailingIcon && !dismissible && "pr-2",
          dismissible && "pr-1",
          className
        )}
        {...props}
      >
        {leadingIcon && (
          <span className="inline-flex items-center" aria-hidden="true">
            {leadingIcon}
          </span>
        )}
        <span>{children}</span>
        {trailingIcon && !dismissible && (
          <span className="inline-flex items-center" aria-hidden="true">
            {trailingIcon}
          </span>
        )}
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              "ml-1 inline-flex items-center justify-center",
              "rounded-full",
              "hover:bg-bg-muted",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              "transition-colors duration-200",
              size === "sm" && "h-3 w-3",
              size === "md" && "h-4 w-4",
              size === "lg" && "h-5 w-5"
            )}
            aria-label="Dismiss badge"
            data-testid={testId ? `${testId}-dismiss` : undefined}
          >
            <svg
              className={cn(
                "text-fg-muted",
                size === "sm" && "h-2 w-2",
                size === "md" && "h-3 w-3",
                size === "lg" && "h-4 w-4"
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </BadgePrimitive>
    );
  }
);

Badge.displayName = "Badge";

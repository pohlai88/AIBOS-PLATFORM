/**
 * Alert Component - Layer 3 Complex Pattern
 *
 * Inline notification component for displaying important messages.
 * Composes Layer 1 Typography components with variant-based styling.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { Alert } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <Alert variant="success" title="Success" description="Operation completed successfully" />
 *   );
 * }
 * ```
 */

"use client";

import * as React from "react";
import {
  CheckCircleIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Import Layer 1 Typography
import { Heading } from "../../../shared/typography/heading";
import { Text } from "../../../shared/typography/text";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type { AlertProps, AlertVariant } from "./alert.types";

/**
 * Alert - Inline notification component
 *
 * Features:
 * - Multiple variants (default, info, success, warning, error)
 * - Optional title and description
 * - Dismissible alerts
 * - Icon support
 * - Composes Layer 1 Typography
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = "default",
      size = "md",
      title,
      description,
      dismissible = false,
      onDismiss,
      icon,
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

    // Don't render if dismissed
    if (isDismissed) {
      return null;
    }

    // Default icons for variants
    const defaultIcons: Record<AlertVariant, React.ReactNode> = {
      default: <InformationCircleIcon className="h-5 w-5" />,
      info: <InformationCircleIcon className="h-5 w-5" />,
      success: <CheckCircleIcon className="h-5 w-5" />,
      warning: <ExclamationTriangleIcon className="h-5 w-5" />,
      error: <XCircleIcon className="h-5 w-5" />,
    };

    const displayIcon = icon ?? defaultIcons[variant];

    // Variant-based styling
    const variantStyles: Record<AlertVariant, string> = {
      default: "bg-bg-muted border-border-subtle text-fg",
      info: "bg-primary-soft border-primary text-primary-foreground",
      success: "bg-success-soft border-success text-success-foreground",
      warning: "bg-warning-soft border-warning text-warning-foreground",
      error: "bg-danger-soft border-danger text-danger-foreground",
    };

    // Size-based styling
    const sizeStyles = {
      sm: "p-2 text-sm",
      md: "p-4 text-base",
      lg: "p-6 text-lg",
    };

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex items-start gap-3",
          "rounded-lg border",
          variantStyles[variant],
          sizeStyles[size],
          "mcp-layer3-pattern",
          className
        )}
        data-testid={testId}
        {...props}
      >
        {displayIcon && (
          <div className="flex-shrink-0" aria-hidden="true">
            {displayIcon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <Heading level={5} className="mb-1 font-semibold">
              {title}
            </Heading>
          )}
          {description && (
            <Text size={size === "sm" ? "sm" : "base"} className="m-0">
              {description}
            </Text>
          )}
          {children && <div>{children}</div>}
        </div>
        {dismissible && (
          <button
            type="button"
            onClick={handleDismiss}
            className={cn(
              "flex-shrink-0 rounded-md",
              "p-1",
              "hover:bg-bg-muted",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "transition-colors"
            )}
            aria-label="Dismiss alert"
            data-testid={testId ? `${testId}-dismiss` : undefined}
          >
            <XMarkIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";


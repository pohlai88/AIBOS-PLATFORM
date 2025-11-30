/**
 * Card Component - Layer 3 Complex Pattern
 *
 * Content container with header, body, and footer sections.
 * Supports multiple visual variants and interactive states.
 * Composes Layer 1 (Heading, Text) components.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { Card, CardHeader, CardBody, CardFooter } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <Card variant="elevated" hoverable>
 *       <CardHeader title="Card Title" description="Card description" />
 *       <CardBody>
 *         <p>Card content goes here</p>
 *       </CardBody>
 *       <CardFooter>
 *         <button>Action</button>
 *       </CardFooter>
 *     </Card>
 *   );
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import Layer 1 components
import { Heading } from "../../../shared/typography/heading";
import { Text } from "../../../shared/typography/text";

// Import design tokens
import {
  colorTokens,
  radiusTokens,
  shadowTokens,
} from "../../../../design/tokens/tokens";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from "./card.types";

// 🎯 STEP 1: Create variant system
const cardVariants = {
  base: [
    "relative",
    "flex flex-col",
    "transition-all duration-200",
    "mcp-layer3-pattern",
  ].join(" "),
  variants: {
    variant: {
      default: [
        colorTokens.bgElevated,
        colorTokens.text,
        `border ${colorTokens.borderSubtle}`,
      ].join(" "),
      outlined: [
        colorTokens.bg,
        colorTokens.text,
        `border-2 ${colorTokens.border}`,
      ].join(" "),
      elevated: [
        colorTokens.bgElevated,
        colorTokens.text,
        shadowTokens.md,
      ].join(" "),
      filled: [colorTokens.bgMuted, colorTokens.text].join(" "),
    },
    size: {
      sm: [radiusTokens.sm, "p-3"].join(" "),
      md: [radiusTokens.md, "p-4"].join(" "),
      lg: [radiusTokens.lg, "p-6"].join(" "),
    },
  },
};

/**
 * Card - Main container component
 *
 * Features:
 * - Multiple visual variants (default, outlined, elevated, filled)
 * - Size variants (sm, md, lg)
 * - Clickable and hoverable states
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      size = "md",
      variant = "default",
      clickable = false,
      hoverable = true,
      testId,
      className,
      children,
      onClick,
      ...props
    },
    ref
  ) => {
    const baseClasses = cardVariants.base;
    const variantClasses = cardVariants.variants.variant[variant];
    const sizeClasses = cardVariants.variants.size[size];

    const interactiveClasses = React.useMemo(() => {
      if (!hoverable && !clickable) return "";

      const classes = [];
      if (hoverable) {
        classes.push("hover:shadow-lg", "hover:scale-[1.01]");
      }
      if (clickable) {
        classes.push(
          "cursor-pointer",
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-offset-2",
          colorTokens.ring
        );
      }
      return classes.join(" ");
    }, [hoverable, clickable]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (clickable && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          onClick?.(event as any);
        }
      },
      [clickable, onClick]
    );

    return (
      <div
        ref={ref}
        data-testid={testId}
        data-mcp-validated="pending"
        className={cn(
          baseClasses,
          variantClasses,
          sizeClasses,
          interactiveClasses,
          className
        )}
        role={clickable ? "button" : undefined}
        tabIndex={clickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={clickable ? handleKeyDown : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

/**
 * CardHeader - Header section component
 *
 * Features:
 * - Optional title and description
 * - Uses Layer 1 Heading and Text components
 * - Consistent spacing and styling
 *
 * @mcp-marker client-component-pattern
 */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, description, testId, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-testid={testId}
        className={cn(
          "flex flex-col gap-1",
          "mb-4",
          "mcp-layer3-pattern-header",
          className
        )}
        {...props}
      >
        {children ? (
          children
        ) : (
          <>
            {title && (
              <Heading level={4} className="m-0">
                {title}
              </Heading>
            )}
            {description && (
              <Text size="sm" color="muted" className="m-0">
                {description}
              </Text>
            )}
          </>
        )}
      </div>
    );
  }
);
CardHeader.displayName = "CardHeader";

/**
 * CardBody - Main content section component
 *
 * Features:
 * - Flexible content area
 * - Consistent spacing
 *
 * @mcp-marker client-component-pattern
 */
export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ testId, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-testid={testId}
        className={cn("flex-1", "mcp-layer3-pattern-body", className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardBody.displayName = "CardBody";

/**
 * CardFooter - Footer section component
 *
 * Features:
 * - Action buttons and links area
 * - Consistent spacing
 * - Border-top separator (optional)
 *
 * @mcp-marker client-component-pattern
 */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ testId, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        data-testid={testId}
        className={cn(
          "flex items-center justify-end gap-2",
          "mt-4",
          "pt-4",
          `border-t ${colorTokens.borderSubtle}`,
          "mcp-layer3-pattern-footer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CardFooter.displayName = "CardFooter";

// Export with default
export default Card;

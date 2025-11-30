/**
 * Tooltip Component - Layer 2 Radix Composition
 *
 * A floating label that provides contextual information on hover or focus.
 * Wraps Radix UI Tooltip primitive with AI-BOS design tokens.
 *
 * @layer Layer 2 - Radix Compositions
 * @radixPrimitive @radix-ui/react-tooltip
 * @category Client Components
 * @example
 * ```tsx
 * import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@aibos/ui/compositions';
 *
 * export default function Page() {
 *   return (
 *     <TooltipProvider>
 *       <Tooltip>
 *         <TooltipTrigger>Hover me</TooltipTrigger>
 *         <TooltipContent>Helpful information</TooltipContent>
 *       </Tooltip>
 *     </TooltipProvider>
 *   );
 * }
 * ```
 */

"use client";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as React from "react";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type {
  TooltipArrowProps,
  TooltipContentProps,
  TooltipProviderProps,
  TooltipSize,
  TooltipTriggerProps,
  TooltipVariant,
} from "./tooltip.types";

/**
 * TooltipProvider - Required wrapper for all tooltips
 * Manages the global tooltip state and delay behavior
 *
 * @mcp-marker client-component-required
 */
export function TooltipProvider({
  delayDuration = 200,
  skipDelayDuration = 300,
  disableHoverableContent = false,
  children,
}: TooltipProviderProps) {
  return (
    <TooltipPrimitive.Provider
      delayDuration={delayDuration}
      skipDelayDuration={skipDelayDuration}
      disableHoverableContent={disableHoverableContent}
    >
      {children}
    </TooltipPrimitive.Provider>
  );
}
TooltipProvider.displayName = "TooltipProvider";

/**
 * Tooltip - Root component
 * Controls the open state of the tooltip
 *
 * @mcp-marker client-component-wrapper
 */
export const Tooltip = TooltipPrimitive.Root;
Tooltip.displayName = "Tooltip";

/**
 * TooltipTrigger - The element that triggers the tooltip
 * Typically a button or interactive element
 *
 * @mcp-marker client-component-trigger
 */
export const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  TooltipTriggerProps
>(({ className, children, testId, ...props }, ref) => (
  <TooltipPrimitive.Trigger
    ref={ref}
    className={cn("mcp-client-interactive", className)}
    data-testid={testId}
    data-mcp-validated="true"
    {...props}
  >
    {children}
  </TooltipPrimitive.Trigger>
));
TooltipTrigger.displayName = "TooltipTrigger";

/**
 * Size variants for tooltip content
 */
const tooltipSizeVariants: Record<TooltipSize, string> = {
  sm: "max-w-[180px] px-2 py-1 text-xs",
  md: "max-w-[240px] px-3 py-1.5 text-sm",
  lg: "max-w-[320px] px-4 py-2 text-sm",
};

/**
 * Visual style variants for tooltip
 */
const tooltipVariantStyles: Record<TooltipVariant, string> = {
  default: cn(
    "bg-bg-elevated", // References --color-bg-elevated
    "text-fg", // References --color-fg
    "border border-gray-200",
    "shadow-[var(--shadow-sm)]" // References --shadow-sm
  ),
  dark: "bg-gray-900 text-white border-none shadow-lg",
  light: "bg-white text-gray-900 border border-gray-200 shadow-md",
  bordered: cn(
    "bg-bg-elevated", // References --color-bg-elevated
    "text-fg", // References --color-fg
    "border-primary border-2",
    "shadow-[var(--shadow-md)]" // References --shadow-md
  ),
};

/**
 * TooltipContent - The content displayed when tooltip is open
 * Includes sizing, styling, positioning, and animation
 *
 * @mcp-marker client-component-content
 */
export const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(
  (
    {
      className,
      children,
      size = "md",
      variant = "default",
      side = "top",
      align = "center",
      sideOffset = 4,
      showArrow = false,
      testId,
      ...props
    },
    ref
  ) => (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        side={side}
        align={align}
        sideOffset={sideOffset}
        data-testid={testId}
        data-mcp-validated="true"
        data-constitution-compliant="client-component-interactive"
        className={cn(
          // Size
          tooltipSizeVariants[size],
          // Visual variant
          tooltipVariantStyles[variant],
          // Borders and radius
          "rounded-[var(--radius-md)]", // References --radius-md
          // Z-index
          "z-50",
          // Animation
          "animate-in fade-in-0 zoom-in-95",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          // MCP marker
          "mcp-client-interactive",
          className
        )}
        {...props}
      >
        {children}
        {showArrow && <TooltipArrow variant={variant} />}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
);
TooltipContent.displayName = "TooltipContent";

/**
 * TooltipArrow - Visual arrow pointing to the trigger
 *
 * @mcp-marker client-component-decoration
 */
export const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  TooltipArrowProps & { variant?: TooltipVariant }
>(
  (
    { className, variant = "default", width = 8, height = 4, ...props },
    ref
  ) => (
    <TooltipPrimitive.Arrow
      ref={ref}
      width={width}
      height={height}
      className={cn(
        // Arrow color matches variant
        variant === "dark" && "fill-gray-900",
        variant === "light" && "fill-white",
        variant === "default" && "fill-white",
        variant === "bordered" && "fill-white",
        className
      )}
      {...props}
    />
  )
);
TooltipArrow.displayName = "TooltipArrow";

// Default export for convenience
export default Object.assign(Tooltip, {
  Provider: TooltipProvider,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
});

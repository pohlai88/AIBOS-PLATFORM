/**
 * Toast Component - Layer 3 Complex Pattern
 *
 * Temporary notification component built on Radix UI Toast primitive.
 * Composes Layer 1 Typography components with auto-dismiss functionality.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { ToastProvider, Toast, ToastViewport, useToast } from '@aibos/ui/patterns';
 *
 * function App() {
 *   return (
 *     <ToastProvider>
 *       <YourApp />
 *       <ToastViewport />
 *     </ToastProvider>
 *   );
 * }
 * ```
 */

"use client";

import * as ToastPrimitive from "@radix-ui/react-toast";
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
import type {
  ToastProviderProps,
  ToastProps,
  ToastViewportProps,
  ToastVariant,
  ToastPosition,
} from "./toast.types";

/**
 * Position mapping for Radix UI
 */
const positionMap: Record<ToastPosition, ToastPrimitive.ToastProviderProps["swipeDirection"]> = {
  "top-left": "right",
  "top-center": "down",
  "top-right": "left",
  "bottom-left": "right",
  "bottom-center": "up",
  "bottom-right": "left",
};

/**
 * ToastProvider - Root provider for toast notifications
 *
 * @mcp-marker client-component-pattern
 */
export const ToastProvider = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Provider>,
  ToastProviderProps
>(({ position = "bottom-right", duration = 5000, className, children, ...props }, ref) => {
  return (
    <ToastPrimitive.Provider
      ref={ref}
      duration={duration}
      className={cn("mcp-layer3-pattern-provider", className)}
      {...props}
    >
      {children}
    </ToastPrimitive.Provider>
  );
});

ToastProvider.displayName = "ToastProvider";

/**
 * ToastViewport - Container for toast notifications
 */
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  ToastViewportProps
>(({ className, ...props }, ref) => {
  return (
    <ToastPrimitive.Viewport
      ref={ref}
      className={cn(
        "fixed z-[100] flex max-h-screen w-full flex-col-reverse",
        "p-4",
        "sm:flex-col",
        "mcp-layer3-pattern-viewport",
        className
      )}
      {...props}
    />
  );
});

ToastViewport.displayName = "ToastViewport";

/**
 * Toast - Individual toast notification
 *
 * Features:
 * - Multiple variants (default, info, success, warning, error)
 * - Auto-dismiss with configurable duration
 * - Manual dismiss
 * - Action button support
 * - Composes Layer 1 Typography
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  ToastPrimitive.ToastProps & ToastProps
>(
  (
    {
      variant = "default",
      title,
      description,
      dismissible = true,
      action,
      className,
      testId,
      children,
      ...props
    },
    ref
  ) => {
    // Default icons for variants
    const defaultIcons: Record<ToastVariant, React.ReactNode> = {
      default: <InformationCircleIcon className="h-5 w-5" />,
      info: <InformationCircleIcon className="h-5 w-5" />,
      success: <CheckCircleIcon className="h-5 w-5" />,
      warning: <ExclamationTriangleIcon className="h-5 w-5" />,
      error: <XCircleIcon className="h-5 w-5" />,
    };

    const displayIcon = defaultIcons[variant];

    // Variant-based styling
    const variantStyles: Record<ToastVariant, string> = {
      default: "bg-bg-elevated border-border-subtle text-fg",
      info: "bg-primary-soft border-primary text-primary-foreground",
      success: "bg-success-soft border-success text-success-foreground",
      warning: "bg-warning-soft border-warning text-warning-foreground",
      error: "bg-danger-soft border-danger text-danger-foreground",
    };

    return (
      <ToastPrimitive.Root
        ref={ref}
        className={cn(
          "group pointer-events-auto relative flex w-full items-center gap-3",
          "rounded-lg border p-4 shadow-lg",
          variantStyles[variant],
          "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
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
            <ToastPrimitive.Title asChild>
              <Heading level={5} className="mb-1 font-semibold">
                {title}
              </Heading>
            </ToastPrimitive.Title>
          )}
          {description && (
            <ToastPrimitive.Description asChild>
              <Text size="sm" className="m-0">
                {description}
              </Text>
            </ToastPrimitive.Description>
          )}
          {children && <div>{children}</div>}
        </div>
        {action && (
          <div className="flex-shrink-0">
            <ToastPrimitive.Action altText="Action" asChild>
              {action}
            </ToastPrimitive.Action>
          </div>
        )}
        {dismissible && (
          <ToastPrimitive.Close
            className={cn(
              "absolute right-2 top-2 rounded-md p-1",
              "opacity-0 transition-opacity",
              "hover:opacity-100 focus:opacity-100 group-hover:opacity-100",
              "focus:outline-none focus:ring-2 focus:ring-ring",
              "mcp-layer3-pattern-close"
            )}
            aria-label="Close"
          >
            <XMarkIcon className="h-4 w-4" />
          </ToastPrimitive.Close>
        )}
      </ToastPrimitive.Root>
    );
  }
);

Toast.displayName = "Toast";

/**
 * Hook to show toast notifications
 * 
 * Note: This is a simplified hook. For full functionality,
 * consider using a toast state management library or context.
 */
export function useToast() {
  const showToast = React.useCallback((props: ToastProps) => {
    // This would typically dispatch to a toast context/state
    // For now, this is a placeholder that can be extended
    console.log("Toast:", props);
  }, []);

  return { toast: showToast };
}


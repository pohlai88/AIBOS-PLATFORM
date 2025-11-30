/**
 * Tabs Component - Layer 3 Complex Pattern
 *
 * Tab navigation component built on Radix UI Tabs primitive.
 * Composes Layer 1 Typography components with interactive tab switching.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { Tabs, TabsList, TabsTrigger, TabsContent } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <Tabs defaultValue="tab1">
 *       <TabsList>
 *         <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *         <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *       </TabsList>
 *       <TabsContent value="tab1">Content 1</TabsContent>
 *       <TabsContent value="tab2">Content 2</TabsContent>
 *     </Tabs>
 *   );
 * }
 * ```
 */

"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

// Import Layer 1 Typography
import { Text } from "../../../shared/typography/text";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type {
  TabsProps,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from "./tabs.types";

/**
 * Tabs - Root tabs component
 *
 * Features:
 * - Horizontal and vertical orientations
 * - Size variants
 * - Controlled and uncontrolled modes
 * - Keyboard navigation
 * - Composes Radix UI Tabs primitive
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  (
    {
      defaultValue,
      value,
      onValueChange,
      orientation = "horizontal",
      size = "md",
      className,
      testId,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <TabsPrimitive.Root
        ref={ref}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        orientation={orientation}
        className={cn("mcp-layer3-pattern", className)}
        data-testid={testId}
        {...props}
      >
        {children}
      </TabsPrimitive.Root>
    );
  }
);

Tabs.displayName = "Tabs";

/**
 * TabsList - Container for tab triggers
 */
export const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, testId, children, ...props }, ref) => {
    return (
      <TabsPrimitive.List
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center",
          "rounded-lg",
          "bg-bg-muted",
          "p-1",
          "mcp-layer3-pattern-list",
          className
        )}
        data-testid={testId}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    );
  }
);

TabsList.displayName = "TabsList";

/**
 * TabsTrigger - Individual tab button
 */
export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  (
    { value, disabled = false, className, testId, children, ...props },
    ref
  ) => {
    return (
      <TabsPrimitive.Trigger
        ref={ref}
        value={value}
        disabled={disabled}
        className={cn(
          "inline-flex items-center justify-center",
          "whitespace-nowrap rounded-md",
          "px-3 py-1.5",
          "text-sm font-medium",
          "transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "data-[state=active]:bg-bg-elevated data-[state=active]:text-fg data-[state=active]:shadow-sm",
          "data-[state=inactive]:text-fg-muted",
          "hover:data-[state=inactive]:text-fg",
          "mcp-layer3-pattern-trigger",
          className
        )}
        data-testid={testId}
        {...props}
      >
        {children}
      </TabsPrimitive.Trigger>
    );
  }
);

TabsTrigger.displayName = "TabsTrigger";

/**
 * TabsContent - Tab panel content
 */
export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, testId, children, ...props }, ref) => {
    return (
      <TabsPrimitive.Content
        ref={ref}
        value={value}
        className={cn(
          "mt-2",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "mcp-layer3-pattern-content",
          className
        )}
        data-testid={testId}
        {...props}
      >
        {children}
      </TabsPrimitive.Content>
    );
  }
);

TabsContent.displayName = "TabsContent";


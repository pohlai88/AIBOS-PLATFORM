/**
 * Tabs Component - Layer 2 Radix Composition
 *
 * A tab navigation component built on Radix UI Tabs primitive.
 *
 * @module Tabs
 * @layer 2
 * @radixPrimitive @radix-ui/react-tabs
 * @category navigation
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type {
  TabsContentProps,
  TabsListProps,
  TabsSize,
  TabsTriggerProps,
  TabsVariant,
} from "./tabs.types";

// ============================================================================
// Variant Definitions
// ============================================================================

const tabsSizeVariants: Record<TabsSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

const tabsListVariants: Record<TabsVariant, string> = {
  default: cn(
    "inline-flex items-center justify-center p-1",
    colorTokens.bgMuted,
    radiusTokens.lg
  ),
  pills: "inline-flex items-center gap-1",
  underline: "inline-flex items-center border-b border-border",
};

const tabsTriggerVariants: Record<TabsVariant, string> = {
  default: cn(
    "inline-flex items-center justify-center whitespace-nowrap font-medium",
    "ring-offset-background transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
    radiusTokens.md
  ),
  pills: cn(
    "inline-flex items-center justify-center whitespace-nowrap font-medium",
    "transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
    radiusTokens.full
  ),
  underline: cn(
    "inline-flex items-center justify-center whitespace-nowrap font-medium",
    "border-b-2 border-transparent -mb-px",
    "transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "disabled:pointer-events-none disabled:opacity-50",
    "data-[state=active]:border-primary data-[state=active]:text-foreground"
  ),
};

// ============================================================================
// Root Component
// ============================================================================

export const Tabs = TabsPrimitive.Root;

// ============================================================================
// List Component
// ============================================================================

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, variant = "default", ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn(
      tabsListVariants[variant],
      "mcp-client-interactive",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

// ============================================================================
// Trigger Component
// ============================================================================

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  TabsTriggerProps & { variant?: TabsVariant }
>(({ className, size = "md", variant = "default", ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      tabsTriggerVariants[variant],
      tabsSizeVariants[size],
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

// ============================================================================
// Content Component
// ============================================================================

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  TabsContentProps
>(({ className, testId, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-testid={testId}
    className={cn(
      "mt-2 ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

// ============================================================================
// Exports
// ============================================================================

export type {
  TabsContentProps,
  TabsListProps,
  TabsRootProps,
  TabsSize,
  TabsTriggerProps,
  TabsVariant,
} from "./tabs.types";

export { tabsListVariants, tabsSizeVariants, tabsTriggerVariants };

export default Tabs;

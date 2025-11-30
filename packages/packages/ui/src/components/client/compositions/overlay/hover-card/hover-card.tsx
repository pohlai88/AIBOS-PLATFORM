/**
 * HoverCard Component - Layer 2 Radix Composition
 *
 * A card that appears on hover built on Radix UI HoverCard primitive.
 *
 * @module HoverCard
 * @layer 2
 * @radixPrimitive @radix-ui/react-hover-card
 * @category overlay
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

"use client";

import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import * as React from "react";

import {
  colorTokens,
  radiusTokens,
  shadowTokens,
} from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { HoverCardContentProps } from "./hover-card.types";

// ============================================================================
// Root Components
// ============================================================================

export const HoverCard = HoverCardPrimitive.Root;
export const HoverCardTrigger = HoverCardPrimitive.Trigger;

// ============================================================================
// Content Component
// ============================================================================

export const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  HoverCardContentProps
>(({ className, align = "center", sideOffset = 4, testId, ...props }, ref) => (
  <HoverCardPrimitive.Content
    ref={ref}
    align={align}
    sideOffset={sideOffset}
    data-testid={testId}
    data-mcp-validated="true"
    data-constitution-compliant="layer2-radix-composition"
    data-layer="2"
    className={cn(
      "z-50 w-64 p-4",
      colorTokens.bgElevated,
      colorTokens.fg,
      radiusTokens.md,
      shadowTokens.md,
      "outline-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
      "data-[side=bottom]:slide-in-from-top-2",
      "data-[side=left]:slide-in-from-right-2",
      "data-[side=right]:slide-in-from-left-2",
      "data-[side=top]:slide-in-from-bottom-2",
      "mcp-client-interactive",
      className
    )}
    {...props}
  />
));
HoverCardContent.displayName = "HoverCardContent";

// ============================================================================
// Exports
// ============================================================================

export type {
  HoverCardAlign,
  HoverCardContentProps,
  HoverCardRootProps,
  HoverCardSide,
  HoverCardTriggerProps,
} from "./hover-card.types";

export default HoverCard;

// packages/ui/src/components/accordion.tsx
"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  colorTokens,
  spacingTokens,
  radiusTokens,
  typographyTokens,
} from "../design/tokens";
import { cn } from "../lib/cn";

/* ==========================================================================
   HYBRID ACCORDION v3
   
   - Tokens for color/space/typography (governed)
   - Tailwind utilities for layout, spacing, responsiveness (flexible)
   - Compatible with multi-tenant + safe mode + theme overrides
   ========================================================================== */

export interface AccordionProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> {}

export const Accordion = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Root>,
  AccordionProps
>(({ className, ...props }, ref) => {
  return (
    <AccordionPrimitive.Root
      ref={ref}
      className={cn("w-full", className)}
      {...props}
    />
  );
});

Accordion.displayName = "Accordion";

/* ==========================================================================
   ITEM
   ========================================================================== */

export interface AccordionItemProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> {}

export const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  AccordionItemProps
>(({ className, ...props }, ref) => {
  return (
    <AccordionPrimitive.Item
      ref={ref}
      className={cn(
        "border-b last:border-b-0", // Utility-driven layout
        colorTokens.border.default,  // Token-driven color consistency
        className
      )}
      {...props}
    />
  );
});

AccordionItem.displayName = "AccordionItem";

/* ==========================================================================
   TRIGGER
   ========================================================================== */

export interface AccordionTriggerProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> {}

export const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  AccordionTriggerProps
>(({ className, children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Header className="flex w-full">
      <AccordionPrimitive.Trigger
        ref={ref}
        {...props}
        className={cn(
          "flex flex-1 items-center justify-between select-none", // utilities
          spacingTokens.md,                                       // SSOT spacing
          typographyTokens.body,                                  // SSOT type
          radiusTokens.md,                                        // SSOT radius
          "transition-all outline-none",                          // utilities
          "hover:bg-bg-muted",                                    // theme-ready
          "focus-visible:ring-2 focus-visible:ring-ring",         // governed focus
          "[&[data-state=open]>svg]:rotate-180",                  // Radix open indicator
          className
        )}
      >
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={cn(
            "h-4 w-4 shrink-0 transition-transform duration-200",
            colorTokens.text.muted
          )}
          aria-hidden="true"
        >
          <path
            d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

/* ==========================================================================
   CONTENT
   ========================================================================== */

export interface AccordionContentProps
  extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> {}

export const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  AccordionContentProps
>(({ className, children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      {...props}
      className={cn(
        "overflow-hidden text-sm transition-all", // utility for simplicity
        "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
        className
      )}
    >
      <div
        className={cn(
          spacingTokens.md, // SSOT padding
          "pt-0"            // override top padding
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
});

AccordionContent.displayName = "AccordionContent";


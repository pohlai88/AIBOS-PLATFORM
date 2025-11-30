/**
 * Accordion Component - Layer 3 Complex Pattern
 *
 * Collapsible content sections built on Radix UI Accordion primitive.
 * Composes Layer 1 Typography components with expand/collapse functionality.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <Accordion type="single" collapsible>
 *       <AccordionItem value="item1">
 *         <AccordionTrigger>Section 1</AccordionTrigger>
 *         <AccordionContent>Content for section 1</AccordionContent>
 *       </AccordionItem>
 *     </Accordion>
 *   );
 * }
 * ```
 */

"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import * as React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

// Import Layer 1 Typography
import { Heading } from "../../../shared/typography/heading";
import { Text } from "../../../shared/typography/text";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import types
import type {
  AccordionProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
} from "./accordion.types";

/**
 * Accordion - Root accordion component
 *
 * Features:
 * - Single or multiple items open
 * - Collapsible items
 * - Keyboard navigation
 * - Composes Radix UI Accordion primitive
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      type = "single",
      defaultValue,
      value,
      onValueChange,
      collapsible = true,
      size = "md",
      className,
      testId,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <AccordionPrimitive.Root
        ref={ref}
        type={type}
        defaultValue={defaultValue}
        value={value}
        onValueChange={onValueChange}
        collapsible={collapsible}
        className={cn("mcp-layer3-pattern", className)}
        data-testid={testId}
        {...props}
      >
        {children}
      </AccordionPrimitive.Root>
    );
  }
);

Accordion.displayName = "Accordion";

/**
 * AccordionItem - Individual accordion item
 */
export const AccordionItem = React.forwardRef<HTMLDivElement, AccordionItemProps>(
  ({ value, disabled = false, className, testId, children, ...props }, ref) => {
    return (
      <AccordionPrimitive.Item
        ref={ref}
        value={value}
        disabled={disabled}
        className={cn(
          "border-b border-border-subtle",
          "mcp-layer3-pattern-item",
          className
        )}
        data-testid={testId}
        {...props}
      >
        {children}
      </AccordionPrimitive.Item>
    );
  }
);

AccordionItem.displayName = "AccordionItem";

/**
 * AccordionTrigger - Clickable header to expand/collapse
 */
export const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  AccordionTriggerProps
>(({ className, testId, children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-1 items-center justify-between",
          "py-4",
          "font-medium",
          "transition-all",
          "hover:underline",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "[&[data-state=open]>svg]:rotate-180",
          "mcp-layer3-pattern-trigger",
          className
        )}
        data-testid={testId}
        {...props}
      >
        {children}
        <ChevronDownIcon
          className="h-4 w-4 shrink-0 text-fg-muted transition-transform duration-200"
          aria-hidden="true"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});

AccordionTrigger.displayName = "AccordionTrigger";

/**
 * AccordionContent - Collapsible content panel
 */
export const AccordionContent = React.forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ className, testId, children, ...props }, ref) => {
  return (
    <AccordionPrimitive.Content
      ref={ref}
      className={cn(
        "overflow-hidden",
        "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        "mcp-layer3-pattern-content",
        className
      )}
      data-testid={testId}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </AccordionPrimitive.Content>
  );
});

AccordionContent.displayName = "AccordionContent";


/**
 * FormSection Component - Layer 3 Complex Pattern
 *
 * Groups related form fields with section heading and optional description.
 * Composes Layer 1 (Heading, Text) components.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { FormSection } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <FormSection title="Personal Information" description="Enter your personal details">
 *       <FormField label="First Name" required>
 *         <Input id="firstName" />
 *       </FormField>
 *       <FormField label="Last Name" required>
 *         <Input id="lastName" />
 *       </FormField>
 *     </FormSection>
 *   );
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import Layer 1 components
import { Heading } from "../../../shared/typography/heading";
import { Text } from "../../../shared/typography/text";

// Import primitives
import { IconWrapper } from "../../../shared/primitives/icon-wrapper";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// 🎯 STEP 1: Define variant types
export type FormSectionSize = "sm" | "md" | "lg";

// 🎯 STEP 2: Define props interface
export interface FormSectionProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Section title/heading
   */
  title?: string;

  /**
   * Optional description text below the title
   */
  description?: string;

  /**
   * Size of spacing between elements
   * @default 'md'
   */
  size?: FormSectionSize;

  /**
   * Whether the section is collapsible (future enhancement)
   * @default false
   */
  collapsible?: boolean;

  /**
   * Whether the section is collapsed by default (requires collapsible=true)
   * @default false
   */
  defaultCollapsed?: boolean;

  /**
   * Test ID for automated testing
   */
  testId?: string;

  /**
   * Child form fields
   */
  children?: React.ReactNode;
}

// 🎯 STEP 3: Create size variant system
const formSectionVariants = {
  base: [
    "flex flex-col",
    "mcp-layer3-pattern",
  ].join(" "),
  variants: {
    size: {
      sm: "gap-3", // 12px
      md: "gap-4", // 16px
      lg: "gap-6", // 24px
    },
  },
};

/**
 * FormSection - Layer 3 Complex Pattern
 *
 * Features:
 * - Section heading with optional description
 * - Grouped form fields with consistent spacing
 * - Design token-based styling
 * - MCP validation enabled
 * - Accessibility compliant
 *
 * @mcp-marker client-component-pattern
 */
export const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  (
    {
      title,
      description,
      size = "md",
      collapsible = false,
      defaultCollapsed = false,
      testId,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

    const sizeClasses =
      formSectionVariants.variants.size[size] ||
      formSectionVariants.variants.size.md;

    const handleToggle = () => {
      if (collapsible) {
        setIsCollapsed(!isCollapsed);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          formSectionVariants.base,
          sizeClasses,
          className
        )}
        data-testid={testId}
        data-mcp-validated="true"
        data-constitution-compliant="formsection-layer3"
        {...props}
      >
        {/* Section Header */}
        {(title || description) && (
          <div className="flex flex-col gap-1">
            {title && (
              <div className="flex items-center gap-2">
                <Heading
                  as="h3"
                  size="md"
                  weight="semibold"
                  className="text-fg"
                >
                  {title}
                </Heading>
                {collapsible && (
                  <button
                    type="button"
                    onClick={handleToggle}
                    className="ml-auto inline-flex items-center justify-center p-1 rounded-md hover:bg-bg-muted transition-colors"
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? "Expand section" : "Collapse section"}
                  >
                    <IconWrapper size="sm" variant="muted">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                        className={cn(
                          "transition-transform duration-200",
                          isCollapsed ? "rotate-0" : "rotate-180"
                        )}
                      >
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </IconWrapper>
                  </button>
                )}
              </div>
            )}
            {description && !isCollapsed && (
              <Text size="sm" color="muted">
                {description}
              </Text>
            )}
          </div>
        )}

        {/* Section Content */}
        {!isCollapsed && (
          <div className="flex flex-col gap-4">
            {children}
          </div>
        )}
      </div>
    );
  }
);

FormSection.displayName = "FormSection";

// Export with default
export default FormSection;


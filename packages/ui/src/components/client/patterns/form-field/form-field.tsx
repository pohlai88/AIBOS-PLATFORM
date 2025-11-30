/**
 * FormField Component - Layer 3 Complex Pattern
 *
 * Advanced form field composition with label, input, error handling, and hints.
 * Composes Layer 1 (Text) and Layer 2 (Tooltip) components.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Client Components
 * @example
 * ```tsx
 * import { FormField } from '@aibos/ui/patterns';
 *
 * export default function Page() {
 *   return (
 *     <FormField
 *       label="Email Address"
 *       error="Invalid email format"
 *       hint="We'll never share your email"
 *       required
 *     >
 *       <Input id="email" type="email" />
 *     </FormField>
 *   );
 * }
 * ```
 */

"use client";

import * as React from "react";

// Import Layer 1 components
import { Text } from "../../../shared/typography/text";

// Import Layer 2 components
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../compositions/tooltip/tooltip";

// Import primitives
import { Input } from "../../../shared/primitives/input";
import { Label } from "../../../shared/primitives/label";
import { FieldGroup } from "../../../shared/primitives/field-group";

// Import design utilities
import { cn } from "../../../../design/utilities/cn";

// Import IconWrapper for hint icon
import { IconWrapper } from "../../../shared/primitives/icon-wrapper";

// 🎯 STEP 1: Define variant types
export type FormFieldSize = "sm" | "md" | "lg";

// 🎯 STEP 2: Define props interface
export interface FormFieldProps
  extends React.ComponentPropsWithoutRef<"div"> {
  /**
   * Label text for the field
   */
  label?: string;

  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;

  /**
   * Error message (takes precedence over helper)
   */
  error?: string;

  /**
   * Helper text displayed below the field
   */
  helper?: string;

  /**
   * Hint text shown in tooltip (on info icon)
   */
  hint?: string;

  /**
   * Size of the field
   * @default 'md'
   */
  size?: FormFieldSize;

  /**
   * Whether the field is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * ID for the input element (used for label association)
   */
  id?: string;

  /**
   * HTML for attribute (used for label association)
   */
  htmlFor?: string;

  /**
   * Test ID for automated testing
   */
  testId?: string;

  /**
   * Child input element
   */
  children?: React.ReactNode;
}

/**
 * FormField - Layer 3 Complex Pattern
 *
 * Features:
 * - Label with required indicator
 * - Input wrapper with error states
 * - Helper text or error message
 * - Hint tooltip with info icon
 * - Proper accessibility associations
 * - Design token-based styling
 * - MCP validation enabled
 *
 * @mcp-marker client-component-pattern
 */
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      required = false,
      error,
      helper,
      hint,
      size = "md",
      disabled = false,
      id,
      htmlFor,
      testId,
      className,
      children,
      ...props
    },
    ref
  ) => {
    // Generate unique IDs for accessibility
    const fieldId = id || htmlFor || React.useId();
    const labelId = `${fieldId}-label`;
    const helperId = `${fieldId}-helper`;
    const errorId = `${fieldId}-error`;

    // Determine which text to show (error takes precedence)
    const helperText = error || helper;
    const isError = !!error;

    // Get the input element from children or create default
    const inputElement = React.useMemo(() => {
      if (children) {
        // Clone the child input and add necessary props
        return React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              id: fieldId,
              "aria-invalid": isError ? true : undefined,
              "aria-describedby": helperText
                ? isError
                  ? errorId
                  : helperId
                : undefined,
              disabled,
              ...(child.props || {}),
            });
          }
          return child;
        });
      }
      // Default input if no children provided
      return (
        <Input
          id={fieldId}
          error={isError}
          disabled={disabled}
          aria-invalid={isError ? true : undefined}
          aria-describedby={helperText ? (isError ? errorId : helperId) : undefined}
        />
      );
    }, [children, fieldId, isError, disabled, helperText, errorId, helperId]);

    return (
      <FieldGroup
        ref={ref}
        label={
          label ? (
            <div className="flex items-center gap-2">
              <Label
                htmlFor={fieldId}
                id={labelId}
                required={required}
                size={size}
                disabled={disabled}
              >
                {label}
              </Label>
              {hint && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center justify-center"
                        aria-label="More information"
                        disabled={disabled}
                      >
                        <IconWrapper size="sm" variant="muted">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <circle
                              cx="8"
                              cy="8"
                              r="7"
                              stroke="currentColor"
                              strokeWidth="1.5"
                            />
                            <path
                              d="M8 6V8M8 10H8.01"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                            />
                          </svg>
                        </IconWrapper>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <Text size="sm">{hint}</Text>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ) : undefined
        }
        required={required}
        helper={helperText ? (
          <Text
            as="span"
            size="sm"
            color={isError ? "danger" : "muted"}
            id={isError ? errorId : helperId}
            role={isError ? "alert" : undefined}
          >
            {helperText}
          </Text>
        ) : undefined}
        error={error}
        size={size}
        disabled={disabled}
        htmlFor={fieldId}
        testId={testId}
        className={cn("mcp-layer3-pattern", className)}
        data-mcp-validated="true"
        data-constitution-compliant="formfield-layer3"
        {...props}
      >
        {inputElement}
      </FieldGroup>
    );
  }
);

FormField.displayName = "FormField";

// Export with default
export default FormField;


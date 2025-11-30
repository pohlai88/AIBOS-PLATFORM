/**
 * Input - RSC-Compatible Shared Component
 *
 * Environment: Server & Client Compatible (NO 'use client' directive)
 * MCP Validation: Enabled with compliance markers
 * Design System: AI-BOS Tokens (exclusive usage)
 * Accessibility: WCAG 2.1 AA/AAA compliant
 * Architecture: Next.js RSC Official Pattern
 *
 * @component Form input primitive with error states
 * @version 2.0.0 - RSC Compliant
 *
 * A form input component with error states and accessibility support.
 * ```tsx
 * // Default input
 * <Input placeholder="Enter text" />
 *
 * // With error state
 * <Input error helperText="This field is required" />
 *
 * // Different sizes
 * <Input size="sm" />
 * <Input size="lg" />
 *
 * // Disabled state
 * <Input disabled />
 * ```
 */

import * as React from "react";
import { cn } from "../../../design/utilities/cn";

/**
 * Input Variants
 * - default: Standard input with border
 * - error: Error state with danger color
 */
export type InputVariant = "default" | "error";

/**
 * Input Sizes
 * - sm: Small input (8px vertical padding)
 * - md: Medium input (12px vertical padding) [default]
 * - lg: Large input (16px vertical padding)
 */
export type InputSize = "sm" | "md" | "lg";

/**
 * Input Props
 * Extends native HTML input attributes for full compatibility
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /**
   * Visual variant of the input
   * @default 'default'
   */
  variant?: InputVariant;

  /**
   * Size of the input
   * @default 'md'
   */
  size?: InputSize;

  /**
   * Error state - shows error styling
   * @default false
   */
  error?: boolean;

  /**
   * Helper or error text displayed below input
   */
  helperText?: string;

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * Input Component
 * Form input field with error states and full accessibility support
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = "default",
      size = "md",
      error = false,
      helperText,
      disabled = false,
      className,
      id,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedby,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for helper text if helperText exists
    const helperId = helperText && id ? `${id}-helper` : undefined;

    // Combine aria-describedby with helper text ID
    const describedBy =
      helperId && ariaDescribedby
        ? `${ariaDescribedby} ${helperId}`
        : helperId || ariaDescribedby;

    /**
     * Base Styles
     * Core input appearance using Tailwind classes referencing CSS variables
     * ✅ GRCD Compliant: No direct token imports, uses Tailwind classes
     */
    const baseStyles = cn(
      // Typography - semantic font sizing
      "text-sm leading-relaxed",

      // Colors - elevated background with border (references CSS variables)
      "bg-bg-elevated",
      "text-fg",
      "border border-border",

      // Spacing - comfortable input padding
      "px-4",

      // Border radius - consistent with design system (references CSS variable)
      "rounded-[var(--radius-md)]",

      // Transition - smooth color changes
      "transition-colors duration-200",

      // Placeholder - muted color (references CSS variable)
      "placeholder:text-fg-muted",

      // Focus - WCAG 2.1 compliant focus indicator
      "focus:outline-none",
      "focus-visible:ring-2",
      "focus-visible:ring-ring",
      "focus-visible:ring-offset-2",
      "focus-visible:border-[var(--color-primary-soft)]",

      // Disabled - reduced opacity and no pointer events
      disabled && ["opacity-50", "cursor-not-allowed"]
    );

    /**
     * Size Variants
     * Controls vertical padding
     * ✅ GRCD Compliant: Direct Tailwind spacing utilities
     */
    const sizeStyles = {
      sm: "py-1.5", // 6px (0.375rem)
      md: "py-2", // 8px (0.5rem)
      lg: "py-2.5", // 10px (0.625rem)
    };

    /**
     * Variant Styles
     * Determines input appearance based on state
     * ✅ GRCD Compliant: Direct Tailwind classes referencing CSS variables
     */
    const variantStyles = {
      default: "",
      error: cn(
        // Error colors (references CSS variables via arbitrary values)
        "border-[var(--color-danger-soft)]",
        "focus-visible:ring-[var(--color-danger-soft)]",
        "focus-visible:border-[var(--color-danger-soft)]"
      ),
    };

    // Use error variant if error prop is true
    const activeVariant = error ? "error" : variant;

    return (
      <div className="w-full">
        <input
          ref={ref}
          id={id}
          disabled={disabled}
          aria-invalid={error || ariaInvalid}
          aria-describedby={describedBy}
          className={cn(
            baseStyles,
            sizeStyles[size],
            variantStyles[activeVariant],
            className
          )}
          {...props}
        />

        {/* Helper/Error Text */}
        {helperText && (
          <p
            id={helperId}
            className={cn(
              "text-xs",
              "mt-1", // Small spacing (0.25rem)
              error
                ? "text-[var(--color-danger-soft)]" // Error text color (references CSS variable)
                : "text-fg-muted" // Helper text color (references CSS variable)
            )}
            role={error ? "alert" : undefined}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

/**
 * Usage Examples:
 *
 * 1. Basic Input
 * <Input placeholder="Enter your name" />
 *
 * 2. With Label
 * <Label htmlFor="email">Email</Label>
 * <Input id="email" type="email" placeholder="you@example.com" />
 *
 * 3. Error State
 * <Input
 *   error
 *   helperText="This field is required"
 *   placeholder="Enter value"
 * />
 *
 * 4. Different Sizes
 * <Input size="sm" placeholder="Small input" />
 * <Input size="md" placeholder="Medium input" />
 * <Input size="lg" placeholder="Large input" />
 *
 * 5. Disabled State
 * <Input disabled placeholder="Cannot edit" />
 *
 * 6. With Custom Styling
 * <Input className="w-64" placeholder="Custom width" />
 */

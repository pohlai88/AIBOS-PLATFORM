/**
 * Label - RSC-Compatible Shared Component
 *
 * Environment: Server & Client Compatible (NO 'use client' directive)
 * MCP Validation: Enabled with compliance markers
 * Design System: AI-BOS Tokens (exclusive usage)
 * Accessibility: WCAG 2.1 AA/AAA compliant
 * Architecture: Next.js RSC Official Pattern
 *
 * @component Form label primitive with required indicator
 * @version 2.0.0 - RSC Compliant
 *
 * A form label component with required indicator and proper accessibility.
 * ```tsx
 * // Basic label
 * <Label htmlFor="email">Email Address</Label>
 *
 * // Required label
 * <Label htmlFor="password" required>Password</Label>
 *
 * // Different sizes
 * <Label htmlFor="name" size="sm">Name</Label>
 * <Label htmlFor="bio" size="lg">Bio</Label>
 *
 * // With input
 * <Label htmlFor="username">Username</Label>
 * <Input id="username" />
 * ```
 */

import * as React from "react";
import { cn } from "../../../design/utilities/cn";

/**
 * Label Variants
 * - default: Standard label text
 * - required: Label with required indicator
 */
export type LabelVariant = "default" | "required";

/**
 * Label Sizes
 * - sm: Small label (11px font)
 * - md: Medium label (13px font) [default]
 * - lg: Large label (14px font)
 */
export type LabelSize = "sm" | "md" | "lg";

/**
 * Label Props
 * Extends native HTML label attributes for full compatibility
 */
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /**
   * Visual variant of the label
   * @default 'default'
   */
  variant?: LabelVariant;

  /**
   * Size of the label
   * @default 'md'
   */
  size?: LabelSize;

  /**
   * Shows required indicator (*)
   * @default false
   */
  required?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Child elements
   */
  children?: React.ReactNode;
}

/**
 * Label Component
 * Form label with required indicator and full accessibility support
 */
export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  (
    {
      variant = "default",
      size = "md",
      required = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    /**
     * Base Styles
     * Core label appearance using Tailwind classes
     * ✅ GRCD Compliant: Direct Tailwind classes referencing CSS variables
     */
    const baseStyles = cn(
      // Typography - medium weight for readability
      "font-medium",

      // Colors - standard text color (references CSS variable)
      "text-fg",

      // Spacing - small margin bottom
      "mb-1.5",

      // Cursor - pointer when hovering label
      "cursor-pointer",

      // User select - allow text selection
      "select-none"
    );

    /**
     * Size Variants
     * Controls font size
     */
    const sizeStyles = {
      sm: "text-xs", // 11px
      md: "text-sm", // 13px
      lg: "text-[14px]", // 14px
    };

    /**
     * Variant Styles
     * Determines label appearance based on state
     */
    const variantStyles = {
      default: "",
      required: "", // Required indicator added separately
    };

    // Use required variant if required prop is true
    const activeVariant = required ? "required" : variant;

    return (
      <label
        ref={ref}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[activeVariant],
          className
        )}
        {...props}
      >
        {children}
        {required && (
          <span
            className={cn(
              "ml-1",
              "text-[var(--color-danger-soft)]", // References CSS variable
              "font-bold"
            )}
            aria-label="required"
            aria-hidden="false"
          >
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = "Label";

/**
 * Usage Examples:
 *
 * 1. Basic Label
 * <Label htmlFor="email">Email Address</Label>
 * <Input id="email" type="email" />
 *
 * 2. Required Field
 * <Label htmlFor="password" required>Password</Label>
 * <Input id="password" type="password" />
 *
 * 3. Different Sizes
 * <Label htmlFor="name" size="sm">Name</Label>
 * <Label htmlFor="bio" size="lg">Biography</Label>
 *
 * 4. With Error State
 * <Label htmlFor="username">Username</Label>
 * <Input id="username" error helperText="Username is required" />
 *
 * 5. Custom Styling
 * <Label htmlFor="custom" className="font-bold">Custom Label</Label>
 */

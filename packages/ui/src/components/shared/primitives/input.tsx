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

import * as React from 'react'
import {
  colorTokens,
  radiusTokens,
  spacingTokens,
  typographyTokens,
} from '../../../design/tokens/tokens'
import { cn } from '../../../design/utilities/cn'

/**
 * Input Variants
 * - default: Standard input with border
 * - error: Error state with danger color
 */
export type InputVariant = 'default' | 'error'

/**
 * Input Sizes
 * - sm: Small input (8px vertical padding)
 * - md: Medium input (12px vertical padding) [default]
 * - lg: Large input (16px vertical padding)
 */
export type InputSize = 'sm' | 'md' | 'lg'

/**
 * Input Props
 * Extends native HTML input attributes for full compatibility
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Visual variant of the input
   * @default 'default'
   */
  variant?: InputVariant

  /**
   * Size of the input
   * @default 'md'
   */
  size?: InputSize

  /**
   * Error state - shows error styling
   * @default false
   */
  error?: boolean

  /**
   * Helper or error text displayed below input
   */
  helperText?: string

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Input Component
 * Form input field with error states and full accessibility support
 */
export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      size = 'md',
      error = false,
      helperText,
      disabled = false,
      className,
      id,
      'aria-invalid': ariaInvalid,
      'aria-describedby': ariaDescribedby,
      ...props
    },
    ref
  ) => {
    // Generate unique ID for helper text if helperText exists
    const helperId = helperText && id ? `${id}-helper` : undefined

    // Combine aria-describedby with helper text ID
    const describedBy =
      helperId && ariaDescribedby
        ? `${ariaDescribedby} ${helperId}`
        : helperId || ariaDescribedby

    /**
     * Base Styles
     * Core input appearance using AI-BOS tokens
     */
    const baseStyles = cn(
      // Typography - semantic font sizing
      typographyTokens.bodySm,

      // Colors - elevated background with border
      `bg-[${colorTokens.bgElevated}]`,
      `text-[${colorTokens.text}]`,
      `border border-[${colorTokens.border}]`,

      // Spacing - comfortable input padding
      `px-[${spacingTokens.md}]`,

      // Border radius - consistent with design system
      `rounded-[${radiusTokens.md}]`,

      // Transition - smooth color changes
      'transition-colors duration-200',

      // Placeholder - muted color
      `placeholder:text-[${colorTokens.textMuted}]`,

      // Focus - WCAG 2.1 compliant focus indicator
      'focus:outline-none',
      'focus-visible:ring-2',
      'focus-visible:ring-ring',
      'focus-visible:ring-offset-2',
      `focus-visible:border-[${colorTokens.primarySoftSurface}]`,

      // Disabled - reduced opacity and no pointer events
      disabled && ['opacity-50', 'cursor-not-allowed']
    )

    /**
     * Size Variants
     * Controls vertical padding
     */
    const sizeStyles = {
      sm: `py-[${spacingTokens.sm}]`, // 8px
      md: `py-[${spacingTokens.md}]`, // 12px
      lg: `py-[${spacingTokens.lg}]`, // 16px
    }

    /**
     * Variant Styles
     * Determines input appearance based on state
     */
    const variantStyles = {
      default: '',
      error: cn(
        // Error colors
        `border-[${colorTokens.dangerSoftSurface}]`,
        `focus-visible:ring-[${colorTokens.dangerSoftSurface}]`,
        `focus-visible:border-[${colorTokens.dangerSoftSurface}]`
      ),
    }

    // Use error variant if error prop is true
    const activeVariant = error ? 'error' : variant

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
              'text-xs',
              `mt-[${spacingTokens.xs}]`,
              error
                ? `text-[${colorTokens.dangerSoftSurface}]`
                : `text-[${colorTokens.textMuted}]`
            )}
            role={error ? 'alert' : undefined}
          >
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

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

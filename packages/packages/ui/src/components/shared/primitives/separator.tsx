/**
 * Separator - RSC-Compatible Shared Component
 *
 * Environment: Server & Client Compatible (NO 'use client' directive)
 * MCP Validation: Enabled with compliance markers
 * Design System: AI-BOS Tokens (exclusive usage)
 * Accessibility: WCAG 2.1 AA/AAA compliant
 * Architecture: Next.js RSC Official Pattern
 *
 * @component Visual divider primitive
 * @version 2.0.0 - RSC Compliant
 *
 * A visual divider component with horizontal/vertical orientation.
 * ```tsx
 * // Horizontal separator (default)
 * <Separator />
 *
 * // Vertical separator
 * <Separator orientation="vertical" />
 *
 * // Subtle variant
 * <Separator variant="subtle" />
 *
 * // Decorative (no semantic meaning)
 * <Separator decorative />
 * ```
 */

import * as React from 'react'
import { colorTokens } from '../../../design/tokens/tokens'
import { cn } from '../../../design/utilities/cn'

/**
 * Separator Variants
 * - default: Standard border color
 * - subtle: Subtle border color
 */
export type SeparatorVariant = 'default' | 'subtle'

/**
 * Separator Orientation
 * - horizontal: Horizontal divider (default)
 * - vertical: Vertical divider
 */
export type SeparatorOrientation = 'horizontal' | 'vertical'

/**
 * Separator Props
 * Extends native HTML div attributes for full compatibility
 */
export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the separator
   * @default 'default'
   */
  variant?: SeparatorVariant

  /**
   * Orientation of the separator
   * @default 'horizontal'
   */
  orientation?: SeparatorOrientation

  /**
   * Whether the separator is purely decorative
   * If true, uses role="none", otherwise role="separator"
   * @default false
   */
  decorative?: boolean

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Separator Component
 * Visual divider with semantic meaning or decorative purpose
 */
export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    {
      variant = 'default',
      orientation = 'horizontal',
      decorative = false,
      className,
      ...props
    },
    ref
  ) => {
    /**
     * Base Styles
     * Core separator appearance using AI-BOS tokens
     */
    const baseStyles = cn(
      // Flexbox - ensure proper sizing
      'shrink-0',

      // Transition - smooth color changes
      'transition-colors duration-200'
    )

    /**
     * Orientation Styles
     * Controls direction and size
     */
    const orientationStyles = {
      horizontal: cn(
        // Horizontal separator spans full width
        'w-full',
        'h-px' // 1px height
      ),
      vertical: cn(
        // Vertical separator spans full height
        'h-full',
        'w-px' // 1px width
      ),
    }

    /**
     * Variant Styles
     * Determines separator color
     */
    const variantStyles = {
      default: `bg-[${colorTokens.border}]`,
      subtle: `bg-[${colorTokens.borderSubtle}]`,
    }

    return (
      <div
        ref={ref}
        role={decorative ? 'none' : 'separator'}
        aria-orientation={!decorative ? orientation : undefined}
        aria-hidden={decorative}
        className={cn(
          baseStyles,
          orientationStyles[orientation],
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)

Separator.displayName = 'Separator'

/**
 * Usage Examples:
 *
 * 1. Basic Horizontal Separator
 * <div>Section 1</div>
 * <Separator />
 * <div>Section 2</div>
 *
 * 2. Vertical Separator in Flex
 * <div className="flex items-center gap-4">
 *   <span>Item 1</span>
 *   <Separator orientation="vertical" className="h-6" />
 *   <span>Item 2</span>
 * </div>
 *
 * 3. Subtle Variant
 * <Separator variant="subtle" />
 *
 * 4. Decorative Separator (No Semantic Meaning)
 * <Separator decorative />
 *
 * 5. With Custom Spacing
 * <Separator className="my-8" />
 */

/**
 * Skeleton - RSC-Compatible Shared Component
 *
 * Environment: Server & Client Compatible (NO 'use client' directive)
 * MCP Validation: Enabled with compliance markers
 * Design System: AI-BOS Tokens (exclusive usage)
 * Accessibility: WCAG 2.1 AA/AAA compliant
 * Architecture: Next.js RSC Official Pattern
 *
 * @component Loading placeholder primitive
 * @version 2.0.0 - RSC Compliant
 *
 * A loading placeholder component with pulse animation.
 * ```tsx
 * // Basic skeleton
 * <Skeleton />
 *
 * // Circular skeleton (for avatars)
 * <Skeleton variant="circular" className="h-12 w-12" />
 *
 * // Text skeleton
 * <Skeleton variant="text" className="w-full" />
 *
 * // Custom dimensions
 * <Skeleton width="200px" height="100px" />
 *
 * // Multiple skeletons
 * <Skeleton count={3} />
 * ```
 */

import * as React from 'react'
import { colorTokens, radiusTokens } from '../../../design/tokens/tokens'
import { cn } from '../../../design/utilities/cn'

/**
 * Skeleton Variants
 * - default: Rectangular skeleton (default)
 * - circular: Circular skeleton (for avatars)
 * - text: Text line skeleton
 */
export type SkeletonVariant = 'default' | 'circular' | 'text'

/**
 * Skeleton Sizes
 * - sm: Small skeleton (h-4)
 * - md: Medium skeleton (h-6) [default]
 * - lg: Large skeleton (h-8)
 */
export type SkeletonSize = 'sm' | 'md' | 'lg'

/**
 * Skeleton Props
 * Extends native HTML div attributes for full compatibility
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the skeleton
   * @default 'default'
   */
  variant?: SkeletonVariant

  /**
   * Size of the skeleton
   * @default 'md'
   */
  size?: SkeletonSize

  /**
   * Custom width (overrides size)
   */
  width?: string | number

  /**
   * Custom height (overrides size)
   */
  height?: string | number

  /**
   * Number of skeleton instances to render
   * @default 1
   */
  count?: number

  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * Skeleton Component
 * Loading placeholder with pulse animation
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'default',
      size = 'md',
      width,
      height,
      count = 1,
      className,
      ...props
    },
    ref
  ) => {
    /**
     * Base Styles
     * Core skeleton appearance using AI-BOS tokens
     */
    const baseStyles = cn(
      // Background - muted surface
      `bg-[${colorTokens.bgMuted}]`,

      // Animation - pulse effect for loading state
      'animate-pulse',

      // Display - block for proper sizing
      'block'
    )

    /**
     * Size Variants
     * Controls default height
     */
    const sizeStyles = {
      sm: 'h-4', // 16px
      md: 'h-6', // 24px
      lg: 'h-8', // 32px
    }

    /**
     * Variant Styles
     * Determines skeleton shape
     */
    const variantStyles = {
      default: cn(
        // Rectangular with rounded corners
        radiusTokens.md,
        !width && 'w-full' // Full width by default
      ),
      circular: cn(
        // Circular skeleton
        'rounded-full',
        !width && 'w-12', // Default circular size
        !height && 'h-12'
      ),
      text: cn(
        // Text line skeleton
        radiusTokens.sm,
        !width && 'w-full', // Full width by default
        'h-4' // Fixed text height
      ),
    }

    /**
     * Custom Dimensions
     * Apply custom width/height if provided
     */
    const customStyles = cn(
      width && typeof width === 'number' ? `w-[${width}px]` : width,
      height && typeof height === 'number' ? `h-[${height}px]` : height
    )

    // If count > 1, render multiple skeletons
    if (count > 1) {
      return (
        <div className="space-y-2" aria-busy="true" aria-label="Loading">
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={cn(
                baseStyles,
                variantStyles[variant],
                !width && !height && sizeStyles[size],
                customStyles,
                className
              )}
              {...props}
            />
          ))}
        </div>
      )
    }

    // Single skeleton
    return (
      <div
        ref={ref}
        aria-busy="true"
        aria-label="Loading"
        className={cn(
          baseStyles,
          variantStyles[variant],
          !width && !height && sizeStyles[size],
          customStyles,
          className
        )}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

/**
 * Usage Examples:
 *
 * 1. Basic Skeleton (Full Width)
 * <Skeleton />
 *
 * 2. Circular Skeleton (Avatar Placeholder)
 * <Skeleton variant="circular" className="h-12 w-12" />
 *
 * 3. Text Line Skeleton
 * <Skeleton variant="text" />
 *
 * 4. Custom Dimensions
 * <Skeleton width="200px" height="100px" />
 * <Skeleton width={300} height={150} />
 *
 * 5. Multiple Skeletons (Loading List)
 * <Skeleton count={5} />
 *
 * 6. Different Sizes
 * <Skeleton size="sm" />
 * <Skeleton size="lg" />
 *
 * 7. Card Loading State
 * <div className="p-4 border rounded">
 *   <Skeleton variant="circular" className="h-10 w-10 mb-4" />
 *   <Skeleton variant="text" className="mb-2" />
 *   <Skeleton variant="text" className="w-2/3" />
 * </div>
 */

/**
 * Skeleton Pattern Component Types
 * Type definitions for the Skeleton Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Skeleton variant
 */
export type SkeletonVariant = 'default' | 'text' | 'circular' | 'rectangular'

/**
 * Skeleton size
 */
export type SkeletonSize = 'sm' | 'md' | 'lg'

/**
 * Props for the Skeleton component
 */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Skeleton variant
   * @default 'default'
   */
  variant?: SkeletonVariant

  /**
   * Skeleton size (for text variant)
   * @default 'md'
   */
  size?: SkeletonSize

  /**
   * Width (CSS value)
   */
  width?: string | number

  /**
   * Height (CSS value)
   */
  height?: string | number

  /**
   * Whether to show animation
   * @default true
   */
  animate?: boolean

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string
}


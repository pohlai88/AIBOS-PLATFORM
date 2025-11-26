/**
 * Skeleton Types - Layer 2 Composition
 * @module SkeletonTypes
 * @layer 2
 */

export type SkeletonVariant = 'default' | 'circular' | 'rectangular'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  testId?: string
}


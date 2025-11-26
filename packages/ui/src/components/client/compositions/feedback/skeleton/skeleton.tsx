/**
 * Skeleton Component - Layer 2 Composition
 *
 * A loading placeholder component for content that is loading.
 *
 * @module Skeleton
 * @layer 2
 * @category feedback
 * @mcp-validated true
 * @wcag-compliant AA/AAA
 */

'use client'

import * as React from 'react'

import { radiusTokens } from '../../../../../design/tokens/tokens'
import { cn } from '../../../../../design/utilities/cn'

import type { SkeletonProps, SkeletonVariant } from './skeleton.types'

// ============================================================================
// Variant Definitions
// ============================================================================

const skeletonVariantStyles: Record<SkeletonVariant, string> = {
  default: radiusTokens.md,
  circular: 'rounded-full',
  rectangular: 'rounded-none',
}

// ============================================================================
// Skeleton Component
// ============================================================================

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'default', width, height, testId, style, ...props }, ref) => (
    <div
      ref={ref}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer2-composition"
      data-layer="2"
      className={cn(
        'animate-pulse bg-muted',
        skeletonVariantStyles[variant],
        'mcp-client-interactive',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  )
)
Skeleton.displayName = 'Skeleton'

// ============================================================================
// Preset Skeletons
// ============================================================================

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        className="h-4"
        style={{ width: i === lines - 1 ? '80%' : '100%' }}
      />
    ))}
  </div>
)
SkeletonText.displayName = 'SkeletonText'

export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ size = 'md', className }) => {
  const sizes = { sm: 32, md: 40, lg: 56 }
  return (
    <Skeleton
      variant="circular"
      width={sizes[size]}
      height={sizes[size]}
      className={className}
    />
  )
}
SkeletonAvatar.displayName = 'SkeletonAvatar'

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('space-y-3', className)}>
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
)
SkeletonCard.displayName = 'SkeletonCard'

// ============================================================================
// Exports
// ============================================================================

export type { SkeletonProps, SkeletonVariant } from './skeleton.types'

export { skeletonVariantStyles }

export default Skeleton


/**
 * AsyncBoundary - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import { Suspense } from 'react'
import type { AsyncBoundaryProps } from './async-boundary.types'
import { cn } from '../../../../design/utilities/cn'

const DefaultFallback = () => (
  <div className="animate-pulse p-4">
    <div className="h-4 bg-muted rounded w-3/4 mb-2" />
    <div className="h-4 bg-muted rounded w-1/2" />
  </div>
)

/**
 * AsyncBoundary - Server-rendered Suspense wrapper
 *
 * @example
 * ```tsx
 * <AsyncBoundary fallback={<Skeleton />}>
 *   <AsyncDataComponent />
 * </AsyncBoundary>
 * ```
 */
export async function AsyncBoundary({
  children,
  fallback,
  className,
  ...props
}: AsyncBoundaryProps) {
  return (
    <div
      className={cn('mcp-server-safe', className)}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      <Suspense fallback={fallback || <DefaultFallback />}>
        {children}
      </Suspense>
    </div>
  )
}

export default AsyncBoundary


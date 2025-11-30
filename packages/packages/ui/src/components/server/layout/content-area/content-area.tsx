/**
 * ContentArea - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { ContentAreaProps } from './content-area.types'
import { cn } from '../../../../design/utilities/cn'

const maxWidths = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  full: 'max-w-full',
}

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

/**
 * ContentArea - Server-rendered main content wrapper
 *
 * @example
 * ```tsx
 * <ContentArea maxWidth="lg" padding="md">
 *   <h1>Page Title</h1>
 *   <p>Page content...</p>
 * </ContentArea>
 * ```
 */
export async function ContentArea({
  children,
  className,
  maxWidth = 'lg',
  padding = 'md',
  centered = true,
  ...props
}: ContentAreaProps) {
  return (
    <main
      className={cn(
        'mcp-server-safe',
        'flex-1 w-full',
        maxWidths[maxWidth],
        paddings[padding],
        centered && 'mx-auto',
        className
      )}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      {children}
    </main>
  )
}

export default ContentArea


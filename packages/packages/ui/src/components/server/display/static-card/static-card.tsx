/**
 * StaticCard - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { StaticCardProps } from './static-card.types'
import { cn } from '../../../../design/utilities/cn'

const variants = {
  default: 'bg-surface border border-border',
  outlined: 'bg-transparent border-2 border-border',
  elevated: 'bg-surface shadow-md',
}

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

/**
 * StaticCard - Server-rendered card component
 *
 * @example
 * ```tsx
 * <StaticCard title="Card Title" description="Card description">
 *   Card content
 * </StaticCard>
 * ```
 */
export async function StaticCard({
  title,
  description,
  header,
  footer,
  children,
  className,
  variant = 'default',
  padding = 'md',
  ...props
}: StaticCardProps) {
  return (
    <article
      className={cn(
        'mcp-server-safe rounded-lg',
        variants[variant],
        className
      )}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      {header && <div className="border-b border-border">{header}</div>}
      <div className={paddings[padding]}>
        {title && <h3 className="font-semibold text-lg mb-1">{title}</h3>}
        {description && (
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
        )}
        {children}
      </div>
      {footer && <div className="border-t border-border p-4">{footer}</div>}
    </article>
  )
}

export default StaticCard


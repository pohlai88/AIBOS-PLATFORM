/**
 * FeatureHighlight - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { FeatureHighlightProps } from './feature-highlight.types'
import { cn } from '../../../../design/utilities/cn'

const alignments = {
  left: 'text-left items-start',
  center: 'text-center items-center',
  right: 'text-right items-end',
}

/**
 * FeatureHighlight - Server-rendered feature showcase
 *
 * @example
 * ```tsx
 * <FeatureHighlight
 *   icon={<RocketIcon />}
 *   title="Fast Performance"
 *   description="Lightning fast load times"
 * />
 * ```
 */
export async function FeatureHighlight({
  title,
  description,
  icon,
  children,
  className,
  direction = 'vertical',
  align = 'center',
  ...props
}: FeatureHighlightProps) {
  return (
    <div
      className={cn(
        'mcp-server-safe flex gap-4',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        alignments[align],
        className
      )}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      {icon && (
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && (
          <p className="mt-1 text-muted-foreground">{description}</p>
        )}
        {children}
      </div>
    </div>
  )
}

export default FeatureHighlight


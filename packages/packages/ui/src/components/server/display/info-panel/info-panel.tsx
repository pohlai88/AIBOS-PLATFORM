/**
 * InfoPanel - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { InfoPanelProps } from './info-panel.types'
import { cn } from '../../../../design/utilities/cn'

const variants = {
  info: 'bg-blue-50 border-blue-200 text-blue-800',
  success: 'bg-green-50 border-green-200 text-green-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  error: 'bg-red-50 border-red-200 text-red-800',
}

/**
 * InfoPanel - Server-rendered information panel
 *
 * @example
 * ```tsx
 * <InfoPanel variant="info" title="Information">
 *   This is an informational message.
 * </InfoPanel>
 * ```
 */
export async function InfoPanel({
  title,
  icon,
  children,
  className,
  variant = 'info',
  ...props
}: InfoPanelProps) {
  return (
    <div
      className={cn(
        'mcp-server-safe p-4 rounded-lg border',
        variants[variant],
        className
      )}
      role="region"
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      <div className="flex gap-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div>
          {title && <h4 className="font-medium mb-1">{title}</h4>}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default InfoPanel


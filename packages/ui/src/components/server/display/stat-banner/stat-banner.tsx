/**
 * StatBanner - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { StatBannerProps } from './stat-banner.types'
import { cn } from '../../../../design/utilities/cn'

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-muted-foreground',
}

/**
 * StatBanner - Server-rendered statistics banner
 *
 * @example
 * ```tsx
 * <StatBanner
 *   stats={[
 *     { label: 'Users', value: 1234, change: '+12%', trend: 'up' },
 *     { label: 'Revenue', value: '$45K', change: '-3%', trend: 'down' },
 *   ]}
 * />
 * ```
 */
export async function StatBanner({
  stats,
  className,
  variant = 'default',
  ...props
}: StatBannerProps) {
  return (
    <div
      className={cn(
        'mcp-server-safe',
        variant === 'cards'
          ? 'grid grid-cols-2 md:grid-cols-4 gap-4'
          : 'flex flex-wrap gap-6',
        className
      )}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      {stats.map((stat, index) => (
        <div
          key={index}
          className={cn(
            variant === 'cards' && 'bg-surface border border-border rounded-lg p-4',
            variant === 'compact' && 'text-center'
          )}
        >
          <div className="flex items-center gap-2">
            {stat.icon}
            <span className="text-sm text-muted-foreground">{stat.label}</span>
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{stat.value}</span>
            {stat.change && (
              <span className={cn('text-sm', trendColors[stat.trend || 'neutral'])}>
                {stat.change}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatBanner


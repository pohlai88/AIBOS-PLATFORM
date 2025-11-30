/**
 * DataList - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { DataListProps } from './data-list.types'
import { cn } from '../../../../design/utilities/cn'

const variants = {
  default: 'space-y-2',
  divided: 'divide-y divide-border',
  cards: 'space-y-3',
}

const itemVariants = {
  default: 'py-2',
  divided: 'py-3',
  cards: 'p-4 bg-surface border border-border rounded-lg',
}

/**
 * DataList - Server-rendered list display
 *
 * @example
 * ```tsx
 * const users = await fetchUsers()
 * <DataList
 *   items={users.map(u => ({
 *     id: u.id,
 *     primary: u.name,
 *     secondary: u.email,
 *   }))}
 * />
 * ```
 */
export async function DataList({
  items,
  className,
  variant = 'default',
  emptyMessage = 'No items to display',
  ...props
}: DataListProps) {
  if (items.length === 0) {
    return (
      <div
        className={cn('mcp-server-safe text-muted-foreground text-center py-8', className)}
        data-mcp-validated="true"
        data-server-component="true"
        {...props}
      >
        {emptyMessage}
      </div>
    )
  }

  return (
    <ul
      className={cn('mcp-server-safe', variants[variant], className)}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      {items.map((item) => (
        <li key={item.id} className={itemVariants[variant]}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{item.primary}</div>
              {item.secondary && (
                <div className="text-sm text-muted-foreground">{item.secondary}</div>
              )}
            </div>
            {item.meta && <div className="text-sm">{item.meta}</div>}
          </div>
        </li>
      ))}
    </ul>
  )
}

export default DataList


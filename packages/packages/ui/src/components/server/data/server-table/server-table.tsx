/**
 * ServerTable - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { ServerTableProps } from './server-table.types'
import { cn } from '../../../../design/utilities/cn'

const variants = {
  default: '',
  striped: '[&_tbody_tr:nth-child(odd)]:bg-muted/50',
  bordered: 'border border-border [&_th]:border [&_td]:border',
}

/**
 * ServerTable - Server-rendered data table
 *
 * @example
 * ```tsx
 * const data = await fetchUsers()
 * <ServerTable
 *   data={data}
 *   columns={[
 *     { key: 'name', header: 'Name' },
 *     { key: 'email', header: 'Email' },
 *   ]}
 * />
 * ```
 */
export async function ServerTable<T extends Record<string, unknown>>({
  data,
  columns,
  caption,
  className,
  variant = 'default',
  compact = false,
  ...props
}: ServerTableProps<T>) {
  return (
    <div
      className={cn('mcp-server-safe overflow-x-auto', className)}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      <table className={cn('w-full text-sm', variants[variant])}>
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-muted/50 border-b border-border">
          <tr>
            {columns.map((col, i) => (
              <th
                key={i}
                className={cn(
                  'font-medium text-muted-foreground',
                  compact ? 'px-3 py-2' : 'px-4 py-3',
                  col.align === 'center' && 'text-center',
                  col.align === 'right' && 'text-right'
                )}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-border last:border-0">
              {columns.map((col, colIndex) => {
                const value = row[col.key as keyof T]
                return (
                  <td
                    key={colIndex}
                    className={cn(
                      compact ? 'px-3 py-2' : 'px-4 py-3',
                      col.align === 'center' && 'text-center',
                      col.align === 'right' && 'text-right'
                    )}
                  >
                    {col.render ? col.render(value, row) : String(value ?? '')}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ServerTable


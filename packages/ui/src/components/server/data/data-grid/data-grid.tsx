/**
 * DataGrid - React 19 RSC Compliant Server Component
 * @version 1.0.0
 * @mcp-validated pending
 */

import type { DataGridProps } from './data-grid.types'
import { cn } from '../../../../design/utilities/cn'

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
  4: 'grid-cols-4',
  5: 'grid-cols-5',
  6: 'grid-cols-6',
}

const responsiveClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5',
  6: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6',
}

const gaps = {
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
}

/**
 * DataGrid - Server-rendered grid layout
 *
 * @example
 * ```tsx
 * <DataGrid columns={3} gap="md" responsive>
 *   {items.map(item => <Card key={item.id}>{item.name}</Card>)}
 * </DataGrid>
 * ```
 */
export async function DataGrid({
  children,
  className,
  columns = 3,
  gap = 'md',
  responsive = true,
  ...props
}: DataGridProps) {
  return (
    <div
      className={cn(
        'mcp-server-safe grid',
        responsive ? responsiveClasses[columns] : columnClasses[columns],
        gaps[gap],
        className
      )}
      data-mcp-validated="true"
      data-server-component="true"
      {...props}
    >
      {children}
    </div>
  )
}

export default DataGrid


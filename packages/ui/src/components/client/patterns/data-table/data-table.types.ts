/**
 * DataTable Pattern Component Types
 * Type definitions for the DataTable Layer 3 pattern component.
 *
 * @layer Layer 3 - Complex Patterns
 * @category Type Definitions
 */

import * as React from 'react'

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc' | null

/**
 * Column definition for DataTable
 */
export interface DataTableColumn<T = any> {
  /**
   * Unique identifier for the column
   */
  id: string

  /**
   * Column header label
   */
  header: string

  /**
   * Accessor function to get cell value from row data
   */
  accessor: (row: T) => React.ReactNode

  /**
   * Whether the column is sortable
   * @default false
   */
  sortable?: boolean

  /**
   * Custom cell renderer (optional, uses accessor by default)
   */
  cell?: (row: T) => React.ReactNode

  /**
   * Column width (CSS value)
   */
  width?: string

  /**
   * Column alignment
   * @default 'left'
   */
  align?: 'left' | 'center' | 'right'
}

/**
 * Props for the DataTable component
 */
export interface DataTableProps<T = any> {
  /**
   * Array of data rows
   */
  data: T[]

  /**
   * Column definitions
   */
  columns: DataTableColumn<T>[]

  /**
   * Whether rows are selectable
   * @default false
   */
  selectable?: boolean

  /**
   * Selected row IDs
   */
  selectedRows?: string[]

  /**
   * Callback when selection changes
   */
  onSelectionChange?: (selectedIds: string[]) => void

  /**
   * Function to get unique ID from row data
   */
  getRowId?: (row: T) => string

  /**
   * Whether to show pagination
   * @default false
   */
  paginated?: boolean

  /**
   * Number of items per page
   * @default 10
   */
  pageSize?: number

  /**
   * Current page (0-indexed)
   * @default 0
   */
  page?: number

  /**
   * Callback when page changes
   */
  onPageChange?: (page: number) => void

  /**
   * Sort configuration
   */
  sortBy?: string
  sortDirection?: SortDirection

  /**
   * Callback when sort changes
   */
  onSortChange?: (columnId: string, direction: SortDirection) => void

  /**
   * Whether rows are clickable
   * @default false
   */
  clickable?: boolean

  /**
   * Callback when row is clicked
   */
  onRowClick?: (row: T) => void

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Empty state message
   */
  emptyMessage?: string
}


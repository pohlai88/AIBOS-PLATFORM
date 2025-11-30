/**
 * DataTable Types - Layer 3 Functional Component
 * @module DataTableTypes
 * @layer 3
 * @category data-tables
 * @library @tanstack/react-table
 */

import type { ColumnDef, SortingState, ColumnFiltersState, VisibilityState, RowSelectionState } from '@tanstack/react-table'

// ============================================================================
// Size & Variant Types
// ============================================================================

export type DataTableSize = 'sm' | 'md' | 'lg'
export type DataTableVariant = 'default' | 'bordered' | 'striped'
export type DataTableDensity = 'compact' | 'normal' | 'comfortable'

// ============================================================================
// Column Definition
// ============================================================================

export type DataTableColumnDef<TData> = ColumnDef<TData, unknown>

// ============================================================================
// Main Component Props
// ============================================================================

export interface DataTableProps<TData> {
  /**
   * Data array to display
   */
  data: TData[]

  /**
   * Column definitions
   */
  columns: DataTableColumnDef<TData>[]

  /**
   * Size variant
   * @default 'md'
   */
  size?: DataTableSize

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: DataTableVariant

  /**
   * Row density
   * @default 'normal'
   */
  density?: DataTableDensity

  /**
   * Enable row selection
   * @default false
   */
  enableRowSelection?: boolean

  /**
   * Enable sorting
   * @default true
   */
  enableSorting?: boolean

  /**
   * Enable column filtering
   * @default false
   */
  enableFiltering?: boolean

  /**
   * Enable column visibility toggle
   * @default false
   */
  enableColumnVisibility?: boolean

  /**
   * Enable pagination
   * @default true
   */
  enablePagination?: boolean

  /**
   * Page size options
   * @default [10, 20, 50, 100]
   */
  pageSizeOptions?: number[]

  /**
   * Initial page size
   * @default 10
   */
  initialPageSize?: number

  /**
   * Loading state
   */
  loading?: boolean

  /**
   * Empty state message
   */
  emptyMessage?: string

  /**
   * Callback when row selection changes
   */
  onRowSelectionChange?: (selection: TData[]) => void

  /**
   * Callback when sorting changes
   */
  onSortingChange?: (sorting: SortingState) => void

  /**
   * Test ID for automated testing
   */
  testId?: string

  /**
   * Additional class name
   */
  className?: string

  /**
   * ARIA label
   */
  'aria-label'?: string
}

// ============================================================================
// Sub-Component Props
// ============================================================================

export interface DataTableHeaderProps {
  className?: string
}

export interface DataTableBodyProps {
  className?: string
}

export interface DataTableRowProps {
  className?: string
  selected?: boolean
}

export interface DataTableCellProps {
  className?: string
}

export interface DataTablePaginationProps {
  className?: string
  pageSizeOptions?: number[]
}

// ============================================================================
// State Types (for external control)
// ============================================================================

export interface DataTableState {
  sorting: SortingState
  columnFilters: ColumnFiltersState
  columnVisibility: VisibilityState
  rowSelection: RowSelectionState
}


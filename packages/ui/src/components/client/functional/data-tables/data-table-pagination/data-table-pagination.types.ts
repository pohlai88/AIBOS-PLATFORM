/**
 * DataTablePagination Types - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

export interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSize?: boolean;
  showItemCount?: boolean;
  testId?: string;
  className?: string;
}


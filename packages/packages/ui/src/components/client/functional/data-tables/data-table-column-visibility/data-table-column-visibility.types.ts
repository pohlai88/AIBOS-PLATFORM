/**
 * DataTableColumnVisibility Types - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

export interface ColumnVisibilityItem {
  id: string;
  label: string;
  visible: boolean;
}

export interface DataTableColumnVisibilityProps {
  columns: ColumnVisibilityItem[];
  onToggle: (columnId: string, visible: boolean) => void;
  onShowAll?: () => void;
  onHideAll?: () => void;
  testId?: string;
  className?: string;
}


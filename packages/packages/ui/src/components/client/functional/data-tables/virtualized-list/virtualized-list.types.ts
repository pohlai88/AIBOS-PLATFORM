/**
 * VirtualizedList Types - Layer 3 Functional Component
 * @layer 3
 * @category data-tables
 */

export interface VirtualizedListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  testId?: string;
  className?: string;
}


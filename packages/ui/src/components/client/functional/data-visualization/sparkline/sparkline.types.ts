/**
 * Sparkline Types - Layer 3 Functional Component
 * @module SparklineTypes
 * @layer 3
 * @category data-visualization
 * @library recharts
 */

export type SparklineVariant = "line" | "area" | "bar";

export interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  variant?: SparklineVariant;
  color?: string;
  showReference?: boolean;
  referenceValue?: number;
  ariaLabel?: string;
  testId?: string;
  className?: string;
}


/**
 * PieChart Types - Layer 3 Functional Component
 * @module PieChartTypes
 * @layer 3
 * @category data-visualization
 * @library recharts
 */

export type PieChartSize = "sm" | "md" | "lg";
export type PieChartVariant = "default" | "donut";

export interface PieDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface PieChartProps {
  data: PieDataPoint[];
  dataKey?: string;
  nameKey?: string;
  width?: number | string;
  height?: number;
  size?: PieChartSize;
  variant?: PieChartVariant;
  innerRadius?: number;
  outerRadius?: number;
  showTooltip?: boolean;
  showLegend?: boolean;
  showLabels?: boolean;
  title?: string;
  description?: string;
  testId?: string;
  className?: string;
}


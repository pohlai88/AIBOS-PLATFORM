/**
 * AreaChart Types - Layer 3 Functional Component
 * @module AreaChartTypes
 * @layer 3
 * @category data-visualization
 * @library recharts
 */

export type AreaChartSize = "sm" | "md" | "lg";
export type AreaChartVariant = "default" | "stacked" | "gradient";

export interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface AreaConfig {
  dataKey: string;
  name?: string;
  fill?: string;
  stroke?: string;
  fillOpacity?: number;
}

export interface AreaChartProps {
  data: DataPoint[];
  areas?: AreaConfig[];
  dataKey?: string;
  xAxisKey?: string;
  width?: number | string;
  height?: number;
  size?: AreaChartSize;
  variant?: AreaChartVariant;
  showGrid?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  showTooltip?: boolean;
  showLegend?: boolean;
  title?: string;
  description?: string;
  testId?: string;
  className?: string;
}


/**
 * BarChart Types - Layer 3 Functional Component
 * @module BarChartTypes
 * @layer 3
 * @category data-visualization
 * @library recharts
 */

export type BarChartSize = "sm" | "md" | "lg";
export type BarChartVariant = "default" | "stacked" | "grouped";
export type BarChartLayout = "horizontal" | "vertical";

export interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface BarConfig {
  dataKey: string;
  name?: string;
  fill?: string;
  radius?: number | [number, number, number, number];
}

export interface BarChartProps {
  /**
   * Data array for the chart
   */
  data: DataPoint[];

  /**
   * Bar configurations (multiple bars supported)
   */
  bars?: BarConfig[];

  /**
   * Single data key (shorthand for single bar)
   */
  dataKey?: string;

  /**
   * X-axis data key
   * @default 'name'
   */
  xAxisKey?: string;

  /**
   * Chart layout
   * @default 'horizontal'
   */
  layout?: BarChartLayout;

  /**
   * Chart width
   */
  width?: number | string;

  /**
   * Chart height
   * @default 300
   */
  height?: number;

  /**
   * Size variant
   * @default 'md'
   */
  size?: BarChartSize;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: BarChartVariant;

  /**
   * Show grid lines
   * @default true
   */
  showGrid?: boolean;

  /**
   * Show X axis
   * @default true
   */
  showXAxis?: boolean;

  /**
   * Show Y axis
   * @default true
   */
  showYAxis?: boolean;

  /**
   * Show tooltip on hover
   * @default true
   */
  showTooltip?: boolean;

  /**
   * Show legend
   * @default false
   */
  showLegend?: boolean;

  /**
   * Bar radius
   * @default 4
   */
  barRadius?: number;

  /**
   * Chart title for accessibility
   */
  title?: string;

  /**
   * Chart description for accessibility
   */
  description?: string;

  /**
   * Test ID
   */
  testId?: string;

  /**
   * Additional class name
   */
  className?: string;
}


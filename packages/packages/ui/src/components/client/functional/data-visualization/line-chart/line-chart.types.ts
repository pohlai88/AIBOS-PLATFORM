/**
 * LineChart Types - Layer 3 Functional Component
 * @module LineChartTypes
 * @layer 3
 * @category data-visualization
 * @library recharts
 */

export type LineChartSize = "sm" | "md" | "lg";
export type LineChartVariant = "default" | "gradient" | "area";

export interface DataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface LineConfig {
  dataKey: string;
  name?: string;
  stroke?: string;
  strokeWidth?: number;
  dot?: boolean;
  activeDot?: boolean;
}

export interface LineChartProps {
  /**
   * Data array for the chart
   */
  data: DataPoint[];

  /**
   * Line configurations (multiple lines supported)
   */
  lines?: LineConfig[];

  /**
   * Single data key (shorthand for single line)
   */
  dataKey?: string;

  /**
   * X-axis data key
   * @default 'name'
   */
  xAxisKey?: string;

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
  size?: LineChartSize;

  /**
   * Visual variant
   * @default 'default'
   */
  variant?: LineChartVariant;

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


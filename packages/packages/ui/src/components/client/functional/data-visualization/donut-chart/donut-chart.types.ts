/**
 * DonutChart Types - Layer 3 Functional Component
 * @layer 3
 * @category data-visualization
 */

export interface DonutChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface DonutChartProps {
  data: DonutChartDataPoint[];
  width?: number | string;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  centerLabel?: string;
  centerValue?: string | number;
  title?: string;
  testId?: string;
  className?: string;
}


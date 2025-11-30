/**
 * RadarChart Types - Layer 3 Functional Component
 * @layer 3
 * @category data-visualization
 */

export interface RadarChartDataPoint {
  subject: string;
  value: number;
  fullMark?: number;
  [key: string]: string | number | undefined;
}

export interface RadarChartProps {
  data: RadarChartDataPoint[];
  dataKeys?: string[];
  width?: number | string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  title?: string;
  testId?: string;
  className?: string;
}


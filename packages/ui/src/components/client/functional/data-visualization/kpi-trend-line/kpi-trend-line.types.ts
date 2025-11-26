/**
 * KPITrendLine Types - Layer 3 Functional Component
 * @layer 3
 * @category data-visualization
 */

export type TrendDirection = "up" | "down" | "neutral";

export interface KPITrendLineProps {
  label: string;
  value: string | number;
  previousValue?: string | number;
  trend?: TrendDirection;
  trendPercent?: number;
  data?: number[];
  sparklineColor?: string;
  testId?: string;
  className?: string;
}


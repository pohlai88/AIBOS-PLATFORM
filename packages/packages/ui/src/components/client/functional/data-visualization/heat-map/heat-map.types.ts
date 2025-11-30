/**
 * HeatMap Types - Layer 3 Functional Component
 * @layer 3
 * @category data-visualization
 */

export interface HeatMapCell {
  x: string | number;
  y: string | number;
  value: number;
}

export interface HeatMapProps {
  data: HeatMapCell[];
  xLabels?: string[];
  yLabels?: string[];
  minValue?: number;
  maxValue?: number;
  colorScale?: string[];
  showValues?: boolean;
  cellSize?: number;
  title?: string;
  testId?: string;
  className?: string;
}


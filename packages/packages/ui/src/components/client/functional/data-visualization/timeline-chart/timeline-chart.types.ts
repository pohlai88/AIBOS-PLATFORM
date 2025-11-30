/**
 * TimelineChart Types - Layer 3 Functional Component
 * @layer 3
 * @category data-visualization
 */

export interface TimelineEvent {
  id: string;
  label: string;
  start: Date;
  end?: Date;
  color?: string;
  group?: string;
}

export interface TimelineChartProps {
  events: TimelineEvent[];
  startDate?: Date;
  endDate?: Date;
  onEventClick?: (event: TimelineEvent) => void;
  showLabels?: boolean;
  height?: number;
  testId?: string;
  className?: string;
}


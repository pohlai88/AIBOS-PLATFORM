/**
 * Scheduler Types - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

export interface SchedulerResource {
  id: string;
  name: string;
  avatar?: string;
}

export interface SchedulerEvent {
  id: string;
  resourceId: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

export interface SchedulerProps {
  resources: SchedulerResource[];
  events: SchedulerEvent[];
  date: Date;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: SchedulerEvent) => void;
  onSlotClick?: (resourceId: string, start: Date, end: Date) => void;
  hourStart?: number;
  hourEnd?: number;
  testId?: string;
  className?: string;
}


/**
 * Calendar Types - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  color?: string;
  data?: Record<string, unknown>;
}

export type CalendarView = "month" | "week" | "day" | "agenda";

export interface CalendarProps {
  events: CalendarEvent[];
  view: CalendarView;
  date: Date;
  onViewChange?: (view: CalendarView) => void;
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onSlotClick?: (start: Date, end: Date) => void;
  testId?: string;
  className?: string;
}


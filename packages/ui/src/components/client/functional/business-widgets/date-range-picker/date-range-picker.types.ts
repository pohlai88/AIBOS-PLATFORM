/**
 * DateRangePicker Types - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  maxDate?: Date;
  presets?: { label: string; range: DateRange }[];
  placeholder?: string;
  testId?: string;
  className?: string;
}


/**
 * DatePicker Types - Layer 3 Functional Component
 * @module DatePickerTypes
 * @layer 3
 * @category business-widgets
 */

export type DatePickerSize = "sm" | "md" | "lg";

export interface DatePickerProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  placeholder?: string;
  size?: DatePickerSize;
  format?: string;
  clearable?: boolean;
  testId?: string;
  className?: string;
  "aria-label"?: string;
}


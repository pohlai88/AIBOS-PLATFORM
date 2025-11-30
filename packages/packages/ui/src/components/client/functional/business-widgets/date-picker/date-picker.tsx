/**
 * DatePicker Component - Layer 3 Functional Component
 * @module DatePicker
 * @layer 3
 * @category business-widgets
 */

"use client";

import { CalendarIcon, XMarkIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { DatePickerProps } from "./date-picker.types";

const datePickerVariants = {
  base: ["relative", "inline-block", "mcp-functional-component"].join(" "),
  input: [
    "flex items-center gap-2",
    "border",
    colorTokens.border,
    colorTokens.bgElevated,
    radiusTokens.md,
    "transition-colors",
    "focus-within:ring-2 focus-within:ring-primary",
  ].join(" "),
  sizes: {
    sm: { input: "h-8 px-2 text-xs", icon: "h-3.5 w-3.5" },
    md: { input: "h-10 px-3 text-sm", icon: "h-4 w-4" },
    lg: { input: "h-12 px-4 text-base", icon: "h-5 w-5" },
  },
};

const formatDate = (date: Date, format: string = "yyyy-MM-dd"): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return format
    .replace("yyyy", String(year))
    .replace("MM", month)
    .replace("dd", day);
};

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  placeholder = "Select date",
  size = "md",
  format = "yyyy-MM-dd",
  clearable = true,
  testId,
  className,
  "aria-label": ariaLabel,
}: DatePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const sizeConfig = datePickerVariants.sizes[size];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const newDate = new Date(dateValue);
      if (!isNaN(newDate.getTime())) {
        if (minDate && newDate < minDate) return;
        if (maxDate && newDate > maxDate) return;
        onChange?.(newDate);
      }
    } else {
      onChange?.(null);
    }
  };

  const handleClear = () => {
    onChange?.(null);
    inputRef.current?.focus();
  };

  const inputValue = value ? formatDate(value, "yyyy-MM-dd") : "";

  return (
    <div
      className={cn(datePickerVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      <div
        className={cn(
          datePickerVariants.input,
          sizeConfig.input,
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <CalendarIcon className={cn(sizeConfig.icon, colorTokens.fgMuted)} />
        <input
          ref={inputRef}
          type="date"
          value={inputValue}
          onChange={handleInputChange}
          disabled={disabled}
          min={minDate ? formatDate(minDate, "yyyy-MM-dd") : undefined}
          max={maxDate ? formatDate(maxDate, "yyyy-MM-dd") : undefined}
          aria-label={ariaLabel || "Date picker"}
          placeholder={placeholder}
          className={cn(
            "flex-1 bg-transparent outline-none",
            colorTokens.fg,
            "placeholder:text-muted-foreground",
            disabled && "cursor-not-allowed"
          )}
        />
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear date"
            className="p-0.5 hover:bg-muted rounded"
          >
            <XMarkIcon className={sizeConfig.icon} />
          </button>
        )}
      </div>
    </div>
  );
}

DatePicker.displayName = "DatePicker";

export { datePickerVariants };
export type { DatePickerProps, DatePickerSize } from "./date-picker.types";
export default DatePicker;


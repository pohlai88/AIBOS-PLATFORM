/**
 * DateRangePicker Component - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

"use client";

import { CalendarIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { DateRangePickerProps, DateRange } from "./date-range-picker.types";

const dateRangeVariants = {
  base: ["relative", "mcp-functional-component"].join(" "),
  trigger: ["flex items-center gap-2 px-3 py-2 w-full", colorTokens.bgMuted, radiusTokens.md, "border", colorTokens.border, "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
  dropdown: ["absolute z-10 mt-1 p-4", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "shadow-lg"].join(" "),
};

const formatDate = (date: Date | null) => date?.toLocaleDateString() || "";

export function DateRangePicker({
  value,
  onChange,
  minDate,
  maxDate,
  presets = [],
  placeholder = "Select date range",
  testId,
  className,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  const displayValue = value.start && value.end
    ? `${formatDate(value.start)} - ${formatDate(value.end)}`
    : value.start
    ? `${formatDate(value.start)} - ...`
    : placeholder;

  return (
    <div
      className={cn(dateRangeVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={dateRangeVariants.trigger}
      >
        <CalendarIcon className="h-5 w-5" aria-hidden="true" />
        <span className={cn("flex-1 text-left text-sm", !value.start && colorTokens.fgMuted)}>{displayValue}</span>
      </button>

      {open && (
        <div role="dialog" aria-label="Date range picker" className={dateRangeVariants.dropdown}>
          {presets.length > 0 && (
            <div className="mb-4 space-y-1">
              <span className={cn("text-xs", colorTokens.fgMuted)}>Presets</span>
              {presets.map((preset, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => { onChange(preset.range); setOpen(false); }}
                  className={cn("block w-full text-left px-2 py-1 text-sm", radiusTokens.md, "hover:bg-muted")}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={cn("text-xs", colorTokens.fgMuted)}>Start Date</label>
              <input
                type="date"
                value={value.start?.toISOString().split("T")[0] || ""}
                min={minDate?.toISOString().split("T")[0]}
                max={maxDate?.toISOString().split("T")[0]}
                onChange={(e) => onChange({ ...value, start: e.target.value ? new Date(e.target.value) : null })}
                className={cn("w-full mt-1 px-2 py-1", colorTokens.bgMuted, radiusTokens.md)}
              />
            </div>
            <div>
              <label className={cn("text-xs", colorTokens.fgMuted)}>End Date</label>
              <input
                type="date"
                value={value.end?.toISOString().split("T")[0] || ""}
                min={value.start?.toISOString().split("T")[0] || minDate?.toISOString().split("T")[0]}
                max={maxDate?.toISOString().split("T")[0]}
                onChange={(e) => onChange({ ...value, end: e.target.value ? new Date(e.target.value) : null })}
                className={cn("w-full mt-1 px-2 py-1", colorTokens.bgMuted, radiusTokens.md)}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className={cn("mt-4 w-full py-2 text-sm bg-primary text-primary-foreground", radiusTokens.md)}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

DateRangePicker.displayName = "DateRangePicker";
export { dateRangeVariants };
export type { DateRangePickerProps, DateRange } from "./date-range-picker.types";
export default DateRangePicker;


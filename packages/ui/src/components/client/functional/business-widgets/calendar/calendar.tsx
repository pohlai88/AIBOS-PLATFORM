/**
 * Calendar Component - Layer 3 Functional Component
 * Placeholder for react-big-calendar/fullcalendar integration
 * @layer 3
 * @category business-widgets
 */

"use client";

import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { CalendarProps, CalendarView, CalendarEvent } from "./calendar.types";

const calendarVariants = {
  base: ["flex flex-col", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "mcp-functional-component"].join(" "),
  header: ["flex items-center justify-between p-4 border-b", colorTokens.border].join(" "),
  nav: ["flex items-center gap-2"].join(" "),
  viewSelector: ["flex items-center gap-1 p-1", colorTokens.bgMuted, radiusTokens.md].join(" "),
  viewBtn: ["px-3 py-1.5 text-sm", radiusTokens.md].join(" "),
  grid: ["flex-1 p-4"].join(" "),
  weekdays: ["grid grid-cols-7 text-center text-xs font-medium mb-2", colorTokens.fgMuted].join(" "),
  days: ["grid grid-cols-7 gap-1"].join(" "),
  day: ["aspect-square p-1 text-sm", radiusTokens.md, "hover:bg-muted cursor-pointer", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
  event: ["text-xs truncate px-1 py-0.5 mt-0.5", radiusTokens.sm].join(" "),
};

const views: CalendarView[] = ["month", "week", "day", "agenda"];
const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function Calendar({
  events,
  view,
  date,
  onViewChange,
  onDateChange,
  onEventClick,
  onSlotClick,
  testId,
  className,
}: CalendarProps) {
  const month = date.getMonth();
  const year = date.getFullYear();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from({ length: 42 }, (_, i) => {
    const day = i - firstDay + 1;
    if (day < 1 || day > daysInMonth) return null;
    return day;
  });

  const getEventsForDay = (day: number) =>
    events.filter((e) => {
      const eventDate = new Date(e.start);
      return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year;
    });

  const navigateMonth = (delta: number) => {
    onDateChange?.(new Date(year, month + delta, 1));
  };

  return (
    <div
      className={cn(calendarVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className={calendarVariants.header}>
        <div className={calendarVariants.nav}>
          <button type="button" onClick={() => navigateMonth(-1)} aria-label="Previous month" className={cn("p-1", radiusTokens.md, "hover:bg-muted")}>
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="font-semibold min-w-32 text-center">
            {date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </span>
          <button type="button" onClick={() => navigateMonth(1)} aria-label="Next month" className={cn("p-1", radiusTokens.md, "hover:bg-muted")}>
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <div className={calendarVariants.viewSelector}>
          {views.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onViewChange?.(v)}
              className={cn(calendarVariants.viewBtn, view === v ? "bg-background shadow-sm" : "")}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className={calendarVariants.grid} role="grid" aria-label="Calendar">
        <div className={calendarVariants.weekdays} role="row">
          {weekdays.map((d) => <div key={d} role="columnheader">{d}</div>)}
        </div>
        <div className={calendarVariants.days}>
          {days.map((day, i) => (
            <button
              key={i}
              type="button"
              role="gridcell"
              disabled={!day}
              onClick={() => day && onSlotClick?.(new Date(year, month, day), new Date(year, month, day, 23, 59))}
              className={cn(calendarVariants.day, !day && "invisible", day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear() && "bg-primary/10 font-bold")}
              aria-label={day ? `${date.toLocaleDateString("en-US", { month: "long" })} ${day}` : undefined}
            >
              {day}
              {day && getEventsForDay(day).slice(0, 2).map((evt) => (
                <button
                  key={evt.id}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onEventClick?.(evt); }}
                  className={calendarVariants.event}
                  style={{ backgroundColor: evt.color || "var(--color-primary)", color: "white" }}
                  aria-label={`Event: ${evt.title}`}
                >
                  {evt.title}
                </button>
              ))}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";
export { calendarVariants };
export type { CalendarProps, CalendarEvent, CalendarView } from "./calendar.types";
export default Calendar;


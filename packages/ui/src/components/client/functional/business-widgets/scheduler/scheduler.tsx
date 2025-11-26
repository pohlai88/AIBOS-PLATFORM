/**
 * Scheduler Component - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { SchedulerProps, SchedulerEvent } from "./scheduler.types";

const schedulerVariants = {
  base: ["flex flex-col", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "overflow-hidden", "mcp-functional-component"].join(" "),
  header: ["flex items-center justify-between p-4 border-b", colorTokens.border].join(" "),
  grid: ["flex-1 overflow-auto"].join(" "),
  row: ["flex border-b", colorTokens.border].join(" "),
  resourceCell: ["w-48 shrink-0 p-3 border-r", colorTokens.border, colorTokens.bgMuted].join(" "),
  timeCell: ["flex-1 h-16 border-r", colorTokens.border, "hover:bg-muted/50 cursor-pointer"].join(" "),
  event: ["absolute text-xs p-1 truncate", radiusTokens.sm, "cursor-pointer"].join(" "),
};

export function Scheduler({
  resources,
  events,
  date,
  onDateChange,
  onEventClick,
  onSlotClick,
  hourStart = 8,
  hourEnd = 18,
  testId,
  className,
}: SchedulerProps) {
  const hours = Array.from({ length: hourEnd - hourStart }, (_, i) => hourStart + i);

  const getEventsForResource = (resourceId: string) =>
    events.filter((e) => {
      const eventDate = new Date(e.start);
      return e.resourceId === resourceId &&
        eventDate.toDateString() === date.toDateString();
    });

  const navigateDay = (delta: number) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + delta);
    onDateChange?.(newDate);
  };

  return (
    <div
      className={cn(schedulerVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className={schedulerVariants.header}>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => navigateDay(-1)} aria-label="Previous day" className={cn("p-1", radiusTokens.md, "hover:bg-muted")}>
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="font-semibold min-w-48 text-center">
            {date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </span>
          <button type="button" onClick={() => navigateDay(1)} aria-label="Next day" className={cn("p-1", radiusTokens.md, "hover:bg-muted")}>
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDateChange?.(new Date())}
          className={cn("px-3 py-1.5 text-sm", radiusTokens.md, "border", colorTokens.border, "hover:bg-muted")}
        >
          Today
        </button>
      </div>

      <div className={schedulerVariants.grid} role="grid" aria-label="Schedule">
        {/* Header row */}
        <div className={schedulerVariants.row}>
          <div className={schedulerVariants.resourceCell} />
          {hours.map((h) => (
            <div key={h} className={cn(schedulerVariants.timeCell, "flex items-end justify-center pb-1 text-xs", colorTokens.fgMuted)}>
              {h}:00
            </div>
          ))}
        </div>

        {/* Resource rows */}
        {resources.map((resource) => (
          <div key={resource.id} className={cn(schedulerVariants.row, "relative")}>
            <div className={schedulerVariants.resourceCell}>
              <div className="flex items-center gap-2">
                {resource.avatar && (
                  <img src={resource.avatar} alt="" className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm font-medium">{resource.name}</span>
              </div>
            </div>
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => onSlotClick?.(resource.id, new Date(date.setHours(h)), new Date(date.setHours(h + 1)))}
                className={schedulerVariants.timeCell}
                aria-label={`${resource.name} at ${h}:00`}
              />
            ))}
            {/* Events overlay */}
            {getEventsForResource(resource.id).map((evt) => {
              const startHour = new Date(evt.start).getHours();
              const endHour = new Date(evt.end).getHours();
              const left = ((startHour - hourStart) / hours.length) * 100;
              const width = ((endHour - startHour) / hours.length) * 100;
              return (
                <button
                  key={evt.id}
                  type="button"
                  onClick={() => onEventClick?.(evt)}
                  className={schedulerVariants.event}
                  style={{
                    left: `calc(12rem + ${left}%)`,
                    width: `${width}%`,
                    top: "0.25rem",
                    backgroundColor: evt.color || "var(--color-primary)",
                    color: "white",
                  }}
                >
                  {evt.title}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

Scheduler.displayName = "Scheduler";
export { schedulerVariants };
export type { SchedulerProps, SchedulerResource, SchedulerEvent } from "./scheduler.types";
export default Scheduler;


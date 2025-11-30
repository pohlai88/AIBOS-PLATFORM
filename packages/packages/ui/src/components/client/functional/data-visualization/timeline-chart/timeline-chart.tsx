/**
 * TimelineChart Component - Layer 3 Functional Component
 * @layer 3
 * @category data-visualization
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { TimelineChartProps } from "./timeline-chart.types";

const timelineVariants = {
  base: ["w-full overflow-x-auto", colorTokens.bgElevated, radiusTokens.lg, "p-4", "mcp-functional-component"].join(" "),
  bar: ["h-6 cursor-pointer hover:opacity-80", radiusTokens.sm].join(" "),
};

export function TimelineChart({
  events,
  startDate,
  endDate,
  onEventClick,
  showLabels = true,
  height = 200,
  testId,
  className,
}: TimelineChartProps) {
  const minDate = startDate || new Date(Math.min(...events.map((e) => e.start.getTime())));
  const maxDate = endDate || new Date(Math.max(...events.map((e) => (e.end || e.start).getTime())));
  const totalMs = maxDate.getTime() - minDate.getTime();

  const getPosition = (date: Date) => ((date.getTime() - minDate.getTime()) / totalMs) * 100;
  const getWidth = (start: Date, end?: Date) => {
    const endTime = end || new Date(start.getTime() + 86400000);
    return ((endTime.getTime() - start.getTime()) / totalMs) * 100;
  };

  const groups = [...new Set(events.map((e) => e.group || "default"))];

  return (
    <div
      role="figure"
      aria-label="Timeline chart"
      className={cn(timelineVariants.base, className)}
      style={{ minHeight: height }}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {groups.map((group, gi) => (
        <div key={group} className="mb-4">
          {group !== "default" && (
            <span className={cn("text-xs font-medium mb-1 block", colorTokens.fgMuted)}>{group}</span>
          )}
          <div className="relative h-8">
            {events
              .filter((e) => (e.group || "default") === group)
              .map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => onEventClick?.(event)}
                  className={cn(timelineVariants.bar, "absolute")}
                  style={{
                    left: `${getPosition(event.start)}%`,
                    width: `${Math.max(getWidth(event.start, event.end), 2)}%`,
                    backgroundColor: event.color || `hsl(${gi * 60}, 70%, 50%)`,
                  }}
                  title={event.label}
                  aria-label={`${event.label}: ${event.start.toLocaleDateString()}`}
                >
                  {showLabels && (
                    <span className="text-xs text-white px-1 truncate block">{event.label}</span>
                  )}
                </button>
              ))}
          </div>
        </div>
      ))}
      <div className={cn("flex justify-between text-xs mt-2", colorTokens.fgMuted)}>
        <span>{minDate.toLocaleDateString()}</span>
        <span>{maxDate.toLocaleDateString()}</span>
      </div>
    </div>
  );
}

TimelineChart.displayName = "TimelineChart";
export { timelineVariants };
export type { TimelineChartProps, TimelineEvent } from "./timeline-chart.types";
export default TimelineChart;


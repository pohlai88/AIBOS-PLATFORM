/**
 * Timeline Component - Layer 3 Functional Component
 * @module Timeline
 * @layer 3
 * @category workflow
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { TimelineProps, TimelineItem } from "./timeline.types";

const timelineVariants = {
  base: ["relative", "mcp-functional-component"].join(" "),
  sizes: {
    sm: { dot: "h-2 w-2", text: "text-xs", gap: "gap-2" },
    md: { dot: "h-3 w-3", text: "text-sm", gap: "gap-3" },
    lg: { dot: "h-4 w-4", text: "text-base", gap: "gap-4" },
  },
};

const statusColors: Record<string, string> = {
  pending: colorTokens.bgMuted,
  active: "bg-primary",
  completed: "bg-success",
  error: "bg-destructive",
};

export function Timeline({
  items,
  size = "md",
  variant = "default",
  showConnector = true,
  testId,
  className,
}: TimelineProps) {
  const sizeConfig = timelineVariants.sizes[size];

  const formatDate = (date?: string | Date) => {
    if (!date) return null;
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div
      role="list"
      aria-label="Timeline"
      className={cn(timelineVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const status = item.status || "pending";

        return (
          <div
            key={item.id}
            role="listitem"
            className={cn(
              "relative flex",
              sizeConfig.gap,
              variant === "alternating" && index % 2 !== 0 && "flex-row-reverse"
            )}
          >
            {/* Connector line */}
            {showConnector && !isLast && (
              <div
                className={cn(
                  "absolute left-[5px] top-4 w-0.5 h-full -translate-x-1/2",
                  colorTokens.bgMuted
                )}
                aria-hidden="true"
              />
            )}

            {/* Dot indicator */}
            <div className="relative z-10 flex-shrink-0">
              {item.icon || (
                <div
                  className={cn(
                    "rounded-full",
                    sizeConfig.dot,
                    statusColors[status]
                  )}
                  aria-hidden="true"
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("flex-1 pb-6", variant === "compact" && "pb-3")}>
              <div className="flex items-center justify-between">
                <h3 className={cn("font-medium", sizeConfig.text, colorTokens.fg)}>
                  {item.title}
                </h3>
                {item.date && (
                  <time
                    dateTime={
                      typeof item.date === "string"
                        ? item.date
                        : item.date.toISOString()
                    }
                    className={cn("text-xs", colorTokens.fgMuted)}
                  >
                    {formatDate(item.date)}
                  </time>
                )}
              </div>
              {item.description && (
                <p className={cn("mt-1", sizeConfig.text, colorTokens.fgMuted)}>
                  {item.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

Timeline.displayName = "Timeline";

export { timelineVariants };
export type { TimelineProps, TimelineItem } from "./timeline.types";
export default Timeline;


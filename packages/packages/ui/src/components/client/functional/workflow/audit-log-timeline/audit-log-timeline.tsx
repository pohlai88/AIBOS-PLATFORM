/**
 * AuditLogTimeline Component - Layer 3 Functional Component
 * @layer 3
 * @category workflow
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { AuditLogTimelineProps, AuditAction } from "./audit-log-timeline.types";

const auditVariants = {
  base: ["w-full", "mcp-functional-component"].join(" "),
  entry: ["flex gap-3 py-3"].join(" "),
};

const actionColors: Record<AuditAction, string> = {
  create: "bg-green-500",
  update: "bg-blue-500",
  delete: "bg-red-500",
  view: "bg-gray-400",
  login: "bg-purple-500",
  logout: "bg-orange-500",
  error: "bg-red-600",
};

const actionLabels: Record<AuditAction, string> = {
  create: "Created",
  update: "Updated",
  delete: "Deleted",
  view: "Viewed",
  login: "Logged in",
  logout: "Logged out",
  error: "Error",
};

const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

export function AuditLogTimeline({
  entries,
  onEntryClick,
  showMetadata = false,
  maxEntries,
  testId,
  className,
}: AuditLogTimelineProps) {
  const visibleEntries = maxEntries ? entries.slice(0, maxEntries) : entries;

  return (
    <div
      role="log"
      aria-label="Audit log timeline"
      className={cn(auditVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {visibleEntries.map((entry, i) => (
        <button
          key={entry.id}
          type="button"
          onClick={() => onEntryClick?.(entry)}
          className={cn(auditVariants.entry, "w-full text-left hover:bg-muted/50", radiusTokens.md)}
        >
          {/* Timeline indicator */}
          <div className="flex flex-col items-center">
            <div className={cn("h-3 w-3 rounded-full", actionColors[entry.action])} />
            {i < visibleEntries.length - 1 && <div className={cn("w-px flex-1 mt-1", colorTokens.bgMuted)} />}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded", colorTokens.bgMuted)}>
                {actionLabels[entry.action]}
              </span>
              <span className={cn("text-xs", colorTokens.fgMuted)}>{formatTime(entry.timestamp)}</span>
            </div>
            <p className={cn("text-sm mt-1", colorTokens.fg)}>{entry.description}</p>
            <p className={cn("text-xs mt-0.5", colorTokens.fgMuted)}>by {entry.user.name}</p>
            {showMetadata && entry.metadata && (
              <pre className={cn("text-xs mt-2 p-2 overflow-auto", colorTokens.bgMuted, radiusTokens.sm)}>
                {JSON.stringify(entry.metadata, null, 2)}
              </pre>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

AuditLogTimeline.displayName = "AuditLogTimeline";
export { auditVariants };
export type { AuditLogTimelineProps, AuditLogEntry, AuditAction } from "./audit-log-timeline.types";
export default AuditLogTimeline;


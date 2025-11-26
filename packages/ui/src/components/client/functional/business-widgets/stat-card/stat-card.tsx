/**
 * StatCard Component - Layer 3 Functional Component
 * @module StatCard
 * @layer 3
 * @category business-widgets
 */

"use client";

import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@heroicons/react/24/solid";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { StatCardProps, StatCardTrend } from "./stat-card.types";

const statCardVariants = {
  base: [
    "p-4",
    colorTokens.bgElevated,
    radiusTokens.lg,
    "border",
    colorTokens.border,
    "mcp-functional-component",
  ].join(" "),
  sizes: {
    sm: "p-3",
    md: "p-4",
    lg: "p-6",
  },
  valueSizes: {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  },
};

const trendIcons: Record<StatCardTrend, React.ElementType> = {
  up: ArrowUpIcon,
  down: ArrowDownIcon,
  neutral: MinusIcon,
};

const trendColors: Record<StatCardTrend, string> = {
  up: "text-green-500",
  down: "text-red-500",
  neutral: colorTokens.fgMuted,
};

export function StatCard({
  title,
  value,
  trend,
  trendValue,
  icon,
  description,
  size = "md",
  loading = false,
  testId,
  className,
}: StatCardProps) {
  const TrendIcon = trend ? trendIcons[trend] : null;

  return (
    <div
      role="article"
      aria-label={`${title}: ${value}`}
      className={cn(statCardVariants.base, statCardVariants.sizes[size], className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className={cn("h-4 w-24 rounded", colorTokens.bgMuted)} />
          <div className={cn("h-8 w-32 rounded", colorTokens.bgMuted)} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <span className={cn("text-sm font-medium", colorTokens.fgMuted)}>{title}</span>
            {icon && <span className={colorTokens.fgMuted}>{icon}</span>}
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={cn("font-bold", colorTokens.fg, statCardVariants.valueSizes[size])}>
              {value}
            </span>
            {trend && trendValue && TrendIcon && (
              <span className={cn("flex items-center text-sm", trendColors[trend])}>
                <TrendIcon className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{trend === "up" ? "Increased by" : trend === "down" ? "Decreased by" : ""}</span>
                {trendValue}
              </span>
            )}
          </div>
          {description && (
            <p className={cn("mt-1 text-sm", colorTokens.fgMuted)}>{description}</p>
          )}
        </>
      )}
    </div>
  );
}

StatCard.displayName = "StatCard";

export { statCardVariants };
export type { StatCardProps, StatCardTrend, StatCardSize } from "./stat-card.types";
export default StatCard;


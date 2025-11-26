/**
 * MetricDisplay Component - Layer 3 Functional Component
 * @module MetricDisplay
 * @layer 3
 * @category business-widgets
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { MetricDisplayProps, MetricFormat } from "./metric-display.types";

const metricVariants = {
  base: [
    "inline-flex flex-col",
    "mcp-functional-component",
  ].join(" "),
  progress: [
    "h-2 w-full mt-2",
    colorTokens.bgMuted,
    radiusTokens.full,
    "overflow-hidden",
  ].join(" "),
};

const formatValue = (
  value: number,
  format: MetricFormat,
  currency: string,
  locale: string,
  precision: number
): string => {
  switch (format) {
    case "currency":
      return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
    case "percentage":
      return new Intl.NumberFormat(locale, { style: "percent", minimumFractionDigits: precision }).format(value / 100);
    case "duration":
      const hours = Math.floor(value / 3600);
      const mins = Math.floor((value % 3600) / 60);
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    default:
      return new Intl.NumberFormat(locale, { maximumFractionDigits: precision }).format(value);
  }
};

export function MetricDisplay({
  label,
  value,
  format = "number",
  currency = "USD",
  locale = "en-US",
  precision = 0,
  target,
  showProgress = false,
  testId,
  className,
}: MetricDisplayProps) {
  const formattedValue = formatValue(value, format, currency, locale, precision);
  const progressPercent = target ? Math.min((value / target) * 100, 100) : 0;

  return (
    <div
      role="group"
      aria-label={`${label}: ${formattedValue}`}
      className={cn(metricVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      <span className={cn("text-sm", colorTokens.fgMuted)}>{label}</span>
      <span className={cn("text-2xl font-bold", colorTokens.fg)}>{formattedValue}</span>
      {showProgress && target && (
        <>
          <div
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={target}
            aria-label={`Progress: ${Math.round(progressPercent)}%`}
            className={metricVariants.progress}
          >
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className={cn("text-xs mt-1", colorTokens.fgMuted)}>
            {Math.round(progressPercent)}% of target
          </span>
        </>
      )}
    </div>
  );
}

MetricDisplay.displayName = "MetricDisplay";

export { metricVariants };
export type { MetricDisplayProps, MetricFormat } from "./metric-display.types";
export default MetricDisplay;


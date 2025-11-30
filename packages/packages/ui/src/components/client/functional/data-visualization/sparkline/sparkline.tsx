/**
 * Sparkline Component - Layer 3 Functional Component
 * @module Sparkline
 * @layer 3
 * @category data-visualization
 * @library recharts
 */

"use client";

import * as React from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { cn } from "../../../../../design/utilities/cn";

import type { SparklineProps } from "./sparkline.types";

export function Sparkline({
  data,
  width = 100,
  height = 24,
  variant = "line",
  color = "var(--color-primary)",
  showReference = false,
  referenceValue,
  ariaLabel = "Sparkline chart",
  testId,
  className,
}: SparklineProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  const refValue =
    referenceValue ?? data.reduce((a, b) => a + b, 0) / data.length;

  const commonProps = {
    data: chartData,
    margin: { top: 2, right: 2, bottom: 2, left: 2 },
  };

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={cn("inline-block", className)}
      style={{ width, height }}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
      data-library="recharts"
    >
      <ResponsiveContainer width="100%" height="100%">
        {variant === "line" ? (
          <LineChart {...commonProps}>
            {showReference && (
              <ReferenceLine
                y={refValue}
                stroke="var(--color-border)"
                strokeDasharray="2 2"
              />
            )}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        ) : variant === "area" ? (
          <AreaChart {...commonProps}>
            {showReference && (
              <ReferenceLine
                y={refValue}
                stroke="var(--color-border)"
                strokeDasharray="2 2"
              />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              fill={color}
              fillOpacity={0.2}
              strokeWidth={1.5}
            />
          </AreaChart>
        ) : (
          <BarChart {...commonProps}>
            {showReference && (
              <ReferenceLine
                y={refValue}
                stroke="var(--color-border)"
                strokeDasharray="2 2"
              />
            )}
            <Bar dataKey="value" fill={color} radius={[1, 1, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

Sparkline.displayName = "Sparkline";

export type { SparklineProps, SparklineVariant } from "./sparkline.types";
export default Sparkline;

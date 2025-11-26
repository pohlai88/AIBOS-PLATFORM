/**
 * PieChart Component - Layer 3 Functional Component
 * @module PieChart
 * @layer 3
 * @category data-visualization
 * @library recharts
 */

"use client";

import * as React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { PieChartProps } from "./pie-chart.types";

const pieChartVariants = {
  base: [
    "w-full",
    colorTokens.bgElevated,
    radiusTokens.lg,
    "p-4",
    "mcp-functional-component",
  ].join(" "),
  sizes: {
    sm: { height: 200, outerRadius: 60 },
    md: { height: 300, outerRadius: 90 },
    lg: { height: 400, outerRadius: 120 },
  },
};

const chartColors = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
  "var(--color-info)",
];

export function PieChart({
  data,
  dataKey = "value",
  nameKey = "name",
  width = "100%",
  height,
  size = "md",
  variant = "default",
  innerRadius,
  outerRadius,
  showTooltip = true,
  showLegend = true,
  showLabels = false,
  title,
  description,
  testId,
  className,
}: PieChartProps) {
  const sizeConfig = pieChartVariants.sizes[size];
  const chartHeight = height || sizeConfig.height;
  const outer = outerRadius || sizeConfig.outerRadius;
  const inner = innerRadius ?? (variant === "donut" ? outer * 0.6 : 0);

  return (
    <div
      role="figure"
      aria-label={title || "Pie chart"}
      aria-describedby={description ? `${testId}-desc` : undefined}
      className={cn(pieChartVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
      data-library="recharts"
    >
      {description && (
        <p id={`${testId}-desc`} className="sr-only">
          {description}
        </p>
      )}
      {title && (
        <h3 className={cn("text-sm font-medium mb-2", colorTokens.fg)}>
          {title}
        </h3>
      )}
      <ResponsiveContainer width={width as number | `${number}%`} height={chartHeight}>
        <RechartsPieChart>
          <Pie
            data={data as unknown as Record<string, unknown>[]}
            dataKey={dataKey}
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            innerRadius={inner}
            outerRadius={outer}
            label={showLabels}
            labelLine={showLabels}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill || chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
              }}
            />
          )}
          {showLegend && <Legend />}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

PieChart.displayName = "PieChart";

export { pieChartVariants };
export type { PieChartProps, PieDataPoint } from "./pie-chart.types";
export default PieChart;


/**
 * DonutChart Component - Layer 3 Functional Component
 * @layer 3
 * @category data-visualization
 */

"use client";

import * as React from "react";
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { DonutChartProps } from "./donut-chart.types";

const chartColors = [
  "var(--color-primary)",
  "var(--color-secondary)",
  "var(--color-success)",
  "var(--color-warning)",
  "var(--color-danger)",
];

const donutChartVariants = {
  base: [colorTokens.bgElevated, radiusTokens.lg, "p-4", "mcp-functional-component"].join(" "),
};

export function DonutChart({
  data,
  width = "100%",
  height = 300,
  innerRadius = 60,
  outerRadius = 80,
  showLabel = false,
  showLegend = true,
  showTooltip = true,
  centerLabel,
  centerValue,
  title,
  testId,
  className,
}: DonutChartProps) {
  return (
    <div
      role="figure"
      aria-label={title || "Donut chart"}
      className={cn(donutChartVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {title && <h3 className={cn("text-sm font-medium mb-2", colorTokens.fg)}>{title}</h3>}
      <ResponsiveContainer width={width as number | `${number}%`} height={height}>
        <RechartsPieChart>
          <Pie
            data={data as unknown as Record<string, unknown>[]}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            dataKey="value"
            label={showLabel}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={entry.fill || chartColors[index % chartColors.length]} />
            ))}
          </Pie>
          {showTooltip && (
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
              }}
            />
          )}
          {showLegend && <Legend />}
          {(centerLabel || centerValue) && (
            <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
              {centerValue && <tspan className="text-2xl font-bold">{centerValue}</tspan>}
              {centerLabel && (
                <tspan x="50%" dy="1.2em" className="text-sm" fill="var(--color-text-muted)">
                  {centerLabel}
                </tspan>
              )}
            </text>
          )}
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

DonutChart.displayName = "DonutChart";
export { donutChartVariants };
export type { DonutChartProps, DonutChartDataPoint } from "./donut-chart.types";
export default DonutChart;


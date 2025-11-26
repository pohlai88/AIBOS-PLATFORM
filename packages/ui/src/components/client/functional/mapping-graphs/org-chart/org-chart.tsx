/**
 * OrgChart Component - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { OrgChartProps, OrgNode } from "./org-chart.types";

const orgChartVariants = {
  base: ["flex justify-center p-4", "mcp-functional-component"].join(" "),
  node: [
    "flex flex-col items-center p-3 min-w-[120px]",
    colorTokens.bgElevated,
    radiusTokens.lg,
    "border",
    colorTokens.border,
    "shadow-sm cursor-pointer",
    "hover:shadow-md transition-shadow",
    "focus-visible:outline-2 focus-visible:outline-primary",
  ].join(" "),
  connector: ["w-px h-6", colorTokens.bgMuted].join(" "),
  horizontalLine: ["h-px flex-1", colorTokens.bgMuted].join(" "),
};

function OrgNodeComponent({
  node,
  onNodeClick,
  isRoot,
}: {
  node: OrgNode;
  onNodeClick?: (node: OrgNode) => void;
  isRoot?: boolean;
}) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="flex flex-col items-center">
      {!isRoot && <div className={orgChartVariants.connector} aria-hidden="true" />}
      <button
        type="button"
        onClick={() => onNodeClick?.(node)}
        className={orgChartVariants.node}
      >
        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold", colorTokens.bgMuted)}>
          {node.avatar ? (
            <img src={node.avatar} alt="" className="h-full w-full rounded-full object-cover" />
          ) : (
            node.name.charAt(0).toUpperCase()
          )}
        </div>
        <span className={cn("font-medium text-sm mt-2", colorTokens.fg)}>{node.name}</span>
        {node.title && <span className={cn("text-xs", colorTokens.fgMuted)}>{node.title}</span>}
      </button>
      {hasChildren && (
        <>
          <div className={orgChartVariants.connector} aria-hidden="true" />
          <div className="flex items-start">
            {node.children!.map((child, i) => (
              <React.Fragment key={child.id}>
                {i > 0 && <div className={orgChartVariants.horizontalLine} aria-hidden="true" />}
                <OrgNodeComponent node={child} onNodeClick={onNodeClick} />
              </React.Fragment>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function OrgChart({ data, onNodeClick, testId, className }: OrgChartProps) {
  return (
    <div
      role="tree"
      aria-label="Organization chart"
      className={cn(orgChartVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <OrgNodeComponent node={data} onNodeClick={onNodeClick} isRoot />
    </div>
  );
}

OrgChart.displayName = "OrgChart";
export { orgChartVariants };
export type { OrgChartProps, OrgNode } from "./org-chart.types";
export default OrgChart;


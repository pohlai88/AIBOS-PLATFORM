/**
 * Mindmap Component - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { MindmapProps, MindmapNode } from "./mindmap.types";

const mindmapVariants = {
  base: ["flex items-center justify-center p-6 overflow-auto", colorTokens.bgMuted, radiusTokens.lg, "mcp-functional-component"].join(" "),
  node: [
    "px-4 py-2",
    colorTokens.bgElevated,
    radiusTokens.lg,
    "shadow-sm cursor-pointer",
    "hover:shadow-md transition-shadow",
    "focus-visible:outline-2 focus-visible:outline-primary",
  ].join(" "),
};

function MindmapBranch({
  node,
  onNodeClick,
  isRoot,
}: {
  node: MindmapNode;
  onNodeClick?: (node: MindmapNode) => void;
  isRoot?: boolean;
}) {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className={cn("flex items-center", isRoot ? "flex-col" : "")}>
      <button
        type="button"
        onClick={() => onNodeClick?.(node)}
        className={mindmapVariants.node}
        style={{ borderLeft: node.color ? `4px solid ${node.color}` : undefined }}
      >
        <span className={cn("text-sm font-medium", colorTokens.fg)}>{node.label}</span>
      </button>

      {hasChildren && (
        <div className={cn("flex", isRoot ? "flex-row gap-8 mt-6" : "flex-col gap-2 ml-6")}>
          {!isRoot && <div className={cn("w-6 h-px self-center", colorTokens.bgMuted)} aria-hidden="true" />}
          <div className={cn("flex", isRoot ? "gap-8" : "flex-col gap-3")}>
            {node.children!.map((child) => (
              <div key={child.id} className="flex items-center">
                {!isRoot && <div className={cn("w-4 h-px", colorTokens.bgMuted)} aria-hidden="true" />}
                <MindmapBranch node={child} onNodeClick={onNodeClick} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Mindmap({ data, onNodeClick, testId, className }: MindmapProps) {
  return (
    <div
      role="tree"
      aria-label="Mind map"
      className={cn(mindmapVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <MindmapBranch node={data} onNodeClick={onNodeClick} isRoot />
    </div>
  );
}

Mindmap.displayName = "Mindmap";
export { mindmapVariants };
export type { MindmapProps, MindmapNode } from "./mindmap.types";
export default Mindmap;


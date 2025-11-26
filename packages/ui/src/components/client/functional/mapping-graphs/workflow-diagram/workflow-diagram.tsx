/**
 * WorkflowDiagram Component - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { WorkflowDiagramProps, WorkflowNode, WorkflowNodeType } from "./workflow-diagram.types";

const workflowVariants = {
  base: ["relative w-full h-96 overflow-auto", colorTokens.bgMuted, radiusTokens.lg, "border", colorTokens.border, "mcp-functional-component"].join(" "),
  node: {
    base: ["absolute flex items-center justify-center text-sm cursor-pointer", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
    start: ["w-12 h-12 rounded-full bg-green-500 text-white"].join(" "),
    end: ["w-12 h-12 rounded-full bg-red-500 text-white"].join(" "),
    action: [colorTokens.bgElevated, "border", colorTokens.border, radiusTokens.md, "px-4 py-2 shadow-sm"].join(" "),
    decision: [colorTokens.bgElevated, "border", colorTokens.border, "w-24 h-24 rotate-45 shadow-sm"].join(" "),
    subprocess: [colorTokens.bgElevated, "border-2 border-dashed", colorTokens.border, radiusTokens.md, "px-4 py-2"].join(" "),
  },
};

const getNodeStyle = (type: WorkflowNodeType) => workflowVariants.node[type] || workflowVariants.node.action;

export function WorkflowDiagram({
  nodes,
  edges,
  onNodeClick,
  testId,
  className,
}: WorkflowDiagramProps) {
  return (
    <div
      role="img"
      aria-label="Workflow diagram"
      className={cn(workflowVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {edges.map((edge) => {
          const source = nodes.find((n) => n.id === edge.source);
          const target = nodes.find((n) => n.id === edge.target);
          if (!source || !target) return null;
          return (
            <g key={edge.id}>
              <line
                x1={source.position.x + 48}
                y1={source.position.y + 24}
                x2={target.position.x + 48}
                y2={target.position.y + 24}
                stroke="var(--color-border)"
                strokeWidth={2}
                markerEnd="url(#workflow-arrow)"
              />
              {edge.label && (
                <text
                  x={(source.position.x + target.position.x) / 2 + 48}
                  y={(source.position.y + target.position.y) / 2 + 24}
                  className="text-xs fill-muted-foreground"
                  textAnchor="middle"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
        <defs>
          <marker id="workflow-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="var(--color-border)" />
          </marker>
        </defs>
      </svg>
      {nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          onClick={() => onNodeClick?.(node)}
          className={cn(workflowVariants.node.base, getNodeStyle(node.type))}
          style={{ left: node.position.x, top: node.position.y }}
        >
          <span className={node.type === "decision" ? "-rotate-45" : ""}>{node.label}</span>
        </button>
      ))}
    </div>
  );
}

WorkflowDiagram.displayName = "WorkflowDiagram";
export { workflowVariants };
export type { WorkflowDiagramProps, WorkflowNode, WorkflowNodeType, WorkflowEdge } from "./workflow-diagram.types";
export default WorkflowDiagram;


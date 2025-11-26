/**
 * FlowBuilder Component - Layer 3 Functional Component
 * @module FlowBuilder
 * @layer 3
 * @category mapping-graphs
 * @description Simple flow diagram builder (for complex needs, use React Flow)
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { FlowBuilderProps, FlowNode, FlowEdge } from "./flow-builder.types";

const flowVariants = {
  base: ["relative w-full h-96 overflow-auto", colorTokens.bgMuted, radiusTokens.lg, "mcp-functional-component"].join(" "),
  node: {
    base: [
      "absolute flex items-center justify-center",
      "px-4 py-2 min-w-[100px]",
      colorTokens.bgElevated,
      "shadow-md cursor-pointer",
      "focus-visible:outline-2 focus-visible:outline-primary",
    ].join(" "),
    start: "rounded-full bg-green-500 text-white",
    end: "rounded-full bg-red-500 text-white",
    action: cn(radiusTokens.md, "border-2 border-blue-500"),
    decision: "rotate-45 bg-yellow-100 border-2 border-yellow-500",
    process: cn(radiusTokens.md, "border-2 border-gray-400"),
  },
};

const nodeShapes: Record<FlowNode["type"], string> = {
  start: flowVariants.node.start,
  end: flowVariants.node.end,
  action: flowVariants.node.action,
  decision: flowVariants.node.decision,
  process: flowVariants.node.process,
};

export function FlowBuilder({
  nodes,
  edges,
  onNodeClick,
  onNodeMove,
  onEdgeClick,
  readonly = false,
  testId,
  className,
}: FlowBuilderProps) {
  const svgRef = React.useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = React.useState<string | null>(null);

  const handleMouseDown = (nodeId: string) => {
    if (!readonly) setDragging(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onNodeMove?.(dragging, x, y);
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const getNodeCenter = (node: FlowNode) => ({
    x: node.x + 50,
    y: node.y + 20,
  });

  return (
    <div
      role="application"
      aria-label="Flow diagram builder"
      className={cn(flowVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Edges */}
        {edges.map((edge) => {
          const source = nodes.find((n) => n.id === edge.source);
          const target = nodes.find((n) => n.id === edge.target);
          if (!source || !target) return null;
          const s = getNodeCenter(source);
          const t = getNodeCenter(target);
          return (
            <g key={edge.id}>
              <line
                x1={s.x}
                y1={s.y}
                x2={t.x}
                y2={t.y}
                stroke="var(--color-border)"
                strokeWidth={2}
                markerEnd="url(#arrowhead)"
                className="cursor-pointer hover:stroke-primary"
                role="button"
                tabIndex={0}
                aria-label={`Edge from ${source.label} to ${target.label}`}
                onClick={() => onEdgeClick?.(edge)}
                onKeyDown={(e) => e.key === "Enter" && onEdgeClick?.(edge)}
              />
              {edge.label && (
                <text
                  x={(s.x + t.x) / 2}
                  y={(s.y + t.y) / 2 - 5}
                  textAnchor="middle"
                  className="text-xs fill-current"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--color-border)" />
          </marker>
        </defs>
      </svg>

      {/* Nodes */}
      {nodes.map((node) => (
        <button
          key={node.id}
          type="button"
          style={{ left: node.x, top: node.y }}
          className={cn(flowVariants.node.base, nodeShapes[node.type])}
          onMouseDown={() => handleMouseDown(node.id)}
          onClick={() => onNodeClick?.(node)}
        >
          <span className={node.type === "decision" ? "-rotate-45" : ""}>{node.label}</span>
        </button>
      ))}
    </div>
  );
}

FlowBuilder.displayName = "FlowBuilder";

export { flowVariants };
export type { FlowBuilderProps, FlowNode, FlowEdge } from "./flow-builder.types";
export default FlowBuilder;


/**
 * NetworkGraph Component - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 * @description Simple network graph (for complex needs, use React Flow or D3)
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { NetworkGraphProps, GraphNode } from "./network-graph.types";

const graphVariants = {
  base: ["relative overflow-hidden", colorTokens.bgMuted, radiusTokens.lg, "mcp-functional-component"].join(" "),
};

export function NetworkGraph({
  nodes,
  edges,
  width = "100%",
  height = 400,
  onNodeClick,
  onEdgeClick,
  testId,
  className,
}: NetworkGraphProps) {
  // Simple force-directed layout simulation
  const [positions, setPositions] = React.useState<Record<string, { x: number; y: number }>>({});

  React.useEffect(() => {
    const pos: Record<string, { x: number; y: number }> = {};
    const centerX = 200;
    const centerY = 200;
    const radius = 150;
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      pos[node.id] = {
        x: node.x ?? centerX + radius * Math.cos(angle),
        y: node.y ?? centerY + radius * Math.sin(angle),
      };
    });
    setPositions(pos);
  }, [nodes]);

  const getNodePos = (id: string) => positions[id] || { x: 0, y: 0 };

  return (
    <div
      role="application"
      aria-label="Network graph"
      className={cn(graphVariants.base, className)}
      style={{ width, height }}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <svg className="w-full h-full">
        {/* Edges */}
        {edges.map((edge) => {
          const source = getNodePos(edge.source);
          const target = getNodePos(edge.target);
          return (
            <g key={edge.id}>
              <line
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="var(--color-border)"
                strokeWidth={edge.weight || 1}
                className="cursor-pointer hover:stroke-primary"
                role="button"
                tabIndex={0}
                aria-label={`Edge from ${edge.source} to ${edge.target}`}
                onClick={() => onEdgeClick?.(edge)}
                onKeyDown={(e) => e.key === "Enter" && onEdgeClick?.(edge)}
              />
              {edge.label && (
                <text x={(source.x + target.x) / 2} y={(source.y + target.y) / 2 - 5} textAnchor="middle" className="text-xs fill-current">
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const pos = getNodePos(node.id);
          const size = node.size || 20;
          return (
            <g key={node.id}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r={size}
                fill={node.color || "var(--color-primary)"}
                className="cursor-pointer hover:opacity-80"
                role="button"
                tabIndex={0}
                aria-label={node.label}
                onClick={() => onNodeClick?.(node)}
                onKeyDown={(e) => e.key === "Enter" && onNodeClick?.(node)}
              />
              <text x={pos.x} y={pos.y + size + 15} textAnchor="middle" className="text-xs fill-current">
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

NetworkGraph.displayName = "NetworkGraph";
export { graphVariants };
export type { NetworkGraphProps, GraphNode, GraphEdge } from "./network-graph.types";
export default NetworkGraph;


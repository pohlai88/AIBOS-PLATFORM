/**
 * TreeDiagram Component - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

"use client";

import { ChevronRightIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { TreeDiagramProps, TreeNode } from "./tree-diagram.types";

const treeVariants = {
  base: ["w-full", "mcp-functional-component"].join(" "),
  node: [
    "flex items-center gap-1 py-1 px-2 cursor-pointer",
    radiusTokens.md,
    "hover:bg-muted",
    "focus-visible:outline-2 focus-visible:outline-primary",
  ].join(" "),
};

function TreeNodeComponent({
  node,
  depth,
  onNodeClick,
  onNodeToggle,
  selectedId,
  expandedIds,
}: {
  node: TreeNode;
  depth: number;
  onNodeClick?: (node: TreeNode) => void;
  onNodeToggle?: (nodeId: string, expanded: boolean) => void;
  selectedId?: string;
  expandedIds: Set<string>;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isSelected = selectedId === node.id;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeToggle?.(node.id, !isExpanded);
  };

  return (
    <div role="treeitem" aria-expanded={hasChildren ? isExpanded : undefined} aria-selected={isSelected}>
      <button
        type="button"
        onClick={() => onNodeClick?.(node)}
        className={cn(
          treeVariants.node,
          isSelected && colorTokens.bgMuted
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          <button type="button" onClick={handleToggle} className="p-0.5" aria-label={isExpanded ? "Collapse" : "Expand"}>
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        {node.icon && <span className="mr-1">{node.icon}</span>}
        <span className={cn("text-sm", colorTokens.fg)}>{node.label}</span>
      </button>
      {hasChildren && isExpanded && (
        <div role="group">
          {node.children!.map((child) => (
            <TreeNodeComponent
              key={child.id}
              node={child}
              depth={depth + 1}
              onNodeClick={onNodeClick}
              onNodeToggle={onNodeToggle}
              selectedId={selectedId}
              expandedIds={expandedIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TreeDiagram({
  data,
  onNodeClick,
  onNodeToggle,
  defaultExpandAll = false,
  selectedId,
  testId,
  className,
}: TreeDiagramProps) {
  const getAllIds = (nodes: TreeNode[]): string[] =>
    nodes.flatMap((n) => [n.id, ...(n.children ? getAllIds(n.children) : [])]);

  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(defaultExpandAll ? getAllIds(data) : [])
  );

  const handleToggle = (nodeId: string, expanded: boolean) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      expanded ? next.add(nodeId) : next.delete(nodeId);
      return next;
    });
    onNodeToggle?.(nodeId, expanded);
  };

  return (
    <div
      role="tree"
      aria-label="Tree diagram"
      className={cn(treeVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {data.map((node) => (
        <TreeNodeComponent
          key={node.id}
          node={node}
          depth={0}
          onNodeClick={onNodeClick}
          onNodeToggle={handleToggle}
          selectedId={selectedId}
          expandedIds={expandedIds}
        />
      ))}
    </div>
  );
}

TreeDiagram.displayName = "TreeDiagram";
export { treeVariants };
export type { TreeDiagramProps, TreeNode } from "./tree-diagram.types";
export default TreeDiagram;


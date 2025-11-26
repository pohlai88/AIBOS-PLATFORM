/**
 * EntityRelationshipGraph Component - Layer 3 Functional Component
 * @layer 3
 * @category mapping-graphs
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { EntityRelationshipGraphProps, ERDEntity, ERDRelationship } from "./entity-relationship-graph.types";

const erdVariants = {
  base: ["relative w-full h-96 overflow-auto", colorTokens.bgMuted, radiusTokens.lg, "border", colorTokens.border, "mcp-functional-component"].join(" "),
  entity: ["absolute p-2 min-w-48", colorTokens.bgElevated, radiusTokens.md, "border", colorTokens.border, "shadow-sm cursor-pointer", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
  entityHeader: ["font-semibold text-sm pb-2 border-b", colorTokens.border].join(" "),
  attribute: ["text-xs py-0.5 flex justify-between"].join(" "),
};

export function EntityRelationshipGraph({
  entities,
  relationships,
  onEntityClick,
  onRelationshipClick,
  testId,
  className,
}: EntityRelationshipGraphProps) {
  return (
    <div
      role="img"
      aria-label="Entity relationship diagram"
      className={cn(erdVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {relationships.map((rel) => {
          const source = entities.find((e) => e.id === rel.source);
          const target = entities.find((e) => e.id === rel.target);
          if (!source || !target) return null;
          return (
            <line
              key={rel.id}
              x1={source.position.x + 96}
              y1={source.position.y + 40}
              x2={target.position.x + 96}
              y2={target.position.y + 40}
              stroke="var(--color-border)"
              strokeWidth={2}
              markerEnd={rel.type.includes("many") ? "url(#arrow)" : undefined}
              role="button"
              tabIndex={0}
              className="pointer-events-auto cursor-pointer"
              onClick={() => onRelationshipClick?.(rel)}
              onKeyDown={(e) => e.key === "Enter" && onRelationshipClick?.(rel)}
            />
          );
        })}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="var(--color-border)" />
          </marker>
        </defs>
      </svg>
      {entities.map((entity) => (
        <button
          key={entity.id}
          type="button"
          onClick={() => onEntityClick?.(entity)}
          className={erdVariants.entity}
          style={{ left: entity.position.x, top: entity.position.y }}
        >
          <div className={erdVariants.entityHeader}>{entity.name}</div>
          {entity.attributes.map((attr, i) => (
            <div key={i} className={erdVariants.attribute}>
              <span className={attr.isPrimaryKey ? "font-bold" : attr.isForeignKey ? "italic" : ""}>
                {attr.isPrimaryKey && "🔑 "}{attr.isForeignKey && "🔗 "}{attr.name}
              </span>
              <span className={colorTokens.fgMuted}>{attr.type}</span>
            </div>
          ))}
        </button>
      ))}
    </div>
  );
}

EntityRelationshipGraph.displayName = "EntityRelationshipGraph";
export { erdVariants };
export type { EntityRelationshipGraphProps, ERDEntity, ERDRelationship } from "./entity-relationship-graph.types";
export default EntityRelationshipGraph;


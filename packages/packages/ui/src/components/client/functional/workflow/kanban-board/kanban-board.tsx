/**
 * KanbanBoard Component - Layer 3 Functional Component
 * @module KanbanBoard
 * @layer 3
 * @category workflow
 */

"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { KanbanBoardProps, KanbanCard, KanbanColumn } from "./kanban-board.types";

const kanbanVariants = {
  base: ["flex gap-4 overflow-x-auto p-4", "mcp-functional-component"].join(" "),
  column: [
    "flex-shrink-0 w-72",
    colorTokens.bgMuted,
    radiusTokens.lg,
    "p-3",
  ].join(" "),
  card: [
    "p-3 mb-2",
    colorTokens.bgElevated,
    radiusTokens.md,
    "shadow-sm",
    "cursor-pointer",
    "hover:shadow-md transition-shadow",
    "focus-visible:outline-2 focus-visible:outline-primary",
  ].join(" "),
};

export function KanbanBoard({
  columns,
  onCardMove,
  onCardClick,
  onAddCard,
  allowAddCards = true,
  testId,
  className,
}: KanbanBoardProps) {
  const [draggedCard, setDraggedCard] = React.useState<{ card: KanbanCard; columnId: string } | null>(null);

  const handleDragStart = (card: KanbanCard, columnId: string) => {
    setDraggedCard({ card, columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (draggedCard && draggedCard.columnId !== targetColumnId) {
      onCardMove?.(draggedCard.card.id, draggedCard.columnId, targetColumnId);
    }
    setDraggedCard(null);
  };

  return (
    <div
      role="region"
      aria-label="Kanban board"
      className={cn(kanbanVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      {columns.map((column) => (
        <div
          key={column.id}
          className={kanbanVariants.column}
          onDragOver={handleDragOver}
          onDrop={() => handleDrop(column.id)}
        >
          {/* Column header */}
          <div className={cn("flex items-center justify-between mb-3", colorTokens.fg)}>
            <h3 className="font-semibold text-sm">{column.title}</h3>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", colorTokens.bgElevated)}>
              {column.cards.length}
              {column.limit && `/${column.limit}`}
            </span>
          </div>

          {/* Cards */}
          <div role="list" aria-label={`${column.title} cards`}>
            {column.cards.map((card) => (
              <button
                key={card.id}
                type="button"
                role="listitem"
                draggable
                onDragStart={() => handleDragStart(card, column.id)}
                onClick={() => onCardClick?.(card)}
                className={cn(kanbanVariants.card, "w-full text-left")}
              >
                <p className={cn("font-medium text-sm", colorTokens.fg)}>{card.title}</p>
                {card.description && (
                  <p className={cn("text-xs mt-1 line-clamp-2", colorTokens.fgMuted)}>{card.description}</p>
                )}
                {card.labels && card.labels.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {card.labels.map((label, i) => (
                      <span
                        key={i}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: label.color, color: "#fff" }}
                      >
                        {label.text}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Add card button */}
          {allowAddCards && onAddCard && (
            <button
              type="button"
              onClick={() => onAddCard(column.id)}
              className={cn(
                "w-full mt-2 p-2 flex items-center justify-center gap-1",
                "text-sm",
                colorTokens.fgMuted,
                radiusTokens.md,
                "hover:bg-muted transition-colors",
                "focus-visible:outline-2 focus-visible:outline-primary"
              )}
            >
              <PlusIcon className="h-4 w-4" />
              Add card
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

KanbanBoard.displayName = "KanbanBoard";

export { kanbanVariants };
export type { KanbanBoardProps, KanbanCard, KanbanColumn } from "./kanban-board.types";
export default KanbanBoard;


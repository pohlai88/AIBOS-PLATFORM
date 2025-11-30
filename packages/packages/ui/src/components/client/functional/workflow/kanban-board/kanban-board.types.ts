/**
 * KanbanBoard Types - Layer 3 Functional Component
 * @module KanbanBoardTypes
 * @layer 3
 * @category workflow
 */

export interface KanbanCard {
  id: string;
  title: string;
  description?: string;
  labels?: { text: string; color: string }[];
  assignee?: { name: string; avatar?: string };
  dueDate?: Date;
}

export interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  limit?: number;
}

export interface KanbanBoardProps {
  columns: KanbanColumn[];
  onCardMove?: (cardId: string, fromColumn: string, toColumn: string) => void;
  onCardClick?: (card: KanbanCard) => void;
  onAddCard?: (columnId: string) => void;
  allowAddCards?: boolean;
  testId?: string;
  className?: string;
}


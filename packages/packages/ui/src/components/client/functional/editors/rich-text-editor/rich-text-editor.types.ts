/**
 * RichTextEditor Types - Layer 3 Functional Component
 * @module RichTextEditorTypes
 * @layer 3
 * @category editors
 */

export type TextFormat = "bold" | "italic" | "underline" | "strikethrough";
export type BlockFormat = "paragraph" | "heading1" | "heading2" | "heading3" | "bulletList" | "numberedList" | "quote";

export interface RichTextEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readonly?: boolean;
  showToolbar?: boolean;
  minHeight?: number;
  maxHeight?: number;
  testId?: string;
  className?: string;
}


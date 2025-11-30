/**
 * MarkdownEditor Types - Layer 3 Functional Component
 * @layer 3
 * @category editors
 */

export interface MarkdownEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readonly?: boolean;
  showPreview?: boolean;
  height?: number | string;
  testId?: string;
  className?: string;
}


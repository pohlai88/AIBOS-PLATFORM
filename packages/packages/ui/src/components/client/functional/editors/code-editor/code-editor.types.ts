/**
 * CodeEditor Types - Layer 3 Functional Component
 * @module CodeEditorTypes
 * @layer 3
 * @category editors
 */

export type CodeLanguage = "javascript" | "typescript" | "python" | "json" | "html" | "css" | "sql" | "markdown";

export interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: CodeLanguage;
  readonly?: boolean;
  showLineNumbers?: boolean;
  showMinimap?: boolean;
  height?: number | string;
  placeholder?: string;
  testId?: string;
  className?: string;
}


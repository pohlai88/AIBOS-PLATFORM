/**
 * CodeEditor Component - Layer 3 Functional Component
 * @module CodeEditor
 * @layer 3
 * @category editors
 * @description Simple code editor (for advanced needs, use Monaco Editor)
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { CodeEditorProps } from "./code-editor.types";

const codeEditorVariants = {
  base: [
    "relative w-full font-mono text-sm",
    colorTokens.bgElevated,
    radiusTokens.lg,
    "border",
    colorTokens.border,
    "overflow-hidden",
    "mcp-functional-component",
  ].join(" "),
  textarea: [
    "w-full h-full p-4 resize-none",
    "bg-transparent",
    colorTokens.fg,
    "outline-none",
    "font-mono text-sm leading-6",
  ].join(" "),
  lineNumbers: [
    "absolute left-0 top-0 bottom-0 w-12",
    "p-4 pr-2 text-right",
    colorTokens.bgMuted,
    colorTokens.fgMuted,
    "border-r",
    colorTokens.border,
    "select-none",
    "font-mono text-sm leading-6",
  ].join(" "),
};

export function CodeEditor({
  value,
  onChange,
  language = "javascript",
  readonly = false,
  showLineNumbers = true,
  height = 300,
  placeholder = "// Enter code here...",
  testId,
  className,
}: CodeEditorProps) {
  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 1);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange?.(e.target.value);
  };

  return (
    <div
      role="group"
      aria-label={`Code editor for ${language}`}
      className={cn(codeEditorVariants.base, className)}
      style={{ height }}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
      data-language={language}
    >
      {/* Line numbers */}
      {showLineNumbers && (
        <div className={codeEditorVariants.lineNumbers} aria-hidden="true">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1}>{i + 1}</div>
          ))}
        </div>
      )}

      {/* Editor */}
      <textarea
        value={value}
        onChange={handleChange}
        readOnly={readonly}
        placeholder={placeholder}
        spellCheck={false}
        aria-label={`${language} code input`}
        className={cn(
          codeEditorVariants.textarea,
          showLineNumbers && "pl-16"
        )}
        style={{ height: "100%" }}
      />
    </div>
  );
}

CodeEditor.displayName = "CodeEditor";

export { codeEditorVariants };
export type { CodeEditorProps, CodeLanguage } from "./code-editor.types";
export default CodeEditor;


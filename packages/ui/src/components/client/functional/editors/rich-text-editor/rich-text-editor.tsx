/**
 * RichTextEditor Component - Layer 3 Functional Component
 * @module RichTextEditor
 * @layer 3
 * @category editors
 * @description Simple rich text editor (for advanced needs, use TipTap/Lexical)
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { RichTextEditorProps } from "./rich-text-editor.types";

const richTextVariants = {
  base: [
    "w-full",
    colorTokens.bgElevated,
    radiusTokens.lg,
    "border",
    colorTokens.border,
    "overflow-hidden",
    "mcp-functional-component",
  ].join(" "),
  toolbar: [
    "flex items-center gap-1 p-2",
    colorTokens.bgMuted,
    "border-b",
    colorTokens.border,
  ].join(" "),
  toolbarButton: [
    "p-2",
    radiusTokens.md,
    "hover:bg-muted",
    "focus-visible:outline-2 focus-visible:outline-primary",
  ].join(" "),
  editor: [
    "p-4 min-h-[150px] outline-none",
    colorTokens.fg,
  ].join(" "),
};

const formatCommands = [
  { command: "bold", icon: "B", label: "Bold", style: "font-bold" },
  { command: "italic", icon: "I", label: "Italic", style: "italic" },
  { command: "underline", icon: "U", label: "Underline", style: "underline" },
  { command: "strikeThrough", icon: "S", label: "Strikethrough", style: "line-through" },
];

export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  readonly = false,
  showToolbar = true,
  minHeight = 150,
  maxHeight = 400,
  testId,
  className,
}: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);

  const execCommand = (command: string) => {
    document.execCommand(command, false);
    editorRef.current?.focus();
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div
      role="group"
      aria-label="Rich text editor"
      className={cn(richTextVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-constitution-compliant="layer3-functional"
      data-layer="3"
    >
      {/* Toolbar */}
      {showToolbar && !readonly && (
        <div role="toolbar" aria-label="Formatting options" className={richTextVariants.toolbar}>
          {formatCommands.map((cmd) => (
            <button
              key={cmd.command}
              type="button"
              onClick={() => execCommand(cmd.command)}
              aria-label={cmd.label}
              className={cn(richTextVariants.toolbarButton, cmd.style)}
            >
              {cmd.icon}
            </button>
          ))}
          <div className="w-px h-6 bg-border mx-1" aria-hidden="true" />
          <button
            type="button"
            onClick={() => execCommand("insertUnorderedList")}
            aria-label="Bullet list"
            className={richTextVariants.toolbarButton}
          >
            •
          </button>
          <button
            type="button"
            onClick={() => execCommand("insertOrderedList")}
            aria-label="Numbered list"
            className={richTextVariants.toolbarButton}
          >
            1.
          </button>
        </div>
      )}

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readonly}
        onInput={handleInput}
        role="textbox"
        aria-multiline="true"
        aria-label="Editor content"
        aria-placeholder={placeholder}
        className={richTextVariants.editor}
        style={{ minHeight, maxHeight, overflowY: "auto" }}
        suppressContentEditableWarning
      />
    </div>
  );
}

RichTextEditor.displayName = "RichTextEditor";

export { richTextVariants };
export type { RichTextEditorProps, TextFormat, BlockFormat } from "./rich-text-editor.types";
export default RichTextEditor;


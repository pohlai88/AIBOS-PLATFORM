/**
 * MarkdownEditor Component - Layer 3 Functional Component
 * @layer 3
 * @category editors
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { MarkdownEditorProps } from "./markdown-editor.types";

const markdownVariants = {
  base: ["w-full flex gap-0", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "overflow-hidden", "mcp-functional-component"].join(" "),
  toolbar: ["flex items-center gap-1 p-2 border-b", colorTokens.border, colorTokens.bgMuted].join(" "),
  toolbarBtn: ["p-1.5 text-sm", radiusTokens.sm, "hover:bg-muted", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
  textarea: ["flex-1 p-4 resize-none bg-transparent outline-none font-mono text-sm", colorTokens.fg].join(" "),
  preview: ["flex-1 p-4 prose prose-sm max-w-none overflow-auto", colorTokens.fg].join(" "),
};

const formatButtons = [
  { label: "B", syntax: "**", title: "Bold" },
  { label: "I", syntax: "_", title: "Italic" },
  { label: "H", syntax: "## ", title: "Heading", prefix: true },
  { label: "•", syntax: "- ", title: "List", prefix: true },
  { label: "`", syntax: "`", title: "Code" },
  { label: "🔗", syntax: "[](url)", title: "Link" },
];

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write markdown...",
  readonly = false,
  showPreview = true,
  height = 300,
  testId,
  className,
}: MarkdownEditorProps) {
  const [preview, setPreview] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertFormat = (syntax: string, isPrefix?: boolean) => {
    const textarea = textareaRef.current;
    if (!textarea || readonly) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const newValue = isPrefix
      ? value.substring(0, start) + syntax + selected + value.substring(end)
      : value.substring(0, start) + syntax + selected + syntax + value.substring(end);
    onChange?.(newValue);
  };

  return (
    <div
      className={cn(markdownVariants.base, "flex-col", className)}
      style={{ height }}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {/* Toolbar */}
      <div className={markdownVariants.toolbar}>
        {formatButtons.map((btn) => (
          <button
            key={btn.label}
            type="button"
            onClick={() => insertFormat(btn.syntax, btn.prefix)}
            disabled={readonly}
            aria-label={btn.title}
            className={markdownVariants.toolbarBtn}
          >
            {btn.label}
          </button>
        ))}
        <div className="flex-1" />
        {showPreview && (
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className={cn(markdownVariants.toolbarBtn, preview && colorTokens.bgMuted)}
          >
            {preview ? "Edit" : "Preview"}
          </button>
        )}
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div className={markdownVariants.preview} dangerouslySetInnerHTML={{ __html: value.replace(/\n/g, "<br>") }} />
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readonly}
          aria-label="Markdown editor"
          className={markdownVariants.textarea}
          style={{ height: "100%" }}
        />
      )}
    </div>
  );
}

MarkdownEditor.displayName = "MarkdownEditor";
export { markdownVariants };
export type { MarkdownEditorProps } from "./markdown-editor.types";
export default MarkdownEditor;


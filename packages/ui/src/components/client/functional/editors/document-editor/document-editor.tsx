/**
 * DocumentEditor Component - Layer 3 Functional Component
 * Placeholder for TipTap/Lexical integration
 * @layer 3
 * @category editors
 */

"use client";

import { DocumentTextIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { DocumentEditorProps } from "./document-editor.types";

const documentEditorVariants = {
  base: ["flex flex-col h-full", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "mcp-functional-component"].join(" "),
  toolbar: ["flex items-center justify-between p-3 border-b", colorTokens.border].join(" "),
  title: ["flex items-center gap-2"].join(" "),
  actions: ["flex items-center gap-2"].join(" "),
  content: ["flex-1 p-6 overflow-auto"].join(" "),
  textarea: ["w-full h-full min-h-96 p-4 text-sm resize-none font-mono", colorTokens.bgMuted, radiusTokens.md, "border", colorTokens.border, "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
  footer: ["flex items-center justify-between p-3 text-xs border-t", colorTokens.border, colorTokens.fgMuted].join(" "),
};

export function DocumentEditor({
  content,
  metadata,
  onChange,
  onMetadataChange,
  onSave,
  onExport,
  readOnly = false,
  testId,
  className,
}: DocumentEditorProps) {
  return (
    <div
      className={cn(documentEditorVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className={documentEditorVariants.toolbar}>
        <div className={documentEditorVariants.title}>
          <DocumentTextIcon className="h-5 w-5" />
          <input
            type="text"
            value={metadata.title}
            onChange={(e) => onMetadataChange?.({ ...metadata, title: e.target.value })}
            className={cn("font-semibold bg-transparent border-none focus:outline-none", readOnly && "pointer-events-none")}
            readOnly={readOnly}
            aria-label="Document title"
          />
        </div>
        <div className={documentEditorVariants.actions}>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              className={cn("px-3 py-1.5 text-sm", radiusTokens.md, "border", colorTokens.border, "hover:bg-muted")}
            >
              Save
            </button>
          )}
          {onExport && (
            <div className="relative group">
              <button
                type="button"
                className={cn("flex items-center gap-1 px-3 py-1.5 text-sm", radiusTokens.md, "border", colorTokens.border, "hover:bg-muted")}
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export
              </button>
              <div className={cn("absolute right-0 mt-1 hidden group-hover:block z-10", colorTokens.bgElevated, radiusTokens.md, "border", colorTokens.border, "shadow-lg")}>
                <button type="button" onClick={() => onExport("pdf")} className="block w-full px-4 py-2 text-sm text-left hover:bg-muted">PDF</button>
                <button type="button" onClick={() => onExport("docx")} className="block w-full px-4 py-2 text-sm text-left hover:bg-muted">DOCX</button>
                <button type="button" onClick={() => onExport("html")} className="block w-full px-4 py-2 text-sm text-left hover:bg-muted">HTML</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={documentEditorVariants.content}>
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          className={documentEditorVariants.textarea}
          readOnly={readOnly}
          placeholder="Start writing your document..."
          aria-label="Document content"
        />
      </div>

      <div className={documentEditorVariants.footer}>
        <span>{metadata.author && `By ${metadata.author}`}</span>
        <span>{content.split(/\s+/).filter(Boolean).length} words</span>
        <span>{metadata.version && `v${metadata.version}`}</span>
      </div>
    </div>
  );
}

DocumentEditor.displayName = "DocumentEditor";
export { documentEditorVariants };
export type { DocumentEditorProps, DocumentMetadata } from "./document-editor.types";
export default DocumentEditor;


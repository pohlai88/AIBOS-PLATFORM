/**
 * EmailEditor Component - Layer 3 Functional Component
 * @layer 3
 * @category editors
 */

"use client";

import { PaperClipIcon, PaperAirplaneIcon, XMarkIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { EmailEditorProps, EmailRecipient } from "./email-editor.types";

const emailEditorVariants = {
  base: ["flex flex-col", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "mcp-functional-component"].join(" "),
  header: ["p-4 space-y-3 border-b", colorTokens.border].join(" "),
  row: ["flex items-center gap-2"].join(" "),
  label: ["w-16 text-sm", colorTokens.fgMuted].join(" "),
  input: ["flex-1 px-2 py-1.5 text-sm", colorTokens.bgMuted, radiusTokens.md, "border", colorTokens.border, "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
  body: ["flex-1 p-4"].join(" "),
  textarea: ["w-full h-full min-h-64 p-2 text-sm resize-none", colorTokens.bgMuted, radiusTokens.md, "border", colorTokens.border, "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
  footer: ["p-4 border-t flex items-center justify-between", colorTokens.border].join(" "),
  attachments: ["flex flex-wrap gap-2"].join(" "),
  attachment: ["flex items-center gap-1 px-2 py-1 text-xs", colorTokens.bgMuted, radiusTokens.md].join(" "),
};

const formatRecipients = (recipients: EmailRecipient[]) =>
  recipients.map((r) => r.name ? `${r.name} <${r.email}>` : r.email).join(", ");

export function EmailEditor({
  to,
  cc = [],
  bcc = [],
  subject,
  body,
  attachments = [],
  onToChange,
  onCcChange,
  onBccChange,
  onSubjectChange,
  onBodyChange,
  onAttach,
  onRemoveAttachment,
  onSend,
  onSaveDraft,
  testId,
  className,
}: EmailEditorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(emailEditorVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className={emailEditorVariants.header}>
        <div className={emailEditorVariants.row}>
          <label className={emailEditorVariants.label}>To:</label>
          <input
            type="text"
            value={formatRecipients(to)}
            onChange={(e) => onToChange(e.target.value.split(",").map((s) => ({ email: s.trim() })))}
            className={emailEditorVariants.input}
            aria-label="To recipients"
          />
        </div>
        {onCcChange && (
          <div className={emailEditorVariants.row}>
            <label className={emailEditorVariants.label}>Cc:</label>
            <input
              type="text"
              value={formatRecipients(cc)}
              onChange={(e) => onCcChange(e.target.value.split(",").map((s) => ({ email: s.trim() })))}
              className={emailEditorVariants.input}
              aria-label="CC recipients"
            />
          </div>
        )}
        <div className={emailEditorVariants.row}>
          <label className={emailEditorVariants.label}>Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => onSubjectChange(e.target.value)}
            className={emailEditorVariants.input}
            aria-label="Email subject"
          />
        </div>
      </div>

      <div className={emailEditorVariants.body}>
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          className={emailEditorVariants.textarea}
          placeholder="Compose your email..."
          aria-label="Email body"
        />
      </div>

      <div className={emailEditorVariants.footer}>
        <div className="flex items-center gap-4">
          {onAttach && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && onAttach(Array.from(e.target.files))}
                aria-label="Attach files"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cn("p-2", radiusTokens.md, "hover:bg-muted")}
                aria-label="Attach files"
              >
                <PaperClipIcon className="h-5 w-5" />
              </button>
            </>
          )}
          <div className={emailEditorVariants.attachments}>
            {attachments.map((att) => (
              <span key={att.id} className={emailEditorVariants.attachment}>
                {att.name}
                {onRemoveAttachment && (
                  <button type="button" onClick={() => onRemoveAttachment(att.id)} aria-label={`Remove ${att.name}`}>
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          {onSaveDraft && (
            <button type="button" onClick={onSaveDraft} className={cn("px-4 py-2 text-sm", radiusTokens.md, "border", colorTokens.border)}>
              Save Draft
            </button>
          )}
          {onSend && (
            <button
              type="button"
              onClick={onSend}
              className={cn("flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground", radiusTokens.md)}
            >
              <PaperAirplaneIcon className="h-4 w-4" />
              Send
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

EmailEditor.displayName = "EmailEditor";
export { emailEditorVariants };
export type { EmailEditorProps, EmailRecipient, EmailAttachment } from "./email-editor.types";
export default EmailEditor;


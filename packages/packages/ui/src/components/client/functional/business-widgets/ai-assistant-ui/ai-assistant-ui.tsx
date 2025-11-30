/**
 * AIAssistantUI Component - Layer 3 Functional Component
 * Lynx Panel AI Assistant Interface
 * @layer 3
 * @category business-widgets
 */

"use client";

import { SparklesIcon, PaperAirplaneIcon, TrashIcon } from "@heroicons/react/24/outline";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { AIAssistantUIProps, AIMessage } from "./ai-assistant-ui.types";

const aiAssistantVariants = {
  base: ["flex flex-col h-full", colorTokens.bgElevated, radiusTokens.lg, "border", colorTokens.border, "mcp-functional-component"].join(" "),
  header: ["flex items-center justify-between p-4 border-b", colorTokens.border].join(" "),
  messages: ["flex-1 overflow-auto p-4 space-y-4"].join(" "),
  message: {
    base: ["max-w-[80%] p-3", radiusTokens.lg].join(" "),
    user: ["ml-auto bg-primary text-primary-foreground"].join(" "),
    assistant: [colorTokens.bgMuted].join(" "),
    system: ["mx-auto text-center text-sm", colorTokens.fgMuted, "italic"].join(" "),
  },
  suggestions: ["flex flex-wrap gap-2 p-4 border-t", colorTokens.border].join(" "),
  suggestion: ["px-3 py-1.5 text-sm", colorTokens.bgMuted, radiusTokens.full, "hover:bg-muted", "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
  input: ["flex items-center gap-2 p-4 border-t", colorTokens.border].join(" "),
  textarea: ["flex-1 px-3 py-2 text-sm resize-none", colorTokens.bgMuted, radiusTokens.md, "border", colorTokens.border, "focus-visible:outline-2 focus-visible:outline-primary"].join(" "),
};

export function AIAssistantUI({
  messages,
  suggestions = [],
  isLoading = false,
  placeholder = "Ask me anything...",
  onSendMessage,
  onSuggestionClick,
  onClear,
  title = "AI Assistant",
  testId,
  className,
}: AIAssistantUIProps) {
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      className={cn(aiAssistantVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div className={aiAssistantVariants.header}>
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-primary" />
          <span className="font-semibold">{title}</span>
        </div>
        {onClear && messages.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className={cn("p-1.5", radiusTokens.md, "hover:bg-muted")}
            aria-label="Clear conversation"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className={aiAssistantVariants.messages} role="log" aria-label="Conversation">
        {messages.length === 0 && (
          <div className={cn("text-center py-8", colorTokens.fgMuted)}>
            <SparklesIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Start a conversation with the AI assistant</p>
          </div>
        )}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              aiAssistantVariants.message.base,
              aiAssistantVariants.message[msg.role]
            )}
          >
            <p className="whitespace-pre-wrap">{msg.content}</p>
            {msg.isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
            )}
          </div>
        ))}
        {isLoading && (
          <div className={cn(aiAssistantVariants.message.base, aiAssistantVariants.message.assistant)}>
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {suggestions.length > 0 && messages.length === 0 && (
        <div className={aiAssistantVariants.suggestions}>
          {suggestions.map((sug) => (
            <button
              key={sug.id}
              type="button"
              onClick={() => onSuggestionClick?.(sug)}
              className={aiAssistantVariants.suggestion}
            >
              {sug.label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className={aiAssistantVariants.input}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          disabled={isLoading}
          className={aiAssistantVariants.textarea}
          aria-label="Message input"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className={cn(
            "p-2 bg-primary text-primary-foreground", radiusTokens.md,
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

AIAssistantUI.displayName = "AIAssistantUI";
export { aiAssistantVariants };
export type { AIAssistantUIProps, AIMessage, AISuggestion, MessageRole } from "./ai-assistant-ui.types";
export default AIAssistantUI;


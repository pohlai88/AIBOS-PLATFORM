/**
 * ChatUI Component - Layer 3 Functional Component
 * @layer 3
 * @category workflow
 */

"use client";

import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { ChatUIProps, ChatMessage } from "./chat-ui.types";

const chatVariants = {
  base: ["flex flex-col h-full", "mcp-functional-component"].join(" "),
  messages: ["flex-1 overflow-y-auto p-4 space-y-3"].join(" "),
  bubble: {
    base: ["max-w-[70%] p-3", radiusTokens.lg].join(" "),
    sent: "bg-primary text-primary-foreground ml-auto",
    received: cn(colorTokens.bgMuted, colorTokens.fg),
  },
  input: [
    "flex items-center gap-2 p-3 border-t",
    colorTokens.border,
    colorTokens.bgElevated,
  ].join(" "),
};

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function ChatUI({
  messages,
  currentUserId,
  onSendMessage,
  onTyping,
  placeholder = "Type a message...",
  showTimestamps = true,
  testId,
  className,
}: ChatUIProps) {
  const [input, setInput] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      role="region"
      aria-label="Chat"
      className={cn(chatVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      <div role="log" aria-live="polite" aria-label="Messages" className={chatVariants.messages}>
        {messages.map((msg) => {
          const isSent = msg.sender.id === currentUserId;
          if (msg.type === "system") {
            return (
              <div key={msg.id} className={cn("text-center text-xs py-2", colorTokens.fgMuted)}>
                {msg.content}
              </div>
            );
          }
          if (msg.type === "typing") {
            return (
              <div key={msg.id} className={cn(chatVariants.bubble.base, chatVariants.bubble.received)}>
                <span className="animate-pulse">...</span>
              </div>
            );
          }
          return (
            <div key={msg.id} className={cn("flex flex-col", isSent ? "items-end" : "items-start")}>
              {!isSent && <span className={cn("text-xs mb-1", colorTokens.fgMuted)}>{msg.sender.name}</span>}
              <div className={cn(chatVariants.bubble.base, isSent ? chatVariants.bubble.sent : chatVariants.bubble.received)}>
                {msg.content}
              </div>
              {showTimestamps && (
                <span className={cn("text-xs mt-1", colorTokens.fgMuted)}>{formatTime(msg.timestamp)}</span>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className={chatVariants.input}>
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); onTyping?.(); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          aria-label="Message input"
          className={cn("flex-1 p-2 bg-transparent outline-none", colorTokens.fg)}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send message"
          className={cn(
            "p-2 bg-primary text-primary-foreground",
            radiusTokens.md,
            "disabled:opacity-50",
            "focus-visible:outline-2 focus-visible:outline-primary"
          )}
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

ChatUI.displayName = "ChatUI";
export { chatVariants };
export type { ChatUIProps, ChatMessage } from "./chat-ui.types";
export default ChatUI;


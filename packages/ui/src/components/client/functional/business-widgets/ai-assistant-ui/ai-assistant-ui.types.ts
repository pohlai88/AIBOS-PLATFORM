/**
 * AIAssistantUI Types - Layer 3 Functional Component
 * @layer 3
 * @category business-widgets
 */

export type MessageRole = "user" | "assistant" | "system";

export interface AIMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface AISuggestion {
  id: string;
  label: string;
  prompt: string;
}

export interface AIAssistantUIProps {
  messages: AIMessage[];
  suggestions?: AISuggestion[];
  isLoading?: boolean;
  placeholder?: string;
  onSendMessage: (message: string) => void;
  onSuggestionClick?: (suggestion: AISuggestion) => void;
  onClear?: () => void;
  title?: string;
  testId?: string;
  className?: string;
}


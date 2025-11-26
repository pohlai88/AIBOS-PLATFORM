/**
 * ChatUI Types - Layer 3 Functional Component
 * @layer 3
 * @category workflow
 */

export interface ChatMessage {
  id: string;
  content: string;
  sender: { id: string; name: string; avatar?: string };
  timestamp: Date;
  type?: "text" | "system" | "typing";
}

export interface ChatUIProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage?: (content: string) => void;
  onTyping?: () => void;
  placeholder?: string;
  showTimestamps?: boolean;
  testId?: string;
  className?: string;
}


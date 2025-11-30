/**
 * CommentThread Types - Layer 3 Functional Component
 * @layer 3
 * @category workflow
 */

export interface Comment {
  id: string;
  author: { name: string; avatar?: string };
  content: string;
  timestamp: Date;
  replies?: Comment[];
  edited?: boolean;
}

export interface CommentThreadProps {
  comments: Comment[];
  onAddComment?: (content: string, parentId?: string) => void;
  onEditComment?: (id: string, content: string) => void;
  onDeleteComment?: (id: string) => void;
  currentUser?: { name: string; avatar?: string };
  allowReplies?: boolean;
  maxDepth?: number;
  testId?: string;
  className?: string;
}


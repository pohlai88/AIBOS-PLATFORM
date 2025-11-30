/**
 * CommentThread Component - Layer 3 Functional Component
 * @layer 3
 * @category workflow
 */

"use client";

import * as React from "react";

import { colorTokens, radiusTokens } from "../../../../../design/tokens/tokens";
import { cn } from "../../../../../design/utilities/cn";

import type { CommentThreadProps, Comment } from "./comment-thread.types";

const commentVariants = {
  base: ["w-full space-y-4", "mcp-functional-component"].join(" "),
  comment: [
    "p-3",
    colorTokens.bgElevated,
    radiusTokens.md,
    "border",
    colorTokens.border,
  ].join(" "),
  input: [
    "w-full p-3",
    colorTokens.bgMuted,
    radiusTokens.md,
    "border",
    colorTokens.border,
    "resize-none",
    "focus:outline-2 focus:outline-primary",
  ].join(" "),
};

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

function CommentItem({
  comment,
  depth,
  maxDepth,
  allowReplies,
  onReply,
}: {
  comment: Comment;
  depth: number;
  maxDepth: number;
  allowReplies: boolean;
  onReply: (parentId: string, content: string) => void;
}) {
  const [showReply, setShowReply] = React.useState(false);
  const [replyText, setReplyText] = React.useState("");

  const handleSubmitReply = () => {
    if (replyText.trim()) {
      onReply(comment.id, replyText);
      setReplyText("");
      setShowReply(false);
    }
  };

  return (
    <div className={cn(commentVariants.comment, depth > 0 && "ml-6")}>
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium", colorTokens.bgMuted)}>
          {comment.author.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <span className={cn("font-medium text-sm", colorTokens.fg)}>{comment.author.name}</span>
          <span className={cn("text-xs ml-2", colorTokens.fgMuted)}>{formatTime(comment.timestamp)}</span>
          {comment.edited && <span className={cn("text-xs ml-1", colorTokens.fgMuted)}>(edited)</span>}
        </div>
      </div>
      <p className={cn("text-sm", colorTokens.fg)}>{comment.content}</p>
      {allowReplies && depth < maxDepth && (
        <button
          type="button"
          onClick={() => setShowReply(!showReply)}
          className={cn("text-xs mt-2", "text-primary hover:underline")}
        >
          Reply
        </button>
      )}
      {showReply && (
        <div className="mt-2 flex gap-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className={commentVariants.input}
            aria-label="Reply input"
          />
          <button
            type="button"
            onClick={handleSubmitReply}
            className={cn("px-3 py-1 text-sm bg-primary text-primary-foreground", radiusTokens.md)}
          >
            Send
          </button>
        </div>
      )}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          depth={depth + 1}
          maxDepth={maxDepth}
          allowReplies={allowReplies}
          onReply={onReply}
        />
      ))}
    </div>
  );
}

export function CommentThread({
  comments,
  onAddComment,
  currentUser,
  allowReplies = true,
  maxDepth = 3,
  testId,
  className,
}: CommentThreadProps) {
  const [newComment, setNewComment] = React.useState("");

  const handleSubmit = () => {
    if (newComment.trim() && onAddComment) {
      onAddComment(newComment);
      setNewComment("");
    }
  };

  const handleReply = (parentId: string, content: string) => {
    onAddComment?.(content, parentId);
  };

  return (
    <div
      role="region"
      aria-label="Comment thread"
      className={cn(commentVariants.base, className)}
      data-testid={testId}
      data-mcp-validated="true"
      data-layer="3"
    >
      {onAddComment && currentUser && (
        <div className="flex gap-2 mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            rows={3}
            className={commentVariants.input}
            aria-label="New comment input"
          />
          <button
            type="button"
            onClick={handleSubmit}
            className={cn("px-4 py-2 text-sm bg-primary text-primary-foreground self-end", radiusTokens.md)}
          >
            Post
          </button>
        </div>
      )}
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          depth={0}
          maxDepth={maxDepth}
          allowReplies={allowReplies}
          onReply={handleReply}
        />
      ))}
    </div>
  );
}

CommentThread.displayName = "CommentThread";
export { commentVariants };
export type { CommentThreadProps, Comment } from "./comment-thread.types";
export default CommentThread;


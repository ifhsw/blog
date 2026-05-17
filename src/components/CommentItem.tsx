"use client";

import { deleteComment } from "@/actions/comments";

interface CommentWithUser {
  id: string;
  content: string;
  createdAt: Date;
  user: { username: string; avatar: string | null };
  parentId: string | null;
  replies?: CommentWithUser[];
}

export function CommentItem({
  comment,
  isAdmin,
  onReply,
  replyTo,
  postId,
  depth = 0,
}: {
  comment: CommentWithUser;
  isAdmin: boolean;
  onReply: (id: string | null) => void;
  replyTo: string | null;
  postId: string;
  depth?: number;
}) {
  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-warm-border pl-4" : ""} mb-4`}>
      <div className="flex items-center gap-2 text-sm mb-1">
        <span className="font-medium text-warm-text">{comment.user.username}</span>
        <span className="text-warm-muted/60 text-xs">
          {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
        </span>
      </div>
      <p className="text-sm text-warm-text mb-2">{comment.content}</p>
      <div className="flex gap-2 text-xs">
        <button onClick={() => onReply(comment.id)} className="text-warm-link hover:underline">
          回复
        </button>
        {isAdmin && (
          <button
            onClick={() => deleteComment(comment.id)}
            className="text-red-500 hover:underline"
          >
            删除
          </button>
        )}
      </div>
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          isAdmin={isAdmin}
          onReply={onReply}
          replyTo={replyTo}
          postId={postId}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

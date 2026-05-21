"use client";

import { deleteComment } from "@/actions/comments";
import { Avatar } from "@/components/Avatar";
import Link from "next/link";

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
  onReply: (id: string, username: string) => void;
  replyTo: { id: string; username: string } | null;
  postId: string;
  depth?: number;
}) {
  return (
    <div className={`${depth > 0 ? "ml-6 border-l-2 border-primary-200/30 pl-4" : ""} mb-4`}>
      <div className="flex items-center gap-2 text-sm mb-1">
        <Avatar src={comment.user.avatar} name={comment.user.username} size="sm" />
        <Link href={`/user/${comment.user.username}`} className="font-medium text-primary-800 hover:text-primary-600 transition-colors">{comment.user.username}</Link>
        <span className="text-primary-600/60 text-xs">
          {new Date(comment.createdAt).toLocaleDateString("zh-CN")}
        </span>
      </div>
      <p className="text-sm text-primary-800 mb-2">{comment.content}</p>
      <div className="flex gap-2 text-xs">
        <button onClick={() => onReply(comment.id, comment.user.username)} className="text-primary-500 hover:underline">
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

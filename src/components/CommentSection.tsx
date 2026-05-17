"use client";

import { createComment } from "@/actions/comments";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { CommentItem } from "./CommentItem";

interface CommentWithUser {
  id: string;
  content: string;
  createdAt: Date;
  user: { username: string; avatar: string | null };
  parentId: string | null;
  replies?: CommentWithUser[];
}

export function CommentSection({
  postId,
  comments: initialComments,
}: {
  postId: string;
  comments: CommentWithUser[];
}) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [replyTo, setReplyTo] = useState<string | null>(null);

  function nestComments(comments: CommentWithUser[]): CommentWithUser[] {
    const top = comments.filter((c) => !c.parentId);
    const replies = comments.filter((c) => c.parentId);
    return top.map((c) => ({
      ...c,
      replies: replies.filter((r) => r.parentId === c.id),
    }));
  }

  const nested = nestComments(initialComments);

  return (
    <div>
      <h3 className="text-xl font-bold text-warm-text mb-4">评论 ({initialComments.length})</h3>
      {nested.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          isAdmin={isAdmin}
          onReply={setReplyTo}
          replyTo={replyTo}
          postId={postId}
        />
      ))}
      {session ? (
        <form action={createComment} className="mt-6 space-y-3">
          <input type="hidden" name="postId" value={postId} />
          {replyTo && <input type="hidden" name="parentId" value={replyTo} />}
          <textarea
            name="content"
            className="input-field min-h-[100px]"
            placeholder={replyTo ? "写下你的回复..." : "写下你的评论..."}
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">发表</button>
            {replyTo && (
              <button type="button" className="btn-secondary text-sm" onClick={() => setReplyTo(null)}>
                取消回复
              </button>
            )}
          </div>
        </form>
      ) : (
        <p className="text-sm text-warm-muted mt-4">
          <a href="/login" className="text-warm-link hover:underline">登录</a> 后发表评论
        </p>
      )}
    </div>
  );
}

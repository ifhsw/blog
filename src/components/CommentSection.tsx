"use client";

import { createCommentAction } from "@/actions/comments";
import { useSession } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
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
      <h3 className="text-lg font-bold text-primary-800 mb-6 flex items-center gap-2">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-400">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        评论 ({initialComments.length})
      </h3>

      {nested.length === 0 && (
        <div className="text-center py-8 text-primary-400/50 text-sm">
          暂无评论，来发表第一条评论吧
        </div>
      )}

      <div className="space-y-1">
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
      </div>

      {session ? (
        <form action={createCommentAction} className="mt-6 card space-y-3 !p-4">
          <input type="hidden" name="postId" value={postId} />
          {replyTo && <input type="hidden" name="parentId" value={replyTo} />}
          {replyTo && (
            <div className="flex items-center gap-2 text-xs text-primary-500/60 bg-primary-50/30 -mx-1 px-3 py-1.5 rounded-lg">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 14L4 9l5-5" />
                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
              </svg>
              正在回复评论
              <button type="button" onClick={() => setReplyTo(null)} className="ml-auto text-primary-400 hover:text-primary-600">取消</button>
            </div>
          )}
          <textarea
            name="content"
            className="input-field min-h-[100px] resize-y"
            placeholder={replyTo ? "写下你的回复..." : "写下你的评论..."}
            required
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">发表评论</button>
            {replyTo && (
              <button type="button" className="btn-secondary text-sm" onClick={() => setReplyTo(null)}>
                取消回复
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="mt-6 card !p-4 text-center">
          <p className="text-sm text-primary-500/60">
            <Link href="/login" className="text-primary-500 hover:underline font-medium">登录</Link> 后发表评论
          </p>
        </div>
      )}
    </div>
  );
}

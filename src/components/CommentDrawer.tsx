"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { createCommentAction } from "@/actions/comments";
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

export function CommentDrawer({
  postId,
  comments: initialComments,
}: {
  postId: string;
  comments: CommentWithUser[];
}) {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  function nestComments(comments: CommentWithUser[]): CommentWithUser[] {
    const byParent = new Map<string, CommentWithUser[]>();
    const roots: CommentWithUser[] = [];

    for (const c of comments) {
      if (!c.parentId) {
        roots.push(c);
      } else {
        const siblings = byParent.get(c.parentId) || [];
        siblings.push(c);
        byParent.set(c.parentId, siblings);
      }
    }

    function attachReplies(comment: CommentWithUser): CommentWithUser {
      const children = byParent.get(comment.id);
      if (!children) return comment;
      return { ...comment, replies: children.map(attachReplies) };
    }

    return roots.map(attachReplies);
  }

  const nested = nestComments(initialComments);

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group"
        aria-label="评论"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        {initialComments.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center shadow-sm">
            {initialComments.length > 99 ? "99+" : initialComments.length}
          </span>
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed z-50 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
          /* Desktop: right side drawer */
          top-0 right-0 h-full w-full sm:w-[420px]
          /* Mobile: bottom sheet */
          max-sm:top-auto max-sm:bottom-0 max-sm:right-0 max-sm:h-[85vh] max-sm:w-full max-sm:rounded-t-2xl
          ${open ? "max-sm:translate-y-0" : "max-sm:translate-y-full max-sm:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-primary-100 shrink-0">
          <h3 className="text-lg font-bold text-primary-800 flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-400">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            评论 ({initialComments.length})
          </h3>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            aria-label="关闭"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body: scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {nested.length === 0 && (
            <div className="text-center py-12 text-primary-400/50 text-sm">
              暂无评论，来发表第一条评论吧
            </div>
          )}

          <div className="space-y-1">
            {nested.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                isAdmin={isAdmin}
                onReply={(id, username) => setReplyTo({ id, username })}
                replyTo={replyTo}
                postId={postId}
              />
            ))}
          </div>
        </div>

        {/* Footer: input */}
        <div className="px-5 py-4 border-t border-primary-100 shrink-0">
          {session ? (
            <form action={createCommentAction} className="space-y-3">
              <input type="hidden" name="postId" value={postId} />
              {replyTo && <input type="hidden" name="parentId" value={replyTo.id} />}
              {replyTo && (
                <div className="flex items-center gap-2 text-xs text-primary-500/60 bg-primary-50/30 px-3 py-1.5 rounded-lg">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 14L4 9l5-5" />
                    <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                  </svg>
                  回复 @{replyTo.username}
                  <button type="button" onClick={() => setReplyTo(null)} className="ml-auto text-primary-400 hover:text-primary-600">取消</button>
                </div>
              )}
              <textarea
                name="content"
                className="w-full rounded-xl bg-primary-50 border border-primary-200/50 px-4 py-3 text-sm text-primary-800 placeholder-primary-400/50 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-300 resize-none min-h-[80px]"
                placeholder={replyTo ? "写下你的回复..." : "写下你的评论..."}
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary text-sm !py-2 !px-5">发表评论</button>
                {replyTo && (
                  <button type="button" className="btn-secondary text-sm !py-2 !px-5" onClick={() => setReplyTo(null)}>
                    取消回复
                  </button>
                )}
              </div>
            </form>
          ) : (
            <div className="text-center py-3">
              <p className="text-sm text-primary-500/60">
                <Link href="/login" className="text-primary-500 hover:underline font-medium">登录</Link> 后发表评论
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

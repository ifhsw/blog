import { prisma } from "@/lib/prisma";
import { deleteCommentAction } from "@/actions/comments";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true } },
      post: { select: { title: true, slug: true } },
    },
    take: 50,
  });

  type CommentItem = (typeof comments)[number];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 mb-6">评论管理</h1>
      <div className="space-y-3">
        {comments.map((c: CommentItem) => (
          <div key={c.id} className="card flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-sm text-primary-800">{c.content}</p>
              <div className="text-xs text-primary-600/60 mt-1">
                {c.user.username} · 在 <a href={`/post/${c.post.slug}`} className="text-primary-500 hover:underline">{c.post.title}</a> · {new Date(c.createdAt).toLocaleString("zh-CN")}
              </div>
            </div>
            <form action={deleteCommentAction}>
              <input type="hidden" name="commentId" value={c.id} />
              <button type="submit" className="text-xs text-red-500 hover:underline">删除</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

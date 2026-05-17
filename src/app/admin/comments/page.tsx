import { prisma } from "@/lib/prisma";
import { deleteComment } from "@/actions/comments";

export default async function AdminCommentsPage() {
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { username: true } },
      post: { select: { title: true, slug: true } },
    },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-warm-text mb-6">评论管理</h1>
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="card flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-sm text-warm-text">{c.content}</p>
              <div className="text-xs text-warm-muted mt-1">
                {c.user.username} · 在 <a href={`/post/${c.post.slug}`} className="text-warm-link hover:underline">{c.post.title}</a> · {new Date(c.createdAt).toLocaleString("zh-CN")}
              </div>
            </div>
            <form action={deleteComment.bind(null, c.id)}>
              <button type="submit" className="text-xs text-red-500 hover:underline">删除</button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}

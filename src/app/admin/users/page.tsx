import { prisma } from "@/lib/prisma";

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { comments: true, posts: true },
      },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-warm-text mb-6">用户管理</h1>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-warm-text">{u.username}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${u.role === "ADMIN" ? "bg-warm-accent text-white" : "bg-warm-bg text-warm-muted"}`}>
                  {u.role === "ADMIN" ? "管理员" : "读者"}
                </span>
              </div>
            </div>
            <div className="text-sm text-warm-muted mt-1 space-y-0.5">
              <div>邮箱：{u.email}</div>
              <div>注册时间：{new Date(u.createdAt).toLocaleString("zh-CN")}</div>
              <div>文章数：{u._count.posts} · 评论数：{u._count.comments}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

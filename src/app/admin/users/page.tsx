import { prisma } from "@/lib/prisma";
import { ResetPasswordButton } from "@/components/ResetPasswordButton";

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
      <h1 className="text-2xl font-bold text-primary-800 mb-6">用户管理</h1>
      <div className="space-y-3">
        {users.map((u) => (
          <div key={u.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <span className="font-medium text-primary-800">{u.username}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${u.role === "ADMIN" ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white" : "bg-primary-50 text-primary-600/60"}`}>
                  {u.role === "ADMIN" ? "管理员" : "读者"}
                </span>
              </div>
              <ResetPasswordButton userId={u.id} username={u.username} />
            </div>
            <div className="text-sm text-primary-600/60 mt-1 space-y-0.5">
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

import { prisma } from "@/lib/prisma";

export default async function AdminDashboard() {
  const [postCount, commentCount, readerCount, draftCount] = await Promise.all([
    prisma.post.count(),
    prisma.comment.count(),
    prisma.user.count({ where: { role: "READER" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
  ]);

  const stats = [
    { label: "文章总数", value: postCount },
    { label: "草稿", value: draftCount },
    { label: "评论", value: commentCount },
    { label: "读者", value: readerCount },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 mb-6">仪表盘</h1>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card text-center">
            <div className="text-3xl font-bold text-primary-500">{s.value}</div>
            <div className="text-sm text-primary-600/60 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";

export async function Sidebar() {
  const recentPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { title: true, slug: true },
  });

  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
  });

  return (
    <aside className="space-y-6">
      <div className="card">
        <h3 className="font-semibold text-warm-text mb-3">最近文章</h3>
        <ul className="space-y-2 text-sm">
          {recentPosts.map((p) => (
            <li key={p.slug}>
              <a href={`/post/${p.slug}`} className="text-warm-muted hover:text-warm-accent transition-colors">
                {p.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="card">
        <h3 className="font-semibold text-warm-text mb-3">标签</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <span key={t.id} className="text-xs bg-warm-bg text-warm-muted px-2 py-1 rounded-full">
              {t.name} ({t._count.posts})
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}

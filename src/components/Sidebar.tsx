import { prisma } from "@/lib/prisma";
import Link from "next/link";

export async function Sidebar() {
  const recentPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { title: true, slug: true, category: true },
  });

  const tags = await prisma.tag.findMany({
    include: { _count: { select: { posts: true } } },
  });

  return (
    <aside className="space-y-5">
      {/* Recent posts */}
      <div className="card">
        <h3 className="text-sm font-semibold text-primary-800 mb-4 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-400">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          最近文章
        </h3>
        <ul className="space-y-1">
          {recentPosts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/post/${p.slug}`}
                className="block py-1.5 px-2 -mx-2 rounded-lg text-sm text-primary-600/70
                           hover:text-primary-800 hover:bg-primary-50/60
                           transition-all duration-200"
              >
                <span className="line-clamp-1">{p.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Tags */}
      <div className="card">
        <h3 className="text-sm font-semibold text-primary-800 mb-4 flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-400">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          标签
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/archive`}
              className="tag cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            >
              {t.name}
              <span className="ml-1 text-primary-400/60 text-[0.65rem]">
                {t._count.posts}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

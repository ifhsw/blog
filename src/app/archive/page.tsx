import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ArchivePage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    select: { title: true, slug: true, createdAt: true, category: true },
  });

  const groupedByYear = posts.reduce<Record<string, typeof posts>>((acc, post) => {
    const year = new Date(post.createdAt).getFullYear().toString();
    (acc[year] ||= []).push(post);
    return acc;
  }, {});

  return (
    <main className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-primary-800">归档</h1>
        <span className="text-xs text-primary-400 bg-primary-100/60 px-2 py-0.5 rounded-full">
          {posts.length} 篇
        </span>
      </div>
      <div className="space-y-5">
        {Object.entries(groupedByYear).map(([year, yearPosts]) => (
          <section key={year} className="card">
            <h2 className="text-lg font-bold text-primary-700 mb-4 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              {year}
              <span className="text-xs font-normal text-primary-400">({yearPosts.length} 篇)</span>
            </h2>
            <ul className="space-y-1">
              {yearPosts.map((p) => (
                <li key={p.slug} className="flex items-center gap-4 text-sm py-1.5 px-2 -mx-2 rounded-lg hover:bg-primary-50/50 transition-colors">
                  <span className="text-primary-400/60 w-14 shrink-0 text-right text-xs font-mono">
                    {new Date(p.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                  </span>
                  <span className="text-[0.65rem] font-semibold text-primary-400 bg-primary-100/60 px-1.5 py-0.5 rounded w-9 text-center shrink-0">
                    {p.category === "TECH" ? "技术" : "随笔"}
                  </span>
                  <Link href={`/post/${p.slug}`} className="text-primary-700 hover:text-blue-600 transition-colors truncate">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

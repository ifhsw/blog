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
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-warm-text mb-6">归档</h1>
      {Object.entries(groupedByYear).map(([year, yearPosts]) => (
        <section key={year} className="mb-8">
          <h2 className="text-xl font-semibold text-warm-accent mb-4">{year}</h2>
          <ul className="space-y-2">
            {yearPosts.map((p) => (
              <li key={p.slug} className="flex items-center gap-4 text-sm">
                <span className="text-warm-muted/60 w-16 shrink-0">
                  {new Date(p.createdAt).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
                </span>
                <span className="text-xs text-warm-link bg-warm-bg px-2 py-0.5 rounded-full w-10 text-center">
                  {p.category === "TECH" ? "技术" : "随笔"}
                </span>
                <Link href={`/post/${p.slug}`} className="text-warm-text hover:text-warm-accent transition-colors">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}

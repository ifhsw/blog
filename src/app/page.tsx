import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true, title: true, slug: true, excerpt: true, category: true,
      createdAt: true, wordCount: true,
      tags: { select: { tag: { select: { name: true } } } },
    },
  });

  const [postCount, tagCount, commentCount] = await Promise.all([
    prisma.post.count({ where: { status: "PUBLISHED", visibility: "PUBLIC" } }),
    prisma.tag.count(),
    prisma.comment.count(),
  ]);

  return (
    <main className="flex-1">
      {/* Hero section — inspired by Stripe/Vercel */}
      <section className="hero-gradient">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-black/10 border border-black/10 text-xs font-semibold text-primary-700 tracking-wide">
              <span className="w-1.5 h-1.5 bg-blue-500" style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }} />
              玄桥 · 写意留白
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-900 leading-tight">
              孤灯
              <span className="text-blue-600"> 残雪</span>
              <br />
              <span className="text-primary-600">墨色生寒</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-900/60 leading-relaxed max-w-xl animate-fade-in-up animation-delay-100">
              冷灰、苍蓝、低饱和。技术笔记与随想，在静谧中沉淀。
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-primary-700/60 animate-fade-in-up animation-delay-150">
              <span>📝 <strong className="text-primary-900 font-semibold">{postCount}</strong> 篇文章</span>
              <span>🏷 <strong className="text-primary-900 font-semibold">{tagCount}</strong> 个标签</span>
              <span>💬 <strong className="text-primary-900 font-semibold">{commentCount}</strong> 条评论</span>
            </div>
            <div className="mt-8 flex items-center gap-4 animate-fade-in-up animation-delay-200">
              <a
                href="/tech"
                className="btn-primary !rounded-lg !px-6 !py-3 !text-base"
              >
                技术文章
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a
                href="/about"
                className="btn-secondary !rounded-lg !px-6 !py-3 !text-base"
              >
                关于
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Post list */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Main content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-primary-800 tracking-tight">最新文章</h2>
                <p className="text-sm text-primary-400/50 mt-1">墨痕未干，字里行间</p>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4 opacity-20 select-none">—</div>
                <p className="text-primary-400/40 text-lg">尚未落笔，静候墨痕</p>
              </div>
            ) : (
              <div className="space-y-5">
                {posts.map((post, i) => (
                  <div
                    key={post.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <PostCard {...post} wordCount={post.wordCount} featured={i === 0} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="lg:sticky lg:top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Remove unused imports
export const dynamic = "force-dynamic";

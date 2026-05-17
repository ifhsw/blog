import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";
import { Sidebar } from "@/components/Sidebar";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } } },
  });

  return (
    <main className="flex-1">
      {/* Hero section — inspired by Stripe/Vercel */}
      <section className="hero-gradient border-b border-primary-200/20">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-primary-100/60 border border-primary-200/30 text-xs font-semibold text-primary-600 tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              博客已就绪
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-primary-900 leading-tight">
              记录
              <span className="gradient-text"> 技术与生活</span>
              <br />
              在喧嚣中找到秩序
            </h1>
            <p className="mt-6 text-lg md:text-xl text-primary-600/60 leading-relaxed max-w-xl animate-fade-in-up animation-delay-100">
              探索前端开发、系统设计与开源项目的思考笔记。
              用文字捕捉每一个灵感的瞬间。
            </p>
            <div className="mt-8 flex items-center gap-4 animate-fade-in-up animation-delay-200">
              <a
                href="/tech"
                className="btn-primary !rounded-xl !px-6 !py-3 !text-base"
              >
                阅读技术文章
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </a>
              <a
                href="/about"
                className="btn-secondary !rounded-xl !px-6 !py-3 !text-base"
              >
                了解更多
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
                <p className="text-sm text-primary-600/45 mt-1">每一次书写都是思想的沉淀</p>
              </div>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-4 opacity-30">✍️</div>
                <p className="text-primary-600/50 text-lg">还没有文章，敬请期待</p>
              </div>
            ) : (
              <div className="space-y-5">
                {posts.map((post, i) => (
                  <div
                    key={post.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <PostCard {...post} featured={i === 0} />
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

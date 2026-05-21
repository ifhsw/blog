import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PostContent } from "@/components/PostContent";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CommentDrawer } from "@/components/CommentDrawer";
import { ReadingProgress } from "@/components/ReadingProgress";
import { BackToTop } from "@/components/BackToTop";
import { TableOfContents } from "@/components/TableOfContents";
import { ShareButtons } from "@/components/ShareButtons";
import { ImageViewer } from "@/components/ImageViewer";
import { BackButton } from "@/components/BackButton";
import { Avatar } from "@/components/Avatar";

function estimateReadingTime(text: string): number {
  const wordsPerMinute = 300; // Chinese characters per minute
  const chars = text.replace(/\s/g, "").length;
  return Math.max(1, Math.ceil(chars / wordsPerMinute));
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      author: { select: { username: true, avatar: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!post) notFound();

  const session = await auth();
  const userId = (session?.user as any)?.id;
  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const isAuthor = userId === post.authorId;

  // Drafts and private posts are only visible to author and admin
  if (post.status !== "PUBLISHED" || post.visibility === "PRIVATE") {
    if (!isAuthor && !isAdmin) notFound();
  }

  const readingTime = post.wordCount
    ? Math.max(1, Math.ceil(post.wordCount / 300))
    : estimateReadingTime(post.content);
  const isTech = post.category === "TECH";
  const wordCount = post.wordCount || post.content.replace(/\s/g, "").length;

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    include: { user: { select: { username: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  // Related posts: same category, exclude current
  const relatedPosts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      category: post.category,
      id: { not: post.id },
    },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { title: true, slug: true, createdAt: true },
  });

  return (
    <>
      <ReadingProgress />
      <BackToTop />
      <ImageViewer />
      <BackButton />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* ========== MAIN ARTICLE COLUMN ========== */}
          <article className="flex-1 min-w-0 lg:max-w-[720px] overflow-hidden break-words">
            {/* ---- Header ---- */}
            <header className="animate-fade-in-up">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-xs mb-5 text-primary-400/50" aria-label="面包屑导航">
                <Link href="/" className="hover:text-primary-500 transition-colors">首页</Link>
                <span>/</span>
                <Link href={isTech ? "/tech" : "/essay"} className="hover:text-primary-500 transition-colors">
                  {isTech ? "技术" : "随笔"}
                </Link>
                <span>/</span>
                <span className="text-primary-500/60 truncate max-w-[180px]">{post.title}</span>
              </nav>

              {/* Category + meta */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`badge ${isTech ? "badge-tech" : "badge-essay"}`}>
                  {isTech ? "技术" : "随笔"}
                </span>
                <span className="text-sm text-primary-500/40">
                  {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="text-xs text-primary-400/35">·</span>
                <span className="text-xs text-primary-400/50">
                  {readingTime} 分钟阅读
                </span>
                <span className="text-xs text-primary-400/35">·</span>
                <span className="text-xs text-primary-400/50">
                  {wordCount.toLocaleString()} 字
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-primary-900 tracking-tight leading-tight">
                {post.title}
              </h1>

              {/* Author row */}
              <div className="mt-5 flex items-center gap-3 pb-6 border-b border-primary-200/30">
                <Avatar src={post.author.avatar || null} name={post.author.username} size="md" />
                <div className="min-w-0">
                  <Link href={`/user/${post.author.username}`} className="text-sm font-semibold text-primary-800 hover:text-primary-600 transition-colors">
                    {post.author.username}
                  </Link>
                  <div className="text-xs text-primary-500/45">作者</div>
                </div>
              </div>
            </header>

            {/* ---- Cover Image ---- */}
            {post.coverImage && (
              <div className="mt-6 mb-2 animate-fade-in animation-delay-150">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-auto rounded-xl shadow-md border border-black/5"
                />
              </div>
            )}

            {/* ---- Article Content ---- */}
            <PostContent content={post.content} />

            {/* ---- Article Footer ---- */}
            <footer className="border-t border-primary-200/30 pt-6 pb-4 space-y-5">
              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-primary-400/50 mr-1">标签：</span>
                  {post.tags.map((pt) => (
                    <Link
                      key={pt.tag.id}
                      href="/archive"
                      className="tag hover:scale-105 active:scale-95 transition-transform"
                    >
                      {pt.tag.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Date info + share */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-primary-400/55">
                <div className="flex items-center gap-4">
                  <span>
                    发布于{" "}
                    {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  {post.updatedAt > post.createdAt && (
                    <span>
                      更新于{" "}
                      {new Date(post.updatedAt).toLocaleDateString("zh-CN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  )}
                </div>
                <ShareButtons title={post.title} slug={post.slug} />
              </div>

              {/* Author card */}
              <div className="card !p-5 flex items-start gap-4 mt-4">
                <Avatar src={post.author.avatar || null} name={post.author.username} size="md" />
                <div>
                  <div className="font-semibold text-primary-800 text-sm">
                    {post.author.username}
                  </div>
                  <p className="text-xs text-primary-500/50 mt-1 leading-relaxed">
                    技术爱好者，热爱分享与写作。欢迎在评论区交流讨论。
                  </p>
                </div>
              </div>
            </footer>

          </article>

          {/* ========== SIDEBAR COLUMN ========== */}
          <aside className="w-full lg:w-60 shrink-0 hidden lg:block min-w-0 overflow-hidden">
            <div className="lg:sticky lg:top-24 space-y-5">
              <TableOfContents content={post.content} />

              {/* Related posts */}
              {relatedPosts.length > 0 && (
                <div className="card p-4">
                  <h4 className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    {isTech ? "相关技术文章" : "相关随笔"}
                  </h4>
                  <ul className="space-y-1">
                    {relatedPosts.map((rp) => (
                      <li key={rp.slug}>
                        <Link
                          href={`/post/${rp.slug}`}
                          className="block py-1.5 px-2 -mx-2 rounded-lg text-sm text-primary-600/65
                                     hover:text-primary-800 hover:bg-primary-50/50
                                     transition-all duration-200 line-clamp-1"
                        >
                          {rp.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick nav back */}
              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-xs text-primary-400/50
                           hover:text-primary-500 transition-colors py-2"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                返回首页
              </Link>
            </div>
          </aside>
        </div>
        </div>

        {/* ---- Floating Comment Drawer ---- */}
        <CommentDrawer postId={post.id} comments={comments} />
      </main>
    </>
  );
}

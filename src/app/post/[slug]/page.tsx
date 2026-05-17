import { prisma } from "@/lib/prisma";
import { compileMdx } from "@/lib/mdx";
import { notFound } from "next/navigation";
import { CommentSection } from "@/components/CommentSection";
import { ReadingProgress } from "@/components/ReadingProgress";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { username: true } } },
  });

  if (!post || post.status !== "PUBLISHED") notFound();

  const mdxContent = await compileMdx(post.content);

  const isTech = post.category === "TECH";

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    include: { user: { select: { username: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <>
      <ReadingProgress />

      <main className="max-w-4xl mx-auto px-6 py-10">
        <article>
          {/* Article header */}
          <header className="mb-12 animate-fade-in-up">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 text-sm mb-6">
              <a
                href="/"
                className="text-primary-400/50 hover:text-primary-500 transition-colors"
              >
                首页
              </a>
              <span className="text-primary-300/40">/</span>
              <a
                href={isTech ? "/tech" : "/essay"}
                className="text-primary-400/50 hover:text-primary-500 transition-colors"
              >
                {isTech ? "技术" : "随笔"}
              </a>
              <span className="text-primary-300/40">/</span>
              <span className="text-primary-500/60 truncate max-w-[200px]">{post.title}</span>
            </div>

            {/* Category badge + date */}
            <div className="flex items-center gap-3 mb-5">
              <span className={`badge ${isTech ? "badge-tech" : "badge-essay"}`}>
                {isTech ? "技术" : "随笔"}
              </span>
              <span className="text-sm text-primary-500/40 font-medium">
                {new Date(post.createdAt).toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-primary-900 tracking-tight leading-tight">
              {post.title}
            </h1>

            {/* Author */}
            <div className="mt-6 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-300 to-primary-500 flex items-center justify-center text-white text-sm font-bold">
                {post.author.username[0]}
              </div>
              <div>
                <div className="text-sm font-semibold text-primary-800">
                  {post.author.username}
                </div>
                <div className="text-xs text-primary-500/45">
                  作者
                </div>
              </div>
            </div>
          </header>

          {/* MDX Content */}
          <div className="animate-fade-in animation-delay-200">
            {mdxContent}
          </div>

          {/* Article footer */}
          <div className="mt-16 pt-8 border-t border-primary-200/30">
            <div className="flex items-center justify-between text-sm text-primary-400/60">
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
                  更新于 {new Date(post.updatedAt).toLocaleDateString("zh-CN")}
                </span>
              )}
            </div>
          </div>
        </article>

        {/* Comments section */}
        <section className="mt-12">
          <CommentSection postId={post.id} comments={comments} />
        </section>
      </main>
    </>
  );
}

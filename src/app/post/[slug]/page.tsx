import { prisma } from "@/lib/prisma";
import { compileMdx } from "@/lib/mdx";
import { notFound } from "next/navigation";

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { username: true } } },
  });

  if (!post || post.status !== "PUBLISHED") notFound();

  const mdxContent = await compileMdx(post.content);

  const categoryLabel = post.category === "TECH" ? "技术" : "随笔";

  const comments = await prisma.comment.findMany({
    where: { postId: post.id },
    include: { user: { select: { username: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <article>
        <header className="mb-8">
          <div className="flex items-center gap-3 text-sm mb-2">
            <span className="text-warm-link font-medium">{categoryLabel}</span>
            <span className="text-warm-muted/60">
              {new Date(post.createdAt).toLocaleDateString("zh-CN")}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-warm-text">{post.title}</h1>
          <p className="text-sm text-warm-muted mt-2">作者：{post.author.username}</p>
        </header>
        <div>{mdxContent}</div>
      </article>
      <hr className="my-8 border-warm-border" />
      {/* CommentSection will be added in Task 11 */}
      <div className="text-center text-sm text-warm-muted py-8">
        评论功能即将上线...
      </div>
    </main>
  );
}

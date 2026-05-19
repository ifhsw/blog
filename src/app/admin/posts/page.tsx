import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deletePostAction } from "@/actions/posts";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filter } = await searchParams;

  const where = filter && (filter === "PUBLISHED" || filter === "DRAFT")
    ? { status: filter }
    : {};

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          role: true,
          _count: { select: { posts: true, comments: true } },
        },
      },
    },
  });

  const counts = {
    all: await prisma.post.count(),
    published: await prisma.post.count({ where: { status: "PUBLISHED" } }),
    draft: await prisma.post.count({ where: { status: "DRAFT" } }),
  };

  const tabs = [
    { label: "全部", href: "/admin/posts", count: counts.all, active: !filter },
    { label: "已发布", href: "/admin/posts?status=PUBLISHED", count: counts.published, active: filter === "PUBLISHED" },
    { label: "投稿", href: "/admin/posts?status=DRAFT", count: counts.draft, active: filter === "DRAFT" },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-primary-800">文章管理</h1>
        <Link href="/admin/posts/new" className="btn-primary text-sm">写文章</Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6">
        {tabs.map((tab) => (
          <Link
            key={tab.label}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              tab.active
                ? "bg-primary-500 text-white"
                : "text-primary-600/60 hover:bg-primary-50 hover:text-primary-700"
            }`}
          >
            {tab.label}
            <span className={`ml-1.5 text-xs ${tab.active ? "text-white/70" : "text-primary-400/50"}`}>
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-primary-400/50 text-sm">
          {filter === "DRAFT" ? "没有待审核的投稿" : filter === "PUBLISHED" ? "没有已发布的文章" : "暂无文章"}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="card flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/post/${post.slug}`}
                    className="font-medium text-primary-800 hover:text-primary-500 truncate"
                  >
                    {post.title}
                  </Link>
                  <span
                    className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                      post.status === "PUBLISHED"
                        ? "bg-green-50 text-green-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {post.status === "PUBLISHED" ? "已发布" : "投稿"}
                  </span>
                </div>
                <div className="text-xs text-primary-600/60 mt-1 flex items-center gap-3">
                  <span>
                    {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                  </span>
                  <Link
                    href={`/user/${post.author.username}`}
                    className="text-primary-500 hover:underline"
                  >
                    {post.author.username}
                  </Link>
                  <span className="text-primary-400/40">
                    {post.author._count.posts} 篇文章 · {post.author._count.comments} 条评论
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0 ml-4">
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="btn-secondary text-xs py-1 px-3"
                >
                  编辑
                </Link>
                <form action={deletePostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-500 hover:underline py-1 px-3"
                  >
                    删除
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

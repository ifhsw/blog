import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() || "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let posts: any[] = [];

  if (query) {
    posts = await prisma.post.findMany({
      where: {
        status: "PUBLISHED",
        OR: [
          { title: { contains: query } },
          { content: { contains: query } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { tags: { include: { tag: true } } },
    });
  }

  return (
    <main className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-800 mb-4">搜索</h1>
        <form action="/search" className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="搜索文章标题或内容..."
            className="input-field flex-1"
            autoFocus
          />
          <button type="submit" className="btn-primary text-sm">
            查询
          </button>
        </form>
      </div>

      {query ? (
        <>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-primary-600/60">
              搜索 &ldquo;{query}&rdquo;
            </span>
            <span className="text-xs text-primary-400 bg-primary-100/60 px-2 py-0.5 rounded-full">
              {posts.length} 篇结果
            </span>
          </div>

          {posts.length === 0 ? (
            <div className="card text-center py-16 text-primary-400/60">
              未找到相关文章。
            </div>
          ) : (
            <div className="space-y-5">
              {posts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-16 text-primary-400/60">
          输入关键词搜索已发布的文章。
        </div>
      )}
    </main>
  );
}

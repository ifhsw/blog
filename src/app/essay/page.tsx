import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";

export default async function EssayPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", category: "ESSAY" },
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } } },
  });

  return (
    <main className="max-w-lg mx-auto px-4 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-primary-800">随笔</h1>
        <span className="text-xs text-primary-400 bg-primary-100/60 px-2 py-0.5 rounded-full">
          {posts.length} 篇
        </span>
      </div>
      {posts.length === 0 ? (
        <div className="card text-center py-16 text-primary-400/60">
          暂无随笔文章。
        </div>
      ) : (
        <div className="space-y-5">{posts.map((p) => <PostCard key={p.id} {...p} />)}</div>
      )}
    </main>
  );
}

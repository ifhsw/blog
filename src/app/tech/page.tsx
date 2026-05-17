import { prisma } from "@/lib/prisma";
import { PostCard } from "@/components/PostCard";

export default async function TechPage() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", category: "TECH" },
    orderBy: { createdAt: "desc" },
    include: { tags: { include: { tag: true } } },
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-warm-text mb-6">技术</h1>
      {posts.length === 0 ? (
        <p className="text-center text-warm-muted py-20">暂无技术文章。</p>
      ) : (
        <div className="space-y-6">{posts.map((p) => <PostCard key={p.id} {...p} />)}</div>
      )}
    </main>
  );
}

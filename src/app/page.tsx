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
    <main className="max-w-5xl mx-auto px-4 py-8 flex-1">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {posts.length === 0 ? (
            <p className="text-center text-warm-muted py-20">还没有文章，敬请期待。</p>
          ) : (
            posts.map((post) => <PostCard key={post.id} {...post} />)
          )}
        </div>
        <div className="w-full lg:w-72">
          <Sidebar />
        </div>
      </div>
    </main>
  );
}

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deletePostAction } from "@/actions/posts";

export default async function MyPostsPage() {
  const session = await auth();
  const userId = (session?.user as any).id;

  const posts = await prisma.post.findMany({
    where: { authorId: userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-800">我的文章</h1>
        <Link href="/my-posts/new" className="btn-primary text-sm">写文章</Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 text-primary-400/50 text-sm">
          还没有文章，开始写你的第一篇文章吧
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="card flex justify-between items-center">
              <div>
                <Link href={`/post/${post.slug}`} className="font-medium text-primary-800 hover:text-primary-500">
                  {post.title}
                </Link>
                <div className="text-xs text-primary-600/60 mt-1">
                  {post.status === "DRAFT" ? "投稿" : "已发布"} · {new Date(post.createdAt).toLocaleDateString("zh-CN")}
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/my-posts/${post.id}/edit`} className="btn-secondary text-xs py-1 px-3">编辑</Link>
                <form action={deletePostAction}>
                  <input type="hidden" name="postId" value={post.id} />
                  <button type="submit" className="text-xs text-red-500 hover:underline py-1 px-3">
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

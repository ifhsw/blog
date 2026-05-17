import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { deletePostAction } from "@/actions/posts";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-800">文章管理</h1>
        <Link href="/admin/posts/new" className="btn-primary text-sm">写文章</Link>
      </div>
      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="card flex justify-between items-center">
            <div>
              <Link href={`/post/${post.slug}`} className="font-medium text-primary-800 hover:text-primary-500">
                {post.title}
              </Link>
              <div className="text-xs text-primary-600/60 mt-1">
                {post.status === "DRAFT" ? "草稿" : "已发布"} · {new Date(post.createdAt).toLocaleDateString("zh-CN")}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/admin/posts/${post.id}/edit`} className="btn-secondary text-xs py-1 px-3">编辑</Link>
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
    </div>
  );
}

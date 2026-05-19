import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updatePost } from "@/actions/posts";
import { PostEditor } from "@/components/PostEditor";
import { notFound, redirect } from "next/navigation";

export default async function EditMyPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as any).id;
  const isAdmin = (session?.user as any).role === "ADMIN";

  const post = await prisma.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
  if (!post) notFound();

  // Only author or admin can edit
  if (!isAdmin && post.authorId !== userId) redirect("/my-posts");

  const bindUpdate = updatePost.bind(null, post.id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 mb-6">编辑文章</h1>
      <PostEditor
        action={bindUpdate}
        initialData={{
          title: post.title,
          excerpt: post.excerpt || "",
          content: post.content,
          category: post.category,
          status: post.status,
          visibility: post.visibility,
          tags: post.tags.map((pt: (typeof post.tags)[number]) => pt.tag.name).join(", "),
        }}
        submitLabel="保存"
        showStatus={isAdmin}
        showVisibility={true}
      />
    </div>
  );
}

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
  if (!isAdmin && post.authorId !== userId) redirect("/my-posts");

  const tagSuggestions = (await prisma.tag.findMany({ select: { name: true } })).map((t) => t.name);
  const bindUpdate = updatePost.bind(null, post.id);

  return (
    <div>
      <PostEditor
        action={bindUpdate}
        initialData={{
          title: post.title,
          excerpt: post.excerpt || "",
          content: post.content,
          category: post.category,
          status: post.status,
          visibility: post.visibility,
          tags: post.tags.map((pt) => pt.tag.name).join(", "),
          coverImage: post.coverImage || "",
          seoTitle: post.seoTitle || "",
          seoDesc: post.seoDesc || "",
          scheduledAt: post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "",
        }}
        submitLabel="保存"
        showStatus={isAdmin}
        showVisibility={true}
        tagSuggestions={tagSuggestions}
        postId={post.id}
      />
    </div>
  );
}

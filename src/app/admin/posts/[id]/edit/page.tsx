import { prisma } from "@/lib/prisma";
import { updatePost } from "@/actions/posts";
import { PostEditor } from "@/components/PostEditor";
import { notFound } from "next/navigation";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id },
    include: { tags: { include: { tag: true } } },
  });
  if (!post) notFound();

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
        showVisibility={true}
      />
    </div>
  );
}

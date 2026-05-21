import { createPost } from "@/actions/posts";
import { PostEditor } from "@/components/PostEditor";
import { prisma } from "@/lib/prisma";

export default async function NewPostPage() {
  const tagSuggestions = (await prisma.tag.findMany({ select: { name: true } })).map((t) => t.name);

  return (
    <div>
      <PostEditor action={createPost} submitLabel="发布" showVisibility={true} tagSuggestions={tagSuggestions} />
    </div>
  );
}

import { createPost } from "@/actions/posts";
import { PostEditor } from "@/components/PostEditor";
import { prisma } from "@/lib/prisma";

export default async function MyPostsNewPage() {
  const tagSuggestions = (await prisma.tag.findMany({ select: { name: true } })).map((t) => t.name);

  return (
    <div>
      <PostEditor action={createPost} submitLabel="投稿" showStatus={false} showVisibility={true} tagSuggestions={tagSuggestions} />
    </div>
  );
}

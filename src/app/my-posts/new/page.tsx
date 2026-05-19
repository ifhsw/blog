import { createPost } from "@/actions/posts";
import { PostEditor } from "@/components/PostEditor";

export default function MyPostsNewPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary-800 mb-6">写文章</h1>
      <PostEditor action={createPost} submitLabel="保存草稿" showStatus={false} />
    </div>
  );
}

import Link from "next/link";

interface PostCardProps {
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  createdAt: Date;
  tags: { tag: { name: string } }[];
}

export function PostCard({ title, slug, excerpt, category, createdAt, tags }: PostCardProps) {
  const categoryLabel = category === "TECH" ? "技术" : "随笔";
  return (
    <Link href={`/post/${slug}`} className="card block hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 text-xs mb-2">
        <span className="text-warm-link font-medium">{categoryLabel}</span>
        <span className="text-warm-muted/60">{new Date(createdAt).toLocaleDateString("zh-CN")}</span>
      </div>
      <h2 className="text-lg font-semibold text-warm-text mb-1">{title}</h2>
      {excerpt && <p className="text-sm text-warm-muted line-clamp-2">{excerpt}</p>}
      {tags.length > 0 && (
        <div className="flex gap-2 mt-3">
          {tags.map((pt) => (
            <span key={pt.tag.name} className="text-xs bg-warm-bg text-warm-muted px-2 py-0.5 rounded-full">
              {pt.tag.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

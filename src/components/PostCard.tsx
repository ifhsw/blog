import Link from "next/link";

interface PostCardProps {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  createdAt: Date;
  tags: { tag: { name: string } }[];
  featured?: boolean;
}

export function PostCard({
  id,
  title,
  slug,
  excerpt,
  category,
  createdAt,
  tags,
  featured = false,
}: PostCardProps) {
  const isTech = category === "TECH";

  return (
    <Link
      href={`/post/${slug}`}
      className={`card card-hoverable block group relative overflow-hidden ${
        featured ? "card-featured" : ""
      }`}
    >
      <div className="relative z-10">
        {/* Meta row */}
        <div className="flex items-center gap-3 mb-3">
          <span className={`badge ${isTech ? "badge-tech" : "badge-essay"}`}>
            {isTech ? "技术" : "随笔"}
          </span>
          <span className="text-xs text-primary-600/40 font-medium">
            {new Date(createdAt).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Title */}
        <h2
          className={`font-bold text-primary-800 group-hover:text-primary-700 transition-colors duration-300 mb-2 tracking-tight ${
            featured ? "text-2xl" : "text-xl"
          }`}
        >
          {title}
        </h2>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-primary-600/55 leading-relaxed line-clamp-2 mb-4">
            {excerpt}
          </p>
        )}

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, featured ? 5 : 3).map((pt) => (
              <span key={pt.tag.name} className="tag">
                {pt.tag.name}
              </span>
            ))}
            {!featured && tags.length > 3 && (
              <span className="tag">+{tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Read more indicator */}
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-primary-500 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
          阅读全文
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

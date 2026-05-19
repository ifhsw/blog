import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      avatar: true,
      role: true,
      bio: true,
      website: true,
      location: true,
      github: true,
      twitter: true,
      createdAt: true,
      _count: { select: { posts: true, comments: true } },
    },
  });
  if (!user) notFound();

  const publishedPosts = await prisma.post.findMany({
    where: { authorId: user.id, status: "PUBLISHED", visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: true,
      createdAt: true,
      tags: { include: { tag: { select: { name: true } } } },
    },
  });

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="card mb-8">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold shrink-0">
            {user.username.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-primary-800">{user.username}</h1>
              {user.role === "ADMIN" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                  管理员
                </span>
              )}
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-3 mt-2 text-xs text-primary-500/60">
              <span>{user._count.posts} 篇文章</span>
              <span>{user._count.comments} 条评论</span>
              <span>{new Date(user.createdAt).toLocaleDateString("zh-CN")} 加入</span>
            </div>

            {/* Bio */}
            {user.bio && (
              <p className="mt-3 text-sm text-primary-700 leading-relaxed">{user.bio}</p>
            )}

            {/* Links */}
            {(user.location || user.website || user.github || user.twitter) && (
              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                {user.location && (
                  <span className="text-primary-500/70 flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {user.location}
                  </span>
                )}
                {user.website && (
                  <a
                    href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                    网站
                  </a>
                )}
                {user.github && (
                  <a
                    href={`https://github.com/${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-700/60 hover:text-primary-800 flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                )}
                {user.twitter && (
                  <a
                    href={`https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500 flex items-center gap-1"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Twitter
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Published posts */}
      <h2 className="text-lg font-semibold text-primary-800 mb-4">
        {user.username} 的文章 ({publishedPosts.length})
      </h2>

      {publishedPosts.length === 0 ? (
        <p className="text-sm text-primary-400/60 text-center py-8">暂无文章</p>
      ) : (
        <div className="space-y-4">
          {publishedPosts.map((post) => (
            <Link
              key={post.id}
              href={`/post/${post.slug}`}
              className="card block hover:shadow-md transition-shadow"
            >
              <h3 className="font-medium text-primary-800 mb-1">{post.title}</h3>
              {post.excerpt && (
                <p className="text-sm text-primary-600/60 line-clamp-2 mb-2">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-primary-400/50">
                <span className={post.category === "TECH" ? "text-blue-500/70" : "text-green-500/70"}>
                  {post.category === "TECH" ? "技术" : "随笔"}
                </span>
                <span>{new Date(post.createdAt).toLocaleDateString("zh-CN")}</span>
                {post.tags.length > 0 && (
                  <span className="flex gap-1">
                    {post.tags.map((pt) => (
                      <span key={pt.tag.name} className="text-primary-400/40">#{pt.tag.name}</span>
                    ))}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

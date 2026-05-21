import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.AUTH_URL || "https://xuanqiao.blog";

export default async function sitemap() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", visibility: "PUBLIC" },
    select: { slug: true, updatedAt: true },
  });

  const staticRoutes = ["", "/tech", "/essay", "/archive", "/about", "/qa", "/links"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${SITE_URL}${route}`,
      lastModified: new Date(),
    })),
    ...posts.map((post) => ({
      url: `${SITE_URL}/post/${post.slug}`,
      lastModified: post.updatedAt,
    })),
  ];
}

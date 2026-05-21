import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.AUTH_URL || "https://xuanqiao.blog";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED", visibility: "PUBLIC" },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { title: true, slug: true, excerpt: true, createdAt: true },
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>玄桥</title>
    <link>${SITE_URL}</link>
    <description>孤灯残雪，写意留白</description>
    <language>zh-CN</language>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    ${posts.map((p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${SITE_URL}/post/${p.slug}</link>
      <description><![CDATA[${p.excerpt || ""}]]></description>
      <pubDate>${p.createdAt.toUTCString()}</pubDate>
      <guid isPermaLink="true">${SITE_URL}/post/${p.slug}</guid>
    </item>`).join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: "file:./dev.db" }),
});

async function main() {
  const passwordHash = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@blog.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@blog.com",
      passwordHash,
      role: "ADMIN",
    },
  });

  const tagTech = await prisma.tag.create({ data: { name: "React" } });
  const tagLife = await prisma.tag.create({ data: { name: "生活" } });

  const post = await prisma.post.create({
    data: {
      title: "欢迎来到我的博客",
      slug: "hello-world",
      excerpt: "这是我的第一篇文章",
      content: `## 你好\n\n这是第一篇博客文章。欢迎来访。`,
      category: "ESSAY",
      status: "PUBLISHED",
      authorId: admin.id,
      tags: { create: [{ tagId: tagLife.id }] },
    },
  });

  console.log("Seed complete:", { admin: admin.email, post: post.title });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

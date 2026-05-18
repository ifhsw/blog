import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: "file:./dev.db" }),
});

async function main() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("SEED_ADMIN_PASSWORD environment variable is required to seed the database.");
    process.exit(1);
  }
  const passwordHash = await bcrypt.hash(adminPassword, 10);

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

  const tagReact = await prisma.tag.upsert({
    where: { name: "React" },
    create: { name: "React" },
    update: {},
  });
  const tagLife = await prisma.tag.upsert({
    where: { name: "生活" },
    create: { name: "生活" },
    update: {},
  });

  const post = await prisma.post.upsert({
    where: { slug: "hello-world" },
    create: {
      title: "欢迎来到我的博客",
      slug: "hello-world",
      excerpt: "这是我的第一篇文章",
      content: `## 你好\n\n这是第一篇博客文章。欢迎来访。`,
      category: "ESSAY",
      status: "PUBLISHED",
      authorId: admin.id,
      tags: { create: [{ tagId: tagLife.id }] },
    },
    update: {},
  });

  console.log("Seed complete:", { admin: admin.email, post: post.title });
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { redirect } from "next/navigation";

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "ADMIN") return { success: false, error: "无权限" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const excerpt = formData.get("excerpt") as string;
  const status = formData.get("status") as string;
  const tagNames = (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean);

  let slug = slugify(title, { lower: true, strict: true, locale: "zh" });
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug += "-" + Date.now().toString(36);

  const userId = (session.user as any).id;

  await prisma.post.create({
    data: {
      title,
      slug,
      content,
      category,
      excerpt: excerpt || null,
      status,
      authorId: userId,
      tags: {
        create: await Promise.all(
          tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
              where: { name },
              create: { name },
              update: {},
            });
            return { tagId: tag.id };
          })
        ),
      },
    },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function updatePost(id: string, formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return { success: false, error: "无权限" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const excerpt = formData.get("excerpt") as string;
  const status = formData.get("status") as string;

  await prisma.post.update({
    where: { id },
    data: { title, content, category, excerpt: excerpt || null, status },
  });

  revalidatePath("/admin/posts");
  revalidatePath("/");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return { success: false, error: "无权限" };

  await prisma.post.delete({ where: { id } });
  revalidatePath("/admin/posts");
  revalidatePath("/");
  return { success: true };
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const postId = formData.get("postId") as string;
  await deletePost(postId);
}

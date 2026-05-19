"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import slugify from "slugify";
import { redirect } from "next/navigation";
import { deletePostWithCleanup, cleanOrphanUploads } from "@/lib/uploads";

async function cleanOrphanTags() {
  await prisma.tag.deleteMany({
    where: { posts: { none: {} } },
  });
}

export async function createPost(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "请先登录" };

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const excerpt = formData.get("excerpt") as string;
  const status = formData.get("status") as string;
  const visibility = (formData.get("visibility") as string) || "PUBLIC";
  const tagNames = (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean);

  let slug = slugify(title, { lower: true, strict: true, locale: "zh" });
  if (!slug) slug = Date.now().toString(36);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug += "-" + Date.now().toString(36);

  // Non-admin users can only create drafts
  const finalStatus = isAdmin ? status : "DRAFT";

  await prisma.post.create({
    data: {
      title,
      slug,
      content,
      category,
      excerpt: excerpt || null,
      status: finalStatus,
      visibility,
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
  revalidatePath("/my-posts");
  revalidatePath("/");
  redirect(isAdmin ? "/admin/posts" : "/my-posts");
}

export async function updatePost(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "请先登录" };

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return { success: false, error: "文章不存在" };
  if (!isAdmin && post.authorId !== userId) return { success: false, error: "无权限" };

  const title = formData.get("title") as string;
  const content = formData.get("content") as string;
  const category = formData.get("category") as string;
  const excerpt = formData.get("excerpt") as string;
  const status = formData.get("status") as string;
  const visibility = (formData.get("visibility") as string) || undefined;

  // Non-admin users can only save as draft
  const finalStatus = isAdmin ? status : "DRAFT";

  const updateData: Record<string, unknown> = {
    title, content, category, excerpt: excerpt || null, status: finalStatus,
  };

  // Only admin can change visibility
  if (isAdmin && visibility) {
    updateData.visibility = visibility;
  }

  await prisma.post.update({
    where: { id },
    data: updateData,
  });

  revalidatePath("/admin/posts");
  revalidatePath("/my-posts");
  revalidatePath("/");
  redirect(isAdmin ? "/admin/posts" : "/my-posts");
}

export async function deletePost(id: string) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "请先登录" };

  const isAdmin = (session.user as any).role === "ADMIN";
  const userId = (session.user as any).id;

  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return { success: false, error: "文章不存在" };
  if (!isAdmin && post.authorId !== userId) return { success: false, error: "无权限" };

  await deletePostWithCleanup(id);
  await cleanOrphanTags();
  revalidatePath("/admin/posts");
  revalidatePath("/my-posts");
  revalidatePath("/");
  return { success: true };
}

export async function cleanOrphanUploadsAction() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") return { success: false, error: "无权限" };

  const count = await cleanOrphanUploads();
  revalidatePath("/admin/posts");
  return { success: true, cleaned: count };
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const postId = formData.get("postId") as string;
  await deletePost(postId);
}

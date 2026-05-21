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
  const content = formData.get("content") as string; // TipTap JSON string
  const category = formData.get("category") as string;
  const excerpt = formData.get("excerpt") as string;
  const status = (formData.get("status") as string) || "DRAFT";
  const visibility = (formData.get("visibility") as string) || "PUBLIC";
  const coverImage = (formData.get("coverImage") as string) || null;
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDesc = (formData.get("seoDesc") as string) || null;
  const scheduledAt = formData.get("scheduledAt") as string || null;
  const wordCountStr = (formData.get("wordCount") as string) || "0";
  const wordCount = parseInt(wordCountStr, 10) || null;
  const tagNames = (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean);
  const customSlug = (formData.get("slug") as string) || null;

  let slug = customSlug || slugify(title, { lower: true, strict: true, locale: "zh" });
  if (!slug) slug = Date.now().toString(36);
  const existing = await prisma.post.findUnique({ where: { slug } });
  if (existing) slug += "-" + Date.now().toString(36);

  // Non-admin users can only create drafts
  const finalStatus = isAdmin ? status : "DRAFT";

  await prisma.post.create({
    data: {
      title, slug, content, category,
      excerpt: excerpt || null,
      status: finalStatus, visibility,
      coverImage,
      seoTitle, seoDesc,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      wordCount,
      authorId: userId,
      tags: {
        create: await Promise.all(
          tagNames.map(async (name) => {
            const tag = await prisma.tag.upsert({
              where: { name }, create: { name }, update: {},
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
  const status = (formData.get("status") as string) || "DRAFT";
  const visibility = (formData.get("visibility") as string) || undefined;
  const coverImage = (formData.get("coverImage") as string) || null;
  const seoTitle = (formData.get("seoTitle") as string) || null;
  const seoDesc = (formData.get("seoDesc") as string) || null;
  const scheduledAt = formData.get("scheduledAt") as string || null;
  const wordCountStr = (formData.get("wordCount") as string) || "0";
  const wordCount = parseInt(wordCountStr, 10) || null;
  const tagNames = (formData.get("tags") as string).split(",").map((t) => t.trim()).filter(Boolean);
  const customSlug = (formData.get("slug") as string) || null;

  // Non-admin users can only save as draft
  const finalStatus = isAdmin ? status : "DRAFT";

  const updateData: Record<string, unknown> = {
    title, content, category, excerpt: excerpt || null, status: finalStatus,
    coverImage, seoTitle, seoDesc,
    scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    wordCount,
  };

  // Auto-update slug if title changed and slug not manually set
  if (!customSlug) {
    let newSlug = slugify(title, { lower: true, strict: true, locale: "zh" });
    if (!newSlug) newSlug = Date.now().toString(36);
    if (newSlug !== post.slug) {
      const existing = await prisma.post.findUnique({ where: { slug: newSlug } });
      if (existing && existing.id !== id) newSlug += "-" + Date.now().toString(36);
      updateData.slug = newSlug;
    }
  } else if (customSlug !== post.slug) {
    updateData.slug = customSlug;
  }

  // Only admin can change visibility
  if (isAdmin && visibility) {
    updateData.visibility = visibility;
  }

  await prisma.post.update({ where: { id }, data: updateData });

  // FIX: Update tags (was missing in old code — tags were never saved on update)
  if (tagNames.length > 0) {
    // Disconnect all existing tags
    await prisma.postTag.deleteMany({ where: { postId: id } });
    // Upsert and connect new tags
    for (const name of tagNames) {
      const tag = await prisma.tag.upsert({
        where: { name }, create: { name }, update: {},
      });
      await prisma.postTag.create({ data: { postId: id, tagId: tag.id } });
    }
  }

  // Clean orphan tags
  await cleanOrphanTags();

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

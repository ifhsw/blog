"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createComment(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "请先登录" };

  const content = formData.get("content") as string;
  const postId = formData.get("postId") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!content?.trim()) return { success: false, error: "评论不能为空" };

  await prisma.comment.create({
    data: {
      content: content.trim(),
      postId,
      userId: (session.user as any).id,
      parentId: parentId || null,
    },
  });

  revalidatePath("/post/[slug]");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return { success: false, error: "无权限" };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath("/post/[slug]");
  return { success: true };
}

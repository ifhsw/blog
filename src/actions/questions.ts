"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createQuestion(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "请先登录" };

  const content = formData.get("content") as string;
  if (!content?.trim()) return { success: false, error: "问题不能为空" };

  await prisma.question.create({
    data: {
      content: content.trim(),
      userId: (session.user as any).id,
    },
  });

  revalidatePath("/qa");
  revalidatePath("/account");
  return { success: true };
}

export async function replyToQuestion(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return { success: false, error: "无权限" };
  }

  const questionId = formData.get("questionId") as string;
  const reply = formData.get("reply") as string;
  if (!reply?.trim()) return { success: false, error: "回复不能为空" };

  await prisma.question.update({
    where: { id: questionId },
    data: { reply: reply.trim(), repliedAt: new Date() },
  });

  revalidatePath("/qa");
  revalidatePath("/account");
  return { success: true };
}

export async function deleteQuestion(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "请先登录" };

  const questionId = formData.get("questionId") as string;
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question) return { success: false, error: "问题不存在" };

  const isAdmin = (session.user as any).role === "ADMIN";
  const isOwner = question.userId === (session.user as any).id;
  if (!isAdmin && !isOwner) return { success: false, error: "无权限" };

  await prisma.question.delete({ where: { id: questionId } });

  revalidatePath("/qa");
  revalidatePath("/account");
  return { success: true };
}

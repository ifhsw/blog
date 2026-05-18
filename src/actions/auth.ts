"use server";

import { signIn, signOut, auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  try {
    await signIn("credentials", { email, password, redirect: false });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "邮箱或密码错误" };
    }
    throw error;
  }
}

export async function registerAction(formData: FormData) {
  const username = formData.get("username") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!username || !email || !password) {
    return { success: false, error: "请填写所有字段" };
  }
  if (password.length < 6) {
    return { success: false, error: "密码至少6位" };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    return { success: false, error: "邮箱或用户名已存在" };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { username, email, passwordHash, role: "READER" },
  });

  return { success: true };
}

export async function logoutAction() {
  await signOut({ redirect: false });
}

export async function changePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "请先登录" };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!currentPassword || !newPassword) {
    return { success: false, error: "请填写所有字段" };
  }
  if (newPassword.length < 6) {
    return { success: false, error: "新密码至少6位" };
  }

  const userId = (session.user as any).id;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "用户不存在" };

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "当前密码错误" };

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { success: true };
}

export async function resetUserPassword(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return { success: false, error: "无权限" };
  }

  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!userId || !newPassword) {
    return { success: false, error: "请填写所有字段" };
  }
  if (newPassword.length < 6) {
    return { success: false, error: "新密码至少6位" };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return { success: true };
}

export async function deleteUser(formData: FormData) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return { success: false, error: "无权限" };
  }

  const userId = formData.get("userId") as string;
  if (!userId) return { success: false, error: "缺少用户ID" };

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { success: false, error: "用户不存在" };
  if (target.role === "ADMIN") return { success: false, error: "不能删除管理员" };

  const selfId = (session?.user as any)?.id;
  if (userId === selfId) return { success: false, error: "不能删除自己" };

  await prisma.$transaction([
    prisma.postTag.deleteMany({ where: { post: { authorId: userId } } }),
    prisma.comment.deleteMany({ where: { userId } }),
    prisma.question.deleteMany({ where: { userId } }),
    prisma.post.deleteMany({ where: { authorId: userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  return { success: true };
}

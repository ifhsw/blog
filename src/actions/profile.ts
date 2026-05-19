"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { success: false, error: "请先登录" };

  const userId = (session.user as any).id;

  const bio = (formData.get("bio") as string)?.trim() || null;
  const website = (formData.get("website") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const github = (formData.get("github") as string)?.trim() || null;
  const twitter = (formData.get("twitter") as string)?.trim() || null;

  await prisma.user.update({
    where: { id: userId },
    data: { bio, website, location, github, twitter },
  });

  revalidatePath("/account");
  revalidatePath(`/user/${(session.user as any).username}`);
  return { success: true };
}

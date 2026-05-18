"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function requireAdmin() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    throw new Error("无权限");
  }
}

export async function getSiteSetting(key: string) {
  const record = await prisma.siteSetting.findUnique({ where: { key } });
  return record?.value ?? null;
}

export async function updateSiteSetting(key: string, value: string) {
  await requireAdmin();
  await prisma.siteSetting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

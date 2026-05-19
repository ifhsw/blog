import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "未选择文件" }, { status: 400 });
    }

    // Validate: only allow safe image types (no SVG — can contain scripts)
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "仅支持 JPEG/PNG/GIF/WebP 图片" }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "文件不能超过 10MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Verify magic bytes to prevent MIME type spoofing
    const magicBytes: Record<string, number[]> = {
      "image/jpeg": [0xff, 0xd8, 0xff],
      "image/png": [0x89, 0x50, 0x4e, 0x47],
      "image/gif": [0x47, 0x49, 0x46],
      "image/webp": [0x52, 0x49, 0x46, 0x46],
    };
    const expectedMagic = magicBytes[file.type];
    if (expectedMagic && !expectedMagic.every((b, i) => buffer[i] === b)) {
      return NextResponse.json({ error: "文件内容与类型不匹配" }, { status: 400 });
    }

    // Sanitize filename extension
    const ext = (file.name.split(".").pop() || "jpg")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();
    const allowedExts = ["jpg", "jpeg", "png", "gif", "webp"];
    const safeExt = allowedExts.includes(ext) ? ext : "jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const filePath = path.join(uploadsDir, uniqueName);
    await writeFile(filePath, buffer);

    const url = `/uploads/${uniqueName}`;

    return NextResponse.json({ success: true, url, filename: uniqueName });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Upload error:", error);
    }
    return NextResponse.json({ error: "上传失败" }, { status: 500 });
  }
}

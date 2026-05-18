import { existsSync, unlinkSync, readdirSync } from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";

const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/** Extract all /uploads/ filenames from markdown/MDX content */
export function extractUploadFilenames(content: string): string[] {
  const matches = content.matchAll(/\/uploads\/([^\s)"')\]>]+)/g);
  return [...matches].map((m) => m[1]);
}

/** Delete specific upload files by filename */
export function deleteUploadFiles(filenames: string[]): { deleted: string[]; missing: string[] } {
  const deleted: string[] = [];
  const missing: string[] = [];

  for (const name of filenames) {
    const filePath = path.join(UPLOADS_DIR, name);
    // Safety: prevent path traversal
    if (!filePath.startsWith(UPLOADS_DIR)) continue;
    if (existsSync(filePath)) {
      unlinkSync(filePath);
      deleted.push(name);
    } else {
      missing.push(name);
    }
  }

  return { deleted, missing };
}

/**
 * Delete post and its associated uploaded images.
 * Call this instead of directly deleting via prisma.
 */
export async function deletePostWithCleanup(postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { content: true },
  });

  if (post) {
    const filenames = extractUploadFilenames(post.content);
    if (filenames.length > 0) {
      deleteUploadFiles(filenames);
    }
  }

  await prisma.post.delete({ where: { id: postId } });
}

/**
 * Find and delete orphan upload files not referenced by any post.
 * Returns the count of deleted files.
 */
export async function cleanOrphanUploads(): Promise<number> {
  if (!existsSync(UPLOADS_DIR)) return 0;

  // Collect all referenced filenames from all posts
  const posts = await prisma.post.findMany({ select: { content: true } });
  const referenced = new Set<string>();
  for (const p of posts) {
    for (const name of extractUploadFilenames(p.content)) {
      referenced.add(name);
    }
  }

  // Find orphan files
  const allFiles = readdirSync(UPLOADS_DIR);
  const orphans = allFiles.filter((f) => !referenced.has(f));

  if (orphans.length > 0) {
    deleteUploadFiles(orphans);
  }

  return orphans.length;
}

/**
 * Clean up uploads that were superseded by post edits.
 * Finds all referenced uploads in current posts, deletes the rest.
 */
export async function cleanOrphanUploadsAction(): Promise<{ cleaned: number }> {
  const count = await cleanOrphanUploads();
  return { cleaned: count };
}

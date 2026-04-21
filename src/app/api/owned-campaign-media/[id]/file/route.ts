import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { OwnedMediaReviewStatus, OwnedMediaStorageBackend } from "@prisma/client";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";
import { storageKeyToAbsoluteFilePath } from "@/lib/owned-media/paths";
import { prisma } from "@/lib/db";

function mimeForPath(fileName: string, fallback: string): string {
  const ext = extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return map[ext] ?? fallback;
}

async function isAdminRequest(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token, secret);
}

/**
 * Serves the original binary. Public read is allowed when the asset is approved for site use and marked public
 * (same bar as the rest of the board: human review, not auto-publish).
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const asset = await prisma.ownedMediaAsset.findUnique({ where: { id } });
  if (!asset) {
    return new Response("Not found", { status: 404 });
  }

  const admin = await isAdminRequest();
  const canPublicRead = asset.isPublic && asset.reviewStatus === OwnedMediaReviewStatus.APPROVED;
  if (!admin && !canPublicRead) {
    return new Response("Forbidden", { status: 403 });
  }

  if (asset.storageBackend === OwnedMediaStorageBackend.SUPABASE && asset.publicUrl) {
    return NextResponse.redirect(asset.publicUrl, 302);
  }

  try {
    const abs = storageKeyToAbsoluteFilePath(asset.storageKey);
    const buf = await readFile(abs);
    const mime = mimeForPath(asset.fileName, asset.mimeType);
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(buf.length),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new Response("File missing on disk", { status: 404 });
  }
}

export const dynamic = "force-dynamic";

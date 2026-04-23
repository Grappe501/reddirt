import { readFile, stat } from "node:fs/promises";
import { extname } from "node:path";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OwnedMediaStorageBackend, OwnedMediaReviewStatus } from "@prisma/client";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";
import { storageKeyToAbsoluteFilePath } from "@/lib/owned-media/paths";
import { prisma } from "@/lib/db";
import { ownedMediaFileUrl } from "@/lib/media-library/public-urls";

function mimeForPath(fileName: string, fallback: string): string {
  const ext = extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
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
 * Serves a thumbnail if present; otherwise redirects to the main file route.
 * Does not return raw `storageKey` or absolute paths in JSON — only image bytes.
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

  if (asset.thumbPublicUrl) {
    return NextResponse.redirect(asset.thumbPublicUrl, 302);
  }

  if (asset.thumbStorageKey) {
    try {
      if (asset.storageBackend === OwnedMediaStorageBackend.LOCAL_DISK) {
        const abs = storageKeyToAbsoluteFilePath(asset.thumbStorageKey);
        const s = await stat(abs);
        if (s.isFile()) {
          const buf = await readFile(abs);
          return new Response(new Uint8Array(buf), {
            status: 200,
            headers: {
              "Content-Type": mimeForPath(asset.fileName, "image/jpeg"),
              "Cache-Control": "private, max-age=600",
            },
          });
        }
      }
    } catch {
      // fall through to main file
    }
  }

  return NextResponse.redirect(ownedMediaFileUrl(id), 302);
}

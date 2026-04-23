import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";
import { storageKeyToAbsoluteFilePath } from "@/lib/owned-media/paths";
import { prisma } from "@/lib/db";

function mimeForPath(fileName: string, fallback: string): string {
  const ext = extname(fileName).toLowerCase();
  const map: Record<string, string> = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".doc": "application/msword",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".xls": "application/vnd.ms-excel",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
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
 * Serves the uploaded file **only** to authenticated admin (not a public RAG URL).
 */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const admin = await isAdminRequest();
  if (!admin) {
    return new Response("Forbidden", { status: 403 });
  }
  const doc = await prisma.complianceDocument.findUnique({ where: { id } });
  if (!doc) {
    return new Response("Not found", { status: 404 });
  }
  try {
    const abs = storageKeyToAbsoluteFilePath(doc.storageKey);
    const buf = await readFile(abs);
    const mime = mimeForPath(doc.fileName, doc.mimeType);
    return new Response(new Uint8Array(buf), {
      status: 200,
      headers: {
        "Content-Type": mime,
        "Content-Length": String(buf.length),
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.originalFileName || doc.fileName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("File missing on disk", { status: 404 });
  }
}

export const dynamic = "force-dynamic";

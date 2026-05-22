import { readFile } from "node:fs/promises";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, getAdminSecret, verifyAdminSessionToken } from "@/lib/admin/session";
import { getMediaById } from "@/lib/campaign-events/media/media-index";
import { getMediaAbsolutePath } from "@/lib/campaign-events/media/media-storage";

export const dynamic = "force-dynamic";

async function requireAdminApi(): Promise<boolean> {
  const secret = getAdminSecret();
  if (!secret) return false;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token, secret);
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ mediaId: string }> },
) {
  if (!(await requireAdminApi())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { mediaId } = await context.params;
  const record = await getMediaById(mediaId);
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const abs = await getMediaAbsolutePath(record);
    const bytes = await readFile(abs);
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": record.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(record.originalFilename)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing on disk" }, { status: 404 });
  }
}

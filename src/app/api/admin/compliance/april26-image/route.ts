import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { getApril26Dir } from "@/lib/compliance/approval/april26-source";
import { prepareCheckImageForVision } from "@/lib/compliance/checks/prepare-check-image-for-vision";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  const rel = new URL(request.url).searchParams.get("rel")?.trim();
  if (!rel || rel.includes("..") || path.isAbsolute(rel)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const root = path.resolve(getApril26Dir());
  const absolute = path.resolve(root, rel);
  if (!absolute.startsWith(root)) {
    return NextResponse.json({ error: "Path outside April26 folder" }, { status: 403 });
  }

  try {
    const converted = await prepareCheckImageForVision(absolute);
    const buf = Buffer.from(converted.base64, "base64");
    return new NextResponse(buf, {
      headers: {
        "Content-Type": converted.mimeType,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    try {
      const buf = await readFile(absolute);
      const ext = path.extname(absolute).toLowerCase();
      const mime = ext === ".png" ? "image/png" : "image/jpeg";
      return new NextResponse(buf, { headers: { "Content-Type": mime, "Cache-Control": "private, max-age=3600" } });
    } catch {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
  }
}

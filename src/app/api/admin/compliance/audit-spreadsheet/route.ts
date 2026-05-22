import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { APRIL_AUDIT_PATHS } from "@/lib/compliance/audit/write-april-audit-spreadsheet";

const ALLOWED_PATHS = Object.values(APRIL_AUDIT_PATHS);

export async function GET(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  const fileParam = new URL(request.url).searchParams.get("file") ?? APRIL_AUDIT_PATHS.main;
  if (!ALLOWED_PATHS.includes(fileParam as (typeof ALLOWED_PATHS)[number])) {
    return NextResponse.json({ error: "Unknown file" }, { status: 400 });
  }

  try {
    const buf = await readFile(path.join(process.cwd(), fileParam));
    const name = path.basename(fileParam);
    return new NextResponse(buf, {
      headers: {
        "Content-Type": fileParam.endsWith(".xlsx") ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" : "text/csv",
        "Content-Disposition": `attachment; filename="${name}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File not found — run npm run compliance:april-audit-spreadsheet" }, { status: 404 });
  }
}

import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  buildAprilCheckSosWorkbook,
  loadAprilCheckSosWorkbook,
  workbookToCsv,
} from "@/lib/compliance/checks/april-check-sos-workbook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  const format = new URL(request.url).searchParams.get("format") ?? "csv";
  const workbook = (await loadAprilCheckSosWorkbook()) ?? (await buildAprilCheckSosWorkbook());

  if (format === "json") {
    return new NextResponse(JSON.stringify(workbook, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="april-check-sos-entries.json"',
      },
    });
  }

  return new NextResponse(workbookToCsv(workbook), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="april-check-sos-export.csv"',
    },
  });
}

import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import {
  addManualCheckOnImage,
  buildAprilCheckSosWorkbook,
  extractAprilCheckSosEntry,
  extractAprilCheckSosImage,
  importAprilCheckSosWorkbook,
  updateAprilCheckSosEntry,
} from "@/lib/compliance/checks/april-check-sos-workbook.server";
import type { AprilCheckSosWorkbook } from "@/lib/compliance/checks/april-check-sos-types";
import type { CheckSosFieldKey } from "@/lib/compliance/checks/check-sos-field-catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const workbook = (await buildAprilCheckSosWorkbook()) ?? { entries: [] };
  return NextResponse.json(workbook);
}

export async function PATCH(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const body = (await request.json()) as {
    id: string;
    fields?: Partial<Record<CheckSosFieldKey, string>>;
    reviewed?: boolean;
    operatorNotes?: string;
  };
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const entry = await updateAprilCheckSosEntry(body.id, {
    fields: body.fields,
    reviewed: body.reviewed,
    operatorNotes: body.operatorNotes,
  });
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ entry });
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const body = (await request.json()) as { action: string; id?: string; imageRelativePath?: string };
  if (body.action === "extract_image" && body.imageRelativePath) {
    const result = await extractAprilCheckSosImage(body.imageRelativePath);
    if (!result) return NextResponse.json({ error: "Image not found" }, { status: 404 });
    return NextResponse.json(result);
  }
  if (body.action === "extract" && body.id) {
    const entry = await extractAprilCheckSosEntry(body.id);
    if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ entry });
  }
  if (body.action === "add_check" && body.imageRelativePath) {
    const entry = await addManualCheckOnImage(body.imageRelativePath);
    if (!entry) return NextResponse.json({ error: "Image not found" }, { status: 404 });
    return NextResponse.json({ entry });
  }
  if (body.action === "rebuild") {
    const workbook = await buildAprilCheckSosWorkbook();
    return NextResponse.json(workbook);
  }
  if (body.action === "extract_all") {
    const workbook = await buildAprilCheckSosWorkbook({ extract: true });
    return NextResponse.json(workbook);
  }
  if (body.action === "import_workbook") {
    const workbook = (body as { workbook?: AprilCheckSosWorkbook }).workbook;
    if (!workbook?.entries?.length) {
      return NextResponse.json({ error: "workbook with entries required" }, { status: 400 });
    }
    const saved = await importAprilCheckSosWorkbook(workbook);
    return NextResponse.json(saved);
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

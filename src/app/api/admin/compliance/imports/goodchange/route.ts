import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { stageGoodChangeImport } from "@/lib/compliance/imports/stage-goodchange-import";
import { stageGoodChangeMoneyCoverage } from "@/lib/compliance/money/goodchange-money-coverage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;

  const formData = await request.formData();
  const file = formData.get("file");
  const uploadedByInitials = String(formData.get("uploadedByInitials") ?? "").trim() || undefined;

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "CSV file is required." }, { status: 400 });
  }

  const csvText = await file.text();
  const analysis = await stageGoodChangeImport({
    fileName: file.name,
    csvText,
    uploadedByInitials,
  });
  const moneyCoverage = await stageGoodChangeMoneyCoverage(analysis);

  return NextResponse.json({ analysis, moneyCoverage }, { status: 201 });
}

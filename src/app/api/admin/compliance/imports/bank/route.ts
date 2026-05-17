import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { stageBankImport } from "@/lib/compliance/imports/stage-bank-import";

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
  const analysis = await stageBankImport({
    fileName: file.name,
    csvText,
    uploadedByInitials,
  });

  return NextResponse.json({ analysis }, { status: 201 });
}

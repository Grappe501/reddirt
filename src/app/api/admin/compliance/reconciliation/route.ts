import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { buildReconciliationAnalysis } from "@/lib/compliance/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const analysis = await buildReconciliationAnalysis();
  return NextResponse.json({ analysis });
}

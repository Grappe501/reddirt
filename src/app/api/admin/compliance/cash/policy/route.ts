import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { loadCashPolicy, saveCashPolicy } from "@/lib/compliance/cash/cash-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const policy = await loadCashPolicy();
  return NextResponse.json({ policy });
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const form = await request.formData();
  const existing = await loadCashPolicy();
  const policy = {
    ...existing,
    maxCashContributionAmount: Number(form.get("maxCashContributionAmount") ?? existing.maxCashContributionAmount),
    idRequired: form.get("idRequired") === "on",
    contributorInfoRequired: form.get("contributorInfoRequired") === "on",
    requireHumanReview: form.get("requireHumanReview") === "on",
    sourceNote: String(form.get("sourceNote") ?? existing.sourceNote),
    verifiedBy: String(form.get("verifiedBy") ?? "").trim() || undefined,
    verifiedAt: String(form.get("verifiedAt") ?? "").trim() || undefined,
  };
  await saveCashPolicy(policy);
  return NextResponse.json({ policy });
}

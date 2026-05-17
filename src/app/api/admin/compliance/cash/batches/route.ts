import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { createCashDepositBatch, loadCashDepositBatches } from "@/lib/compliance/cash/cash-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const batches = await loadCashDepositBatches();
  return NextResponse.json({ batches });
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const form = await request.formData();
  const contributionIds = String(form.get("contributionIds") ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const batch = await createCashDepositBatch({
    contributionIds,
    countedCashTotal: Number(form.get("countedCashTotal") ?? 0),
    preparedByInitials: String(form.get("preparedByInitials") ?? "").trim() || "UNK",
    batchDate: String(form.get("batchDate") ?? "").trim() || undefined,
    notes: String(form.get("notes") ?? "").trim() || undefined,
  });
  return NextResponse.json({ batch }, { status: 201 });
}

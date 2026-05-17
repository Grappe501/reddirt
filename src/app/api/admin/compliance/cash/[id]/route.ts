import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { updateCashContributionStatus } from "@/lib/compliance/cash/cash-storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const { id } = await params;
  const form = await request.formData();
  const action = String(form.get("action") ?? "");
  if (!["approved", "rejected", "converted_to_contribution"].includes(action)) {
    return NextResponse.json({ error: "Unsupported cash action." }, { status: 400 });
  }
  const contribution = await updateCashContributionStatus({
    id,
    actorInitials: String(form.get("actorInitials") ?? "").trim() || "UNK",
    action: action as "approved" | "rejected" | "converted_to_contribution",
    note: String(form.get("note") ?? "").trim() || undefined,
  });
  return NextResponse.json({ contribution });
}

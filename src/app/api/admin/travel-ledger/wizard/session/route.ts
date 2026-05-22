import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { createTravelLedgerWizardSession } from "@/lib/travel-ledger/workflow";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const body = (await request.json()) as {
    reviewerInitials?: string;
    reviewerName?: string;
    startDate?: string;
    endDate?: string;
  };
  const session = await createTravelLedgerWizardSession({
    reviewerInitials: body.reviewerInitials ?? "",
    reviewerName: body.reviewerName,
    startDate: body.startDate ?? "",
    endDate: body.endDate ?? "",
  });
  return NextResponse.json({ session }, { status: 201 });
}
import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { loadLedgerItems } from "@/lib/travel-ledger/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const { itemId } = await params;
  const item = (await loadLedgerItems()).find((entry) => entry.id === itemId);
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ item });
}

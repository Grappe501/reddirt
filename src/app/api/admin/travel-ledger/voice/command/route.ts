import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { assertAdminApi } from "@/lib/admin/require-admin";
import { appendAuditLog } from "@/lib/travel-ledger/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const unauthorized = await assertAdminApi();
  if (unauthorized) return unauthorized;
  const { transcript, itemId } = (await request.json()) as { transcript?: string; itemId?: string };
  const normalized = (transcript ?? "").trim().toLowerCase();
  const intent = normalized.includes("approve with changes")
    ? "approve_with_changes"
    : normalized.includes("approve")
      ? "approve"
      : normalized.includes("deny")
        ? "deny"
        : normalized.includes("next")
          ? "next"
          : "unknown";

  await appendAuditLog({
    id: randomUUID(),
    itemId: itemId || "voice-session",
    action: "voice_command",
    note: `Parsed voice command intent: ${intent}. Manual confirmation still required.`,
    actor: "admin",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({
    intent,
    requiresConfirmation: true,
    message: "Voice command parsed. Use the wizard buttons to confirm reimbursement actions.",
  });
}

import { NextResponse } from "next/server";
import {
  approveItem,
  approveItemWithChanges,
  markDuplicate,
  markNeedsInfo,
  rejectItem,
  reopenItem,
  saveApprovalFieldEdits,
  skipItem,
} from "@/lib/compliance/approval/approval-actions";
import { getApprovalItem } from "@/lib/compliance/approval/approval-storage";

export async function GET(_request: Request, context: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await context.params;
  const item = await getApprovalItem(itemId);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function POST(request: Request, context: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await context.params;
  const body = (await request.json()) as {
    action: string;
    initials: string;
    note?: string;
    edits?: Record<string, string | number | boolean | null>;
    duplicateOfId?: string;
  };
  const initials = body.initials?.trim();
  if (!initials) return NextResponse.json({ error: "Initials required" }, { status: 400 });

  try {
    let result;
    switch (body.action) {
      case "save":
        result = { item: await saveApprovalFieldEdits(itemId, body.edits ?? {}, initials) };
        break;
      case "approve":
        result = await approveItem(itemId, initials, body.note);
        break;
      case "approve_with_changes":
        if (body.edits && Object.keys(body.edits).length) await saveApprovalFieldEdits(itemId, body.edits, initials);
        result = await approveItemWithChanges(itemId, initials, body.note);
        break;
      case "needs_info":
        result = await markNeedsInfo(itemId, initials, body.note);
        break;
      case "reject":
        result = await rejectItem(itemId, initials, body.note ?? "Rejected");
        break;
      case "duplicate":
        result = await markDuplicate(itemId, initials, body.duplicateOfId, body.note);
        break;
      case "skip":
        result = await skipItem(itemId, initials, body.note);
        break;
      case "reopen":
        result = { item: await reopenItem(itemId, initials, body.note) };
        break;
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Action failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

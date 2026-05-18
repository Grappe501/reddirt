import { NextResponse } from "next/server";
import { loadApprovalAuditLog } from "@/lib/compliance/approval/approval-storage";

export async function GET() {
  const log = await loadApprovalAuditLog();
  return NextResponse.json({ exportedAt: new Date().toISOString(), entries: log });
}

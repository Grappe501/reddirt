import "server-only";

import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/db";
import { parseFactCardEnvelope, serializeFactCardEnvelope, withPreservedFactCardExtensions } from "../fact-card-envelope";
import type { ApprovalEmailLogEntry } from "./approval-email-log";
import { parseApprovalEmailLog } from "./approval-email-log";

function newLogId(): string {
  return `ael_${randomBytes(10).toString("hex")}`;
}

export async function appendApprovalEmailLog(recordId: string, entry: Omit<ApprovalEmailLogEntry, "id" | "recordId">): Promise<ApprovalEmailLogEntry> {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) throw new Error("Campaign event record not found.");

  const full: ApprovalEmailLogEntry = {
    ...entry,
    id: newLogId(),
    recordId,
  };

  const envelope = parseFactCardEnvelope(record.factCard);
  const prevLog = parseApprovalEmailLog(record.factCard);
  const nextLog = [full, ...prevLog].slice(0, 40);

  const serialized = serializeFactCardEnvelope(envelope);
  const withLog = {
    ...(serialized as Record<string, unknown>),
    _approvalEmailLog: nextLog,
  };

  await prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: {
      factCard: withPreservedFactCardExtensions(withLog, record.factCard) as object,
    },
  });

  return full;
}

export async function loadApprovalEmailLogForRecord(recordId: string): Promise<ApprovalEmailLogEntry[]> {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) return [];
  return parseApprovalEmailLog(record.factCard);
}

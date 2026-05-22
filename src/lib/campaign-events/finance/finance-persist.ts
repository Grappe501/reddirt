import { prisma } from "@/lib/db";
import { parseFactCardEnvelope, serializeFactCardEnvelope, withPreservedFactCardExtensions } from "../fact-card-envelope";
import { getRecordById } from "../persistence/records";
import { emptyEventFinance } from "./finance-defaults";
import type { EventFinanceData } from "./finance-types";

const STORAGE_KEY = "_eventFinance";

export function parseEventFinance(raw: unknown): EventFinanceData {
  const base = emptyEventFinance();
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  return {
    ...base,
    budget: { ...base.budget, ...(o.budget as object) },
    expenses: Array.isArray(o.expenses) ? (o.expenses as EventFinanceData["expenses"]) : base.expenses,
    linkedReceiptIds: Array.isArray(o.linkedReceiptIds) ? (o.linkedReceiptIds as string[]) : base.linkedReceiptIds,
    compliance: { ...base.compliance, ...(o.compliance as object), gaps: Array.isArray((o.compliance as { gaps?: unknown })?.gaps) ? ((o.compliance as { gaps: string[] }).gaps) : base.compliance.gaps },
    approvalChain: { ...base.approvalChain, ...(o.approvalChain as object) },
    executiveSummary: typeof o.executiveSummary === "string" ? o.executiveSummary : base.executiveSummary,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
  };
}

export async function loadEventFinance(recordId: string): Promise<EventFinanceData> {
  const record = await getRecordById(recordId);
  if (!record) return emptyEventFinance();
  const raw = record.factCard as Record<string, unknown> | null;
  return parseEventFinance(raw?.[STORAGE_KEY]);
}

export async function saveEventFinance(recordId: string, data: EventFinanceData): Promise<EventFinanceData> {
  const record = await getRecordById(recordId);
  if (!record) throw new Error("Campaign event record not found.");
  const envelope = parseFactCardEnvelope(record.factCard);
  const payload: EventFinanceData = { ...data, updatedAt: new Date().toISOString() };
  const serialized = serializeFactCardEnvelope(envelope) as Record<string, unknown>;
  const merged = { ...serialized, [STORAGE_KEY]: payload };
  await prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: { factCard: withPreservedFactCardExtensions(merged, record.factCard) as object },
  });
  return payload;
}

import { randomBytes } from "node:crypto";
import type { CampaignEventLedgerCalendarStatus } from "@prisma/client";
import { prisma } from "@/lib/db";
import { parseFactCardEnvelope, serializeFactCardEnvelope, withPreservedFactCardExtensions } from "../fact-card-envelope";
import { attachPromotionMeta, parsePromotionMeta } from "./promotion-meta";
import type { PromotionTargetLane } from "./promotion-types";

export type PromotionAuditEntry = {
  id: string;
  recordId: string;
  at: string;
  actor: string;
  action:
    | "promotion_attempted"
    | "promotion_blocked"
    | "promotion_succeeded"
    | "promotion_failed"
    | "dry_run"
    | "operator_overrode_warning";
  targetLane: PromotionTargetLane;
  message?: string;
  googleEventId?: string;
};

export function parsePromotionAuditLog(raw: unknown): PromotionAuditEntry[] {
  if (!raw || typeof raw !== "object") return [];
  const log = (raw as Record<string, unknown>)._calendarPromotionLog;
  if (!Array.isArray(log)) return [];
  return log.filter((e): e is PromotionAuditEntry => e && typeof e === "object" && typeof (e as PromotionAuditEntry).id === "string");
}

async function appendAudit(recordId: string, entry: Omit<PromotionAuditEntry, "id" | "recordId">) {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) throw new Error("Record not found");
  const prev = parsePromotionAuditLog(record.factCard);
  const full: PromotionAuditEntry = {
    ...entry,
    id: `cpl_${randomBytes(8).toString("hex")}`,
    recordId,
  };
  const envelope = parseFactCardEnvelope(record.factCard);
  const serialized = withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), {
    ...(record.factCard as object),
    _calendarPromotionLog: [...prev, full].slice(-100),
  });
  await prisma.campaignEventLedgerRecord.update({
    where: { id: recordId },
    data: { factCard: serialized as object },
  });
  return full;
}

export async function loadPromotionAuditForRecord(recordId: string): Promise<PromotionAuditEntry[]> {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: recordId } });
  if (!record) return [];
  return parsePromotionAuditLog(record.factCard);
}

export async function persistPromotionSuccess(input: {
  recordId: string;
  targetLane: PromotionTargetLane;
  actor: string;
  googleEventId: string;
  googleEventUrl: string | null;
  calendarSourceId: string;
  externalCalendarId: string;
}) {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: input.recordId } });
  if (!record) throw new Error("Record not found");

  const meta = parsePromotionMeta(record.factCard);
  const now = new Date().toISOString();
  if (input.targetLane === "tentative") {
    meta.tentativeGoogleEventId = input.googleEventId;
    meta.tentativePromotedAt = now;
    meta.promotionStatus = "PROMOTED_TO_TENTATIVE";
  } else {
    meta.officialGoogleEventId = input.googleEventId;
    meta.officialPromotedAt = now;
    meta.promotionStatus = "PROMOTED_TO_OFFICIAL";
  }
  meta.promotedBy = input.actor;
  meta.promotionError = null;
  meta.promotionAttemptCount += 1;
  meta.lastPromotionAttemptAt = now;
  meta.lastTargetLane = input.targetLane;

  const calendarStatus: CampaignEventLedgerCalendarStatus =
    input.targetLane === "official" ? "OFFICIAL_CALENDAR" : "TENTATIVE_CALENDAR";

  const envelope = parseFactCardEnvelope(record.factCard);
  const serialized = withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), {
    ...(record.factCard as object),
    _calendarPromotion: meta,
  });

  await prisma.campaignEventLedgerRecord.update({
    where: { id: input.recordId },
    data: {
      googleEventId: input.googleEventId,
      googleEventUrl: input.googleEventUrl,
      googleSyncStatus: "SYNCED",
      googleLastSyncedAt: new Date(),
      calendarStatus,
      tentativeCalendarId: input.targetLane === "tentative" ? input.externalCalendarId : record.tentativeCalendarId,
      officialCalendarId: input.targetLane === "official" ? input.externalCalendarId : record.officialCalendarId,
      factCard: serialized as object,
    },
  });

  await appendAudit(input.recordId, {
    at: now,
    actor: input.actor,
    action: "promotion_succeeded",
    targetLane: input.targetLane,
    googleEventId: input.googleEventId,
    message: `Promoted to ${input.targetLane} Google calendar`,
  });
}

export async function persistPromotionFailure(input: {
  recordId: string;
  targetLane: PromotionTargetLane;
  actor: string;
  error: string;
}) {
  const record = await prisma.campaignEventLedgerRecord.findUnique({ where: { id: input.recordId } });
  if (!record) return;
  const meta = parsePromotionMeta(record.factCard);
  const now = new Date().toISOString();
  meta.promotionStatus = "PROMOTION_FAILED";
  meta.promotionError = input.error;
  meta.promotionAttemptCount += 1;
  meta.lastPromotionAttemptAt = now;
  meta.lastTargetLane = input.targetLane;

  const envelope = parseFactCardEnvelope(record.factCard);
  const serialized = withPreservedFactCardExtensions(serializeFactCardEnvelope(envelope), {
    ...(record.factCard as object),
    _calendarPromotion: meta,
  });
  await prisma.campaignEventLedgerRecord.update({
    where: { id: input.recordId },
    data: { googleSyncStatus: "ERROR", factCard: serialized as object },
  });
  await appendAudit(input.recordId, {
    at: now,
    actor: input.actor,
    action: "promotion_failed",
    targetLane: input.targetLane,
    message: input.error,
  });
}

export { appendAudit as appendPromotionAudit };

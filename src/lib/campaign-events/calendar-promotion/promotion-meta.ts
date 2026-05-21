import type { CampaignEventLedgerRecord } from "@prisma/client";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import { parseFactCardEnvelope } from "../fact-card-envelope";
import type { CalendarPromotionStatus, LedgerCalendarPromotionMeta, PromotionTargetLane } from "./promotion-types";

export function emptyPromotionMeta(): LedgerCalendarPromotionMeta {
  return {
    version: 1,
    promotionStatus: "WEBSITE_ENTRY_ONLY",
    tentativeGoogleEventId: null,
    officialGoogleEventId: null,
    tentativePromotedAt: null,
    officialPromotedAt: null,
    promotedBy: null,
    promotionError: null,
    promotionAttemptCount: 0,
    lastPromotionAttemptAt: null,
    lastTargetLane: null,
  };
}

export function parsePromotionMeta(raw: unknown): LedgerCalendarPromotionMeta {
  if (!raw || typeof raw !== "object") return emptyPromotionMeta();
  const o = raw as Record<string, unknown>;
  const m = o._calendarPromotion;
  if (!m || typeof m !== "object") return emptyPromotionMeta();
  const p = m as Partial<LedgerCalendarPromotionMeta>;
  return {
    version: 1,
    promotionStatus: (p.promotionStatus as CalendarPromotionStatus) ?? "WEBSITE_ENTRY_ONLY",
    tentativeGoogleEventId: typeof p.tentativeGoogleEventId === "string" ? p.tentativeGoogleEventId : null,
    officialGoogleEventId: typeof p.officialGoogleEventId === "string" ? p.officialGoogleEventId : null,
    tentativePromotedAt: typeof p.tentativePromotedAt === "string" ? p.tentativePromotedAt : null,
    officialPromotedAt: typeof p.officialPromotedAt === "string" ? p.officialPromotedAt : null,
    promotedBy: typeof p.promotedBy === "string" ? p.promotedBy : null,
    promotionError: typeof p.promotionError === "string" ? p.promotionError : null,
    promotionAttemptCount: typeof p.promotionAttemptCount === "number" ? p.promotionAttemptCount : 0,
    lastPromotionAttemptAt: typeof p.lastPromotionAttemptAt === "string" ? p.lastPromotionAttemptAt : null,
    lastTargetLane: (p.lastTargetLane as PromotionTargetLane) ?? null,
  };
}

export function derivePromotionStatus(
  record: CampaignEventLedgerRecord,
  row: WorkbenchEventRow,
  meta: LedgerCalendarPromotionMeta,
): CalendarPromotionStatus {
  if (meta.promotionStatus === "PROMOTION_FAILED" && meta.promotionError) return "PROMOTION_FAILED";
  if (row.hasConflictWarning && !meta.officialGoogleEventId) return "PROMOTION_CONFLICT";
  if (meta.officialGoogleEventId || record.calendarStatus === "OFFICIAL_CALENDAR") return "PROMOTED_TO_OFFICIAL";
  if (meta.tentativeGoogleEventId || record.calendarStatus === "TENTATIVE_CALENDAR") return "PROMOTED_TO_TENTATIVE";
  if (record.entrySource === "WEBSITE_ENTRY" && !row.rawDecision) return "WEBSITE_ENTRY_ONLY";
  if (row.rawDecision === "denied" || row.rawDecision === "personal" || row.rawDecision === "duplicate") {
    return "PROMOTION_BLOCKED";
  }
  if (row.rawDecision === "approved") {
    if (!meta.tentativeGoogleEventId) return "READY_FOR_TENTATIVE_PROMOTION";
    if (!meta.officialGoogleEventId) return "READY_FOR_OFFICIAL_PROMOTION";
  }
  if (record.eventStatus === "TENTATIVE" || record.eventStatus === "NEEDS_REVIEW") return "TENTATIVE_INTERNAL";
  return meta.promotionStatus;
}

export function attachPromotionMeta(factCardObject: object, meta: LedgerCalendarPromotionMeta): object {
  return { ...(factCardObject as Record<string, unknown>), _calendarPromotion: meta };
}

export function getReviewDecision(record: CampaignEventLedgerRecord): string | null {
  const envelope = parseFactCardEnvelope(record.factCard);
  return envelope.review.decision ?? null;
}

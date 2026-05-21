import type { WorkbenchEventRow } from "./merge-persisted-row";
import { resolveCalendarLanes } from "./calendar-lane";
import { derivePromotionStatus, parsePromotionMeta } from "./calendar-promotion/promotion-meta";
import type { CampaignEventLedgerRecord } from "@prisma/client";

export type CalendarEventAlert = {
  key: string;
  label: string;
  tone: "red" | "amber" | "blue" | "slate";
};

export type CalendarEventSurfaceMeta = {
  alerts: CalendarEventAlert[];
  isPast: boolean;
  isTentative: boolean;
  missingApproval: boolean;
  missingLocation: boolean;
  missingHost: boolean;
  missingTravel: boolean;
};

export function buildCalendarEventFlags(
  row: WorkbenchEventRow,
  record: CampaignEventLedgerRecord,
  nowMs: number,
): CalendarEventSurfaceMeta {
  const lanes = resolveCalendarLanes(record);
  const promoMeta = parsePromotionMeta(record.factCard);
  const promoStatus = derivePromotionStatus(record, row, promoMeta);
  const alerts: CalendarEventAlert[] = [];
  const isPast = row.startAtMs < nowMs;
  const isTentative = row.rawEventStatus === "TENTATIVE" || lanes.sourceLane === "tentative";
  const missingApproval = !row.rawDecision && row.rawReviewStatus !== "READY";
  const missingLocation = !row.likelyCity && !record.originalLocation?.trim();
  const missingHost =
    row.classification === "house_meet_greet" &&
    !row.sections.find((s) => s.id === "who")?.fields.some((f) => f.key === "hostName" && f.status === "known");
  const missingTravel = row.roundTripMiles == null && row.rawEventStatus !== "CANCELLED";

  if (row.hasConflictWarning) alerts.push({ key: "conflict", label: "Conflict", tone: "red" });
  if (row.hasWorkHoursWarning) alerts.push({ key: "work_hours", label: "Work hours", tone: "amber" });
  if (missingApproval) alerts.push({ key: "approval", label: "Needs approval", tone: "amber" });
  if (missingLocation) alerts.push({ key: "location", label: "Missing location", tone: "amber" });
  if (missingHost) alerts.push({ key: "host", label: "Missing host", tone: "amber" });
  if (missingTravel) alerts.push({ key: "travel", label: "Travel TBD", tone: "blue" });
  if (isTentative) alerts.push({ key: "tentative", label: "Tentative", tone: "slate" });
  if (row.calendarTruthStatus === "WEBSITE_ENTRY_ONLY") {
    alerts.push({ key: "website_only", label: "Website only", tone: "navy" });
  }
  if (row.calendarTruthStatus === "IMPORTED_FROM_NORMALIZED_JSON") {
    alerts.push({ key: "imported_json", label: "Imported JSON", tone: "slate" });
  }
  if (row.calendarTruthStatus === "GOOGLE_READ_MATCHED") {
    alerts.push({ key: "gcal_matched", label: "Google matched", tone: "green" });
  }
  if (row.calendarTruthStatus === "GOOGLE_READ_STALE") {
    alerts.push({ key: "gcal_stale", label: "Stale", tone: "amber" });
  }
  if (row.calendarTruthStatus === "GOOGLE_READ_CONFLICT") {
    alerts.push({ key: "gcal_conflict", label: "GCal conflict", tone: "red" });
  }
  if (row.calendarWriteDisabled) {
    alerts.push({ key: "write_off", label: "Write gated", tone: "slate" });
  }
  if (promoStatus === "PROMOTED_TO_OFFICIAL") alerts.push({ key: "promo_official", label: "Official promoted", tone: "green" });
  else if (promoStatus === "PROMOTED_TO_TENTATIVE") alerts.push({ key: "promo_tent", label: "Tentative promoted", tone: "green" });
  else if (promoStatus === "PROMOTION_FAILED") alerts.push({ key: "promo_fail", label: "Promotion failed", tone: "red" });
  else if (promoStatus === "PROMOTION_BLOCKED" || promoStatus === "PROMOTION_CONFLICT") {
    alerts.push({ key: "promo_block", label: "Promotion blocked", tone: "amber" });
  } else if (promoStatus === "READY_FOR_TENTATIVE_PROMOTION" || promoStatus === "READY_FOR_OFFICIAL_PROMOTION") {
    alerts.push({ key: "promo_ready", label: "Ready to promote", tone: "blue" });
  }
  if (row.persistedMissingCount > 2) alerts.push({ key: "gaps", label: `${row.persistedMissingCount} gaps`, tone: "amber" });

  return {
    alerts,
    isPast,
    isTentative,
    missingApproval,
    missingLocation,
    missingHost,
    missingTravel,
  };
}

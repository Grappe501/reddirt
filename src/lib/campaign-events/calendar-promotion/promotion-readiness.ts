import type { CampaignEventLedgerRecord } from "@prisma/client";
import type { WorkbenchEventRow } from "../merge-persisted-row";
import { getCalendarPromotionConfig } from "./promotion-config";
import { derivePromotionStatus, getReviewDecision, parsePromotionMeta } from "./promotion-meta";
import type { PromotionReadinessResult, PromotionTargetLane } from "./promotion-types";

export async function assessPromotionReadiness(
  record: CampaignEventLedgerRecord,
  row: WorkbenchEventRow,
  targetLane: PromotionTargetLane,
): Promise<PromotionReadinessResult> {
  const meta = parsePromotionMeta(record.factCard);
  const promotionStatus = derivePromotionStatus(record, row, meta);
  const decision = getReviewDecision(record);
  const blockers: string[] = [];
  const warnings: string[] = [];
  const missingItems: string[] = [];

  const config = await getCalendarPromotionConfig();
  if (!config.readyToWrite) blockers.push(config.disabledReason ?? "Google write not enabled");

  if (record.eventStatus === "CANCELLED") blockers.push("Event is cancelled");
  if (decision === "denied") blockers.push("Event denied on ledger");
  if (decision === "hold") blockers.push("Event on hold");
  if (decision === "request_confirmation") blockers.push("Awaiting request-info / confirmation");
  if (decision === "personal") blockers.push("Marked personal — excluded from promotion");
  if (decision === "duplicate") blockers.push("Marked duplicate — excluded");
  if (!decision || decision !== "approved") {
    blockers.push("Event not approved on ledger");
    missingItems.push("Approval decision");
  }

  if (!row.likelyCity?.trim() && !record.displayCity?.trim()) {
    blockers.push("City missing");
    missingItems.push("City");
  }
  if (!row.county?.trim()) {
    blockers.push("County missing");
    missingItems.push("County");
  }
  if (!record.startAt || Number.isNaN(record.startAt.getTime())) {
    blockers.push("Invalid start date/time");
    missingItems.push("Valid date/time");
  }

  const hostField = row.factCard.who.hostName?.trim() || row.factCard.who.hostOrganization?.trim();
  const venue = row.factCard.where.venueName?.trim() || record.originalLocation?.trim();
  if (!venue) {
    warnings.push("Venue/location text thin");
    missingItems.push("Venue or location");
  }
  if (!hostField && row.classification === "house_meet_greet") {
    warnings.push("Host name missing for house meet & greet");
    missingItems.push("Host");
  }

  if (row.hasConflictWarning) {
    warnings.push("Schedule conflict flagged");
    if (targetLane === "official") blockers.push("Unresolved schedule conflict");
  }
  if (row.hasWorkHoursWarning) warnings.push("Work-hours warning — confirm before official promote");
  if (row.duplicateRisk) warnings.push("Duplicate risk on intake");
  if (row.intakeScheduleConflict) warnings.push("Intake schedule conflict");

  if (row.calendarTruthStatus === "GOOGLE_READ_STALE") warnings.push("Google read mirror stale — refresh sync first");
  if (row.calendarTruthStatus === "GOOGLE_READ_CONFLICT") warnings.push("Google truth conflict");
  if (config.tentativeSourceReady === false && targetLane === "tentative") {
    blockers.push("Tentative Google calendar lane not ready");
  }
  if (config.officialSourceReady === false && targetLane === "official") {
    blockers.push("Official Google calendar lane not ready");
  }

  if (targetLane === "tentative" && meta.tentativeGoogleEventId) {
    warnings.push("Already has tentative Google event — promote will update");
  }
  if (targetLane === "official") {
    if (!meta.tentativeGoogleEventId && record.entrySource === "WEBSITE_ENTRY") {
      warnings.push("Website intake — tentative promotion recommended first");
    }
    if (meta.officialGoogleEventId) warnings.push("Already has official Google event — promote will update");
  }

  let level: PromotionReadinessResult["level"] = "READY";
  if (blockers.length) level = "BLOCKED";
  else if (warnings.length) level = "WARNING";

  const suggestedTargetLane: PromotionTargetLane | null =
    meta.officialGoogleEventId ? null : meta.tentativeGoogleEventId ? "official" : "tentative";

  return {
    level,
    blockers,
    warnings,
    missingItems,
    promotionStatus,
    suggestedTargetLane,
  };
}

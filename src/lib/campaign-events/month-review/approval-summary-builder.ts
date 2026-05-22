import type { EventAiInference } from "../infer-event-assumptions";
import type { WorkbenchEventRow } from "../merge-persisted-row";

export type ApprovalRecommendation = "likely_approve" | "needs_info" | "hold" | "likely_deny";

export type ApprovalSummary = {
  plainSummary: string;
  criticalMissing: string[];
  blockers: string[];
  travelSummary: string;
  conflictSummary: string;
  workHoursSummary: string | null;
  recommendation: ApprovalRecommendation;
  recommendationReason: string;
};

function criticalMissingFields(row: WorkbenchEventRow): string[] {
  const missing: string[] = [];
  if (!row.likelyCity?.trim()) missing.push("City");
  if (!row.county?.trim()) missing.push("County");
  if (!row.factCard.where.zipCode?.trim()) missing.push("ZIP code (helps confirm county)");
  if (!row.factCard.who.hostName?.trim() && row.classification === "house_meet_greet") missing.push("Host name");
  if (!row.factCard.where.venueName?.trim() && row.rawEventStatus !== "CANCELLED") missing.push("Venue / location");
  if (!row.factCard.why.campaignPurpose?.trim()) missing.push("Campaign purpose");
  if (row.roundTripMiles == null && row.rawEventStatus !== "CANCELLED") missing.push("Round-trip mileage");
  return missing;
}

export function buildApprovalSummary(row: WorkbenchEventRow, inference?: EventAiInference): ApprovalSummary {
  const criticalMissing = criticalMissingFields(row);
  const blockers: string[] = [];

  if (row.hasConflictWarning) {
    blockers.push(...row.conflicts.map((c) => `${c.label}: ${c.detail}`));
  }
  if (row.hasWorkHoursWarning) blockers.push(row.workHours.detail);
  if (row.rawDecision === "denied") blockers.push("Previously denied — retained in ledger history");

  const travelSummary =
    row.roundTripMiles != null
      ? `${row.travelLine} · ${row.roundTripMiles.toFixed(1)} mi round trip${row.reimbursementDisplay ? ` · ${row.reimbursementDisplay}` : ""}`
      : `${row.travelLine} · mileage not calculated`;

  const conflictSummary = row.conflicts.length
    ? row.conflicts.map((c) => c.label).join(", ")
    : "No schedule conflicts flagged";

  const workHoursSummary = row.hasWorkHoursWarning ? row.workHours.detail : null;

  let recommendation: ApprovalRecommendation = "likely_approve";
  let recommendationReason = "Core fields and travel look sufficient for approval.";

  if (row.rawDecision === "denied" || row.rawDecision === "personal") {
    recommendation = "likely_deny";
    recommendationReason = "Prior decision was deny/personal — confirm before reversing.";
  } else if (blockers.some((b) => b.includes("Conflict"))) {
    recommendation = "hold";
    recommendationReason = "Resolve schedule conflicts before approving.";
  } else if (row.hasWorkHoursWarning) {
    recommendation = "needs_info";
    recommendationReason = "Work-hours overlap — confirm with candidate/employer rules.";
  } else if (criticalMissing.length >= 3) {
    recommendation = "needs_info";
    recommendationReason = `Multiple gaps (${criticalMissing.length}) — gather details before approving.`;
  } else if (criticalMissing.length > 0) {
    recommendation = "needs_info";
    recommendationReason = "Missing location or logistics fields.";
  } else if (inference?.missingRequired.length) {
    recommendation = "needs_info";
    recommendationReason = inference.missingRequired[0] ?? "AI flagged missing context.";
  }

  const host = row.factCard.who.hostName || row.factCard.who.hostOrganization || "host TBD";
  const zip = row.factCard.where.zipCode?.trim();
  const plainSummary = [
    `${row.classificationLabel} on ${row.dateYmd} at ${row.timeLabel}.`,
    `${row.likelyCity ?? "City TBD"}${row.county ? `, ${row.county}` : ""}${zip ? ` ${zip}` : ""}.`,
    `Host: ${host}.`,
    row.factCard.why.campaignPurpose ? `Purpose: ${row.factCard.why.campaignPurpose}.` : "",
    inference?.likelyAudience ? `Audience: ${inference.likelyAudience}.` : "",
    travelSummary,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    plainSummary,
    criticalMissing,
    blockers,
    travelSummary,
    conflictSummary,
    workHoursSummary,
    recommendation,
    recommendationReason,
  };
}

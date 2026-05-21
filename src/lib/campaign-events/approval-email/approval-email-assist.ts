import { buildApprovalSummary } from "../month-review/approval-summary-builder";
import type { WorkbenchEventRow } from "../merge-persisted-row";

export type ApprovalEmailAssist = {
  subject: string;
  shortSummary: string;
  missingInfoLanguage: string;
  riskNote: string;
  recommendedAction: string;
  plainEnglishPackage: string;
};

function recommendationLabel(rec: string): string {
  switch (rec) {
    case "likely_approve":
      return "Likely approve";
    case "needs_info":
      return "Request more information";
    case "hold":
      return "Hold for review";
    case "likely_deny":
      return "Likely deny";
    default:
      return rec;
  }
}

export function buildApprovalEmailAssist(row: WorkbenchEventRow): ApprovalEmailAssist {
  const summary = buildApprovalSummary(row);
  const zip = row.factCard.where.zipCode?.trim();
  const location = [row.likelyCity, row.county, zip].filter(Boolean).join(", ") || "Location TBD";
  const host = row.factCard.who.hostName || row.factCard.who.hostOrganization || "Host TBD";

  const missingInfoLanguage =
    summary.criticalMissing.length > 0
      ? `Before approving, we still need: ${summary.criticalMissing.join(", ")}.`
      : "Core logistics fields are present.";

  const riskParts: string[] = [];
  if (row.hasConflictWarning) riskParts.push(summary.conflictSummary);
  if (row.hasWorkHoursWarning && summary.workHoursSummary) riskParts.push(summary.workHoursSummary);
  if (row.duplicateRisk) riskParts.push("Possible duplicate event flagged.");
  if (row.calendarWriteDisabled) riskParts.push("Google Calendar promotion is not enabled yet.");

  const riskNote = riskParts.length ? riskParts.join(" ") : "No major schedule risks flagged.";

  const plainEnglishPackage = [
    `${row.calendar.title} — ${row.dateYmd} ${row.timeLabel}`,
    `${row.classificationLabel} · ${location}`,
    `Host: ${host}`,
    summary.plainSummary,
    `Travel: ${summary.travelSummary}`,
    missingInfoLanguage,
    `Recommendation: ${recommendationLabel(summary.recommendation)} — ${summary.recommendationReason}`,
  ]
    .filter(Boolean)
    .join("\n");

  const subject = `Approval needed: ${row.calendar.title} (${row.dateYmd})`;

  return {
    subject,
    shortSummary: summary.plainSummary,
    missingInfoLanguage,
    riskNote,
    recommendedAction: `${recommendationLabel(summary.recommendation)}: ${summary.recommendationReason}`,
    plainEnglishPackage,
  };
}

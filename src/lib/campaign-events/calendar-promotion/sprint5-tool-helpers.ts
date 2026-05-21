import type { WorkbenchEventRow } from "../merge-persisted-row";
import { recommendApprovalFollowUp } from "../ai-tools/sprint4-tool-helpers";
import type { LedgerCalendarPromotionMeta } from "./promotion-meta";
import type { PromotionReadinessResult } from "./promotion-types";

/** Tool: official-calendar-safety-blocker */
export function assertOfficialCalendarSafetyBlocker(context: string): { ok: true; context: string } {
  return {
    ok: true,
    context: `${context} — autonomous promotion blocked; human click required (Sprint 5).`,
  };
}

/** Tool: google-write-status-summarizer */
export function summarizeGoogleWriteStatus(input: {
  writeEnabled: boolean;
  readyToWrite: boolean;
  promotionStatus: string;
  meta: LedgerCalendarPromotionMeta;
}): string {
  const parts = [
    input.writeEnabled ? "Write env on" : "Write env off",
    input.readyToWrite ? "lanes ready" : "lanes not ready",
    `status: ${input.promotionStatus}`,
  ];
  if (input.meta.tentativeGoogleEventId) parts.push("tentative linked");
  if (input.meta.officialGoogleEventId) parts.push("official linked");
  if (input.meta.promotionError) parts.push(`last error: ${input.meta.promotionError}`);
  return parts.join(" · ");
}

/** Tool: promotion-risk-summary-writer */
export function writePromotionRiskSummary(readiness: PromotionReadinessResult, lane: string): string {
  if (readiness.level === "BLOCKED") return `Blocked from ${lane} promotion: ${readiness.blockers.join("; ")}`;
  if (readiness.level === "WARNING") return `Proceed with caution (${lane}): ${readiness.warnings.join("; ")}`;
  return `Ready for ${lane} Google Calendar promotion.`;
}

/** Tool: promotion-followup hint from sprint4 helper pattern */
export function promotionFollowUpHint(row: WorkbenchEventRow, meta: LedgerCalendarPromotionMeta): string | null {
  if (meta.promotionError) return `Last promotion failed — review error and retry when ready.`;
  if (meta.officialPromotedAt) return null;
  if (meta.tentativePromotedAt && !row.rawDecision) return "Promoted to tentative — awaiting approval for official lane.";
  return recommendApprovalFollowUp(
    meta.lastPromotionAttemptAt
      ? {
          id: "x",
          recordId: row.recordId,
          recipients: [],
          subject: "",
          provider: "none",
          status: "sent",
          createdAt: meta.lastPromotionAttemptAt,
          sentAt: meta.lastPromotionAttemptAt,
          createdBy: meta.promotedBy ?? "system",
        }
      : null,
    row,
  );
}

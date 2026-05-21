import type { ReimbursementMonthStatusContext } from "./reimbursement-month-status";
import { reviewHref, travelLogHref } from "./travel-reimbursement-links";

export type ChecklistItemStatus = "complete" | "needs_attention";

export type ReimbursementChecklistItem = {
  id: string;
  label: string;
  status: ChecklistItemStatus;
  detail?: string;
  href?: string;
};

export function buildReimbursementMonthChecklist(ctx: ReimbursementMonthStatusContext): ReimbursementChecklistItem[] {
  const { month, queues, report, effectiveStatus } = ctx;
  const travelReviewed =
    queues.needsApproval === 0 && queues.unreviewedTravel === 0;
  const cityCountyOk = queues.missingCityCounty === 0;
  const mileageOk = queues.missingMileage === 0;
  const totalsOk = report.totals.approvedEventCount > 0;
  const excludedOk = true;
  const signatureReady = effectiveStatus === "ready" || effectiveStatus === "finalized";
  const cmReviewReady = effectiveStatus === "finalized";
  const finalized = effectiveStatus === "finalized";

  return [
    {
      id: "travel_reviewed",
      label: "All travel candidates reviewed",
      status: travelReviewed ? "complete" : "needs_attention",
      detail: travelReviewed
        ? `${queues.totalTravelCandidates} candidates`
        : `${queues.needsApproval} need approval · ${queues.unreviewedTravel} unreviewed`,
      href: reviewHref({ month, mode: "travel_needs_approval", autostart: true }),
    },
    {
      id: "city_county",
      label: "Approved items have city and county",
      status: cityCountyOk ? "complete" : "needs_attention",
      detail: cityCountyOk ? "Complete" : `${queues.missingCityCounty} missing`,
      href: travelLogHref(month, "needs_city_county"),
    },
    {
      id: "mileage",
      label: "Mileage calculated",
      status: mileageOk ? "complete" : "needs_attention",
      detail: mileageOk ? "Complete" : `${queues.missingMileage} missing`,
      href: reviewHref({ month, focus: "missing_mileage", autostart: true }),
    },
    {
      id: "excluded",
      label: "Denied / personal / duplicate excluded from total",
      status: excludedOk ? "complete" : "needs_attention",
      detail: `${queues.denied} denied · ${queues.personal} personal · ${queues.duplicate} duplicate`,
      href: travelLogHref(month, "denied"),
    },
    {
      id: "totals",
      label: "Report totals reviewed",
      status: totalsOk ? "complete" : "needs_attention",
      detail: totalsOk
        ? `${report.totals.totalMiles.toFixed(1)} mi · $${report.totals.totalReimbursement.toFixed(2)}`
        : "No approved reimbursable lines",
    },
    {
      id: "candidate_sig",
      label: "Candidate signature ready",
      status: signatureReady ? "complete" : "needs_attention",
      detail: signatureReady ? "Mark ready or finalize when packet is complete" : "Finish review first",
    },
    {
      id: "cm_review",
      label: "Campaign manager / treasurer review ready",
      status: cmReviewReady ? "complete" : "needs_attention",
      detail: cmReviewReady ? "Finalized" : "Finalize month after print review",
    },
    {
      id: "finalized",
      label: "Month finalized",
      status: finalized ? "complete" : "needs_attention",
      detail: finalized ? (ctx.stored?.finalizedAt?.slice(0, 10) ?? "Yes") : "Use Finalize Month when packet is signed",
    },
  ];
}

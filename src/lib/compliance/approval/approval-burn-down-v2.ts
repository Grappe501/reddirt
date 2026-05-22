import type { ApprovalItem } from "./approval-types";
import { getBatchEligibleItems } from "./load-approval-queue";
import { reasonsForItem } from "./batch-readiness";

export type OperatorReviewRowV2 = {
  id: string;
  queueId: string;
  sourceType: string;
  blockerCategory: string;
  confidenceBucket: "below_98" | "at_or_above_98";
  ruleTopicId: string | null;
  sourceUpdatePending: boolean;
  recommendedAction: string;
  couldBecomeBatchEligibleAfterFix: boolean;
  filingImpact: "yes" | "indirect" | "no";
  status: string;
};

function blockerCategory(item: ApprovalItem): string {
  if (item.source === "rule_review") return "rule_review";
  if (item.status === "needs_info") return "needs_info";
  if (item.sourceUpdatePending) return "source_update_pending";
  if (!item.evidence.length) return "missing_evidence";
  if (item.source === "filing_task") return "filing_task_dependency";
  if (item.confidenceScore < 98) return "low_confidence";
  if (item.blockers.length) return "active_blockers";
  return "near_eligible";
}

function recommendedAction(item: ApprovalItem): string {
  const cat = blockerCategory(item);
  switch (cat) {
    case "rule_review":
      return "Review rule topic on /admin/compliance/rules; document review; then approve with override.";
    case "needs_info":
      return "Request missing info; task created in task center.";
    case "source_update_pending":
      return "Confirm source write path or document workbench-only decision.";
    case "missing_evidence":
      return "Link receipt, bank row, or import evidence.";
    case "filing_task_dependency":
      return "Resolve linked filing task before approval.";
    case "low_confidence":
      return "Complete required fields and save — refreshes confidence.";
    case "active_blockers":
      return "Resolve blockers or use override with initials + reason.";
    default:
      return "Review and approve if source-backed.";
  }
}

function filingImpact(item: ApprovalItem): OperatorReviewRowV2["filingImpact"] {
  if (item.source === "rule_review" || item.source === "filing_task") return "yes";
  if (item.source === "goodchange_contribution" || item.source === "receipt_expense") return "indirect";
  return "no";
}

export async function buildOperatorReviewRowsV2(
  items: ApprovalItem[],
  queueId: string,
): Promise<OperatorReviewRowV2[]> {
  const eligible = await getBatchEligibleItems(queueId);
  const eligibleIds = new Set(eligible.map((i) => i.id));

  return items
    .filter((item) => ["queued", "needs_review", "ready", "reopened"].includes(item.status))
    .map((item) => {
      const reasons = reasonsForItem(item);
      const couldFix =
        !eligibleIds.has(item.id) &&
        !reasons.includes("rule_review_required") &&
        !reasons.includes("high_risk") &&
        reasons.length <= 2;
      return {
        id: item.id,
        queueId: item.queueId,
        sourceType: item.source,
        blockerCategory: blockerCategory(item),
        confidenceBucket: item.confidenceScore >= 98 ? "at_or_above_98" : "below_98",
        ruleTopicId: item.source === "rule_review" ? item.sourceRecordId : null,
        sourceUpdatePending: item.sourceUpdatePending === true,
        recommendedAction: recommendedAction(item),
        couldBecomeBatchEligibleAfterFix: couldFix,
        filingImpact: filingImpact(item),
        status: item.status,
      };
    });
}

export function summarizeBurnDownV2(rows: OperatorReviewRowV2[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const row of rows) {
    summary[row.blockerCategory] = (summary[row.blockerCategory] ?? 0) + 1;
  }
  return summary;
}

export const BURN_DOWN_START_ORDER = [
  "rule_review",
  "missing_evidence",
  "source_update_pending",
  "filing_task_dependency",
  "low_confidence",
  "needs_info",
  "near_eligible",
] as const;

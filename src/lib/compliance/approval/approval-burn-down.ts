import type { ApprovalItem } from "./approval-types";
import { reasonsForItem, type BatchIneligibilityReason } from "./batch-readiness";
import { pickBestNextItem } from "./queue-navigation";

export type BurnDownGroup = {
  key: BatchIneligibilityReason | "open_total";
  label: string;
  count: number;
  fixHint: string;
  filterKey: string;
};

export type NextItemExplanation = {
  itemId: string;
  title: string;
  reasons: string[];
  scoreSummary: string;
};

export type ApprovalBurnDownReport = {
  openCount: number;
  groups: BurnDownGroup[];
  nextBest: NextItemExplanation | null;
  ruleReviewCount: number;
  confidenceBelow98: number;
};

const GROUP_META: Record<BatchIneligibilityReason, Omit<BurnDownGroup, "count">> = {
  confidence_low: {
    key: "confidence_low",
    label: "Confidence below 98%",
    fixHint: "Complete fields and evidence; save edits to refresh AI prep.",
    filterKey: "all",
  },
  rule_review_required: {
    key: "rule_review_required",
    label: "Rule review required",
    fixHint: "Review topic on Rules page — source reviewed for campaign workflow, not legal certification.",
    filterKey: "rule_review",
  },
  source_update_pending: {
    key: "source_update_pending",
    label: "Source update pending",
    fixHint: "Confirm upstream write path or document workbench-only decision.",
    filterKey: "all",
  },
  evidence_missing: {
    key: "evidence_missing",
    label: "Missing evidence",
    fixHint: "Attach receipt, bank row, or source file reference.",
    filterKey: "missing_evidence",
  },
  missing_required_field: {
    key: "missing_required_field",
    label: "Missing required fields",
    fixHint: "Fill donor, employer, occupation, or vendor fields.",
    filterKey: "missing_employer",
  },
  blockers: {
    key: "blockers",
    label: "Active blockers",
    fixHint: "Resolve item blockers or use override with initials + reason.",
    filterKey: "blocked",
  },
  high_risk: {
    key: "high_risk",
    label: "High / blocked risk",
    fixHint: "Review manually; batch approval will not include these.",
    filterKey: "high_risk",
  },
  not_open_status: {
    key: "not_open_status",
    label: "Already decided",
    fixHint: "No action — item closed.",
    filterKey: "all",
  },
};

export function buildApprovalBurnDownReport(items: ApprovalItem[]): ApprovalBurnDownReport {
  const open = items.filter((item) => ["queued", "needs_review", "ready", "reopened"].includes(item.status));
  const counts = new Map<BatchIneligibilityReason, number>();
  for (const item of open) {
    for (const reason of reasonsForItem(item)) {
      counts.set(reason, (counts.get(reason) ?? 0) + 1);
    }
  }
  const groups: BurnDownGroup[] = (Object.keys(GROUP_META) as BatchIneligibilityReason[])
    .map((key) => ({
      ...GROUP_META[key],
      count: counts.get(key) ?? 0,
    }))
    .filter((g) => g.count > 0)
    .sort((a, b) => b.count - a.count);

  const next = pickBestNextItem(open);
  const nextBest: NextItemExplanation | null = next
    ? {
        itemId: next.id,
        title: next.title,
        reasons: explainNextPick(next, open),
        scoreSummary: `Risk ${next.riskLevel} · confidence ${next.confidenceScore}% · ${next.source.replace(/_/g, " ")}`,
      }
    : null;

  return {
    openCount: open.length,
    groups,
    nextBest,
    ruleReviewCount: open.filter((i) => i.source === "rule_review").length,
    confidenceBelow98: open.filter((i) => i.confidenceScore < 98).length,
  };
}

function explainNextPick(item: ApprovalItem, open: ApprovalItem[]): string[] {
  const reasons: string[] = [];
  const highFirst = open.some(
    (i) => (i.riskLevel === "high" || i.riskLevel === "blocked" || i.blockers.length) && i.id === item.id,
  );
  if (highFirst) reasons.push("Highest-priority: unresolved high risk or blockers first.");
  else if (item.confidenceScore >= 98 && !item.blockers.length && item.evidence.length) {
    reasons.push("Ready item with strong confidence — fastest path to reduce open count.");
  } else if (item.status === "needs_info") reasons.push("Follow-up on needs-info queue.");
  else reasons.push("Oldest remaining open item in queue order.");
  if (item.source === "rule_review") reasons.push("Rule review item — approve only after Rules topic review.");
  return reasons;
}

/** Redacted export for operator planning — no donor names in output. */
export function buildRedactedOperatorReviewList(items: ApprovalItem[]): Array<{
  id: string;
  source: string;
  riskLevel: string;
  confidenceScore: number;
  status: string;
  issueFlags: string[];
}> {
  return items
    .filter((item) => ["queued", "needs_review", "ready", "reopened"].includes(item.status))
    .map((item) => ({
      id: item.id,
      source: item.source,
      riskLevel: item.riskLevel,
      confidenceScore: item.confidenceScore,
      status: item.status,
      issueFlags: reasonsForItem(item),
    }));
}

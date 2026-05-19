import type { ApprovalItem, ApprovalItemSource } from "./approval-types";

export const QUEUE_FILTER_OPTIONS = [
  ["all", "All"],
  ["ready", "Ready"],
  ["blocked", "Blocked"],
  ["needs_info", "Needs info"],
  ["missing_evidence", "Missing evidence"],
  ["missing_employer", "Missing employer/occupation"],
  ["high_risk", "High risk"],
  ["goodchange", "GoodChange"],
  ["receipts", "Receipts"],
  ["checks_cash", "Checks/cash"],
  ["in_kind", "In-kind"],
  ["rule_review", "Rule review"],
  ["filing_tasks", "Filing tasks"],
  ["low_confidence", "Low confidence (<98%)"],
  ["source_update_pending", "Source update pending"],
  ["near_eligible", "Near batch eligible"],
  ["filing_impact", "Filing impact"],
] as const;

export type QueueFilterKey = (typeof QUEUE_FILTER_OPTIONS)[number][0];

export const QUEUE_SORT_OPTIONS = [
  ["confidence_desc", "Highest confidence"],
  ["risk_desc", "Highest risk"],
  ["amount_desc", "Largest amount"],
  ["oldest", "Oldest first"],
  ["source", "Source type"],
] as const;

export type QueueSortKey = (typeof QUEUE_SORT_OPTIONS)[number][0];

const SOURCE_GROUPS: Record<string, ApprovalItemSource[]> = {
  goodchange: ["goodchange_contribution"],
  receipts: ["receipt_expense"],
  checks_cash: ["check_contribution", "cash_contribution"],
  in_kind: ["in_kind_contribution"],
  rule_review: ["rule_review"],
  filing_tasks: ["filing_task"],
};

export function filterQueueItems(items: ApprovalItem[], filterKey: string): ApprovalItem[] {
  switch (filterKey) {
    case "ready":
      return items.filter(
        (item) =>
          ["ready", "queued", "needs_review", "reopened"].includes(item.status) &&
          !item.blockers.length &&
          !item.missingFields.length &&
          item.evidence.length > 0,
      );
    case "blocked":
      return items.filter((item) => item.blockers.length > 0 || item.riskLevel === "blocked");
    case "needs_info":
      return items.filter((item) => item.status === "needs_info");
    case "missing_evidence":
      return items.filter((item) => !item.evidence.length);
    case "missing_employer":
      return items.filter((item) =>
        item.missingFields.some((field) => /employer|occupation/i.test(field)) ||
        item.fields.some((field) => ["employer", "occupation"].includes(field.key) && field.validationStatus === "missing"),
      );
    case "high_risk":
      return items.filter((item) => item.riskLevel === "high" || item.riskLevel === "blocked");
    case "low_confidence":
      return items.filter((item) => item.confidenceScore < 98 && ["queued", "needs_review", "ready", "reopened"].includes(item.status));
    case "source_update_pending":
      return items.filter((item) => item.sourceUpdatePending === true);
    case "near_eligible":
      return items.filter(
        (item) =>
          ["queued", "needs_review", "ready", "reopened"].includes(item.status) &&
          item.source !== "rule_review" &&
          item.confidenceScore >= 90 &&
          item.confidenceScore < 98 &&
          item.evidence.length > 0 &&
          !item.blockers.length,
      );
    case "filing_impact":
      return items.filter(
        (item) =>
          item.source === "rule_review" ||
          item.source === "filing_task" ||
          item.source === "goodchange_contribution" ||
          item.source === "receipt_expense",
      );
    default:
      if (filterKey in SOURCE_GROUPS) {
        const sources = SOURCE_GROUPS[filterKey];
        return items.filter((item) => sources.includes(item.source));
      }
      return items;
  }
}

export function sortQueueItems(items: ApprovalItem[], sortKey: string): ApprovalItem[] {
  const copy = [...items];
  switch (sortKey) {
    case "confidence_desc":
      return copy.sort((a, b) => b.confidenceScore - a.confidenceScore || a.sortOrder - b.sortOrder);
    case "risk_desc": {
      const rank = { blocked: 4, high: 3, medium: 2, low: 1 };
      return copy.sort((a, b) => (rank[b.riskLevel] ?? 0) - (rank[a.riskLevel] ?? 0) || a.sortOrder - b.sortOrder);
    }
    case "amount_desc":
      return copy.sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0) || a.sortOrder - b.sortOrder);
    case "oldest":
      return copy.sort((a, b) => a.sortOrder - b.sortOrder);
    case "source":
      return copy.sort((a, b) => a.source.localeCompare(b.source) || a.sortOrder - b.sortOrder);
    default:
      return copy.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

const REMAINING = ["queued", "needs_review", "ready", "reopened"] as const;

export function pickBestNextItem(items: ApprovalItem[]): ApprovalItem | null {
  const open = items.filter((item) => REMAINING.includes(item.status as (typeof REMAINING)[number]));
  const highRisk = open
    .filter((item) => item.riskLevel === "high" || item.riskLevel === "blocked" || item.blockers.length > 0)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (highRisk.length) return highRisk[0];
  const ready = open
    .filter((item) => !item.blockers.length && !item.missingFields.length && item.evidence.length > 0)
    .sort((a, b) => b.confidenceScore - a.confidenceScore || a.sortOrder - b.sortOrder);
  if (ready.length) return ready[0];
  const needsInfo = open.filter((item) => item.status === "needs_info").sort((a, b) => a.sortOrder - b.sortOrder);
  if (needsInfo.length) return needsInfo[0];
  return open.sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null;
}

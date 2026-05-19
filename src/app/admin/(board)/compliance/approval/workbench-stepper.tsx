"use client";

import type { ApprovalItem } from "@/lib/compliance/approval/approval-types";
import type { RuleReviewContext } from "@/lib/compliance/approval/rule-review-context";
import { ComplianceStepGuide } from "../compliance-ux";

export function ComplianceWorkbenchStepper({
  item,
  ruleReview,
  canApprove,
  hasOverride,
}: {
  item: ApprovalItem;
  ruleReview?: RuleReviewContext | null;
  canApprove: boolean;
  hasOverride: boolean;
}) {
  const evidenceOk = item.evidence.length > 0;
  const confidenceOk = item.confidenceScore >= 98;
  const ruleOk = item.source !== "rule_review" || hasOverride;
  const sourceOk = !item.sourceUpdatePending;
  const decisionReady = canApprove || hasOverride;

  const steps = [
    {
      id: "evidence",
      title: "Source evidence",
      description: evidenceOk
        ? `${item.evidence.length} evidence item(s) linked.`
        : "Missing evidence — add receipt, import, or bank link before approving.",
      status: evidenceOk ? ("done" as const) : ("blocked" as const),
    },
    {
      id: "confidence",
      title: "Confidence and match quality",
      description:
        item.confidenceScore >= 98
          ? `Confidence ${item.confidenceScore}% — meets batch threshold if other gates pass.`
          : `Confidence ${item.confidenceScore}% — complete fields/evidence to reach 98%. Batch not available until then.`,
      status: confidenceOk ? ("done" as const) : ("current" as const),
    },
    {
      id: "rule",
      title: "Rule review status",
      description: ruleReview
        ? `${ruleReview.topicLabel}: human rule review required. Cannot batch. Override + documented review if approving.`
        : "Not a rule_review item.",
      status: item.source === "rule_review" ? (ruleOk ? ("done" as const) : ("blocked" as const)) : ("done" as const),
    },
    {
      id: "filing",
      title: "Filing impact",
      description:
        item.source === "rule_review" || item.source === "filing_task"
          ? "Direct filing readiness impact."
          : item.source === "goodchange_contribution" || item.source === "receipt_expense"
            ? "Indirect filing impact via queue and reconciliation."
            : "Lower direct filing impact.",
      status: "upcoming" as const,
    },
    {
      id: "decision",
      title: "Operator decision",
      description: decisionReady
        ? "You may approve, needs-info, or reject with initials."
        : "Resolve blockers or enter override reason with note.",
      status: decisionReady ? ("current" as const) : ("blocked" as const),
    },
    {
      id: "audit",
      title: "Audit note / override",
      description: hasOverride
        ? "Override path active — note required for audit."
        : item.blockers.length
          ? "Override reason required if approving with blockers."
          : "Initials and optional note.",
      status: hasOverride ? ("current" as const) : ("upcoming" as const),
    },
    {
      id: "preview",
      title: "Final preview",
      description: "Confirm what happens when you approve (staged — not filed). Reconciliation may still be open.",
      status: "upcoming" as const,
    },
  ];

  const current =
    !evidenceOk ? "evidence" : !confidenceOk ? "confidence" : item.source === "rule_review" && !ruleOk ? "rule" : !sourceOk ? "decision" : decisionReady ? "decision" : "audit";

  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
      <h2 className="font-heading text-lg font-bold text-[#0f2744]">Review steps</h2>
      <p className="mt-1 text-xs text-slate-500">rule_review items are never batch-eligible.</p>
      <div className="mt-3">
        <ComplianceStepGuide steps={steps} currentStep={current} />
      </div>
    </section>
  );
}

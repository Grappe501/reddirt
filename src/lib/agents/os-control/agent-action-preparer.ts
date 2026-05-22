import type { CampaignOsStateSnapshot } from "./campaign-os-state-snapshot";
import type { OsWorkflowPlan } from "./os-workflow-planner";
import { isActionForbidden } from "./human-approval-gate-matrix";

export type PreparedActionStatus = "prepared_only" | "awaiting_human" | "blocked";

export type PreparedAgentAction = {
  id: string;
  actionType: string;
  title: string;
  preview: string;
  previewData: Record<string, string | number | boolean | null>;
  riskLevel: "low" | "medium" | "high" | "blocked";
  reviewRoute: string;
  executionStatus: PreparedActionStatus;
  toolIds: string[];
  humanApprovalLabel: string;
};

export function prepareAgentActions(state: CampaignOsStateSnapshot, plans: OsWorkflowPlan[]): PreparedAgentAction[] {
  const p = state.period;
  const out: PreparedAgentAction[] = [];

  out.push({
    id: "prep-os-summary",
    actionType: "system_health_summary",
    title: "Campaign OS health summary",
    preview: `Health ${state.systemHealthScore}/100 · ${state.activeBlockers.length} blocker(s) · ${state.recommendedWorkflow}`,
    previewData: { score: state.systemHealthScore, blockers: state.activeBlockers.length },
    riskLevel: "low",
    reviewRoute: "/admin/ai-command-center",
    executionStatus: "prepared_only",
    toolIds: ["system-health-summary-writer", "campaign-os-state-observer"],
    humanApprovalLabel: "None — read-only",
  });

  const top = plans[0];
  if (top) {
    out.push({
      id: "prep-workflow-plan",
      actionType: "workflow_plan",
      title: top.title,
      preview: `${top.steps.length} steps · ${top.expectedOutcome}`,
      previewData: { planId: top.id, steps: top.steps.length },
      riskLevel: "low",
      reviewRoute: top.steps[0]?.route ?? "/admin/ai-command-center",
      executionStatus: "prepared_only",
      toolIds: ["campaign-os-workflow-planner", "workflow-priority-ranker"],
      humanApprovalLabel: "Operator follows plan manually",
    });
  }

  if (state.signals.reimbursementDerivedStatus !== "empty") {
    const forbidden = isActionForbidden("finalize_reimbursement");
    out.push({
      id: "prep-reimbursement-packet",
      actionType: "reimbursement_packet_draft",
      title: `Reimbursement packet draft — ${p}`,
      preview: `Approved travel lines ready for packet assembly. Status: ${state.signals.reimbursementDerivedStatus}. Human must finalize.`,
      previewData: { month: p, status: state.signals.reimbursementDerivedStatus },
      riskLevel: forbidden ? "high" : "medium",
      reviewRoute: `/admin/campaign-events/reimbursement?month=${p}`,
      executionStatus: "awaiting_human",
      toolIds: ["reimbursement-packet-builder", "agent-action-preparer"],
      humanApprovalLabel: "Build packet + finalize month",
    });
  }

  if (state.signals.pendingApprovals > 0) {
    out.push({
      id: "prep-approval-package",
      actionType: "approval_package_draft",
      title: "Approval package drafts",
      preview: `${state.signals.pendingApprovals} event(s) — preview packages in review queue (no email send).`,
      previewData: { count: state.signals.pendingApprovals },
      riskLevel: "medium",
      reviewRoute: `/admin/campaign-events/review?month=${p}`,
      executionStatus: "awaiting_human",
      toolIds: ["appr-summary-build", "agent-action-preparer"],
      humanApprovalLabel: "Approve/deny + optional email (gated)",
    });
  }

  if (state.signals.promotionReady > 0) {
    out.push({
      id: "prep-gcal-preview",
      actionType: "calendar_promotion_preview",
      title: "Google Calendar promotion preview",
      preview: `${state.signals.promotionReady} event(s) eligible — dry-run only until human promotes.`,
      previewData: { ready: state.signals.promotionReady },
      riskLevel: "high",
      reviewRoute: `/admin/campaign-events/calendar-promotion?month=${p}`,
      executionStatus: "blocked",
      toolIds: ["gated-action-router"],
      humanApprovalLabel: "Human promotion workbench",
    });
  }

  out.push({
    id: "prep-next-actions",
    actionType: "dashboard_next_action",
    title: "Dashboard next actions",
    preview: state.safeActions.slice(0, 4).join(" · "),
    previewData: {},
    riskLevel: "low",
    reviewRoute: "/admin/campaign-manager-dashboard",
    executionStatus: "prepared_only",
    toolIds: ["all-system-next-move-recommender"],
    humanApprovalLabel: "None",
  });

  return out;
}

import type { ComplianceBrainSnapshot } from "../brain/compliance-brain-types";
import type { ReconciliationProgress } from "../../reconciliation/build-reconciliation-progress";
import type { RolePlan, RolePlansBundle } from "./orchestrator-types";
import type { OrchestratorAction } from "./orchestrator-types";

function plan(
  role: RolePlan["role"],
  label: string,
  todayPlan: RolePlan["todayPlan"],
  doNot: string[],
  successCriteria: string,
): RolePlan {
  return { role, label, todayPlan, doNot, successCriteria };
}

export function buildRolePlans(input: {
  commitBase: string;
  snapshot: ComplianceBrainSnapshot;
  reconProgress: ReconciliationProgress;
  topActions: OrchestratorAction[];
}): RolePlansBundle {
  const { snapshot, reconProgress, topActions } = input;
  const nba = topActions[0];

  const treasurer = plan(
    "treasurer",
    "Treasurer",
    [
      {
        step: 1,
        title: reconProgress.remainingReviewItems > 0 ? "Resolve ambiguous/unmatched bank credits" : "Review locked reconciliation matches",
        href: "/admin/compliance/reconciliation",
        durationHint: "30–60 min",
      },
      {
        step: 2,
        title: "Verify bank source on production after deploy (re-import if needed)",
        href: "/admin/compliance/imports/bank",
        command: "npm run compliance:source-truth-audit",
      },
      {
        step: 3,
        title: "Approve and lock drafts (no auto-approve)",
        href: nba?.href ?? "/admin/compliance/reconciliation",
      },
    ],
    ["Auto-resolve ambiguous credits", "Batch approve queue items", "Mark filing green without sources"],
    "All rehearsal bank credits drafted, approved, and locked or documented as exceptions.",
  );

  const operator = plan(
    "operator",
    "Compliance operator",
    [
      { step: 1, title: "Command center + orchestrator brief review", href: "/admin/compliance/command-center" },
      {
        step: 2,
        title: `Burn down queue (${snapshot.queue.openItems} open) — not rule_review batch`,
        href: "/admin/compliance/approval/april-2026-compliance-review",
        command: "npm run compliance:queue-burndown",
      },
      { step: 3, title: "Next-best item in workbench", href: "/admin/compliance/approval/april-2026-compliance-review" },
    ],
    ["Batch rule_review", "Skip override on blocked items"],
    "Queue categories moving toward approved/needs-info with initials.",
  );

  const steve = plan(
    "steve",
    "Technical / Steve",
    [
      { step: 1, title: "Storage preflight + Supabase private bucket", command: "npm run compliance:storage-preflight", href: "/admin/compliance/settings#storage-setup" },
      { step: 2, title: "Review DB migration plan (no apply without approval)", href: "/admin/compliance/settings" },
      { step: 3, title: "Netlify deploy verify checklist", command: "npm run compliance:deploy-readiness" },
    ],
    ["Apply DB migration without approval packet", "Commit secrets or tasks JSON"],
    "Production storage ready; migration plan acknowledged.",
  );

  const aiAssist = plan(
    "ai_assist",
    "AI assist",
    [
      { step: 1, title: "Regenerate orchestrator + expert", command: "npm run compliance:ai-orchestrator" },
      { step: 2, title: "Run QA bundle", command: "npm run compliance:ai-orchestrator:qa" },
      { step: 3, title: "Filing impact + delta reports", command: "npm run compliance:ai-delta" },
    ],
    ["Auto-approve", "Fake filing green", "Invent bank rows"],
    "Artifacts validated; recommendations pass decision guard.",
  );

  const engineer = plan(
    "engineer",
    "Engineering",
    [
      { step: 1, title: "typecheck + build", command: "npm run typecheck && npm run build" },
      { step: 2, title: "qa-full", command: "npm run compliance:qa-full" },
      { step: 3, title: "Commit orchestrator pass (no private JSON)", command: "git status" },
    ],
    ["Lower confidence gates", "Commit data/compliance/tasks/*.json"],
    "CI green; orchestrator schemas pass QA.",
  );

  const human = plan(
    "human",
    "Compliance officer (rules)",
    [
      { step: 1, title: `Rules workflow — ${snapshot.rules.unverifiedTopicCount} topics`, href: "/admin/compliance/rules" },
      { step: 2, title: "Mark topics reviewed with initials", href: "/admin/compliance/rules" },
      { step: 3, title: "Return to queue items individually", href: "/admin/compliance/approval/april-2026-compliance-review" },
    ],
    ["Legal certification claims", "Batch rule_review"],
    "Topics reviewed for campaign workflow; queue items unblocked for individual approve.",
  );

  return {
    generatedAt: new Date().toISOString(),
    commitBase: input.commitBase,
    plans: [treasurer, operator, steve, aiAssist, engineer, human],
  };
}

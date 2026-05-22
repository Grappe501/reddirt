import type { CopilotCampaignContext, CopilotTaskPackage } from "./copilot-intelligence-types";
import type { CopilotSkillLevel, RoleCopilotId } from "./role-copilot-types";
import { getRoleCopilot } from "./role-copilot-registry";

const M = "2026-03";

type RoleIntel = {
  urgentTasks?: (ctx: CopilotCampaignContext, month: string) => Partial<CopilotTaskPackage>[];
  dailyExtras?: (ctx: CopilotCampaignContext, month: string) => Partial<CopilotTaskPackage>[];
  risks?: (ctx: CopilotCampaignContext, skill: CopilotSkillLevel) => string[];
  toolIds: string[];
};

const RULES: Partial<Record<RoleCopilotId, RoleIntel>> = {
  candidate: {
    toolIds: ["candidate-daily-briefing-builder", "candidate-fatigue-risk-detector", "candidate-event-prep-coach"],
    risks: (ctx, skill) => {
      const r = ["Do not approve while rushed — use hold if unsure."];
      if (ctx.recentFriction.some((f) => f.includes("Overload"))) r.push("Fatigue risk: limit to 2 approval decisions today.");
      if (skill === "beginner") r.push("Stay on candidate dashboard — avoid workbench edits.");
      return r;
    },
    urgentTasks: (ctx, month) =>
      (ctx.pendingApprovals ?? 0) > 0
        ? [{ type: "approval", title: "Clear pending approvals", whyItMatters: "Events and travel cannot close until approvals move." }]
        : [],
    dailyExtras: (_, month) => [
      { type: "event", title: "Review week-ahead calendar", routeLinks: [{ label: "Timeline", href: "/admin/campaign-calendar/timeline" }] },
    ],
  },
  campaign_manager: {
    toolIds: ["campaign-manager-blocker-ranker", "campaign-manager-workflow-delegator", "campaign-manager-staffing-risk-detector"],
    risks: (ctx) => {
      const r: string[] = [];
      if (ctx.activeBlockers.length) r.push(`Active blockers: ${ctx.activeBlockers.slice(0, 2).join("; ")}`);
      if (ctx.systemHealthScore != null && ctx.systemHealthScore < 70) r.push("System health low — fix sync/review before promotion.");
      return r;
    },
    urgentTasks: (ctx, month) =>
      ctx.activeBlockers.length
        ? [{ type: "urgent", title: "Resolve top blocker", whyItMatters: "Month close depends on clearing blockers first." }]
        : [{ type: "daily", title: "Workbench triage", routeLinks: [{ label: "Workbench", href: `/admin/campaign-events/workbench?month=${month}` }] }],
  },
  treasurer: {
    toolIds: ["treasurer-packet-review-copilot", "treasurer-missing-docs-prioritizer"],
    risks: () => ["Never print packet until finance readiness clears.", "No FIN-1 post without treasurer + CM sign-off."],
    dailyExtras: (_, month) => [
      { type: "finance", title: "Review mileage gaps", routeLinks: [{ label: "Reimbursement", href: `/admin/campaign-events/reimbursement?month=${month}` }] },
    ],
  },
  event_planner: {
    toolIds: ["event-planner-execution-coach", "event-readiness-task-router", "run-of-show-completion-coach"],
    dailyExtras: (_, month) => [
      { type: "event", title: "Update run of show for next event", routeLinks: [{ label: "Workbench", href: `/admin/campaign-events/workbench?month=${month}` }] },
    ],
  },
  volunteer_coordinator: {
    toolIds: ["volunteer-coordinator-staffing-copilot", "volunteer-assignment-fit-scorer", "volunteer-retention-coach"],
    risks: (ctx) => (ctx.routeContext === "volunteer" ? [] : ["Check unfilled slots before event promotion."]),
    urgentTasks: () => [{ type: "volunteer", title: "Fill staffing gaps for next 7 days", whyItMatters: "Events fail without assigned volunteers." }],
  },
  volunteer: {
    toolIds: ["volunteer-first-task-coach", "volunteer-assignment-fit-scorer"],
    risks: () => ["No finance routes.", "No mass outreach — coordinator approves sends."],
    dailyExtras: () => [{ type: "training", title: "Complete check-in training", trainingNeeded: ["tr-check-in-101"] }],
  },
  intern: {
    toolIds: ["intern-safe-task-router"],
    risks: () => ["Supervisor required for uploads and any approval surface.", "Do not touch send/promote/FIN."],
    dailyExtras: () => [{ type: "first", title: "Staging receipts (metadata)", humanApprovalGates: ["Treasurer review"] }],
  },
  field_manager: {
    toolIds: ["field-manager-county-gap-copilot", "power-of-five-task-router"],
    dailyExtras: () => [
      { type: "county", title: "Review Power of 5 gaps", routeLinks: [{ label: "County intel", href: "/admin/county-intelligence" }] },
    ],
  },
  county_lead: {
    toolIds: ["county-lead-action-planner"],
    dailyExtras: (_, month) => [
      { type: "county", title: "Update county memory after local event", routeLinks: [{ label: "Counties", href: "/admin/counties" }] },
    ],
  },
  host: {
    toolIds: ["host-invite-list-coach"],
    dailyExtras: () => [{ type: "event", title: "Confirm host intake details", routeLinks: [{ label: "Get involved", href: "/get-involved" }] }],
  },
  social_media_lead: {
    toolIds: ["social-media-content-safety-coach", "social-media-event-content-planner"],
    risks: () => ["No unapproved photos or off-brand posts.", "Draft only — human publishes."],
  },
  communications_lead: {
    toolIds: ["communications-audience-risk-scanner", "communications-message-calendar-builder"],
    risks: () => ["EMAIL_SEND_ENABLED must be off in dev unless testing.", "Audience size preview before any send."],
  },
  finance_helper: {
    toolIds: ["finance-helper-task-router"],
    risks: () => ["Upload and tag only — treasurer finalizes."],
  },
  new_admin: {
    toolIds: ["copilot-training-gap-detector"],
    dailyExtras: () => [{ type: "training", title: "Complete OS navigation module", trainingNeeded: ["tr-os-navigation-101"] }],
  },
  operator: {
    toolIds: ["operator-system-gap-copilot", "sprint-priority-copilot", "demo-readiness-copilot", "copilot-tool-gap-detector"],
    dailyExtras: () => [
      { type: "dashboard_setup", title: "Review tool-builder queue", routeLinks: [{ label: "Tool builder", href: "/admin/ai-command-center/tool-builder" }] },
    ],
  },
};

export function getRoleIntelligenceToolIds(role: RoleCopilotId): string[] {
  const base = ["copilot-intelligence-engine", "copilot-task-package-builder", "copilot-readiness-scorer"];
  return [...base, ...(RULES[role]?.toolIds ?? [])];
}

export function getRoleRiskWarnings(
  role: RoleCopilotId,
  ctx: CopilotCampaignContext,
  skill: CopilotSkillLevel,
): string[] {
  const def = getRoleCopilot(role);
  const fromRules = RULES[role]?.risks?.(ctx, skill) ?? [];
  const fromDef = def?.gatedActions.slice(0, 2).map((g) => `Gated: ${g}`) ?? [];
  return [...fromRules, ...fromDef].slice(0, 5);
}

export function getRoleExtraTaskPartials(
  role: RoleCopilotId,
  ctx: CopilotCampaignContext,
  month: string,
): Partial<CopilotTaskPackage>[] {
  const rule = RULES[role];
  const urgent = rule?.urgentTasks?.(ctx, month) ?? [];
  const daily = rule?.dailyExtras?.(ctx, month) ?? [];
  return [...urgent, ...daily];
}

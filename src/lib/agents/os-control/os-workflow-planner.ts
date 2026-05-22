import type { CampaignOsStateSnapshot } from "./campaign-os-state-snapshot";

export type OsWorkflowStep = {
  order: number;
  title: string;
  route: string;
  toolIds: string[];
  humanApprovalRequired: boolean;
  blocker?: string;
};

export type OsWorkflowPlan = {
  id: string;
  title: string;
  priority: number;
  steps: OsWorkflowStep[];
  requiredApprovals: string[];
  blockers: string[];
  expectedOutcome: string;
  domains: string[];
};

function plan(
  partial: Omit<OsWorkflowPlan, "priority"> & { priority?: number },
): OsWorkflowPlan {
  return { priority: partial.priority ?? 50, ...partial };
}

export function buildOsWorkflowPlans(state: CampaignOsStateSnapshot): OsWorkflowPlan[] {
  const plans: OsWorkflowPlan[] = [];
  const p = state.period;

  if (state.signals.reimbursementDerivedStatus === "needs_review" || state.activeBlockers.some((b) => b.includes("mileage"))) {
    plans.push(
      plan({
        id: "close-reimbursement",
        title: `Close ${p} reimbursement`,
        priority: 90,
        domains: ["travel", "reimbursement", "finance"],
        steps: [
          { order: 1, title: "Clear travel approval queue", route: `/admin/campaign-events/travel-log?month=${p}`, toolIds: ["mr-travel-queue-verifier"], humanApprovalRequired: true },
          { order: 2, title: "Fix missing mileage / city", route: `/admin/campaign-events/review?month=${p}&focus=missing_mileage`, toolIds: ["mr-mileage-assist", "cri-city-county-assist"], humanApprovalRequired: true },
          { order: 3, title: "Build reimbursement packet", route: `/admin/campaign-events/reimbursement?month=${p}`, toolIds: ["reimbursement-packet-builder", "mr-report-builder"], humanApprovalRequired: true },
          { order: 4, title: "Mark ready / finalize (human)", route: `/admin/campaign-events/reimbursement?month=${p}`, toolIds: ["mr-finalization-guard"], humanApprovalRequired: true },
        ],
        requiredApprovals: ["Travel approvals", "Finalize reimbursement month"],
        blockers: state.activeBlockers.filter((b) => /travel|mileage|reimburse/i.test(b)),
        expectedOutcome: "Print-ready reimbursement packet with audit trail",
      }),
    );
  }

  if (state.signals.pendingApprovals > 0) {
    plans.push(
      plan({
        id: "clear-approvals",
        title: `Clear ${p} event approvals`,
        priority: 85,
        domains: ["approval"],
        steps: [
          { order: 1, title: "Month review wizard", route: `/admin/campaign-events/review?month=${p}&mode=chronological`, toolIds: ["appr-month-wizard", "appr-summary-build"], humanApprovalRequired: true },
          { order: 2, title: "Send approval packages (human)", route: `/admin/campaign-events/review?month=${p}`, toolIds: ["appr-email-draft"], humanApprovalRequired: true, blocker: "Email send gated" },
        ],
        requiredApprovals: ["Approve/deny each event"],
        blockers: [`${state.signals.pendingApprovals} pending`],
        expectedOutcome: "Approved events ready for planning and travel",
      }),
    );
  }

  if (state.signals.websiteIntakeCount > 0) {
    plans.push(
      plan({
        id: "review-intake",
        title: "Review website intake",
        priority: 80,
        domains: ["intake", "calendar"],
        steps: [
          { order: 1, title: "Tentative / intake queue", route: `/admin/campaign-events/workbench?month=${p}`, toolIds: ["tentative-review-assistant", "intake-duplicate-detector"], humanApprovalRequired: true },
        ],
        requiredApprovals: ["Intake decision"],
        blockers: [`${state.signals.websiteIntakeCount} intake(s)`],
        expectedOutcome: "Website entries merged into ledger",
      }),
    );
  }

  if (state.signals.promotionReady > 0) {
    plans.push(
      plan({
        id: "promote-calendar",
        title: "Promote approved events to calendar",
        priority: 75,
        domains: ["calendar"],
        steps: [
          { order: 1, title: "Promotion workbench", route: `/admin/campaign-events/calendar-promotion?month=${p}`, toolIds: ["gcal-promotion-dry-run"], humanApprovalRequired: true },
        ],
        requiredApprovals: ["Google Calendar promotion"],
        blockers: state.signals.calendarSyncStale ? ["Calendar JSON stale"] : [],
        expectedOutcome: "Official/tentative lanes updated (human confirms write)",
      }),
    );
  }

  if (state.signals.financeExceptions > 0 || state.signals.pendingReceipts > 0) {
    plans.push(
      plan({
        id: "finance-gaps",
        title: "Resolve finance documentation gaps",
        priority: 70,
        domains: ["finance", "compliance"],
        steps: [
          { order: 1, title: "Reimbursement operations", route: `/admin/campaign-events/reimbursement?month=${p}`, toolIds: ["receipt-gap-detector", "reimbursement-packet-builder"], humanApprovalRequired: true },
          { order: 2, title: "Event financial ops", route: `/admin/campaign-events/workbench?month=${p}`, toolIds: ["financial-readiness-scorer"], humanApprovalRequired: true },
        ],
        requiredApprovals: ["Receipt approval", "Packet build"],
        blockers: state.activeBlockers.filter((b) => /finance|receipt/i.test(b)),
        expectedOutcome: "Audit-ready finance documentation",
      }),
    );
  }

  plans.push(
    plan({
      id: "hot-wash-learning",
      title: "Complete hot wash learning loop",
      priority: 55,
      domains: ["hot_wash", "county_memory"],
      steps: [
        { order: 1, title: "Post-event drilldown hot wash", route: `/admin/campaign-events/workbench?month=${p}`, toolIds: ["campaign-learning-loop-orchestrator", "county-memory-builder"], humanApprovalRequired: true },
      ],
      requiredApprovals: ["Complete hot wash review"],
      blockers: [],
      expectedOutcome: "County memory and optional blueprints updated",
    }),
  );

  plans.push(
    plan({
      id: "prepare-execution",
      title: "Prepare event execution plan",
      priority: 50,
      domains: ["event_planning"],
      steps: [
        { order: 1, title: "Planning workbook", route: `/admin/campaign-events/workbench?month=${p}`, toolIds: ["event-planning-readiness-scorer", "run-of-show-generator"], humanApprovalRequired: true },
      ],
      requiredApprovals: ["Save planning workbook"],
      blockers: [],
      expectedOutcome: "Run-of-show, briefs, and readiness score on drilldown",
    }),
  );

  return plans.sort((a, b) => b.priority - a.priority);
}

export function pickRecommendedWorkflow(plans: OsWorkflowPlan[], state: CampaignOsStateSnapshot): OsWorkflowPlan | null {
  const match = plans.find((pl) => state.recommendedWorkflow.toLowerCase().includes(pl.title.toLowerCase().slice(0, 12)));
  return match ?? plans[0] ?? null;
}

export function rankTopMoves(plans: OsWorkflowPlan[], limit = 3): OsWorkflowPlan[] {
  return plans.slice(0, limit);
}

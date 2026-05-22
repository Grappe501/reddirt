import type { CampaignUserRole } from "@/lib/agents/user-intelligence/user-personas";

export type DashboardBlockId =
  | "approval_queue"
  | "upcoming_events"
  | "travel_reimbursement_summary"
  | "missing_mileage"
  | "finance_readiness"
  | "receipt_gaps"
  | "calendar_sync_health"
  | "promotion_readiness"
  | "event_planning_checklist"
  | "hot_wash_queue"
  | "county_memory"
  | "volunteer_needs"
  | "host_follow_up"
  | "ai_next_actions"
  | "onboarding_checklist"
  | "role_training"
  | "command_palette"
  | "recent_activity"
  | "executive_summary"
  | "print_download_actions"
  | "county_priority_list"
  | "county_action_package"
  | "county_power_of_five_gaps"
  | "county_registration_progress"
  | "county_volunteer_gap"
  | "county_event_recommendation"
  | "county_comms_prompt"
  | "candidate_county_briefing"
  | "intern_county_tasks"
  | "field_manager_county_plan";

export type DashboardBlockDefinition = {
  id: DashboardBlockId;
  title: string;
  purpose: string;
  readsFrom: string;
  requiredRoles: CampaignUserRole[] | "any";
  riskLevel: "low" | "medium" | "high";
  routeLinks: { label: string; href: string }[];
  emptyState: string;
  aiExplanation: string;
  safetyNotes: string;
};

export const DASHBOARD_COMPONENT_REGISTRY: DashboardBlockDefinition[] = [
  {
    id: "executive_summary",
    title: "Executive summary",
    purpose: "What matters, what is blocked, top next move.",
    readsFrom: "executive-summary-builder.ts",
    requiredRoles: "any",
    riskLevel: "low",
    routeLinks: [],
    emptyState: "Load month snapshot for summary.",
    aiExplanation: "Always place first for calm orientation.",
    safetyNotes: "Read-only.",
  },
  {
    id: "approval_queue",
    title: "Approval queue",
    purpose: "Pending candidate/CM approval decisions.",
    readsFrom: "CampaignEventsDashboardSnapshot.pendingApprovals",
    requiredRoles: ["candidate", "campaign_manager", "operator"],
    riskLevel: "medium",
    routeLinks: [{ label: "Month review", href: "/admin/campaign-events/review?month=2026-03&mode=chronological" }],
    emptyState: "No pending approvals in snapshot.",
    aiExplanation: "Decisions gate promotion and reimbursement close.",
    safetyNotes: "Human must approve — no auto-send.",
  },
  {
    id: "upcoming_events",
    title: "Upcoming events",
    purpose: "Tentative and official events in active month.",
    readsFrom: "ledger + campaign calendar",
    requiredRoles: "any",
    riskLevel: "low",
    routeLinks: [
      { label: "Workbench", href: "/admin/campaign-events/workbench?month=2026-03" },
      { label: "Timeline", href: "/admin/campaign-calendar/timeline" },
    ],
    emptyState: "No events in period.",
    aiExplanation: "Operational tempo for field and candidate.",
    safetyNotes: "Read-only list.",
  },
  {
    id: "travel_reimbursement_summary",
    title: "Travel reimbursement",
    purpose: "Month reimbursement status and totals.",
    readsFrom: "reimbursement-month-status, finance snapshot",
    requiredRoles: ["treasurer", "campaign_manager", "candidate", "operator"],
    riskLevel: "medium",
    routeLinks: [{ label: "Official reimbursement", href: "/admin/campaign-events/reimbursement?month=2026-03" }],
    emptyState: "Open reimbursement page to build packet.",
    aiExplanation: "Treasurer and candidate care about print readiness.",
    safetyNotes: "Print is human-triggered only.",
  },
  {
    id: "missing_mileage",
    title: "Missing mileage",
    purpose: "Rows blocking reimbursement print.",
    readsFrom: "snapshot.needsMileageReview, travel queues",
    requiredRoles: ["treasurer", "campaign_manager", "operator"],
    riskLevel: "medium",
    routeLinks: [{ label: "Travel report", href: "/admin/campaign-events/travel-report?month=2026-03" }],
    emptyState: "Mileage queue clear.",
    aiExplanation: "Must clear before treasurer packet.",
    safetyNotes: "Edits are human-confirmed.",
  },
  {
    id: "finance_readiness",
    title: "Finance readiness",
    purpose: "Pipeline, exceptions, treasurer panel.",
    readsFrom: "loadCampaignFinanceSnapshot",
    requiredRoles: ["treasurer", "campaign_manager", "operator"],
    riskLevel: "medium",
    routeLinks: [{ label: "Reimbursement", href: "/admin/campaign-events/reimbursement?month=2026-03" }],
    emptyState: "Finance snapshot unavailable.",
    aiExplanation: "Resource efficiency and compliance posture.",
    safetyNotes: "No FIN-1 auto-post.",
  },
  {
    id: "receipt_gaps",
    title: "Receipt gaps",
    purpose: "Pending or missing receipt documents.",
    readsFrom: "finance-document-store",
    requiredRoles: ["treasurer", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "Finance ops", href: "/admin/campaign-events/reimbursement?month=2026-03" }],
    emptyState: "No pending receipts flagged.",
    aiExplanation: "Audit trail completeness.",
    safetyNotes: "Upload human-reviewed.",
  },
  {
    id: "calendar_sync_health",
    title: "Calendar sync health",
    purpose: "JSON freshness and GCal truth.",
    readsFrom: "calendar-sync dashboard",
    requiredRoles: ["campaign_manager", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "Calendar sync", href: "/admin/campaign-events/calendar-sync?month=2026-03" }],
    emptyState: "Sync healthy.",
    aiExplanation: "Stale JSON misleads promotion readiness.",
    safetyNotes: "GCal write remains gated.",
  },
  {
    id: "promotion_readiness",
    title: "Promotion readiness",
    purpose: "Events eligible for official calendar promotion.",
    readsFrom: "snapshot.promotionReadyTentative",
    requiredRoles: ["campaign_manager", "operator"],
    riskLevel: "high",
    routeLinks: [{ label: "Workbench", href: "/admin/campaign-events/workbench?month=2026-03" }],
    emptyState: "No rows ready for promotion preview.",
    aiExplanation: "Requires prior approval + sync truth.",
    safetyNotes: "Promotion human-gated.",
  },
  {
    id: "event_planning_checklist",
    title: "Event planning",
    purpose: "Run of show, materials, drilldown readiness.",
    readsFrom: "EventPlanningWorkbook",
    requiredRoles: ["campaign_manager", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "Workbench", href: "/admin/campaign-events/workbench?month=2026-03" }],
    emptyState: "Open event drilldown planning tab.",
    aiExplanation: "Execution quality before event day.",
    safetyNotes: "Read/write on fact card — human saves.",
  },
  {
    id: "hot_wash_queue",
    title: "Hot wash queue",
    purpose: "Media approval and post-event intelligence.",
    readsFrom: "media-approval queue, hot wash intel",
    requiredRoles: ["campaign_manager", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "Media approval", href: "/admin/campaign-events/media-approval" }],
    emptyState: "No pending hot wash reviews.",
    aiExplanation: "Feeds county memory and blueprints.",
    safetyNotes: "No public PII in smoke tests.",
  },
  {
    id: "county_memory",
    title: "County memory",
    purpose: "County signals and organizing intelligence.",
    readsFrom: "county-memory JSON",
    requiredRoles: ["campaign_manager", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "Counties", href: "/admin/counties" }],
    emptyState: "County memory building.",
    aiExplanation: "Geography-aware strategy.",
    safetyNotes: "No invented leaders.",
  },
  {
    id: "volunteer_needs",
    title: "Volunteer needs",
    purpose: "Asks and volunteer intake scaffold.",
    readsFrom: "/admin/asks, volunteer intake",
    requiredRoles: ["campaign_manager", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "Volunteer asks", href: "/admin/asks" }],
    emptyState: "Volunteer CRM not fully wired.",
    aiExplanation: "Field capacity planning.",
    safetyNotes: "Scaffold — no auto outreach.",
  },
  {
    id: "host_follow_up",
    title: "Host follow-up",
    purpose: "Website intake and host engagement.",
    readsFrom: "WorkflowIntake, intake queue",
    requiredRoles: ["campaign_manager", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "Workbench intake", href: "/admin/campaign-events/workbench?month=2026-03" }],
    emptyState: "No intake items waiting.",
    aiExplanation: "Relationship building after events.",
    safetyNotes: "No auto email.",
  },
  {
    id: "ai_next_actions",
    title: "AI next actions",
    purpose: "Supervised next moves from agent runtime.",
    readsFrom: "next-action-engine, workflow router",
    requiredRoles: "any",
    riskLevel: "low",
    routeLinks: [{ label: "AI command center", href: "/admin/ai-command-center" }],
    emptyState: "Use command palette to generate actions.",
    aiExplanation: "Human-gated recommendations only.",
    safetyNotes: "No autonomous execution.",
  },
  {
    id: "onboarding_checklist",
    title: "Onboarding checklist",
    purpose: "First-time role setup tasks.",
    readsFrom: "role-onboarding-engine",
    requiredRoles: "any",
    riskLevel: "low",
    routeLinks: [{ label: "Role onboarding", href: "/admin/onboarding" }],
    emptyState: "Complete onboarding wizard.",
    aiExplanation: "Reduces new-user friction.",
    safetyNotes: "Local guidance only.",
  },
  {
    id: "role_training",
    title: "Role training",
    purpose: "Tooltips and training path links.",
    readsFrom: "training-path-builder",
    requiredRoles: "any",
    riskLevel: "low",
    routeLinks: [{ label: "Onboarding", href: "/admin/onboarding" }],
    emptyState: "Select a role for training path.",
    aiExplanation: "Skill-appropriate depth.",
    safetyNotes: "Documentation links only.",
  },
  {
    id: "command_palette",
    title: "Command palette",
    purpose: "Plain-language OS entry (Ctrl+K).",
    readsFrom: "GlobalAiCommandPalette",
    requiredRoles: "any",
    riskLevel: "low",
    routeLinks: [],
    emptyState: "Press Ctrl+K anywhere in admin.",
    aiExplanation: "Primary AI entry for operators.",
    safetyNotes: "Routes only — no writes from palette.",
  },
  {
    id: "recent_activity",
    title: "Recent activity",
    purpose: "Observation stream and recent paths.",
    readsFrom: "user-observations.json",
    requiredRoles: ["operator"],
    riskLevel: "low",
    routeLinks: [{ label: "Command center", href: "/admin/ai-command-center" }],
    emptyState: "No observations yet.",
    aiExplanation: "Steve/operator situational awareness.",
    safetyNotes: "Metadata only — no PII.",
  },
  {
    id: "print_download_actions",
    title: "Print & export",
    purpose: "Reimbursement print, CSV, audit exports.",
    readsFrom: "reimbursement report builder",
    requiredRoles: ["treasurer", "candidate", "operator"],
    riskLevel: "medium",
    routeLinks: [{ label: "Print reimbursement", href: "/admin/campaign-events/reimbursement?month=2026-03" }],
    emptyState: "Clear blockers before print.",
    aiExplanation: "Final mile for treasurer workflow.",
    safetyNotes: "Human initiates print.",
  },
  {
    id: "county_priority_list",
    title: "County priority list",
    purpose: "Top weak counties needing field attention.",
    readsFrom: "county-intelligence-engine identifyWeakCounties",
    requiredRoles: ["campaign_manager", "county_lead", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "County command center", href: "/admin/county-intelligence" }],
    emptyState: "Bridge countyWorkbench for priorities.",
    aiExplanation: "Guides where to organize next.",
    safetyNotes: "Read-only workbench bridge.",
  },
  {
    id: "county_action_package",
    title: "County action package",
    purpose: "Per-county operational package with tasks and routes.",
    readsFrom: "county-action-package-builder",
    requiredRoles: ["campaign_manager", "county_lead", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "County command center", href: "/admin/county-intelligence" }],
    emptyState: "Select a county slug.",
    aiExplanation: "Turns KPIs into operator tasks.",
    safetyNotes: "Human executes — no auto outreach.",
  },
  {
    id: "county_power_of_five_gaps",
    title: "Power of 5 gaps",
    purpose: "Relational organizing gaps by county.",
    readsFrom: "power-of-five-engine",
    requiredRoles: ["campaign_manager", "county_lead", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "County intel", href: "/admin/county-intelligence" }],
    emptyState: "No P5 goals connected.",
    aiExplanation: "Drives post-event asks.",
    safetyNotes: "Planning proxy until governance sheet.",
  },
  {
    id: "county_registration_progress",
    title: "Registration target progress",
    purpose: "County registration planning targets.",
    readsFrom: "county-workbench-adapter",
    requiredRoles: ["campaign_manager", "county_lead", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "County command center", href: "/admin/county-intelligence" }],
    emptyState: "Goals pending connection.",
    aiExplanation: "50K statewide planning context.",
    safetyNotes: "Aggregate only.",
  },
  {
    id: "county_volunteer_gap",
    title: "County volunteer gap",
    purpose: "Counties needing volunteer recruitment.",
    readsFrom: "county-copilot-applications",
    requiredRoles: ["volunteer_coordinator", "campaign_manager"],
    riskLevel: "low",
    routeLinks: [{ label: "Volunteers", href: "/admin/volunteers" }],
    emptyState: "No gaps detected.",
    aiExplanation: "Staff before promoting events.",
    safetyNotes: "No mass SMS.",
  },
  {
    id: "county_event_recommendation",
    title: "County event recommendation",
    purpose: "Where to plan the next county-tagged event.",
    readsFrom: "recommendCountyEventsForPeriod",
    requiredRoles: ["campaign_manager", "county_lead", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "Workbench", href: "/admin/campaign-events/workbench?month=2026-03" }],
    emptyState: "No weak counties flagged.",
    aiExplanation: "House parties in low-readiness counties.",
    safetyNotes: "Human schedules event.",
  },
  {
    id: "county_comms_prompt",
    title: "County communications prompt",
    purpose: "Draft angles for county-specific messaging.",
    readsFrom: "county-action-package-builder",
    requiredRoles: ["operator", "campaign_manager"],
    riskLevel: "medium",
    routeLinks: [{ label: "Communications", href: "/admin/communications" }],
    emptyState: "Pick a county focus.",
    aiExplanation: "Draft only — audience safety gate.",
    safetyNotes: "EMAIL_SEND_ENABLED required for send.",
  },
  {
    id: "candidate_county_briefing",
    title: "Candidate county briefing",
    purpose: "Talking points before county events.",
    readsFrom: "buildCountyIntelligenceSummary",
    requiredRoles: ["candidate", "campaign_manager"],
    riskLevel: "low",
    routeLinks: [{ label: "Candidate dashboard", href: "/admin/candidate-dashboard" }],
    emptyState: "County not resolved.",
    aiExplanation: "Calm briefing — fatigue protection.",
    safetyNotes: "No overwhelm mode.",
  },
  {
    id: "intern_county_tasks",
    title: "Intern county tasks",
    purpose: "Safe supervised county research tasks.",
    readsFrom: "county-action-package-builder internTaskList",
    requiredRoles: ["new_admin_user", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "County command center", href: "/admin/county-intelligence" }],
    emptyState: "Assign supervisor first.",
    aiExplanation: "No voter export or outreach.",
    safetyNotes: "Supervisor sign-off.",
  },
  {
    id: "field_manager_county_plan",
    title: "Field manager county plan",
    purpose: "Daily statewide field plan from county intel.",
    readsFrom: "buildFieldManagerDailyCountyPlan",
    requiredRoles: ["campaign_manager", "county_lead", "operator"],
    riskLevel: "low",
    routeLinks: [{ label: "County command center", href: "/admin/county-intelligence" }],
    emptyState: "Load county bridge.",
    aiExplanation: "Top weak counties + PO5 + volunteers.",
    safetyNotes: "Guidance not permissions.",
  },
];

export function getBlocksForRole(role: CampaignUserRole): DashboardBlockDefinition[] {
  return DASHBOARD_COMPONENT_REGISTRY.filter(
    (b) => b.requiredRoles === "any" || b.requiredRoles.includes(role),
  );
}

export function getBlockById(id: DashboardBlockId): DashboardBlockDefinition | undefined {
  return DASHBOARD_COMPONENT_REGISTRY.find((b) => b.id === id);
}

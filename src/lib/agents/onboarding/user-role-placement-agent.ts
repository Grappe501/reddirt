import type { OnboardingRoleId } from "./role-onboarding-engine";

export type UserPlacementInput = {
  who: string;
  helpingWith: string;
  experience: "none" | "some" | "experienced";
  preferredRole?: OnboardingRoleId;
};

export type UserPlacementRecommendation = {
  role: OnboardingRoleId;
  permissionScaffold: string[];
  dashboardBlueprintHint: string;
  firstTasks: { label: string; href: string }[];
  trainingPath: { label: string; href: string }[];
  doNotTouch: string[];
  humanSupervisor: boolean;
  rationale: string;
};

export function recommendUserRolePlacement(input: UserPlacementInput): UserPlacementRecommendation {
  const text = `${input.who} ${input.helpingWith}`.toLowerCase();
  let role: OnboardingRoleId = input.preferredRole ?? "campaign_manager";

  if (!input.preferredRole) {
    if (/treasurer|finance|receipt|mileage|reimburse/i.test(text)) role = "treasurer";
    else if (/candidate|kelly|approve/i.test(text)) role = "candidate";
    else if (/volunteer|house party/i.test(text)) role = "volunteer_coordinator";
    else if (/county|pulaski|organizer/i.test(text)) role = "county_lead";
    else if (/host|intake/i.test(text)) role = "host_helper";
    else if (/event|planning|run of show/i.test(text)) role = "event_planner";
    else if (/steve|operator|admin/i.test(text)) role = "operator";
    else if (input.experience === "none") role = "new_admin";
  }

  const permissionScaffold =
    role === "treasurer"
      ? ["view_finance", "edit_travel", "print_reimbursement"]
      : role === "candidate"
        ? ["view_approvals", "view_travel_summary"]
        : role === "operator"
          ? ["full_admin_read", "gated_writes"]
          : ["view_workbench", "view_events", "edit_assigned_rows"];

  const firstTasks: { label: string; href: string }[] =
    role === "treasurer"
      ? [
          { label: "Open April reimbursement", href: "/admin/campaign-events/reimbursement?month=2026-04" },
          { label: "Clear mileage queue", href: "/admin/campaign-events/travel-report?month=2026-04" },
          { label: "Review finance readiness", href: "/admin/campaign-manager-dashboard?month=2026-04" },
        ]
      : role === "candidate"
        ? [
            { label: "Candidate dashboard", href: "/admin/candidate-dashboard?month=2026-03" },
            { label: "Pending approvals", href: "/admin/campaign-events/review?month=2026-03&mode=chronological" },
            { label: "Travel summary", href: "/admin/campaign-events/travel-report?month=2026-03" },
          ]
        : [
            { label: "CM dashboard", href: "/admin/campaign-manager-dashboard?month=2026-03" },
            { label: "Events workbench", href: "/admin/campaign-events/workbench?month=2026-03" },
            { label: "AI command center", href: "/admin/ai-command-center" },
          ];

  return {
    role,
    permissionScaffold,
    dashboardBlueprintHint: `Build blueprint via dashboard builder for ${role}`,
    firstTasks,
    trainingPath: [
      { label: "Role onboarding", href: "/admin/onboarding" },
      { label: "Dashboard builder", href: "/admin/ai-command-center/dashboard-builder" },
      { label: "Kelly command center", href: "/admin/ai-command-center" },
    ],
    doNotTouch: [
      "Send approval email without review",
      "Google Calendar promotion without human confirm",
      "Post FIN-1 transactions",
    ],
    humanSupervisor: role === "treasurer" || role === "new_admin" || input.experience === "none",
    rationale: `Placed as ${role} based on task "${input.helpingWith}" and experience ${input.experience}.`,
  };
}

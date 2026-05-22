import type { CopilotIntelligenceBrief } from "@/lib/agents/role-copilots/copilot-intelligence-types";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";

const COUNTY_COPILOT_ROLES: RoleCopilotId[] = [
  "field_manager",
  "county_lead",
  "volunteer_coordinator",
  "intern",
  "communications_lead",
  "candidate",
  "campaign_manager",
];

/** Client-safe county hints — no countyWorkbench fs reads (full merge on server routes). */
export function mergeCountyIntoCopilotBriefLite(
  role: RoleCopilotId,
  brief: CopilotIntelligenceBrief,
): CopilotIntelligenceBrief {
  if (!COUNTY_COPILOT_ROLES.includes(role)) return brief;
  const countyRoute = { label: "County command center", href: "/admin/county-intelligence" };
  return {
    ...brief,
    riskWarnings: [
      ...brief.riskWarnings,
      "County KPIs load on server — open county command center for live weak-county list.",
    ].slice(0, 6),
    recommendedNextTask: {
      ...brief.recommendedNextTask,
      title: brief.recommendedNextTask.title || "Review county priorities",
      routeLinks: [countyRoute, ...(brief.recommendedNextTask.routeLinks ?? [])].slice(0, 2),
    },
    toolIds: [
      ...new Set([
        ...brief.toolIds,
        "county-action-package-builder",
        "field-manager-county-plan-builder",
        "county-dashboard-context-composer",
      ]),
    ],
  };
}

import type { CopilotIntelligenceBrief } from "@/lib/agents/role-copilots/copilot-intelligence-types";
import type { RoleCopilotId } from "@/lib/agents/role-copilots/role-copilot-types";

const COMMS_ROLES: RoleCopilotId[] = [
  "communications_lead",
  "volunteer_coordinator",
  "county_lead",
  "host",
  "candidate",
  "campaign_manager",
];

/** Client-safe comms hints — full intelligence on server routes only. */
export function mergeCommunicationsIntoCopilotBriefLite(
  role: RoleCopilotId,
  brief: CopilotIntelligenceBrief,
): CopilotIntelligenceBrief {
  if (!COMMS_ROLES.includes(role)) return brief;
  return {
    ...brief,
    riskWarnings: [
      ...brief.riskWarnings,
      "Communications V2: drafts only — open /admin/communications/intelligence for live priorities.",
    ].slice(0, 6),
    toolIds: [
      ...new Set([
        ...brief.toolIds,
        "campaign-writing-router",
        "communication-sequence-builder",
        "relationship-strength-engine",
      ]),
    ],
    recommendedNextTask: {
      ...brief.recommendedNextTask,
      routeLinks: [
        { label: "Communications intelligence", href: "/admin/communications/intelligence" },
        { label: "Message Studio", href: "/admin/communications/studio" },
        ...(brief.recommendedNextTask.routeLinks ?? []),
      ].slice(0, 2),
    },
  };
}

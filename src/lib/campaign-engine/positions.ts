/**
 * ROLE-1: Position identifiers for the hierarchical campaign operating system.
 * No RBAC, no assignment logic — names + hierarchy for planning and future UI.
 * @see docs/position-system-foundation.md
 * @see docs/workbench-job-definitions.md
 * @see docs/position-hierarchy-map.md
 */

export const ROLE1_PACKET = "ROLE-1" as const;

/** Stable slug for a campaign position (not a User id). */
export type PositionId =
  | "campaign_manager"
  | "assistant_campaign_manager"
  | "communications_director"
  | "field_director"
  | "finance_director"
  | "compliance_director"
  | "email_comms_manager"
  | "content_manager"
  | "social_media_manager"
  | "media_relations_press"
  | "volunteer_coordinator"
  | "county_regional_coordinator"
  | "field_organizer"
  | "data_manager"
  | "opposition_research_lead"
  | "voter_insights_analytics"
  | "events_manager"
  | "scheduler_calendar_manager"
  | "task_workflow_manager"
  | "intern_general"
  | "volunteer_general"
  | "platforms_integrations";

export type PositionNode = {
  id: PositionId;
  parentId: PositionId | null;
  /** For docs / display only in ROLE-1 */
  displayName: string;
  /** Key workbench path hints — align with workbench-build-map */
  workbenchRouteHints: readonly string[];
};

/**
 * Placeholder org tree. Single source of truth for structure is the docs
 * (position-hierarchy-map.md) until a DB or CMS backs this.
 */
export const POSITION_TREE: readonly PositionNode[] = [
  {
    id: "campaign_manager",
    parentId: null,
    displayName: "Campaign Manager",
    workbenchRouteHints: ["/admin/workbench", "/admin/tasks", "/admin/events"],
  },
  {
    id: "assistant_campaign_manager",
    parentId: "campaign_manager",
    displayName: "Assistant Campaign Manager",
    workbenchRouteHints: [
      "/admin/workbench/calendar",
      "/admin/tasks",
      "/admin/events",
      "/admin/voter-import",
    ],
  },
  {
    id: "communications_director",
    parentId: "campaign_manager",
    displayName: "Communications Director",
    workbenchRouteHints: [
      "/admin/workbench/comms",
      "/admin/workbench/social",
      "/admin/workbench/email-queue",
    ],
  },
  {
    id: "field_director",
    parentId: "campaign_manager",
    displayName: "Field Director",
    workbenchRouteHints: [
      "/admin/workbench",
      "/admin/workbench/festivals",
      "/admin/asks",
    ],
  },
  {
    id: "finance_director",
    parentId: "campaign_manager",
    displayName: "Finance Director",
    workbenchRouteHints: ["/admin/settings"],
  },
  {
    id: "compliance_director",
    parentId: "campaign_manager",
    displayName: "Compliance Director",
    workbenchRouteHints: ["/admin/workbench/comms", "/admin/voter-import"],
  },
  {
    id: "email_comms_manager",
    parentId: "communications_director",
    displayName: "Email/Comms Manager",
    workbenchRouteHints: [
      "/admin/workbench/comms",
      "/admin/workbench/email-queue",
      "/admin/inbox",
    ],
  },
  {
    id: "content_manager",
    parentId: "communications_director",
    displayName: "Content Manager",
    workbenchRouteHints: [
      "/admin/content",
      "/admin/owned-media",
      "/admin/review-queue",
    ],
  },
  {
    id: "social_media_manager",
    parentId: "communications_director",
    displayName: "Social Media Manager",
    workbenchRouteHints: ["/admin/workbench/social", "/admin/orchestrator"],
  },
  {
    id: "media_relations_press",
    parentId: "communications_director",
    displayName: "Media Relations / Press",
    workbenchRouteHints: ["/admin/media-monitor", "/admin/workbench/comms"],
  },
  {
    id: "volunteer_coordinator",
    parentId: "field_director",
    displayName: "Volunteer Coordinator",
    workbenchRouteHints: ["/admin/volunteers/intake", "/admin/asks", "/admin/tasks"],
  },
  {
    id: "county_regional_coordinator",
    parentId: "field_director",
    displayName: "County/Regional Coordinator",
    workbenchRouteHints: ["/admin/workbench", "/admin/workbench/festivals", "/admin/tasks"],
  },
  {
    id: "field_organizer",
    parentId: "county_regional_coordinator",
    displayName: "Field Organizer",
    workbenchRouteHints: ["/admin/tasks", "/admin/events", "/admin/workbench/festivals"],
  },
  {
    id: "data_manager",
    parentId: "assistant_campaign_manager",
    displayName: "Data Manager",
    workbenchRouteHints: ["/admin/voter-import", "/admin/insights"],
  },
  {
    id: "opposition_research_lead",
    parentId: "assistant_campaign_manager",
    displayName: "Opposition Research Lead",
    workbenchRouteHints: ["/admin/content", "/admin/media-monitor"],
  },
  {
    id: "voter_insights_analytics",
    parentId: "data_manager",
    displayName: "Voter Insights / Analytics",
    workbenchRouteHints: ["/admin/insights", "/admin/voter-import"],
  },
  {
    id: "events_manager",
    parentId: "assistant_campaign_manager",
    displayName: "Events Manager",
    workbenchRouteHints: ["/admin/events", "/admin/workbench/calendar", "/admin/workbench/festivals"],
  },
  {
    id: "scheduler_calendar_manager",
    parentId: "assistant_campaign_manager",
    displayName: "Scheduler / Calendar Manager",
    workbenchRouteHints: ["/admin/workbench/calendar", "/admin/events"],
  },
  {
    id: "task_workflow_manager",
    parentId: "assistant_campaign_manager",
    displayName: "Task/Workflow Manager",
    workbenchRouteHints: ["/admin/tasks", "/admin/workbench"],
  },
  {
    id: "intern_general",
    parentId: "assistant_campaign_manager",
    displayName: "Intern (general)",
    workbenchRouteHints: ["/admin/tasks"],
  },
  {
    id: "volunteer_general",
    parentId: "volunteer_coordinator",
    displayName: "Volunteer (general)",
    workbenchRouteHints: [],
  },
  {
    id: "platforms_integrations",
    parentId: "assistant_campaign_manager",
    displayName: "Platforms / Integrations",
    workbenchRouteHints: ["/admin/settings", "/admin/platforms"],
  },
];

/** Stable list of role keys (for SEAT-1 and validation). */
export const ALL_POSITION_IDS: readonly PositionId[] = POSITION_TREE.map((n) => n.id);

const POSITION_ID_SET = new Set<string>(ALL_POSITION_IDS);

export function isValidPositionId(s: string): s is PositionId {
  return POSITION_ID_SET.has(s);
}

/** Get direct children in the placeholder tree. */
export function getChildPositions(
  parentId: PositionId | null,
): readonly PositionNode[] {
  return POSITION_TREE.filter((n) => n.parentId === parentId);
}

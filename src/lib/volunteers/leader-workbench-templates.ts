import templatesFile from "../../../data/volunteers/leader-workbench-templates.source.json";
import type { VolunteerLeader } from "@/lib/volunteers/types";

export type LeaderWorkbenchTemplateId =
  | "youth_leadership"
  | "high_school_leadership"
  | "hispanic_outreach_lead"
  | "volunteer_manager"
  | "event_planner"
  | "fundraising_workbench"
  | "fundraising_lead"
  | "fundraising_field_leader"
  | "volunteer_leadership_team"
  | "county_candidate_coordinator"
  | "cluster_leader"
  | "city_leader"
  | "county_leader"
  | "events_lead"
  | "muslim_community_lead"
  | "interfaith_comms_liaison"
  | "progressives_liaison"
  | "finance_inner_circle"
  | "campus_team_co_chair"
  | "special_outreach_lead"
  | "union_liaison"
  | "social_media_influencer"
  | "democratic_black_caucus_lead"
  | "educators_coalition_lead"
  | "comms_lead"
  | "assistant_cm_workbench";

export type LeaderTemplateToolLink = {
  label: string;
  href: string;
  description: string;
};

export type LeaderWorkbenchTemplate = {
  id: LeaderWorkbenchTemplateId;
  label: string;
  description: string;
  coalitionSlug?: string;
  locale?: string;
  interimNotice?: string;
  includes?: LeaderWorkbenchTemplateId[];
  sections: LeaderTemplateSection[];
  pathways: LeaderTemplatePathway[];
  toolLinks?: LeaderTemplateToolLink[];
};

const registry = templatesFile as {
  templates: Record<LeaderWorkbenchTemplateId, LeaderWorkbenchTemplate>;
};

export function getLeaderWorkbenchTemplate(id: LeaderWorkbenchTemplateId): LeaderWorkbenchTemplate {
  return registry.templates[id];
}

export type LeaderTemplateSection = {
  id: string;
  label: string;
  description: string;
};

export type LeaderTemplatePathway = {
  key: string;
  label: string;
  labelEs?: string;
};

export function hasVolunteerManagerRole(leader: VolunteerLeader): boolean {
  return Boolean(
    leader.volunteerManagerInterim || leader.workbenchTemplates?.includes("volunteer_manager"),
  );
}

/** High school template includes all youth leadership sections. */
export function resolveLeaderWorkbenchTemplates(leader: VolunteerLeader): LeaderWorkbenchTemplate[] {
  const ids = new Set<LeaderWorkbenchTemplateId>();

  if (leader.volunteerManagerInterim) {
    ids.add("volunteer_manager");
  }

  if (leader.volunteerLeadershipTeam) {
    ids.add("volunteer_leadership_team");
  }

  if (leader.interfaithCommsLiaison) {
    ids.add("interfaith_comms_liaison");
  }

  if (leader.campusTeamCoChair) {
    ids.add("campus_team_co_chair");
  }

  if (leader.grassrootsFundraisingLead) {
    ids.add("fundraising_field_leader");
  }

  if (leader.specialOutreachProgramSlug) {
    ids.add("special_outreach_lead");
  }

  if (leader.acmWorkbenchFlex) {
    ids.add("assistant_cm_workbench");
  }

  for (const id of leader.workbenchTemplates ?? []) {
    ids.add(id);
    const tpl = registry.templates[id];
    for (const inc of tpl?.includes ?? []) {
      ids.add(inc);
    }
  }

  if (leader.highSchoolSenior) {
    ids.add("high_school_leadership");
    ids.add("youth_leadership");
  }

  const order: LeaderWorkbenchTemplateId[] = [
    "volunteer_manager",
    "county_candidate_coordinator",
    "cluster_leader",
    "city_leader",
    "county_leader",
    "muslim_community_lead",
    "interfaith_comms_liaison",
    "progressives_liaison",
    "campus_team_co_chair",
    "special_outreach_lead",
    "union_liaison",
    "social_media_influencer",
    "democratic_black_caucus_lead",
    "educators_coalition_lead",
    "assistant_cm_workbench",
    "comms_lead",
    "events_lead",
    "event_planner",
    "finance_inner_circle",
    "fundraising_lead",
    "fundraising_field_leader",
    "fundraising_workbench",
    "volunteer_leadership_team",
    "youth_leadership",
    "high_school_leadership",
    "hispanic_outreach_lead",
  ];

  return order.filter((id) => ids.has(id)).map((id) => registry.templates[id]);
}

export function coalitionWorkbenchHref(slug: string): string {
  return `/election-plan/workbenches/${slug}`;
}

export function resolveSpecialKpiCitySlugs(leader: VolunteerLeader): string[] {
  const slugs = new Set(leader.specialKpiCitySlugs ?? []);
  for (const conn of leader.connections) {
    if (conn.kind === "city") slugs.add(conn.citySlug);
  }
  return [...slugs];
}

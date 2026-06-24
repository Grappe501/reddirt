import rosterFile from "../../../data/volunteers/leader-roster.json";
import type { LeaderRosterFile, VolunteerLeader, VolunteerTeamLaneId } from "@/lib/volunteers/types";
import { VOLUNTEER_TEAM_LANES } from "@/lib/volunteers/types";

const roster = rosterFile as LeaderRosterFile;

export function getVolunteerLeaderRoster(): VolunteerLeader[] {
  return roster.leaders;
}

/** Leader sign-in picker — excludes open co-chair placeholders until a person is named. */
export function getVolunteerLeadersForSignIn(): VolunteerLeader[] {
  return roster.leaders.filter((l) => !l.leaderRosterSignInHidden);
}

export function getVolunteerLeaderBySlug(slug: string): VolunteerLeader | undefined {
  return roster.leaders.find((l) => l.slug === slug);
}

export function getVolunteerLeaderByInitials(initials: string): VolunteerLeader | undefined {
  const normalized = initials.trim().toUpperCase();
  return roster.leaders.find((l) => l.initials.toUpperCase() === normalized);
}

export function getCommandAccessLeaders(): VolunteerLeader[] {
  return roster.leaders.filter((l) => l.commandAccess);
}

/** Field roster table + sign-in list — excludes HQ-only command logins unless flex workbench. */
export function countsInFieldLeaderRoster(leader: VolunteerLeader): boolean {
  return !leader.commandAccess || Boolean(leader.assistantCm || leader.volunteerManagerInterim);
}

/** Full Operators shell: all lanes, command, field admin — role title not fixed in UI. */
export function hasFlexLeaderWorkbench(leader: VolunteerLeader): boolean {
  return Boolean(leader.assistantCm || leader.acmWorkbenchFlex);
}

/** Volunteer intake ops dashboard — interim vol manager, vol-manager template, or command access. */
export function canAccessVolunteerIntakeOps(leader: VolunteerLeader): boolean {
  return Boolean(
    leader.volunteerManagerInterim ||
      leader.workbenchTemplates?.includes("volunteer_manager") ||
      leader.commandAccess ||
      leader.assistantCm,
  );
}

/** Statewide comms command — comms lead template, interfaith liaison, or command access. */
export function canAccessCommsCommand(leader: VolunteerLeader): boolean {
  return Boolean(
    leader.workbenchTemplates?.includes("comms_lead") ||
      leader.interfaithCommsLiaison ||
      leader.commandAccess ||
      leader.assistantCm ||
      leader.acmWorkbenchFlex,
  );
}

/** Statewide voter registration command — VR lead template or command access. */
export function canAccessVoterRegistrationCommand(leader: VolunteerLeader): boolean {
  return Boolean(
    leader.workbenchTemplates?.includes("voter_registration_lead") ||
      leader.commandAccess ||
      leader.assistantCm ||
      leader.acmWorkbenchFlex ||
      leader.volunteerManagerInterim,
  );
}

/** Events & Mobilize command — events lead, event planner, or command access. */
export function canAccessEventsCommand(leader: VolunteerLeader): boolean {
  return Boolean(
    leader.workbenchTemplates?.includes("events_lead") ||
      leader.workbenchTemplates?.includes("event_planner") ||
      leader.commandAccess ||
      leader.assistantCm ||
      leader.acmWorkbenchFlex,
  );
}

const COALITION_COMMAND_TEMPLATES = [
  "progressives_liaison",
  "muslim_community_lead",
  "educators_coalition_lead",
  "union_liaison",
  "democratic_black_caucus_lead",
  "hispanic_outreach_lead",
  "special_outreach_lead",
] as const;

/** Coalition lane rollup — coalition liaisons and command access. */
export function canAccessCoalitionCommand(leader: VolunteerLeader): boolean {
  return Boolean(
    COALITION_COMMAND_TEMPLATES.some((id) => leader.workbenchTemplates?.includes(id)) ||
      leader.interfaithCommsLiaison ||
      leader.commandAccess ||
      leader.assistantCm ||
      leader.acmWorkbenchFlex,
  );
}

/** Statewide leader health rollup on leader dashboard — HQ, vol manager, command access. */
export function canAccessLeaderDashboardCommand(leader: VolunteerLeader): boolean {
  return Boolean(
    leader.commandAccess ||
      leader.assistantCm ||
      leader.volunteerManagerInterim ||
      leader.acmWorkbenchFlex,
  );
}

/** Lane coverage boards — city, coalition, campus gap views for HQ and field ops. */
export function canAccessLaneCoverageCommand(leader: VolunteerLeader): boolean {
  return Boolean(
    leader.commandAccess ||
      leader.assistantCm ||
      leader.volunteerManagerInterim ||
      leader.acmWorkbenchFlex ||
      leader.workbenchTemplates?.includes("county_leader") ||
      leader.workbenchTemplates?.includes("cluster_leader") ||
      leader.workbenchTemplates?.includes("volunteer_manager"),
  );
}

/** Flex leaders get every lane drill-down — role title stays open in UI. */
export function getEffectiveTeamLanes(leader: VolunteerLeader): VolunteerTeamLaneId[] {
  if (hasFlexLeaderWorkbench(leader)) {
    return VOLUNTEER_TEAM_LANES.map((l) => l.id);
  }
  return leader.teamLanes;
}

export const ALL_VOLUNTEER_TEAM_LANE_IDS = VOLUNTEER_TEAM_LANES.map((l) => l.id);

/** Campaign-wide pins shown on every leader workbench. */
export const CAMPAIGN_WORKBENCH_PINS = [
  {
    href: "/onboarding/power-of-5",
    label: "Power of 5 walkthrough",
    description: "Relational organizing structure — start here for My Five and team ladders.",
  },
  {
    href: "/election-plan/operators/leader-dashboard",
    label: "Leader dashboard",
    description: "Live My Five, team health, follow-ups, and next actions — tied to your slug.",
  },
  {
    href: "/election-plan/operators/leaders/me",
    label: "My workbench",
    description: "Full v3.4 workbench — lanes, field log, templates, and Power of 5 roster editing.",
  },
  {
    href: "/election-plan/power-of-5/command-center",
    label: "Power of 5 command center",
    description: "Election Plan relational command — requires Election Plan login.",
  },
] as const;

export const GAIL_CHOATE_PIN = {
  href: "/onboarding/power-of-5",
  label: "Gail Choate — grassroots philosophy",
  description: "Statewide mentor resource on relational organizing.",
} as const;

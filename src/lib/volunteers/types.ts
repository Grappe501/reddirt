export const VOLUNTEER_TEAM_LANES = [
  { id: "county", label: "County" },
  { id: "events", label: "Events" },
  { id: "fundraising", label: "Fundraising" },
  { id: "comms", label: "Comms" },
  { id: "campus", label: "Campus / youth" },
  { id: "coalition", label: "Coalition" },
  { id: "voter-registration", label: "Voter registration" },
  { id: "operations", label: "Operations / vol HQ" },
] as const;

export type VolunteerTeamLaneId = (typeof VOLUNTEER_TEAM_LANES)[number]["id"];

/** Leadership hierarchy tier — volunteer nested under city under county under cluster under ACM under CM. */
export type WorkbenchHierarchyTierId =
  | "volunteer"
  | "city"
  | "county"
  | "cluster"
  | "assistant_campaign_manager"
  | "campaign_manager";

export type LeaderConnection =
  | { kind: "county"; county: string; countySlug?: string; label?: string }
  | { kind: "city"; citySlug: string; label: string }
  | { kind: "program"; programSlug: string; label: string }
  | {
      kind: "event";
      workbenchSlug: string;
      eventSlug: string;
      label: string;
    }
  | { kind: "global"; href: string; label: string; description?: string };

export type VolunteerLeader = {
  slug: string;
  displayName: string;
  initials: string;
  isCouple?: boolean;
  commandAccess?: boolean;
  assistantCm?: boolean;
  /** Override inferred hierarchy tier (city / county / cluster / ACM / CM). */
  workbenchTier?: WorkbenchHierarchyTierId;
  /** Interim statewide Volunteer Manager — explicit on workbench until permanent replacement. */
  volunteerManagerInterim?: boolean;
  /** Coalition / youth / outreach / vol-manager / event / fundraising workbench templates (stackable). */
  workbenchTemplates?: Array<
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
  >;
  /** Students for Arkansas founding co-chair — campus chapter + statewide student movement. */
  campusTeamCoChair?: boolean;
  /** Grassroots fundraising field lead — same tier as Sarah Rampona (campus co-chairs included). */
  grassrootsFundraisingLead?: boolean;
  /** Arkansas campus network slug — links co-chair to /election-plan/campuses/[slug]. */
  campusLeadCampusSlug?: string;
  /** students-for-arkansas.json foundingCoChairs id (confirmed or open-* slot). */
  studentsForArkansasCoChairId?: string;
  /** Open co-chair placeholder — hidden from leader sign-in until a person is named. */
  leaderRosterSignInHidden?: boolean;
  /** Member of the founding volunteer leadership team (June 28 launch network). */
  volunteerLeadershipTeam?: boolean;
  /** Interfaith communications liaison — Christian–Muslim bridge for campaign comms (Tom's role). */
  interfaithCommsLiaison?: boolean;
  /** Nonprofit advisor — ACM-flex workbench access without assistant CM title in UI. */
  nonprofitAdvisor?: boolean;
  /** High school senior — auto-includes youth + high school leadership templates. */
  highSchoolSenior?: boolean;
  /** Volunteer county board — sees county and nested city workbenches without county chair title. */
  countyBoardMember?: boolean;
  /** Multi-county special outreach program (Ozark Forward, Just A Girl, etc.). */
  specialOutreachProgramSlug?: "ozark-forward" | "just-a-girl";
  /** Read-only cluster geography context — not a cluster manager role. */
  clusterInsightSlug?: string;
  /** City slugs for leadership-tracked special KPIs (e.g. Jacksonville 25% SOS lift). */
  specialKpiCitySlugs?: string[];
  teamLanes: VolunteerTeamLaneId[];
  connections: LeaderConnection[];
  notes?: string;
};

export type LeaderRosterFile = {
  version: number;
  leaders: VolunteerLeader[];
};

export type ResolvedLeaderLink = {
  href: string;
  label: string;
  description?: string;
  kind: LeaderConnection["kind"];
};

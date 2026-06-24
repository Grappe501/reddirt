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

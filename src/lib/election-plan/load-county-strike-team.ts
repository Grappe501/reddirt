import strikeSource from "../../../data/campaign-brain/county-strike-teams.json";

export type StrikeRoleStatus = "assigned" | "vacant" | "recruiting";

export type CountyStrikeRole = {
  name: string;
  email: string;
  phone: string;
  status: StrikeRoleStatus;
};

export type CountyStrikeTeam = {
  county: string;
  slug: string;
  roles: Record<string, CountyStrikeRole>;
};

export type CountyStrikeRoleLabels = Record<string, string>;

const STRIKE_TEAMS = strikeSource.counties as CountyStrikeTeam[];
const ROLE_LABELS = strikeSource.roleLabels as CountyStrikeRoleLabels;

export function getStrikeRoleLabels(): CountyStrikeRoleLabels {
  return ROLE_LABELS;
}

export function getAllCountyStrikeTeams(): CountyStrikeTeam[] {
  return STRIKE_TEAMS;
}

export function getCountyStrikeTeamBySlug(slug: string): CountyStrikeTeam | undefined {
  return STRIKE_TEAMS.find((t) => t.slug === slug);
}

export function getCountyStrikeTeamByName(countyName: string): CountyStrikeTeam | undefined {
  const norm = countyName.replace(/\s+County$/i, "").trim();
  return STRIKE_TEAMS.find((t) => t.county.toLowerCase() === norm.toLowerCase());
}

export function strikeTeamAssignedCount(team: CountyStrikeTeam): number {
  return Object.values(team.roles).filter((r) => r.status === "assigned" && r.name.trim()).length;
}

export function primaryStrikeRoles(): string[] {
  return [
    "countyCaptain",
    "volunteerCaptain",
    "eventsCaptain",
    "faithCaptain",
    "mediaCaptain",
  ];
}

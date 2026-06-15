import orgSource from "../../../data/campaign-brain/ownership/campaign-organization.source.json";

export type CampaignLeadershipRole = {
  name: string;
  title: string;
  focus: string;
};

export type FunctionalTeam = {
  id: string;
  name: string;
  owner: string | null;
  deputy: string | null;
  currentVolunteers: number;
  openPositions: number;
  weeklyMeetingTime: string;
  monthlyGoal: string;
  quarterGoal: string;
  weeklyDeliverable: string;
  href: string;
  status: "critical" | "active" | "planning";
  unassigned: boolean;
};

export type CampaignOrganizationModel = {
  doctrine: string;
  title: string;
  subtitle: string;
  leadership: {
    candidate: CampaignLeadershipRole;
    campaignManager: CampaignLeadershipRole;
    operationsDirector: CampaignLeadershipRole;
  };
  teams: FunctionalTeam[];
  nextBuild: { phase: string; title: string; note: string };
};

export function getCampaignOrganization(): CampaignOrganizationModel {
  const src = orgSource as Omit<CampaignOrganizationModel, "teams"> & {
    teams: Array<Omit<FunctionalTeam, "unassigned">>;
  };
  const teams: FunctionalTeam[] = src.teams.map((t) => ({
    ...t,
    unassigned: !t.owner || t.owner.includes("TBD"),
  }));
  return { ...src, teams };
}

export function getCampaignOrganizationRollup() {
  const org = getCampaignOrganization();
  const teams = org.teams;
  return {
    teamCount: teams.length,
    unassignedTeams: teams.filter((t) => t.unassigned).length,
    assignedTeams: teams.filter((t) => !t.unassigned).length,
    totalOpenPositions: teams.reduce((s, t) => s + t.openPositions, 0),
    totalVolunteers: teams.reduce((s, t) => s + t.currentVolunteers, 0),
    criticalTeams: teams.filter((t) => t.status === "critical").length,
  };
}

export function campaignOrganizationHref(): string {
  return "/election-plan/organization";
}

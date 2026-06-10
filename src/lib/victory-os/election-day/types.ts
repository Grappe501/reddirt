/**
 * Victory OS Sprint 5 — Election Day Operations Center types.
 */

export type ElectionDayCountyStatus = "on_track" | "watch" | "critical" | "unknown";

export type ElectionDayCountyCard = {
  countySlug: string;
  county: string;
  displayName: string;
  regionSlug: string;
  goalVotes: number;
  actualVotes: number | null;
  gap: number | null;
  status: ElectionDayCountyStatus;
  opsStatus: string;
  electoralImportance: string;
  pollWatcherCount: number;
  volunteerDeployed: number;
  notes: string;
};

export type ElectionDaySidePanel = {
  id: string;
  title: string;
  status: "nominal" | "active" | "escalation";
  summary: string;
  itemCount: number;
};

export type ElectionDayViewModel = {
  version: 1;
  generatedAt: string;
  publicationSafety: "INTERNAL_DRAFT";
  electionDate: string;
  isElectionDay: boolean;
  daysUntilElection: number;
  statewide: {
    goalVotes: number;
    actualVotes: number | null;
    gap: number | null;
    workingTargetWithCushion: number;
    advisoryNote: string;
  };
  countyCards: ElectionDayCountyCard[];
  criticalCounties: ElectionDayCountyCard[];
  sidePanels: ElectionDaySidePanel[];
  intelligenceNarrative: string;
};

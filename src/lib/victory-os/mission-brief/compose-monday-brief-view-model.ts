import { weekKeyFromDate } from "@/lib/calendar/weekly-time";
import {
  listWeeklyDecisionBriefWeekKeys,
  loadOrGenerateWeeklyDecisionBrief,
} from "../decision-engine/load-decision-brief";
import {
  loadCountyMissionsRegistry,
  listTopDecisionMissionStacks,
} from "../mission-framework/load-county-missions";
import { loadVictoryMapStatewideSummary } from "../load-victory-map";
import type {
  CountyMissionStack,
  CountyMissionsRegistryFile,
  VictoryMapDimensionCounts,
  WeeklyDecisionBrief,
} from "../types";
import { computeBriefReadiness, type BriefReadiness } from "./compute-brief-readiness";
import { computeBriefWeekDelta, type BriefWeekDelta } from "./compute-brief-week-delta";
import { electionCountdown } from "./election-countdown";

export type MondayBriefViewModel = {
  weekKey: string;
  brief: WeeklyDecisionBrief;
  readiness: BriefReadiness;
  delta: BriefWeekDelta | null;
  electionCountdown: ReturnType<typeof electionCountdown>;
  mapClassificationStatus: string;
  dimensionCounts: VictoryMapDimensionCounts;
  currentSeasonLabel: string | null;
  currentSeasonQuestion: string | null;
  missionRegistry: CountyMissionsRegistryFile | null;
  priorityStacks: CountyMissionStack[];
  fromSnapshot: boolean;
  snapshots: string[];
};

export function composeMondayBriefViewModel(weekKey?: string, asOf = new Date()): MondayBriefViewModel {
  const wk = weekKey ?? weekKeyFromDate(asOf);
  const snapshots = listWeeklyDecisionBriefWeekKeys();
  const fromSnapshot = snapshots.includes(wk);
  const brief = loadOrGenerateWeeklyDecisionBrief(wk);
  const mapSummary = loadVictoryMapStatewideSummary({ asOf });
  const missionRegistry = loadCountyMissionsRegistry();
  const priorityStacks = listTopDecisionMissionStacks(15);

  return {
    weekKey: wk,
    brief,
    readiness: computeBriefReadiness(brief, missionRegistry),
    delta: computeBriefWeekDelta(brief),
    electionCountdown: electionCountdown(asOf),
    mapClassificationStatus: mapSummary.mapClassificationStatus,
    dimensionCounts: mapSummary.dimensionCounts,
    currentSeasonLabel: mapSummary.currentSeason?.label ?? brief.seasonLabel,
    currentSeasonQuestion: mapSummary.currentSeason?.headlineQuestion ?? null,
    missionRegistry,
    priorityStacks,
    fromSnapshot,
    snapshots,
  };
}

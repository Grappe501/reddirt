/**
 * Victory OS Sprint 5 — Season 5 daily decision brief types.
 */

import type { WeeklyCampaignDecision } from "../types";

export type DailyDecisionBrief = {
  briefId: string;
  dayKey: string;
  weekKey: string;
  generatedAt: string;
  seasonId: "season_5_build_urgency";
  seasonLabel: string;
  publicationSafety: "INTERNAL_DRAFT";
  headline: string;
  summary: string;
  /** Top 5 Kelly deployment decisions for today */
  kellyToday: WeeklyCampaignDecision[];
  /** Counties with largest turnout gaps today */
  countyGaps: { countySlug: string; county: string; gapScore: number; opsStatus: string }[];
  cadence: "daily";
};

export type DailyBriefViewModel = {
  dayKey: string;
  weekKey: string;
  brief: DailyDecisionBrief;
  isSeason5: boolean;
  seasonLabel: string;
  electionDaysRemaining: number;
  intelligenceNarrative: string;
};

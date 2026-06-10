/**
 * Victory OS Sprint 5 — tactic linkage types (calendar as byproduct of missions).
 */

import type { CampaignCalendarEventType, CampaignCalendarStatus } from "@/lib/calendar/campaign-calendar-item";

export type TacticLinkageStatus = "linked" | "unlinked" | "orphan" | "needs_mission";

export type LinkedTacticRecord = {
  tacticId: string;
  calendarItemId: string;
  title: string;
  startYmd: string;
  countySlug: string | null;
  county: string | null;
  eventType: CampaignCalendarEventType;
  calendarStatus: CampaignCalendarStatus;
  linkedMissionId: string | null;
  linkedDecisionId: string | null;
  linkageStatus: TacticLinkageStatus;
  matchReason: string;
  kellyTierHint?: number | null;
};

export type TacticLinkageRegistryFile = {
  version: 1;
  updatedAt: string;
  syncedWeekKey: string | null;
  syncedFromBriefId: string | null;
  doctrinePath: "docs/campaign-events/VICTORY_OS_DOCTRINE.md";
  tactics: LinkedTacticRecord[];
  summary: {
    totalCalendarItems: number;
    linkedCount: number;
    unlinkedCount: number;
    orphanCount: number;
    needsMissionCount: number;
  };
};

export type TacticLinkageViewModel = {
  weekKey: string;
  registry: TacticLinkageRegistryFile;
  byCounty: { countySlug: string; county: string; linked: number; unlinked: number }[];
  intelligenceNarrative: string;
};

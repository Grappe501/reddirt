"use client";

import type { StopCommandCenterView } from "@/lib/election-plan/forward-motion-stop-types";

export type StopCommandCenterTracking = {
  coalitionOutreachPct: number;
  volunteerRecruitmentPct: number;
  housePartyPlanPct: number;
  endorsementPipelinePct: number;
  powerOf5Actuals: Record<string, number>;
  housePartyPlanned: Record<string, boolean>;
  endorsementStatus: Record<string, "requested" | "scheduled" | "pending" | "endorsed" | "">;
};

const DEFAULT_TRACKING: StopCommandCenterTracking = {
  coalitionOutreachPct: 0,
  volunteerRecruitmentPct: 0,
  housePartyPlanPct: 0,
  endorsementPipelinePct: 0,
  powerOf5Actuals: {},
  housePartyPlanned: {},
  endorsementStatus: {},
};

function storageKey(eventId: string): string {
  return `reddirt-stop-command-center:${eventId}`;
}

export function loadStopCommandCenterTracking(eventId: string): StopCommandCenterTracking {
  if (typeof window === "undefined") return DEFAULT_TRACKING;
  try {
    const raw = localStorage.getItem(storageKey(eventId));
    if (!raw) return DEFAULT_TRACKING;
    return { ...DEFAULT_TRACKING, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_TRACKING;
  }
}

export function saveStopCommandCenterTracking(eventId: string, tracking: StopCommandCenterTracking): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(eventId), JSON.stringify(tracking));
}

export function mergeReadinessWithTracking(
  view: StopCommandCenterView,
  tracking: StopCommandCenterTracking,
): StopCommandCenterView["readiness"] {
  const promotion = view.readiness.promotion;
  const story = view.readiness.story;
  const coalition = tracking.coalitionOutreachPct;
  const volunteers = tracking.volunteerRecruitmentPct;
  const houseParties = tracking.housePartyPlanPct;
  const endorsements = tracking.endorsementPipelinePct;
  const composite =
    Math.round(((promotion + story + coalition + volunteers + houseParties + endorsements) / 6) * 10) / 10;
  return {
    promotion,
    story,
    coalition: Math.round(coalition),
    volunteers: Math.round(volunteers),
    houseParties: Math.round(houseParties),
    endorsements: Math.round(endorsements),
    composite,
  };
}

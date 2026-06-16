import { computeVictoryMetrics, formatPercentIncrease } from "@/lib/election-plan/load-county-victory-targets";

export type VoteCushionRecord = {
  label: string | null;
  targetIncreasePct: number | null;
  targetVotes: number | null;
  notes: string | null;
  operatorInitials: string | null;
  updatedAt: string | null;
};

export type VoteCushionView = {
  /** Global planning baseline from snapshot — locked */
  globalBaseline: number;
  globalTargetVotes: number;
  globalVoteGain: number;
  globalPercentIncrease: number;
  /** Local field cushion (null = use global only) */
  localTargetVotes: number | null;
  localVoteGain: number | null;
  localPercentIncrease: number | null;
  weeklyVoteGoal: number | null;
  powerOf5LeadersNeeded: number | null;
  hasLocalCushion: boolean;
  label: string | null;
  notes: string | null;
  operatorInitials: string | null;
  updatedAt: string | null;
  /** Sourced planning hints from special-kpi-goals / city numeric targets */
  planningHint?: {
    label?: string;
    targetIncreasePct?: number;
    targetVotes?: number;
    notes?: string;
  };
};

export function computeVoteCushionView(
  globalBaseline: number,
  globalTargetVotes: number,
  record: VoteCushionRecord | null,
): VoteCushionView {
  const globalMetrics = computeVictoryMetrics(globalBaseline, globalTargetVotes);

  if (!record || (record.targetIncreasePct == null && record.targetVotes == null)) {
    return {
      globalBaseline,
      globalTargetVotes,
      globalVoteGain: globalMetrics.growthNeeded,
      globalPercentIncrease: globalMetrics.percentIncrease,
      localTargetVotes: null,
      localVoteGain: null,
      localPercentIncrease: null,
      weeklyVoteGoal: null,
      powerOf5LeadersNeeded: null,
      hasLocalCushion: false,
      label: record?.label ?? null,
      notes: record?.notes ?? null,
      operatorInitials: record?.operatorInitials ?? null,
      updatedAt: record?.updatedAt ?? null,
    };
  }

  let localTargetVotes: number;
  if (record.targetVotes != null && record.targetVotes > 0) {
    localTargetVotes = Math.round(record.targetVotes);
  } else if (record.targetIncreasePct != null && globalBaseline > 0) {
    localTargetVotes = Math.round(globalBaseline * (1 + record.targetIncreasePct / 100));
  } else {
    localTargetVotes = globalTargetVotes;
  }

  const localMetrics = computeVictoryMetrics(globalBaseline, localTargetVotes);

  return {
    globalBaseline,
    globalTargetVotes,
    globalVoteGain: globalMetrics.growthNeeded,
    globalPercentIncrease: globalMetrics.percentIncrease,
    localTargetVotes,
    localVoteGain: localMetrics.growthNeeded,
    localPercentIncrease: localMetrics.percentIncrease,
    weeklyVoteGoal: localMetrics.weeklyVoteGoal,
    powerOf5LeadersNeeded: localMetrics.powerOf5LeadersNeeded,
    hasLocalCushion: localTargetVotes !== globalTargetVotes,
    label: record.label,
    notes: record.notes,
    operatorInitials: record.operatorInitials,
    updatedAt: record.updatedAt,
  };
}

export function formatCushionPercent(n: number): string {
  return formatPercentIncrease(n);
}

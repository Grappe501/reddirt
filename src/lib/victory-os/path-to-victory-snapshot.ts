import "server-only";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";
import { loadVictoryMapStatewideSummary } from "./load-victory-map";

export type PathToVictoryLockItem = {
  id: string;
  label: string;
  status: "draft" | "locked" | string;
  docPath: string;
  notes?: string;
};

export type PathToVictoryCountyTargetRow = {
  county: string;
  projectedTotalVotes: number;
  baselineDemVotes: number;
  baselineDemShare: number;
  targetVotes: number;
  targetVoteGain: number;
  targetShare: number;
  confidence: string;
  dashboardLabel: string;
};

export type PathToVictorySnapshot = {
  phase: string;
  overallStatus: string;
  blocksPriority2Until: string;
  locks: PathToVictoryLockItem[];
  locksComplete: number;
  locksTotal: number;
  map: {
    totalCounties: number;
    classificationStatus: string;
    statewideVoteGap: number;
    workingTargetWithCushion: number;
    projectedStatewideVotes: number;
    legalTarget50Plus1: number;
    electoral: { critical: number; important: number; helpful: number; maintenance: number };
    opportunity: { high: number; medium: number; low: number };
    readiness: { strong: number; moderate: number; weak: number };
  };
  winTargets: {
    generatedAt: string;
    modelNote: string;
    countyCount: number;
    counties: PathToVictoryCountyTargetRow[];
  } | null;
};

const LOCK_LABELS: Record<string, string> = {
  criticalCountyList: "Critical Counties",
  readinessDefinitions: "Readiness Definitions",
  opportunityDefinitions: "Opportunity Definitions",
  kellyCapacityRules: "Kelly Capacity",
  assumptionSignOff: "Victory Assumptions",
  winningTheory: "Winning Theory",
};

const LOCK_ORDER = [
  "criticalCountyList",
  "readinessDefinitions",
  "opportunityDefinitions",
  "kellyCapacityRules",
  "assumptionSignOff",
  "winningTheory",
] as const;

type LeadershipLockFile = {
  phase?: string;
  overallStatus?: string;
  blocksPriority2Until?: string;
  artifacts?: Record<string, { status?: string; docPath?: string; notes?: string }>;
};

export function loadPathToVictorySnapshot(): PathToVictorySnapshot {
  const lockFile = path.join(process.cwd(), "data/strategy-doctrine/leadership-lock-v1.json");
  let lockJson: LeadershipLockFile | null = null;

  if (existsSync(lockFile)) {
    try {
      lockJson = JSON.parse(readFileSync(lockFile, "utf8")) as LeadershipLockFile;
    } catch {
      lockJson = null;
    }
  }

  const mapSummary = loadVictoryMapStatewideSummary();
  const winTarget = loadKellyWinTargetScenarioFile();
  const artifacts = lockJson?.artifacts ?? {};

  const locks: PathToVictoryLockItem[] = LOCK_ORDER.map((key) => {
    const artifact = artifacts[key];
    return {
      id: key,
      label: LOCK_LABELS[key] ?? key,
      status: artifact?.status ?? "draft",
      docPath: artifact?.docPath ?? "",
      notes: artifact?.notes,
    };
  });

  const locksComplete = locks.filter((l) => l.status === "locked").length;

  const statewideVoteGap = winTarget?.statewide.statewideVoteGap ?? mapSummary.statewideVoteGap;
  const workingTargetWithCushion =
    winTarget?.statewide.workingTargetWithCushion ?? mapSummary.workingTargetWithCushion;

  return {
    phase: lockJson?.phase ?? "1_complete",
    overallStatus: lockJson?.overallStatus ?? "pending_leadership_review",
    blocksPriority2Until: lockJson?.blocksPriority2Until ?? "all_six_decisions_locked",
    locks,
    locksComplete,
    locksTotal: locks.length,
    map: {
      totalCounties: mapSummary.totalCounties,
      classificationStatus: mapSummary.mapClassificationStatus,
      statewideVoteGap,
      workingTargetWithCushion,
      projectedStatewideVotes: winTarget?.statewide.projectedStatewideVotes ?? 0,
      legalTarget50Plus1: winTarget?.statewide.legalTarget50Plus1 ?? 0,
      electoral: mapSummary.dimensionCounts.electoral,
      opportunity: mapSummary.dimensionCounts.opportunity,
      readiness: mapSummary.dimensionCounts.readiness,
    },
    winTargets: winTarget
      ? {
          generatedAt: winTarget.generatedAt,
          modelNote: winTarget.modelNote,
          countyCount: winTarget.counties.length,
          counties: winTarget.counties.map((c) => ({
            county: c.county,
            projectedTotalVotes: c.projectedTotalVotes,
            baselineDemVotes: c.baselineDemVotes,
            baselineDemShare: c.baselineDemShare,
            targetVotes: c.targetVotes,
            targetVoteGain: c.targetVoteGain,
            targetShare: c.targetShare,
            confidence: c.confidence,
            dashboardLabel: c.dashboardLabel,
          })),
        }
      : null,
  };
}

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import { loadCountyTouchMap } from "@/lib/calendar/load-travel-calendar-data";
import { loadKellyWinTargetScenarioFile } from "@/lib/election-targets/load-win-target-scenario";
import {
  buildAllVictoryMapCountyProfiles,
  summarizeVictoryMapDimensions,
} from "./classify-county-dimensions";
import { computeDeploymentPriority } from "./score-maps";
import type {
  CampaignVictorySeasonId,
  CountyOpsStatus,
  CountyVictoryContext,
  VictoryMapFile,
  VictoryOsSeasonsFile,
} from "./types";

const DATA_STRATEGY = "data/strategy-doctrine";
const VICTORY_MAP_FILE = "victory-map-v1.json";
const VICTORY_SEASONS_FILE = "victory-os-seasons-v1.json";

function readJsonFile<T>(name: string): T | null {
  const p = path.join(process.cwd(), DATA_STRATEGY, name);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as T;
  } catch {
    return null;
  }
}

function ymdToDate(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function loadVictoryMapFile(): VictoryMapFile | null {
  return readJsonFile<VictoryMapFile>(VICTORY_MAP_FILE);
}

export function loadVictoryOsSeasonsFile(): VictoryOsSeasonsFile | null {
  return readJsonFile<VictoryOsSeasonsFile>(VICTORY_SEASONS_FILE);
}

export function resolveCurrentVictorySeason(asOf = new Date()): {
  id: CampaignVictorySeasonId;
  label: string;
  headlineQuestion: string;
} | null {
  const file = loadVictoryOsSeasonsFile();
  if (!file) return null;
  const t = asOf.getTime();
  for (const s of file.seasons) {
    const start = ymdToDate(s.startYmd).getTime();
    const end = ymdToDate(s.endYmd).getTime() + 86_400_000 - 1;
    if (t >= start && t <= end) {
      return { id: s.id, label: s.label, headlineQuestion: s.headlineQuestion };
    }
  }
  return null;
}

function computeNeglectDays(lastYmd: string | undefined, asOf = new Date()): number | null {
  if (!lastYmd) return null;
  const last = ymdToDate(lastYmd);
  const diff = Math.floor((asOf.getTime() - last.getTime()) / 86_400_000);
  return diff >= 0 ? diff : null;
}

export function deriveCountyOpsStatus(input: {
  electoralImportance: CountyVictoryContext["electoralImportance"];
  organizationalReadiness: CountyVictoryContext["organizationalReadiness"];
  neglectDays: number | null;
  touches: number;
}): CountyOpsStatus {
  const { electoralImportance, organizationalReadiness, neglectDays, touches } = input;
  const days = neglectDays ?? (touches === 0 ? 999 : 0);
  if (electoralImportance === "critical" && days >= 60) return "red";
  if (touches === 0 && days >= 45) return "red";
  if (
    (electoralImportance === "critical" || electoralImportance === "important") &&
    organizationalReadiness === "weak" &&
    days >= 30
  ) {
    return "red";
  }
  if (days >= 45) return "yellow";
  if (organizationalReadiness === "weak" && electoralImportance !== "maintenance") return "yellow";
  return "green";
}

function enrichCountyProfile(
  profile: VictoryMapFile["counties"][number],
  touchMap: Map<string, { touches: number; lastYmd: string }>,
  asOf = new Date(),
): CountyVictoryContext {
  const touch = touchMap.get(profile.county);
  const neglectDays = computeNeglectDays(touch?.lastYmd, asOf);
  const opsStatus = deriveCountyOpsStatus({
    electoralImportance: profile.electoralImportance,
    organizationalReadiness: profile.organizationalReadiness,
    neglectDays,
    touches: touch?.touches ?? 0,
  });
  const deploymentPriority = computeDeploymentPriority({
    electoralImportance: profile.electoralImportance,
    opportunityLevel: profile.opportunityLevel,
    organizationalReadiness: profile.organizationalReadiness,
    opsStatus,
    neglectDays,
  });
  return { ...profile, opsStatus, deploymentPriority, neglectDays };
}

/** Load map from JSON; rebuild from heuristics if file missing or incomplete. */
export function loadVictoryMapCounties(options?: { asOf?: Date }): CountyVictoryContext[] {
  const asOf = options?.asOf ?? new Date();
  const touchMap = loadCountyTouchMap();
  const file = loadVictoryMapFile();

  let profiles = file?.counties ?? [];
  if (profiles.length < 75) {
    const win = loadKellyWinTargetScenarioFile();
    profiles = buildAllVictoryMapCountyProfiles(win?.counties ?? []);
  }

  return profiles
    .map((p) => enrichCountyProfile(p, touchMap, asOf))
    .sort((a, b) => b.deploymentPriority.deploymentPriority - a.deploymentPriority.deploymentPriority);
}

export function loadVictoryMapStatewideSummary(options?: { asOf?: Date }) {
  const asOf = options?.asOf ?? new Date();
  const file = loadVictoryMapFile();
  const counties = loadVictoryMapCounties({ asOf });
  const dimensionCounts = summarizeVictoryMapDimensions(counties);
  const topByDeploymentPriority = counties.slice(0, 15);
  const criticalCountiesAtRisk = counties.filter(
    (c) => c.electoralImportance === "critical" && (c.opsStatus === "red" || c.opsStatus === "yellow"),
  );

  return {
    totalCounties: counties.length,
    mapClassificationStatus: file?.classificationStatus ?? "draft",
    updatedAt: file?.updatedAt ?? new Date().toISOString(),
    statewideVoteGap: file?.statewide.workingTargetWithCushion
      ? file.statewide.statewideVoteGap
      : (loadKellyWinTargetScenarioFile()?.statewide.statewideVoteGap ?? 0),
    workingTargetWithCushion:
      file?.statewide.workingTargetWithCushion ??
      loadKellyWinTargetScenarioFile()?.statewide.workingTargetWithCushion ??
      0,
    dimensionCounts,
    currentSeason: resolveCurrentVictorySeason(asOf),
    topByDeploymentPriority,
    criticalCountiesAtRisk,
    leadershipReviewRemaining: dimensionCounts.needsLeadershipReview,
    counties,
  };
}

export function victoryMapDataPresent(): boolean {
  return existsSync(path.join(process.cwd(), DATA_STRATEGY, VICTORY_MAP_FILE));
}

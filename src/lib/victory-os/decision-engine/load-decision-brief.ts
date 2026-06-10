/**
 * Victory OS — persist and load weekly decision brief snapshots.
 * Path: data/mission-briefs/{weekKey}.json (Monday YMD, America/Chicago week start)
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { WeeklyDecisionBrief, WeeklyDecisionStatus, WeeklyCampaignDecision } from "../types";
import { generateWeeklyDecisionBrief } from "./generate-weekly-decisions";

const BRIEFS_DIR = "data/mission-briefs";

function briefPath(weekKey: string): string {
  return path.join(process.cwd(), BRIEFS_DIR, `${weekKey}.json`);
}

function ensureBriefsDir(): void {
  const dir = path.join(process.cwd(), BRIEFS_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function loadWeeklyDecisionBriefSnapshot(weekKey: string): WeeklyDecisionBrief | null {
  const p = briefPath(weekKey);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as WeeklyDecisionBrief;
  } catch {
    return null;
  }
}

export function listWeeklyDecisionBriefWeekKeys(): string[] {
  const dir = path.join(process.cwd(), BRIEFS_DIR);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
    .map((f) => f.replace(/\.json$/, ""))
    .sort()
    .reverse();
}

/** Load snapshot or generate fresh (does not persist). */
export function loadOrGenerateWeeklyDecisionBrief(
  weekKey: string,
  options?: { forceRegenerate?: boolean; asOf?: Date },
): WeeklyDecisionBrief {
  if (!options?.forceRegenerate) {
    const snap = loadWeeklyDecisionBriefSnapshot(weekKey);
    if (snap) return snap;
  }
  return generateWeeklyDecisionBrief({ weekKey, asOf: options?.asOf });
}

export function persistWeeklyDecisionBrief(brief: WeeklyDecisionBrief): string {
  ensureBriefsDir();
  const p = briefPath(brief.weekKey);
  writeFileSync(p, `${JSON.stringify(brief, null, 2)}\n`, "utf8");
  return p;
}

export function generateAndPersistWeeklyDecisionBrief(options?: {
  weekKey?: string;
  asOf?: Date;
}): { brief: WeeklyDecisionBrief; path: string } {
  const brief = generateWeeklyDecisionBrief(options);
  const p = persistWeeklyDecisionBrief(brief);
  return { brief, path: p };
}

export function mergeDecisionStatuses(
  fresh: WeeklyDecisionBrief,
  existing: WeeklyDecisionBrief | null,
): WeeklyDecisionBrief {
  if (!existing) return fresh;
  const statusById = new Map<string, WeeklyDecisionStatus>();
  for (const d of [...existing.topDecisions, ...existing.fundraisingDeployment]) {
    if (d.status !== "pending") statusById.set(d.id, d.status);
  }
  const apply = (d: WeeklyCampaignDecision): WeeklyCampaignDecision => {
    const s = statusById.get(d.id);
    return s ? { ...d, status: s } : d;
  };
  return {
    ...fresh,
    topDecisions: fresh.topDecisions.map(apply),
    kellyDeployment: fresh.kellyDeployment.map(apply),
    volunteerDeployment: fresh.volunteerDeployment.map(apply),
    fundraisingDeployment: fresh.fundraisingDeployment.map(apply),
  };
}

export function updateDecisionStatusInBrief(
  weekKey: string,
  decisionId: string,
  status: WeeklyDecisionStatus,
): WeeklyDecisionBrief | null {
  const brief = loadWeeklyDecisionBriefSnapshot(weekKey);
  if (!brief) return null;

  const patch = (d: WeeklyCampaignDecision) => (d.id === decisionId ? { ...d, status } : d);
  const updated: WeeklyDecisionBrief = {
    ...brief,
    topDecisions: brief.topDecisions.map(patch),
    kellyDeployment: brief.kellyDeployment.map(patch),
    volunteerDeployment: brief.volunteerDeployment.map(patch),
    fundraisingDeployment: brief.fundraisingDeployment.map(patch),
  };
  persistWeeklyDecisionBrief(updated);
  return updated;
}

export function missionBriefsDataPresent(): boolean {
  return existsSync(path.join(process.cwd(), BRIEFS_DIR));
}

/**
 * Victory OS Sprint 5 — daily brief persistence + view model.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { electionCountdown } from "../mission-brief/election-countdown";
import { resolveCurrentVictorySeason } from "../load-victory-map";
import { dayKeyFromDate, generateDailyDecisionBrief, isSeason5 } from "./generate-daily-decisions";
import type { DailyBriefViewModel, DailyDecisionBrief } from "./types";

const DATA_DIR = "data/daily-briefs";

function briefPath(dayKey: string): string {
  return path.join(process.cwd(), DATA_DIR, `${dayKey}.json`);
}

export function persistDailyDecisionBrief(brief: DailyDecisionBrief): string {
  const dir = path.join(process.cwd(), DATA_DIR);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(briefPath(brief.dayKey), `${JSON.stringify(brief, null, 2)}\n`, "utf8");
  return `${DATA_DIR}/${brief.dayKey}.json`;
}

export function loadDailyDecisionBriefSnapshot(dayKey: string): DailyDecisionBrief | null {
  const p = briefPath(dayKey);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8")) as DailyDecisionBrief;
  } catch {
    return null;
  }
}

export function loadOrGenerateDailyDecisionBrief(dayKey?: string, asOf = new Date()): DailyDecisionBrief {
  const dk = dayKey ?? dayKeyFromDate(asOf);
  return loadDailyDecisionBriefSnapshot(dk) ?? generateDailyDecisionBrief({ asOf, dayKey: dk });
}

export function composeDailyBriefViewModel(dayKey?: string, asOf = new Date()): DailyBriefViewModel {
  const dk = dayKey ?? dayKeyFromDate(asOf);
  const brief = loadOrGenerateDailyDecisionBrief(dk, asOf);
  const season = resolveCurrentVictorySeason(asOf);
  const ec = electionCountdown(asOf);
  const season5 = isSeason5(asOf);

  return {
    dayKey: dk,
    weekKey: brief.weekKey,
    brief,
    isSeason5: season5,
    seasonLabel: season?.label ?? brief.seasonLabel,
    electionDaysRemaining: ec.daysRemaining,
    intelligenceNarrative: [
      `Daily brief · ${dk} · ${season?.label ?? "Campaign season"}`,
      brief.summary,
      `${brief.kellyToday.length} Kelly deployments · ${brief.countyGaps.length} county gaps tracked`,
      season5 ? "Season 5 daily cadence active." : "Weekly Monday brief remains primary until Season 5.",
    ].join(" "),
  };
}

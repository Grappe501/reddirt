import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { CampaignEventCoveragePlan, EventCoveragePlansFile } from "@/lib/calendar/event-coverage-types";

const REL = "data/calendar-command-center/event-coverage-plans.staged.json";

export function eventCoveragePlansPath(repoRoot = process.cwd()): string {
  return path.join(repoRoot, REL);
}

export function loadEventCoveragePlansFile(repoRoot = process.cwd()): EventCoveragePlansFile | null {
  const file = eventCoveragePlansPath(repoRoot);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as EventCoveragePlansFile;
  } catch {
    return null;
  }
}

export function loadEventCoveragePlans(repoRoot = process.cwd()): CampaignEventCoveragePlan[] {
  return loadEventCoveragePlansFile(repoRoot)?.plans ?? [];
}

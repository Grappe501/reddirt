import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import type { EventStaffingPlan, EventStaffingPlansFile } from "@/lib/calendar/event-staffing-types";

const REL = "data/calendar-command-center/event-staffing-plans.staged.json";

export function loadEventStaffingPlansFile(repoRoot = process.cwd()): EventStaffingPlansFile | null {
  const file = path.join(repoRoot, REL);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8")) as EventStaffingPlansFile;
  } catch {
    return null;
  }
}

export function loadEventStaffingPlans(repoRoot = process.cwd()): EventStaffingPlan[] {
  return loadEventStaffingPlansFile(repoRoot)?.plans ?? [];
}
